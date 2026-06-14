"use client";

import { Play } from "lucide-react";
import { Video } from "@/lib/api";

function ytThumbnail(youtubeId: string) {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

/** A YouTube video card that opens the inline player (no external navigation). */
export function VideoCard({ video, onOpen }: { video: Video; onOpen: (v: Video) => void }) {
  const thumb = video.thumbnailUrl || ytThumbnail(video.youtubeId);

  return (
    <button
      onClick={() => onOpen(video)}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col text-left"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
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

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.05 0 12 0 12s0 3.95.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.95 24 12 24 12s0-3.95-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
          </svg>
          <span className="text-xs text-gray-400 capitalize">{video.category}</span>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
          {video.title}
        </h3>

        {video.description && (
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </button>
  );
}
