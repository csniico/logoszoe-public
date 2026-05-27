"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Play, PlayCircle, Search } from "lucide-react";
import { videoApi, Video } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function ytThumbnail(youtubeId: string) {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

function ytUrl(youtubeId: string) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

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

// ── Video card ────────────────────────────────────────────────────────────────

function VideoCard({ video }: { video: Video }) {
  const thumb = video.thumbnailUrl || ytThumbnail(video.youtubeId);

  return (
    <a
      href={ytUrl(video.youtubeId)}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="relative h-44 bg-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
        <img
          src={thumb}
          alt={video.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity duration-200"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Play size={18} className="text-gray-900 ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.05 0 12 0 12s0 3.95.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.95 24 12 24 12s0-3.95-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
          </svg>
          <span className="text-xs text-gray-400 capitalize">{video.category}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-900 transition-colors leading-snug line-clamp-2 flex-1">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </a>
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
            {filtered.map((v) => <VideoCard key={v._id} video={v} />)}
          </div>
        </>
      )}
    </div>
  );
}
