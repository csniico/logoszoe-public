"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  /** Invoked when the sentinel scrolls into view. */
  onLoadMore: () => void;
  /** Whether more pages exist. When false the observer is never attached. */
  hasMore: boolean;
  /** Suppresses firing while a request is already in flight. */
  loading: boolean;
  /** How far ahead of the viewport to trigger. Defaults to 400px. */
  rootMargin?: string;
}

/**
 * Fires `onLoadMore` when a sentinel element enters the viewport.
 *
 * Encapsulating the IntersectionObserver here keeps the page component free of
 * observer lifecycle handling, per the project's custom-hook mandate for
 * cross-cutting concerns.
 *
 * `onLoadMore` is held in a ref so a caller passing an inline arrow function
 * does not tear down and rebuild the observer on every render.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  rootMargin = "400px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  // Keep the latest callback without making it an effect dependency.
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, rootMargin]);

  return { sentinelRef };
}
