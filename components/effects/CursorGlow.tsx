"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Subscribes to a media query the React way, so there is no setState inside an
 * effect and no mismatch between the server and the first client render.
 */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false, // the server has no pointer, so assume touch
  );
}

/**
 * A soft light that trails the cursor, giving the dark page some depth.
 * Only runs on devices with a real pointer, so phones and tablets skip it
 * entirely and pay no cost.
 */
export function CursorGlow() {
  const reduceMotion = useReducedMotion();
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const enabled = hasFinePointer && !reduceMotion;

  const rawX = useMotionValue(-500);
  const rawY = useMotionValue(-500);
  // Spring lag is what makes it feel alive rather than glued to the pointer.
  const x = useSpring(rawX, { stiffness: 180, damping: 28, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 180, damping: 28, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-0 hidden h-[460px] w-[460px] rounded-full opacity-45 mix-blend-screen md:block"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
        background:
          "radial-gradient(closest-side, rgba(94,234,212,0.16), rgba(139,147,248,0.07) 55%, transparent)",
      }}
    />
  );
}
