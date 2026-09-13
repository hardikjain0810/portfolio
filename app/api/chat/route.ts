/* ============================================================================
 * POST /api/chat — the "AI version of Hardik" chatbot.
 *
 * Each message goes down a ladder and stops at the first rung that answers:
 *   smalltalk  "hi", "thanks", "bye"            no AI call
 *   instant    email, role, skills, projects…   no AI call
 *   offtopic   "write me a poem"                no AI call
 *   cache      same first question seen before  no AI call
 *   llm        everything else, streamed        free AI provider chain
 *   degraded   every provider unavailable       plain text from the site
 *
 * The response is newline-delimited JSON:
 *   {"type":"meta","tier":"llm","sources":[...]}
 *   {"type":"delta","text":"..."}      (repeated)
 *   {"type":"done","tier":"llm","ms":812}
 * ==========================================================================*/

import { chat } from "@/lib/content";
import { clientIp, createRateLimiter, envInt } from "@/lib/rate-limit";
import { classifySmallTalk } from "@/lib/chat/smalltalk";
import { fill, smallTalkReply } from "@/lib/chat/replies";
import { instantAnswer } from "@/lib/chat/instant";
import { CONTENT_HASH, sourceFor, type Source } from "@/lib/chat/knowledge";
import { retrieve, type Retrieval } from "@/lib/chat/retrieve";
import { createRedactor, isAllowedOrigin, isOffTopicTask, parseChatBody } from "@/lib/chat/guard";
import { buildMessages, estimateTokens } from "@/lib/chat/prompt";
import { startStream } from "@/lib/chat/providers";

export const dynamic = "force-dynamic";

type Tier = "smalltalk" | "instant" | "offtopic" | "cache" | "llm" | "degraded" | "limited" | "error";

const burstLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: envInt("CHAT_RATE_LIMIT_PER_10MIN", 20),
});
const dailyLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: envInt("CHAT_RATE_LIMIT_PER_DAY", 60),
});

/* ---------- small LRU cache for first-turn AI answers ---------- */

type Cached = { text: string; sources: Source[]; at: number };
const CACHE_MAX = 200;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, Cached>();

function cacheGet(key: string): Cached | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, hit); // refresh recency
  return hit;
}

function cacheSet(key: string, value: Omit<Cached, "at">) {
  cache.set(key, { ...value, at: Date.now() });
  while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string);
}

/* ---------- response helpers ---------- */

const encoder = new TextEncoder();
const line = (event: Record<string, unknown>) => encoder.encode(`${JSON.stringify(event)}\n`);

function headers(tier: Tier): HeadersInit {
  return {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-store",
    "x-accel-buffering": "no",
    "x-chat-tier": tier,
  };
}

function log(fields: Record<string, unknown>) {
  console.info(JSON.stringify({ evt: "chat", ...fields }));
}

/** A complete, non-streamed reply in the same NDJSON shape. */
function textReply(tier: Tier, text: string, sources: Source[], started: number, status = 200): Response {
  const ms = Date.now() - started;
  log({ tier, ms });
  const body = [
    JSON.stringify({ type: "meta", tier, sources }),
    JSON.stringify({ type: "delta", text }),
    JSON.stringify({ type: "done", tier, ms }),
  ].join("\n");
  return new Response(`${body}\n`, { status, headers: headers(tier) });
}

function degradedText(retrieval: Retrieval): { text: string; sources: Source[] } {
  const best = retrieval.best;
  if (!best) return { text: fill(chat.replies.unavailable), sources: [] };
  const excerpt =
    best.text.length > 320 ? `${best.text.slice(0, best.text.lastIndexOf(" ", 320)).replace(/[,;:.]$/, "")}…` : best.text;
  return {
    text: `${fill(chat.replies.degraded)} ${excerpt} You can also reach me through the contact form.`,
    sources: [sourceFor(best.section)],
  };
}

/* ---------- handler ---------- */

export async function POST(request: Request) {
  const started = Date.now();

  if (!isAllowedOrigin(request)) {
    return textReply("error", fill(chat.replies.error), [], started, 403);
  }

  const ip = clientIp(request);
  if (burstLimiter.limited(ip) || dailyLimiter.limited(ip)) {
    return textReply("limited", fill(chat.replies.rateLimited), [sourceFor("contact")], started, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return textReply("error", "Invalid request.", [], started, 400);
  }

  const parsed = parseChatBody(body);
  if (!parsed.ok) return textReply("error", parsed.error, [], started, 400);
  const { message, history } = parsed;

  // 1. Small talk (the browser normally catches this first).
  const classified = classifySmallTalk(message);
  if (classified.kind === "smalltalk") {
    return textReply("smalltalk", smallTalkReply(classified.intent), [], started);
  }

  // 2. Instant answers straight from content.ts.
  const instant = instantAnswer(classified.normalized, classified.lead);
  if (instant) return textReply("instant", instant.text, instant.sources, started);

  // 3. Clearly off-topic requests.
  const retrieval = retrieve(classified.normalized || message);
  if (
    isOffTopicTask(classified.normalized) ||
    (classified.normalized && !retrieval.onTopic && history.length === 0)
  ) {
    return textReply("offtopic", fill(chat.replies.offTopic), [], started);
  }

  const sources = [...new Map(retrieval.chunks.filter((c) => c.id !== "profile").map((c) => [c.section, sourceFor(c.section)])).values()].slice(0, 2);

  // 4. Cache (first-turn questions only; follow-ups depend on history).
  const cacheKey = history.length === 0 && classified.normalized ? `${CONTENT_HASH}:${classified.normalized}` : null;
  const cached = cacheKey ? cacheGet(cacheKey) : null;
  if (cached) return textReply("cache", cached.text, cached.sources, started);

  // 5. AI answer, streamed.
  const messages = buildMessages({ question: message, history, chunks: retrieval.chunks });
  const promptTokens = estimateTokens(messages.map((m) => m.content).join(""));
  const upstream = await startStream(messages, request.signal);

  if (!upstream.ok) {
    if (upstream.aborted) return new Response(null, { status: 499 });
    const fallback = degradedText(retrieval);
    log({ tier: "degraded", attempts: upstream.attempts, promptTokens });
    return textReply("degraded", fallback.text, fallback.sources, started);
  }

  const ttftMs = Date.now() - started;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const redactor = createRedactor();
      let truncated = false;

      controller.enqueue(line({ type: "meta", tier: "llm", sources }));

      const emit = (text: string) => {
        if (text) controller.enqueue(line({ type: "delta", text }));
      };

      try {
        emit(redactor.push(upstream.firstText));
        for await (const delta of upstream.rest) emit(redactor.push(delta));
      } catch {
        truncated = true;
      } finally {
        upstream.close();
      }

      emit(redactor.flush());
      const finalText = redactor.text().trim();
      if (!finalText) emit(fill(chat.replies.unknown));

      const ms = Date.now() - started;
      controller.enqueue(line({ type: "done", tier: "llm", ms, ...(truncated ? { truncated: true } : {}) }));
      controller.close();

      if (cacheKey && finalText && !truncated) cacheSet(cacheKey, { text: finalText, sources });
      log({
        tier: "llm",
        provider: upstream.provider,
        model: upstream.model,
        attempts: upstream.attempts,
        ttftMs,
        ms,
        promptTokens,
        inputTokens: upstream.usage.inputTokens,
        outputTokens: upstream.usage.outputTokens,
        truncated,
      });
    },
    cancel() {
      upstream.close();
    },
  });

  return new Response(stream, { headers: headers("llm") });
}
