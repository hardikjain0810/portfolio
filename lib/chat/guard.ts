/* ============================================================================
 * Request and response safety for the chat API.
 * ==========================================================================*/

import { site } from "../content.ts";

export const MAX_MESSAGE_CHARS = 500;
export const MAX_HISTORY_ITEMS = 6;
const MAX_HISTORY_CHARS = 600;

export type HistoryItem = { role: "user" | "assistant"; content: string };

/* ---------- origin ---------- */

/**
 * Accepts requests from this site's own pages. Browsers always send an
 * Origin header on POST, so a missing one in production means a script.
 * This is a speed bump: headers can be forged outside a browser.
 */
export function isAllowedOrigin(request: Request): boolean {
  const production = process.env.NODE_ENV === "production";
  const origin = request.headers.get("origin");

  if (!origin) {
    return !production || request.headers.get("sec-fetch-site") === "same-origin";
  }

  let from: URL;
  try {
    from = new URL(origin);
  } catch {
    return false;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host && from.host === host) return true;

  const siteHost = new URL(site.url).hostname;
  if (from.hostname === siteHost || from.hostname === `www.${siteHost}`) return true;

  return !production && (from.hostname === "localhost" || from.hostname === "127.0.0.1");
}

/* ---------- body ---------- */

export type ParsedBody =
  | { ok: true; message: string; history: HistoryItem[] }
  | { ok: false; error: string };

export function parseChatBody(body: unknown): ParsedBody {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };

  const { message, history } = body as { message?: unknown; history?: unknown };
  if (typeof message !== "string") return { ok: false, error: "Invalid request." };

  const text = message.trim();
  if (!text) return { ok: false, error: "Type a message first." };
  if (text.length > MAX_MESSAGE_CHARS) {
    return { ok: false, error: `Keep messages under ${MAX_MESSAGE_CHARS} characters.` };
  }

  const cleanHistory: HistoryItem[] = [];
  if (Array.isArray(history)) {
    for (const item of history.slice(-MAX_HISTORY_ITEMS)) {
      if (!item || typeof item !== "object") continue;
      const { role, content } = item as { role?: unknown; content?: unknown };
      if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
      const trimmed = content.trim().slice(0, MAX_HISTORY_CHARS);
      if (trimmed) cleanHistory.push({ role, content: trimmed });
    }
  }

  return { ok: true, message: text, history: cleanHistory };
}

/* ---------- off-topic tasks ---------- */

const TASK_REQUEST =
  /\b(?:write|generate|create|compose|draft|give|make)(?: me| us)?(?: a| an| some| the| my)?(?: \w+){0,2} (?:code|script|program|function|class|essay|poem|story|joke|song|lyrics|cover letter|sql query|regex|algorithm)s?\b|\b(?:write|draft) (?:an? )?email to\b|\b(?:solve|calculate|translate|debug|fix) (?:this|my|the)\b|\bhomework\b/;

/** Requests for general work ("write me a poem") rather than questions about Hardik. */
export function isOffTopicTask(normalized: string): boolean {
  return TASK_REQUEST.test(normalized);
}

/* ---------- output redaction ---------- */

const PHONE_LIKE = /\+?\d[\d\s().-]{6,}\d/g;
const EMAIL_LIKE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const OWN_PHONE_DIGITS = site.phone.replace(/\D/g, "");

/** Removes phone numbers and any email address other than the public one. */
export function redactText(text: string): string {
  return text
    .replace(PHONE_LIKE, (match) => {
      const digits = match.replace(/\D/g, "");
      const isOwn = OWN_PHONE_DIGITS.length >= 7 && digits.includes(OWN_PHONE_DIGITS.slice(-7));
      return digits.length >= 10 || isOwn ? "[number removed]" : match;
    })
    .replace(EMAIL_LIKE, (match) =>
      match.toLowerCase() === site.email.toLowerCase() ? match : "[email removed]",
    );
}

/**
 * Streaming-safe redaction. A number or email can arrive split across
 * chunks, so the trailing run that could still become one is held back
 * until the text after it arrives.
 */
export function createRedactor() {
  let raw = "";
  let sent = 0;

  function holdIndex(text: string): number {
    const digitTail = text.match(/[+\d][\d\s().-]*$/);
    const wordTail = text.match(/[\w.+-]+@?[\w.-]*$/);
    return Math.min(digitTail?.index ?? text.length, wordTail?.index ?? text.length);
  }

  return {
    push(delta: string): string {
      raw += delta;
      const safe = redactText(raw.slice(0, holdIndex(raw)));
      if (safe.length <= sent) return "";
      const out = safe.slice(sent);
      sent = safe.length;
      return out;
    },
    flush(): string {
      const safe = redactText(raw);
      const out = safe.length > sent ? safe.slice(sent) : "";
      sent = safe.length;
      return out;
    },
    text(): string {
      return redactText(raw);
    },
  };
}
