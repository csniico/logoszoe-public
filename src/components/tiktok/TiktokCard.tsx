"use client";

import { Play, Heart, MessageCircle, Eye } from "lucide-react";
import { TiktokVideo } from "@/lib/api";

/** Compact view/like counts - 12300 → "12.3K". */
function formatCount(n?: number) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** A TikTok video card that opens the inline embed player (no external navigation). */
export function TiktokCard({
  video,
  onOpen,
}: {
  video: TiktokVideo;
  onOpen: (v: TiktokVideo) => void;
}) {
  const caption = video.title || video.videoDescription || "Untitled";
  const duration = formatDuration(video.duration);

  return (
    <button
      onClick={() => onOpen(video)}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col text-left"
    >
      {/* Thumbnail - 9:16 to match TikTok's vertical format */}
      <div className="relative aspect-[9/16] bg-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
        {video.coverImageUrl ? (
          /* Plain <img>: TikTok cover URLs are signed and expiring, which the
             next/image optimizer cannot fetch. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={video.coverImageUrl}
            alt={caption}
            loading="lazy"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity duration-200"
          />
        ) : (
          <span className="text-xs text-gray-500">No cover</span>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Play size={18} className="text-gray-900 ml-0.5" fill="currentColor" />
          </div>
        </div>

        {duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-medium">
            {duration}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
          {caption}
        </h3>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {formatCount(video.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} />
            {formatCount(video.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} />
            {formatCount(video.commentCount)}
          </span>
        </div>
      </div>
    </button>
  );
}
