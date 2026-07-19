"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Plays a YouTube video INLINE (embedded) so the user never leaves the app -
 * keeps YouTube's own player/controls for ToS compliance. `playsinline=1`
 * keeps it in-page on iOS Safari (mobile web).
 */
export function YouTubeModal({
  youtubeId,
  title,
  description,
  onClose,
}: {
  youtubeId: string;
  title: string;
  description?: string;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {description && (
          <p className="text-white/70 text-sm mt-3 leading-relaxed max-h-28 overflow-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
