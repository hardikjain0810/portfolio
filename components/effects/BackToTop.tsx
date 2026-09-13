"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpIcon } from "../ui/Icons";

/** Appears once the visitor is well down the page. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.22 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          // Sits directly above the chat launcher, centred on its round button.
          className="fixed right-6 bottom-[5.25rem] z-30 grid h-11 w-11 place-items-center rounded-full border border-ink-700 bg-ink-900/90 text-mist-200 backdrop-blur transition-colors hover:border-accent hover:text-accent sm:right-9 sm:bottom-[6.5rem]"
        >
          <ArrowUpIcon className="h-[18px] w-[18px]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
