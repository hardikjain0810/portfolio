"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin gradient bar pinned to the top edge showing how far down the page you are. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-60 h-[2px] origin-left bg-gradient-to-r from-accent via-accent-deep to-violet-soft"
    />
  );
}
