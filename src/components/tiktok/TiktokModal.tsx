"use client";

import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { TiktokVideo } from "@/lib/api";

/**
 * Inline TikTok player.
 *
 * Playback goes through TikTok's own embed. Their terms require it, and the
 * Display API never exposes a raw video file - only this embed URL.
 */
export function TiktokModal({
  video,
  onClose,
}: {
  video: TiktokVideo;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const caption = video.title || video.videoDescription || "TikTok video";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-white truncate">{caption}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* 9:16 to match TikTok's vertical format */}
        <div className="aspect-[9/16] max-h-[75vh] rounded-xl overflow-hidden bg-black shadow-2xl">
          {video.embedLink ? (
            <iframe
              src={video.embedLink}
              title={caption}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
              This video cannot be embedded.
            </div>
          )}
        </div>

        {video.shareUrl && (
          <a
            href={video.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mt-3 transition-colors"
          >
            <ExternalLink size={14} />
            Open in TikTok
          </a>
        )}
      </div>
    </div>
  );
}
