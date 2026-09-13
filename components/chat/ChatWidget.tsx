"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { chat } from "@/lib/content";
import { ChatIcon, CloseIcon } from "../ui/Icons";

/* The chat window's code is only downloaded when a visitor hovers, focuses,
   or opens the launcher, so the page itself loads no faster or slower. */
const loadPanel = () => import("./ChatPanel");
const ChatPanel = dynamic(() => loadPanel().then((mod) => mod.ChatPanel), { ssr: false });

const PANEL_ID = "ask-hardik";
const PEEK_SEEN_KEY = "ask-hardik:peek-seen";
const PEEK_DELAY_MS = 8_000;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const peekDismissed = useRef(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  /* A one-time "Hi! Ask me anything" bubble, once per browser session. */
  useEffect(() => {
    try {
      if (sessionStorage.getItem(PEEK_SEEN_KEY) === "1") return;
    } catch {
      // storage unavailable: still show the bubble
    }
    const timer = window.setTimeout(() => {
      if (!peekDismissed.current) setPeek(true);
    }, PEEK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissPeek = useCallback(() => {
    peekDismissed.current = true;
    setPeek(false);
    try {
      sessionStorage.setItem(PEEK_SEEN_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const openChat = useCallback(() => {
    dismissPeek();
    setOpen(true);
  }, [dismissPeek]);

  const closeChat = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
  }, []);

  const preload = () => {
    void loadPanel();
  };

  return (
    <>
      <div className="fixed right-5 bottom-5 z-30 flex items-end gap-3 sm:right-8 sm:bottom-8">
        <AnimatePresence>
          {peek && !open && (
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative mb-1 max-w-[14rem] rounded-2xl rounded-br-md border border-ink-700 bg-ink-850/95 py-2.5 pr-8 pl-3.5 text-[13px] leading-snug text-mist-100 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.9)] backdrop-blur"
            >
              <button type="button" onClick={openChat} onPointerEnter={preload} className="text-left">
                {chat.peek}
              </button>
              <button
                type="button"
                onClick={dismissPeek}
                aria-label="Dismiss"
                className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full text-mist-400 transition-colors hover:text-mist-100"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          ref={launcherRef}
          type="button"
          onClick={open ? closeChat : openChat}
          onPointerEnter={preload}
          onFocus={preload}
          aria-expanded={open}
          aria-controls={open ? PANEL_ID : undefined}
          aria-label={open ? "Close chat" : `Open chat with the ${chat.label}`}
          className="group flex items-center gap-2.5 rounded-full border border-accent/30 bg-ink-900/90 p-1.5 text-mist-100 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.9)] backdrop-blur transition-colors hover:border-accent md:pl-4"
        >
          <span className="hidden text-sm font-medium md:inline">{open ? "Close chat" : chat.launcher}</span>
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-accent text-ink-950 transition-transform duration-200 group-active:scale-95">
            {!open && !reduceMotion && (
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-accent/40 [animation-iteration-count:3]" />
            )}
            {open ? <CloseIcon className="relative h-[18px] w-[18px]" /> : <ChatIcon className="relative h-5 w-5" />}
          </span>
        </button>
      </div>

      <AnimatePresence>{open && <ChatPanel key="panel" id={PANEL_ID} onClose={closeChat} />}</AnimatePresence>
    </>
  );
}
