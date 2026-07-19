"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCarouselOptions {
  /** Number of slides in the carousel. */
  count: number;
  /** Auto-advance interval in milliseconds. Set to 0 to disable auto-play. */
  intervalMs?: number;
  /** Pause auto-advance while the pointer is over the carousel. */
  pauseOnHover?: boolean;
}

interface UseCarouselResult {
  index: number;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  /** Handlers to spread onto the carousel root for hover-pause behaviour. */
  hoverHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

/**
 * Encapsulates carousel index state and the auto-advance lifecycle.
 *
 * SRP: keeps timer/side-effect logic out of presentational carousel markup so
 * the UI stays a pure function of `index`. Respects `prefers-reduced-motion`
 * and pauses when the tab is hidden to avoid wasted work.
 */
export function useCarousel({
  count,
  intervalMs = 3000,
  pauseOnHover = true,
}: UseCarouselOptions): UseCarouselResult {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  const goTo = useCallback(
    (i: number) => {
      if (count <= 0) return;
      setIndex(((i % count) + count) % count);
    },
    [count],
  );

  // Derive a safe index so a shrinking slide count can't point past the end,
  // without an extra state-sync effect.
  const safeIndex = count > 0 ? Math.min(index, count - 1) : 0;

  const next = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);
  const prev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);

  useEffect(() => {
    if (!intervalMs || count <= 1) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      setIndex((i) => (i + 1) % count);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [count, intervalMs]);

  const hoverHandlers = {
    onMouseEnter: () => {
      if (pauseOnHover) pausedRef.current = true;
    },
    onMouseLeave: () => {
      if (pauseOnHover) pausedRef.current = false;
    },
  };

  return { index: safeIndex, goTo, next, prev, hoverHandlers };
}
