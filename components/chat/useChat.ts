"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chat } from "@/lib/content";
import { classifySmallTalk } from "@/lib/chat/smalltalk";
import { smallTalkReply } from "@/lib/chat/replies";
import type { Source } from "@/lib/chat/knowledge";

export type Tier =
  | "smalltalk"
  | "instant"
  | "offtopic"
  | "cache"
  | "llm"
  | "degraded"
  | "limited"
  | "error";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status: "done" | "streaming" | "error";
  tier?: Tier;
  sources?: Source[];
};

const STORAGE_KEY = "ask-hardik:v1";
const MAX_STORED = 30;
const HISTORY_SENT = 6;
const SMALLTALK_DELAY_MS = 260; // long enough to read as a reply, short enough to feel instant

let counter = 0;
const newId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

function loadMessages(): Message[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is Message =>
          !!m &&
          typeof m === "object" &&
          typeof (m as Message).id === "string" &&
          ((m as Message).role === "user" || (m as Message).role === "assistant") &&
          typeof (m as Message).text === "string",
      )
      .map((m) => (m.status === "streaming" ? { ...m, status: "done" as const } : m))
      .slice(-MAX_STORED);
  } catch {
    return [];
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [busy, setBusy] = useState(false);

  const messagesRef = useRef(messages);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const timersRef = useRef<number[]>([]);
  const pendingRef = useRef<{ id: string; text: string } | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
    if (messages.some((m) => m.status === "streaming")) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // Private mode or storage full: the chat still works, it just won't persist.
    }
  }, [messages]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      timersRef.current.forEach((t) => window.clearTimeout(t));
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const patch = useCallback((id: string, change: Partial<Message> | ((m: Message) => Partial<Message>)) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...(typeof change === "function" ? change(m) : change) } : m)),
    );
  }, []);

  /* Streamed text is batched to one state update per animation frame. */
  const flushText = useCallback(() => {
    frameRef.current = null;
    const pending = pendingRef.current;
    if (!pending || !pending.text) return;
    const addition = pending.text;
    pending.text = "";
    patch(pending.id, (m) => ({ text: m.text + addition }));
  }, [patch]);

  const queueText = useCallback(
    (id: string, text: string) => {
      if (!pendingRef.current || pendingRef.current.id !== id) pendingRef.current = { id, text: "" };
      pendingRef.current.text += text;
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(flushText);
    },
    [flushText],
  );

  const setBusyState = (value: boolean) => {
    busyRef.current = value;
    setBusy(value);
  };

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busyRef.current) return;

      const classified = classifySmallTalk(text);

      /* Small talk: answered right here, no network request at all. */
      if (classified.kind === "smalltalk") {
        const reply: Message = { id: newId(), role: "assistant", text: "", status: "streaming", tier: "smalltalk" };
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "user", text, status: "done", tier: "smalltalk" },
          reply,
        ]);
        const timer = window.setTimeout(() => {
          patch(reply.id, { text: smallTalkReply(classified.intent), status: "done" });
        }, SMALLTALK_DELAY_MS);
        timersRef.current.push(timer);
        return;
      }

      const history = messagesRef.current
        .filter((m) => m.status === "done" && m.tier !== "smalltalk" && m.text)
        .slice(-HISTORY_SENT)
        .map((m) => ({ role: m.role, content: m.text }));

      const reply: Message = { id: newId(), role: "assistant", text: "", status: "streaming" };
      setMessages((prev) => [...prev, { id: newId(), role: "user", text, status: "done" }, reply]);
      setBusyState(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let failed = false;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text, history }),
          signal: controller.signal,
        });
        failed = !response.ok && response.status !== 429;
        if (!response.body) throw new Error("Empty response");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newline: number;
          while ((newline = buffer.indexOf("\n")) !== -1) {
            const lineText = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!lineText) continue;

            let event: { type?: string; text?: string; tier?: Tier; sources?: Source[] };
            try {
              event = JSON.parse(lineText);
            } catch {
              continue;
            }

            if (event.type === "meta") patch(reply.id, { tier: event.tier, sources: event.sources ?? [] });
            else if (event.type === "delta" && event.text) queueText(reply.id, event.text);
          }
        }

        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        flushText();
        patch(reply.id, (m) => ({
          status: failed ? "error" : "done",
          text: m.text || chat.replies.error,
        }));
      } catch {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        flushText();
        const stopped = controller.signal.aborted;
        patch(reply.id, (m) => ({
          status: stopped ? "done" : "error",
          text: m.text || (stopped ? "Stopped." : chat.replies.error),
        }));
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setBusyState(false);
      }
    },
    [flushText, patch, queueText],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setMessages([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  /** Removes a failed reply and asks the same question again. */
  const retry = useCallback(() => {
    const current = messagesRef.current;
    const userIndex = current.map((m) => m.role).lastIndexOf("user");
    if (userIndex === -1 || busyRef.current) return;
    const question = current[userIndex].text;
    setMessages(current.slice(0, userIndex));
    messagesRef.current = current.slice(0, userIndex);
    void send(question);
  }, [send]);

  return { messages, busy, send, stop, clear, retry };
}
