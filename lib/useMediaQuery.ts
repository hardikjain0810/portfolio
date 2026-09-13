"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query the React way: no setState inside an
 * effect, and no mismatch between the server and the first client render.
 * The server has no screen, so it reports `serverDefault`.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}
