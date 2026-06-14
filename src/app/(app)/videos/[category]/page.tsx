"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { PlayCircle, Search } from "lucide-react";
import { videoApi, Video } from "@/lib/api";
import { VideoCard } from "@/components/video/VideoCard";
import { YouTubeModal } from "@/components/video/YouTubeModal";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function VideoSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="h-44 bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse mt-1" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VideoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const decodedCategory = decodeURIComponent(category);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    videoApi
      .getByCategory(decodedCategory)
      .then(setVideos)
      .catch((e) => setError(e.message ?? "Failed to load videos"))
      .finally(() => setLoading(false));
  }, [decodedCategory]);

  const filtered = search.trim()
    ? videos.filter(
        (v) =>
          v.title.toLowerCase().includes(search.toLowerCase()) ||
          v.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : videos;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">{decodedCategory}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Videos in the <span className="capitalize">{decodedCategory}</span> category.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search videos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 bg-white"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <VideoSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PlayCircle size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">
            {videos.length === 0
              ? "No videos in this category yet."
              : "No videos match your search."}
          </p>
          {search && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((v) => (
              <VideoCard key={v._id} video={v} onOpen={setPlaying} />
            ))}
          </div>
        </>
      )}

      {/* Inline player */}
      {playing && (
        <YouTubeModal
          youtubeId={playing.youtubeId}
          title={playing.title}
          description={playing.description}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  );
}
