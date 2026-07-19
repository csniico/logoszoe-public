"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Loader2,
} from "lucide-react";

function fmt(s: number): string {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const mm = h > 0 ? m.toString().padStart(2, "0") : `${m}`;
  return `${h > 0 ? `${h}:` : ""}${mm}:${sec.toString().padStart(2, "0")}`;
}

const ACCENT = "#0d9488"; // primary-600

const THUMB =
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer";

/**
 * Custom-controls HTML5 player for uploaded course videos. (YouTube/Vimeo keep
 * their own embedded players for ToS compliance - this is for direct files.)
 */
export function CourseVideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 2600);
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
    reveal();
  }

  function seek(t: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = t;
    setCurrent(t);
  }

  function skip(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
    reveal();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function changeVolume(val: number) {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  }

  function toggleFullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) void el.requestFullscreen?.();
    else void document.exitFullscreen?.();
  }

  const seekPct = duration > 0 ? (current / duration) * 100 : 0;
  const volPct = muted ? 0 : volume * 100;

  return (
    <div
      ref={wrapRef}
      className="relative aspect-video rounded-xl overflow-hidden bg-black select-none"
      onMouseMove={reveal}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onPlay={() => { setPlaying(true); reveal(); }}
        onPause={() => { setPlaying(false); setShowControls(true); }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onVolumeChange={(e) => { setVolume(e.currentTarget.volume); setMuted(e.currentTarget.muted); }}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
      />

      {/* Buffering spinner */}
      {buffering && playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={40} className="text-white/90 animate-spin" />
        </div>
      )}

      {/* Center play button when paused */}
      {!playing && !buffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group"
          aria-label="Play"
        >
          <span className="w-16 h-16 rounded-full bg-black/45 group-hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors">
            <Play size={28} className="text-white ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-2.5 pt-8 transition-opacity duration-200 ${
          showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          style={{ background: `linear-gradient(to right, ${ACCENT} ${seekPct}%, rgba(255,255,255,0.3) ${seekPct}%)` }}
          className={`w-full h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 ${THUMB}`}
        />

        {/* Buttons row */}
        <div className="flex items-center gap-3 mt-1.5 text-white">
          <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className="hover:text-white/80 transition-colors">
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={() => skip(-10)} aria-label="Back 10s" className="hover:text-white/80 transition-colors">
            <RotateCcw size={18} />
          </button>
          <button onClick={() => skip(10)} aria-label="Forward 10s" className="hover:text-white/80 transition-colors">
            <RotateCw size={18} />
          </button>

          <span className="text-xs tabular-nums text-white/90">
            {fmt(current)} <span className="text-white/50">/ {fmt(duration)}</span>
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-1.5 group/vol">
            <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="hover:text-white/80 transition-colors">
              {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              aria-label="Volume"
              style={{ background: `linear-gradient(to right, #fff ${volPct}%, rgba(255,255,255,0.3) ${volPct}%)` }}
              className={`w-16 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 ${THUMB}`}
            />
          </div>

          <button onClick={toggleFullscreen} aria-label="Fullscreen" className="hover:text-white/80 transition-colors">
            {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
