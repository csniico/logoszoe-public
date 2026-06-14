"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  podcastApi,
  Podcast,
  PODCAST_CATEGORIES,
  PodcastCategory,
} from "@/lib/api";
import { ArrowLeft, Mic2, Play, Pause, Eye } from "lucide-react";

// ── Audio player state (module-level so one episode plays at a time) ──────────

let globalAudio: HTMLAudioElement | null = null;

function formatDuration(src: string) {
  // We don't know duration until the audio loads - show nothing until then
  return null;
}

// ── Episode card ──────────────────────────────────────────────────────────────

function EpisodeCard({ podcast, accentColor }: { podcast: Podcast; accentColor: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function togglePlay() {
    // Pause any other episode that's playing
    if (globalAudio && globalAudio !== audioRef.current) {
      globalAudio.pause();
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(podcast.audioUrl);
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }

    globalAudio = audioRef.current;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex gap-4 p-4">
      {/* Thumbnail */}
      <div
        className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: podcast.imageUrl ? undefined : `${accentColor}18` }}
      >
        {podcast.imageUrl ? (
          <img
            src={podcast.imageUrl}
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Mic2 size={28} style={{ color: accentColor, opacity: 0.5 }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-gray-900 transition-colors mb-1">
          {podcast.title}
        </h3>
        {podcast.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{podcast.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {(podcast.hits ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={10} /> {podcast.hits!.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Play button */}
      <div className="flex-shrink-0 flex items-center">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: playing ? accentColor : `${accentColor}18`,
            color: playing ? "#fff" : accentColor,
          }}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PodcastCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  const meta = PODCAST_CATEGORIES.find((c) => c.value === category);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    podcastApi
      .getByCategory(category as PodcastCategory)
      .then(setPodcasts)
      .catch(() => setError("Failed to load episodes. Please try again."))
      .finally(() => setLoading(false));
  }, [category]);

  const accentColor = meta?.color ?? "#0891b2";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/podcasts"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft size={14} /> All podcasts
        </Link>

        <div className="flex items-center gap-3">
          {meta?.color && (
            <div
              className="w-3 h-10 rounded-full flex-shrink-0"
              style={{ background: meta.color }}
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {meta?.label ?? category}
            </h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-0.5">
                {podcasts.length} episode{podcasts.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
            >
              <div className="w-20 h-20 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0 self-center" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      )}

      {/* Empty */}
      {!loading && !error && podcasts.length === 0 && (
        <div className="text-center py-16">
          <Mic2 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No episodes in this category yet.</p>
        </div>
      )}

      {/* List */}
      {!loading && !error && podcasts.length > 0 && (
        <div className="space-y-3">
          {podcasts.map((podcast) => (
            <EpisodeCard
              key={podcast._id}
              podcast={podcast}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
