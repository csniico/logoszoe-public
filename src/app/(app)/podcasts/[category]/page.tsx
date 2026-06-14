"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  podcastApi,
  Podcast,
  PODCAST_CATEGORIES,
  PodcastCategory,
} from "@/lib/api";
import { ArrowLeft, Mic2, Play, Pause, Eye, RotateCcw, RotateCw, X } from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

function podcastImage(p: Podcast): string {
  return p.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(p._id)}/200/200`;
}

function fmtTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const RATES = [1, 1.25, 1.5, 2];

// ── Episode card (presentational) ─────────────────────────────────────────────

function EpisodeCard({
  podcast,
  accentColor,
  isActive,
  isPlaying,
  onPlay,
}: {
  podcast: Podcast;
  accentColor: string;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden transition-shadow group flex gap-4 p-4 ${
        isActive ? "border-transparent ring-2 shadow-sm" : "border-gray-100 hover:shadow-md"
      }`}
      style={isActive ? ({ ["--tw-ring-color" as string]: accentColor } as React.CSSProperties) : undefined}
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={podcastImage(podcast)} alt={podcast.title} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
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
          {isActive && (
            <span className="flex items-center gap-1 font-medium" style={{ color: accentColor }}>
              {isPlaying ? "Now playing" : "Paused"}
            </span>
          )}
        </div>
      </div>

      {/* Play button */}
      <div className="flex-shrink-0 flex items-center">
        <button
          onClick={onPlay}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: isActive && isPlaying ? accentColor : `${accentColor}18`,
            color: isActive && isPlaying ? "#fff" : accentColor,
          }}
          aria-label={isActive && isPlaying ? "Pause" : "Play"}
        >
          {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

// ── Custom player bar ─────────────────────────────────────────────────────────

function PlayerBar({
  podcast,
  accentColor,
  playing,
  time,
  duration,
  rate,
  onToggle,
  onSeek,
  onSkip,
  onCycleRate,
  onClose,
}: {
  podcast: Podcast;
  accentColor: string;
  playing: boolean;
  time: number;
  duration: number;
  rate: number;
  onToggle: () => void;
  onSeek: (t: number) => void;
  onSkip: (delta: number) => void;
  onCycleRate: () => void;
  onClose: () => void;
}) {
  const pct = duration > 0 ? (time / duration) * 100 : 0;

  const thumb =
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer";

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Artwork + title */}
          <div className="flex items-center gap-3 min-w-0 w-40 sm:w-56 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={podcastImage(podcast)}
              alt={podcast.title}
              className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{podcast.title}</p>
              <p className="text-[11px] text-gray-400 truncate">
                {PODCAST_CATEGORIES.find((c) => c.value === podcast.category)?.label ?? "Podcast"}
              </p>
            </div>
          </div>

          {/* Controls + seek */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 sm:gap-5">
              <button
                onClick={() => onSkip(-15)}
                className="flex flex-col items-center text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Back 15 seconds"
              >
                <RotateCcw size={18} />
                <span className="text-[8px] font-semibold leading-none mt-0.5">15</span>
              </button>

              <button
                onClick={onToggle}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
                style={{ background: accentColor }}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>

              <button
                onClick={() => onSkip(15)}
                className="flex flex-col items-center text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Forward 15 seconds"
              >
                <RotateCw size={18} />
                <span className="text-[8px] font-semibold leading-none mt-0.5">15</span>
              </button>
            </div>

            {/* Seek bar + times */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 tabular-nums w-8 text-right">{fmtTime(time)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={time}
                onChange={(e) => onSeek(Number(e.target.value))}
                aria-label="Seek"
                style={
                  {
                    ["--accent" as string]: accentColor,
                    background: `linear-gradient(to right, ${accentColor} ${pct}%, #e5e7eb ${pct}%)`,
                  } as React.CSSProperties
                }
                className={`flex-1 h-1.5 rounded-full appearance-none cursor-pointer ${thumb}`}
              />
              <span className="text-[10px] text-gray-400 tabular-nums w-8">{fmtTime(duration)}</span>
            </div>
          </div>

          {/* Speed + close */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onCycleRate}
              className="px-2 py-1 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors tabular-nums"
              aria-label="Playback speed"
            >
              {rate}x
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Close player"
            >
              <X size={16} />
            </button>
          </div>
        </div>
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

  // ── Player state ──
  const [current, setCurrent] = useState<Podcast | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    podcastApi
      .getByCategory(category as PodcastCategory)
      .then(setPodcasts)
      .catch(() => setError("Failed to load episodes. Please try again."))
      .finally(() => setLoading(false));
  }, [category]);

  // Load + play whenever the current episode changes
  useEffect(() => {
    if (!current) return;
    audioRef.current?.pause();
    const a = new Audio(current.audioUrl);
    a.playbackRate = rate;
    audioRef.current = a;
    setTime(0);
    setDuration(0);

    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);

    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));

    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?._id]);

  // Pause audio if the component unmounts
  useEffect(() => () => audioRef.current?.pause(), []);

  function selectEpisode(p: Podcast) {
    if (current?._id === p._id) {
      togglePlay();
      return;
    }
    setCurrent(p);
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function seek(t: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setTime(t);
  }

  function skip(delta: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + delta));
  }

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  function closePlayer() {
    audioRef.current?.pause();
    audioRef.current = null;
    setCurrent(null);
    setPlaying(false);
  }

  const accentColor = meta?.color ?? "#0891b2";

  return (
    <div className={current ? "pb-28" : ""}>
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
            <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ background: meta.color }} />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{meta?.label ?? category}</h1>
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
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
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
      {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}

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
              isActive={current?._id === podcast._id}
              isPlaying={current?._id === podcast._id && playing}
              onPlay={() => selectEpisode(podcast)}
            />
          ))}
        </div>
      )}

      {/* Custom player */}
      {current && (
        <PlayerBar
          podcast={current}
          accentColor={accentColor}
          playing={playing}
          time={time}
          duration={duration}
          rate={rate}
          onToggle={togglePlay}
          onSeek={seek}
          onSkip={skip}
          onCycleRate={cycleRate}
          onClose={closePlayer}
        />
      )}
    </div>
  );
}
