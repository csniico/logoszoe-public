"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, PlayCircle, ExternalLink } from "lucide-react";
import { tiktokApi, TiktokVideo, TiktokProfile } from "@/lib/api";
import { TiktokCard } from "@/components/tiktok/TiktokCard";
import { TiktokModal } from "@/components/tiktok/TiktokModal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const PAGE_SIZE = 24;

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TiktokSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="aspect-[9/16] bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse mt-1" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TiktokPage() {
  const [videos, setVideos] = useState<TiktokVideo[]>([]);
  const [profile, setProfile] = useState<TiktokProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<TiktokVideo | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    tiktokApi
      .getAll(1, PAGE_SIZE)
      .then((res) => {
        setVideos(res.data);
        setTotalPages(res.totalPages);
      })
      .catch((e) => setError(e.message ?? "Failed to load TikTok videos"))
      .finally(() => setLoading(false));

    // A missing profile just means no account is connected - not a page error.
    tiktokApi.getProfile().then(setProfile).catch(() => {});
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const next = page + 1;

    tiktokApi
      .getAll(next, PAGE_SIZE)
      .then((res) => {
        // Guard against duplicates if a page boundary shifts between requests.
        setVideos((prev) => {
          const seen = new Set(prev.map((v) => v.videoId));
          return [...prev, ...res.data.filter((v) => !seen.has(v.videoId))];
        });
        setPage(next);
        setTotalPages(res.totalPages);
      })
      .catch((e) => setError(e.message ?? "Failed to load more videos"))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, page, totalPages]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    // Paging while a search filters the loaded set would be confusing.
    hasMore: page < totalPages && !search.trim(),
    loading: loading || loadingMore,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return videos;
    const q = search.trim().toLowerCase();
    return videos.filter(
      (v) =>
        v.title?.toLowerCase().includes(q) ||
        v.videoDescription?.toLowerCase().includes(q),
    );
  }, [videos, search]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">TikTok</h1>
        <p className="text-gray-500 text-sm mt-1">
          Short clips and encouragement from our TikTok channel.
        </p>

        {profile?.displayName && (
          <div className="flex items-center gap-2 mt-3">
            {profile.avatarUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm font-medium text-gray-700">
              {profile.displayName}
            </span>
            {profile.profileDeepLink && (
              <a
                href={profile.profileDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ExternalLink size={12} />
                View profile
              </a>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search TikTok videos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 bg-white"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <TiktokSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PlayCircle size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">
            {videos.length === 0
              ? "No TikTok videos yet."
              : "No videos match your search."}
          </p>
          {videos.length > 0 && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-sm text-gray-900 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {filtered.length} video{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((v) => (
              <TiktokCard key={v.videoId} video={v} onOpen={setPlaying} />
            ))}
          </div>

          {/* Infinite-scroll sentinel */}
          <div ref={sentinelRef} className="h-px" />

          {loadingMore && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <TiktokSkeleton key={i} />
              ))}
            </div>
          )}
        </>
      )}

      {playing && (
        <TiktokModal video={playing} onClose={() => setPlaying(null)} />
      )}
    </div>
  );
}
