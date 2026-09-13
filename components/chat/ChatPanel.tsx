"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { chat } from "@/lib/content";
import type { SectionId, Source } from "@/lib/chat/knowledge";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useChat, type Message } from "./useChat";
import { ArrowUpIcon, CloseIcon, StopIcon } from "../ui/Icons";

const MAX_CHARS = 500;

/* ---------- message text with safe links ---------- */

const LINKISH = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(LINKISH).map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          const url = part.replace(/[.,;:!?]+$/, "");
          return (
            <Fragment key={i}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
              >
                {url.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
              {part.slice(url.length)}
            </Fragment>
          );
        }
        if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(part)) {
          return (
            <a
              key={i}
              href={`mailto:${part}`}
              className="break-all text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
            >
              {part}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function TypingDots() {
  return (
    <span className="flex h-5 items-center gap-1" aria-label="Typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-typing rounded-full bg-mist-300"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function Bubble({
  message,
  reduceMotion,
  onSource,
  onRetry,
}: {
  message: Message;
  reduceMotion: boolean;
  onSource: (section: SectionId) => void;
  onRetry: () => void;
}) {
  const enter = reduceMotion ? false : { opacity: 0, y: 8 };

  if (message.role === "user") {
    return (
      <motion.div initial={enter} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-[14px] leading-snug break-words whitespace-pre-wrap text-ink-950">
          {message.text}
        </p>
      </motion.div>
    );
  }

  const waiting = message.status === "streaming" && !message.text;
  const isError = message.status === "error";

  return (
    <motion.div
      initial={enter}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start gap-1.5"
      data-tier={message.tier}
    >
      <div
        className={`max-w-[90%] rounded-2xl rounded-bl-md border px-3.5 py-2 text-[14px] leading-relaxed break-words whitespace-pre-wrap ${
          isError ? "border-red-400/40 bg-red-400/10 text-red-200" : "border-ink-700 bg-ink-850 text-mist-100"
        }`}
      >
        {waiting ? <TypingDots /> : <RichText text={message.text} />}
        {message.status === "streaming" && message.text && (
          <span aria-hidden className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-caret bg-accent" />
        )}
      </div>

      {isError && (
        <button type="button" onClick={onRetry} className="px-1 text-xs font-medium text-accent hover:underline">
          Try again
        </button>
      )}

      {message.status === "done" && message.sources && message.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.sources.map((source: Source) => (
            <button
              key={source.section}
              type="button"
              onClick={() => onSource(source.section)}
              className="rounded-full border border-ink-700 px-2.5 py-1 font-mono text-[11px] text-mist-300 transition-colors hover:border-accent hover:text-accent"
            >
              ↗ {source.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ---------- panel ---------- */

export function ChatPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const { messages, busy, send, stop, retry } = useChat();
  const isMobile = useMediaQuery("(max-width: 767.98px)");
  const reduceMotion = useReducedMotion() ?? false;

  const [draft, setDraft] = useState("");
  const [hint, setHint] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  /* Escape closes from anywhere. */
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Laptop: focus the input. Phone: focus the dialog, so the keyboard doesn't pop up uninvited. */
  useEffect(() => {
    if (isMobile) panelRef.current?.focus({ preventScroll: true });
    else inputRef.current?.focus({ preventScroll: true });
  }, [isMobile]);

  /* Full-screen on phones: stop the page behind from scrolling. */
  useEffect(() => {
    if (!isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile]);

  /* Follow new messages, unless the visitor has scrolled up to read. */
  useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) log.scrollTop = log.scrollHeight;
  }, [messages]);

  const onLogScroll = () => {
    const log = logRef.current;
    if (log) stickToBottom.current = log.scrollHeight - log.scrollTop - log.clientHeight < 64;
  };

  const ask = (question: string) => {
    if (busy) return;
    stickToBottom.current = true;
    void send(question);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) {
      stop();
      return;
    }
    if (!draft.trim()) {
      setHint("Type a message first");
      inputRef.current?.focus();
      return;
    }
    ask(draft);
    setDraft("");
    setHint("");
  };

  const goToSection = (section: SectionId) => {
    if (isMobile) {
      document.body.style.overflow = "";
      onClose();
    }
    requestAnimationFrame(() =>
      document.getElementById(section)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }),
    );
  };

  /* Keep keyboard focus inside the full-screen dialog on phones. */
  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isMobile || event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.text.toLowerCase()));
  const suggestions = chat.suggestions.filter((s) => !asked.has(s.toLowerCase()));

  const enter = reduceMotion
    ? { opacity: 0 }
    : isMobile
      ? { opacity: 0, y: 32 }
      : { opacity: 0, y: 24, scale: 0.94 };

  return (
    <motion.div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal={isMobile ? true : undefined}
      aria-label={`Chat with the ${chat.label}`}
      tabIndex={-1}
      onKeyDown={trapFocus}
      initial={enter}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={enter}
      transition={reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 34 }}
      style={{ transformOrigin: "bottom right" }}
      className="fixed inset-0 z-70 flex h-dvh flex-col outline-none md:inset-auto md:right-8 md:bottom-[6.25rem] md:z-45 md:chat-panel-h md:w-[360px]"
    >
      {/* Chat card on laptops; fills the screen on phones. */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-ink-950 md:rounded-3xl md:border md:border-ink-700 md:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(94,234,212,0.05)]">
          {/* Header */}
          <header className="flex shrink-0 items-center gap-3 border-b border-ink-800 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-violet-soft font-mono text-[13px] font-bold text-ink-950">
              HJ
              <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] leading-tight font-semibold text-mist-100">{chat.name}</p>
              <p className="truncate font-mono text-[11px] text-accent">{chat.label}</p>
            </div>
            {/* Phones only: the full-screen chat covers the launcher, so it needs its own way out.
                On laptops the launcher below the card closes it. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="grid h-9 w-9 place-items-center rounded-full text-mist-400 transition-colors hover:bg-ink-800 hover:text-mist-100 md:hidden"
            >
              <CloseIcon className="h-[18px] w-[18px]" />
            </button>
          </header>

          {/* Conversation. data-clarity-mask keeps visitors' messages out of analytics recordings. */}
          <div
            ref={logRef}
            onScroll={onLogScroll}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
            data-clarity-mask="true"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3.5 py-4"
          >
            <div className="flex flex-col items-start">
              <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-ink-700 bg-ink-850 px-3.5 py-2 text-[14px] leading-relaxed text-mist-100">
                {chat.welcome}
              </p>
            </div>
            {messages.map((message) => (
              <Bubble
                key={message.id}
                message={message}
                reduceMotion={reduceMotion}
                onSource={goToSection}
                onRetry={retry}
              />
            ))}
          </div>

          {/* Suggestions and composer */}
          <div className="shrink-0 border-t border-ink-800 bg-ink-950 px-3 pt-2.5 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
            {suggestions.length > 0 && !busy && (
              <div className="no-scrollbar -mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="shrink-0 rounded-full border border-ink-700 bg-ink-900 px-3 py-1.5 text-[12px] whitespace-nowrap text-mist-200 transition-colors hover:border-accent hover:text-accent"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex items-center gap-2" noValidate>
              <label htmlFor={`${id}-input`} className="sr-only">
                Message
              </label>
              <input
                id={`${id}-input`}
                ref={inputRef}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (hint) setHint("");
                }}
                onKeyDown={(event) => {
                  // Explicit Enter-to-send. Skipped mid-composition, so people typing
                  // with an input method (Chinese, Japanese, Hindi…) can confirm words.
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                maxLength={MAX_CHARS}
                placeholder={chat.placeholder}
                autoComplete="off"
                enterKeyHint="send"
                aria-describedby={hint ? `${id}-hint` : undefined}
                className="h-11 min-w-0 flex-1 rounded-full border border-ink-700 bg-ink-900 px-4 text-[16px] text-mist-100 outline-none placeholder:text-mist-400 focus:border-accent md:h-10 md:text-[14px]"
              />
              <button
                type="submit"
                aria-label={busy ? "Stop answering" : "Send message"}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-ink-950 transition hover:brightness-110 active:scale-95 md:h-10 md:w-10"
              >
                {busy ? <StopIcon className="h-4 w-4" /> : <ArrowUpIcon className="h-[18px] w-[18px]" />}
              </button>
            </form>

            {(hint || draft.length > MAX_CHARS - 100) && (
              <p id={`${id}-hint`} aria-live="polite" className="px-3 pt-1 text-[11px] text-mist-400">
                {hint ? <span className="text-red-300">{hint}</span> : `${draft.length} / ${MAX_CHARS}`}
              </p>
            )}
          </div>
      </div>
    </motion.div>
  );
}
