/* ============================================================================
 * Free AI providers, tried in order until one starts answering.
 *
 * Groq and Gemini both expose OpenAI-compatible "chat/completions" with
 * streaming, so one small fetch client serves every provider and the site
 * needs no AI SDK dependency.
 *
 *   1. Groq, GROQ_MODEL            (default openai/gpt-oss-120b)
 *   2. Groq, GROQ_FALLBACK_MODEL   (default openai/gpt-oss-20b; Groq's free
 *                                   limits are per model, so this adds room)
 *   3. Gemini, GEMINI_MODEL        (default gemini-3.5-flash-lite)
 *
 * A provider is skipped when its key is missing or it is cooling down after
 * a rate limit or error. If none answer, the route falls back to plain text
 * from the site, so visitors never see a raw error.
 * ==========================================================================*/

import type { ModelMessage } from "./prompt.ts";

type Provider = {
  id: string;
  model: string;
  url: string;
  apiKey: string;
  body: Record<string, unknown>;
};

export type Attempt = { provider: string; model: string; outcome: string };

export type Usage = { inputTokens?: number; outputTokens?: number };

export type StartedStream = {
  ok: true;
  provider: string;
  model: string;
  firstText: string;
  rest: AsyncGenerator<string>;
  usage: Usage;
  attempts: Attempt[];
  close: () => void;
};

export type FailedStart = { ok: false; aborted: boolean; attempts: Attempt[] };

const FIRST_TOKEN_TIMEOUT_MS = 6_000;
const TOTAL_TIMEOUT_MS = 25_000;
const MAX_OUTPUT_TOKENS = 1_024; // room for brief reasoning plus a ~90-word answer

function env(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

function reasoningParams(model: string): Record<string, unknown> {
  if (/gpt-oss/i.test(model)) return { reasoning_effort: "low", include_reasoning: false };
  if (/qwen/i.test(model)) return { reasoning_format: "hidden" };
  return {};
}

export function configuredProviders(): Provider[] {
  const providers: Provider[] = [];

  const groqKey = env("GROQ_API_KEY");
  if (groqKey) {
    const url = `${env("GROQ_BASE_URL", "https://api.groq.com/openai/v1").replace(/\/+$/, "")}/chat/completions`;
    const primary = env("GROQ_MODEL", "openai/gpt-oss-120b");
    const fallback = env("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b");
    for (const [id, model] of [
      ["groq", primary],
      ["groq-fallback", fallback],
    ] as const) {
      if (!model || (id === "groq-fallback" && model === primary)) continue;
      providers.push({
        id,
        model,
        url,
        apiKey: groqKey,
        body: { max_completion_tokens: MAX_OUTPUT_TOKENS, ...reasoningParams(model) },
      });
    }
  }

  const geminiKey = env("GEMINI_API_KEY");
  if (geminiKey) {
    const base = env("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/+$/, "");
    providers.push({
      id: "gemini",
      model: env("GEMINI_MODEL", "gemini-3.5-flash-lite"),
      url: `${base}/chat/completions`,
      apiKey: geminiKey,
      body: { max_tokens: MAX_OUTPUT_TOKENS, reasoning_effort: env("GEMINI_REASONING_EFFORT", "minimal") },
    });
  }

  return providers;
}

/* ---------- cooldowns (per server instance) ---------- */

const coolingUntil = new Map<string, number>();

function coolDown(providerId: string, seconds: number) {
  coolingUntil.set(providerId, Date.now() + seconds * 1000);
}

function isCooling(providerId: string): boolean {
  return (coolingUntil.get(providerId) ?? 0) > Date.now();
}

function retryAfterSeconds(response: Response): number {
  const header = Number.parseFloat(response.headers.get("retry-after") ?? "");
  return Number.isFinite(header) ? Math.min(Math.max(header, 5), 600) : 60;
}

/* ---------- SSE parsing ---------- */

async function* contentDeltas(body: ReadableStream<Uint8Array>, usage: Usage): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line.startsWith("data:")) continue;

        const data = line.slice(5).trim();
        if (data === "[DONE]") return;

        let event: {
          choices?: Array<{ delta?: { content?: string | null } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
          x_groq?: { usage?: { prompt_tokens?: number; completion_tokens?: number } };
        };
        try {
          event = JSON.parse(data);
        } catch {
          continue;
        }

        const reported = event.usage ?? event.x_groq?.usage;
        if (reported) {
          usage.inputTokens = reported.prompt_tokens ?? usage.inputTokens;
          usage.outputTokens = reported.completion_tokens ?? usage.outputTokens;
        }

        // Only the visible answer is forwarded; reasoning fields are ignored.
        const text = event.choices?.[0]?.delta?.content;
        if (text) yield text;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/* ---------- main entry ---------- */

/**
 * Tries each provider until one produces its first piece of text.
 * Failover can only happen before the first token; after that the answer
 * is committed to that provider.
 */
export async function startStream(messages: ModelMessage[], clientSignal: AbortSignal): Promise<StartedStream | FailedStart> {
  const attempts: Attempt[] = [];

  for (const provider of configuredProviders()) {
    if (clientSignal.aborted) return { ok: false, aborted: true, attempts };
    if (isCooling(provider.id)) {
      attempts.push({ provider: provider.id, model: provider.model, outcome: "cooling down" });
      continue;
    }

    const controller = new AbortController();
    const abortFromClient = () => controller.abort();
    clientSignal.addEventListener("abort", abortFromClient, { once: true });
    const firstTokenTimer = setTimeout(() => controller.abort(), FIRST_TOKEN_TIMEOUT_MS);
    const cleanup = () => {
      clearTimeout(firstTokenTimer);
      clientSignal.removeEventListener("abort", abortFromClient);
    };

    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${provider.apiKey}` },
        body: JSON.stringify({
          model: provider.model,
          messages,
          stream: true,
          temperature: 0.2,
          ...provider.body,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const detail = (await response.text().catch(() => "")).slice(0, 300);
        if (response.status === 429) coolDown(provider.id, retryAfterSeconds(response));
        else if (response.status >= 500) coolDown(provider.id, 20);
        else coolDown(provider.id, 600); // bad key, bad model id, bad params: needs a human
        if (response.status !== 429) {
          console.error(`[chat] ${provider.id} (${provider.model}) returned ${response.status}: ${detail}`);
        }
        attempts.push({ provider: provider.id, model: provider.model, outcome: `http ${response.status}` });
        cleanup();
        continue;
      }

      const usage: Usage = {};
      const deltas = contentDeltas(response.body, usage);
      const first = await deltas.next();
      clearTimeout(firstTokenTimer);

      if (first.done || !first.value) {
        coolDown(provider.id, 15);
        attempts.push({ provider: provider.id, model: provider.model, outcome: "empty answer" });
        cleanup();
        controller.abort();
        continue;
      }

      const totalTimer = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS);
      attempts.push({ provider: provider.id, model: provider.model, outcome: "answered" });

      return {
        ok: true,
        provider: provider.id,
        model: provider.model,
        firstText: first.value,
        rest: deltas,
        usage,
        attempts,
        close: () => {
          clearTimeout(totalTimer);
          cleanup();
          controller.abort();
        },
      };
    } catch {
      cleanup();
      if (clientSignal.aborted) return { ok: false, aborted: true, attempts };
      coolDown(provider.id, 20);
      attempts.push({ provider: provider.id, model: provider.model, outcome: "timeout or network error" });
    }
  }

  return { ok: false, aborted: false, attempts };
}
