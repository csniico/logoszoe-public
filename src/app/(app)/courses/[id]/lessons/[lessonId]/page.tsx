"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  courseApi, courseVideoApi, ApiError,
  CourseVideo, Course, CourseModule, Lesson, CourseProgress,
} from "@/lib/api";
import {
  BookOpen, CheckCircle2, ChevronDown, Circle, Clock,
  FileText, Lock, Mic2, Pause, Play,
  ChevronRight,
  RotateCcw, RotateCw, Volume2, VolumeX,
} from "lucide-react";
import { CourseVideoPlayer } from "@/components/video/CourseVideoPlayer";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(sec?: number) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`;
  return `${m}m`;
}

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function vimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? null;
}


// ── Content renderers ─────────────────────────────────────────────────────────

function VideoContent({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<CourseVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseVideoApi.getOne(videoId)
      .then(setVideo)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [videoId]);

  if (loading) {
    return <div className="aspect-video bg-gray-100 rounded-xl animate-pulse" />;
  }

  if (!video) {
    return (
      <div className="aspect-video bg-gray-50 rounded-xl flex items-center justify-center">
        <p className="text-sm text-gray-400">Video not available.</p>
      </div>
    );
  }

  const ytId = youtubeId(video.videoUrl);
  if (ytId) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const vId = vimeoId(video.videoUrl);
  if (vId) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${vId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return <CourseVideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} />;
}

function AudioContent({ url, title }: { url: string; title: string }) {
  const audioRef  = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const [playing,     setPlaying]     = useState(false);
  const [current,     setCurrent]     = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [volume,      setVolume]      = useState(1);
  const [muted,       setMuted]       = useState(false);
  const [showVolume,  setShowVolume]  = useState(false);

  // Close volume drawer when clicking outside
  useEffect(() => {
    if (!showVolume) return;
    function onOutsideClick(e: MouseEvent) {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolume(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [showVolume]);

  function fmt(s: number) {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { void a.play(); setPlaying(true); }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current;
    if (!a) return;
    const t = Number(e.target.value);
    a.currentTime = t;
    setCurrent(t);
  }

  function skip(delta: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + delta));
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current;
    if (!a) return;
    const v = Number(e.target.value);
    a.volume = v;
    setVolume(v);
    if (v > 0 && muted) { a.muted = false; setMuted(false); }
  }

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    const next = !muted;
    a.muted = next;
    setMuted(next);
  }

  const seekPct = duration > 0 ? (current / duration) * 100 : 0;
  const volPct  = muted ? 0 : volume * 100;
  const trackStyle = (pct: number) => ({
    background: `linear-gradient(to right, #0d9488 ${pct}%, #e5e7eb ${pct}%)`,
  });

  const sliderThumb = `
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-primary-600
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-primary-600
    [&::-moz-range-thumb]:border-0
    [&::-moz-range-thumb]:cursor-pointer
  `;

  return (
    <div className="max-w-md mx-auto">

      {/* Hidden native audio */}
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />

      {/* Hero band - no border, just gradient */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-t-2xl px-6 pt-8 pb-12 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
          <Mic2 size={34} className="text-white" />
        </div>
        <p className="text-white font-semibold text-center text-sm leading-snug line-clamp-2 max-w-[200px]">
          {title}
        </p>
      </div>

      {/* Controls card - the only bordered element */}
      <div className="-mt-6 mx-4 bg-white rounded-2xl border border-gray-100 shadow-md px-5 py-5 space-y-4">

        {/* Seek bar */}
        <div className="space-y-1.5">
          <input
            type="range"
            min={0} max={duration || 0} step={0.05} value={current}
            onChange={seek}
            style={trackStyle(seekPct)}
            className={`w-full h-1 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
              [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5
              ${sliderThumb}`}
          />
          <div className="flex justify-between text-[11px] text-gray-400 tabular-nums">
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Playback row: centre controls + volume far right */}
        <div className="flex items-center">

          {/* Centre: skip / play / skip */}
          <div className="flex-1 flex items-center justify-center gap-6">
            <button
              onClick={() => skip(-10)}
              className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary-700 transition-colors"
            >
              <RotateCcw size={18} />
              <span className="text-[9px] font-semibold">10s</span>
            </button>

            <button
              onClick={toggle}
              className="w-[50px] h-[50px] rounded-full bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center shadow-md"
            >
              {playing
                ? <Pause size={19} className="text-white" />
                : <Play  size={19} className="text-white ml-0.5" />
              }
            </button>

            <button
              onClick={() => skip(10)}
              className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary-700 transition-colors"
            >
              <RotateCw size={18} />
              <span className="text-[9px] font-semibold">10s</span>
            </button>
          </div>

          {/* Volume - far right, with pop-up drawer */}
          <div ref={volumeRef} className="relative flex-shrink-0">

            {/* Drawer - slides up from button */}
            {showVolume && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl border border-gray-100 shadow-lg px-3 pt-3 pb-2 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 z-10">
                {/* Mute button at top of drawer */}
                <button
                  onClick={toggleMute}
                  className={`transition-colors ${muted || volume === 0 ? "text-red-400 hover:text-red-500" : "text-gray-500 hover:text-primary-700"}`}
                >
                  {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {/* Vertical slider - rotated range input */}
                <div className="h-[80px] flex items-center justify-center overflow-visible">
                  <input
                    type="range"
                    min={0} max={1} step={0.02}
                    value={muted ? 0 : volume}
                    onChange={handleVolume}
                    style={{
                      ...trackStyle(volPct),
                      transform: "rotate(-90deg)",
                      width: "72px",
                    }}
                    className={`h-1 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
                      ${sliderThumb}`}
                  />
                </div>
              </div>
            )}

            {/* Volume toggle button */}
            <button
              onClick={() => setShowVolume((v) => !v)}
              className={`p-1.5 rounded-lg transition-colors ${
                showVolume
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-400 hover:text-primary-700"
              }`}
            >
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

        </div>
      </div>

      {/* Transcript - disabled until backend ready */}
      <div className="mx-4 mt-3">
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-300 text-xs font-medium cursor-not-allowed"
        >
          <FileText size={13} />
          Generate transcript
          <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-400 uppercase tracking-wider">
            Coming soon
          </span>
        </button>
      </div>

    </div>
  );
}


function TextContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm prose-green max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Study guide collapsible section ──────────────────────────────────────────

function StudySection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 bg-white border-t border-gray-50 text-sm text-gray-600 leading-relaxed space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}


// ── Sidebar ───────────────────────────────────────────────────────────────────

function LessonSidebar({
  courseId,
  currentLessonId,
  modules,
  lessons,
  completedIds,
  unlockedIds,
}: {
  courseId: string;
  currentLessonId: string;
  modules: CourseModule[];
  lessons: Lesson[];
  completedIds: Set<string>;
  unlockedIds: Set<string>;
}) {
  const completed = completedIds.size;
  const total = lessons.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  // Render one lesson row. Locked rows are not clickable.
  const lessonRow = (l: Lesson, idx: number) => {
    const isCurrent = l._id === currentLessonId;
    const isDone = completedIds.has(l._id);
    const isLocked = !unlockedIds.has(l._id);

    const inner = (
      <>
        <span className="text-[11px] text-gray-400 w-4 flex-shrink-0">{idx + 1}</span>
        <span className={`flex-1 text-xs leading-snug line-clamp-2 ${isCurrent ? "font-semibold text-gray-800" : isLocked ? "text-gray-400" : "text-gray-600"}`}>
          {l.title}
        </span>
        {isDone
          ? <CheckCircle2 size={13} className="text-gray-700 flex-shrink-0" />
          : isCurrent
            ? <ChevronRight size={13} className="text-gray-500 flex-shrink-0" />
            : isLocked
              ? <Lock size={12} className="text-gray-300 flex-shrink-0" />
              : <Circle size={13} className="text-gray-200 flex-shrink-0" />
        }
      </>
    );

    if (isLocked) {
      return (
        <li key={l._id}>
          <div
            title="Complete the previous lessons to unlock this one."
            className="flex items-center gap-3 px-4 py-3 cursor-not-allowed"
          >
            {inner}
          </div>
        </li>
      );
    }

    return (
      <li key={l._id}>
        <Link
          href={`/courses/${courseId}/lessons/${l._id}`}
          className={`flex items-center gap-3 px-4 py-3 transition-colors ${isCurrent ? "bg-gray-100" : "hover:bg-gray-50"}`}
        >
          {inner}
        </Link>
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Progress</p>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-400">{completed} / {total} lessons</span>
          <span className={`text-xs font-semibold ${pct === 100 ? "text-gray-900" : "text-gray-500"}`}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? "bg-gray-700" : "bg-gray-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {sortedModules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 border-b border-gray-50">
            Lessons
          </p>
          <ul className="divide-y divide-gray-50">
            {lessons.map((l, idx) => lessonRow(l, idx))}
          </ul>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedModules.map((module) => {
            const moduleLessons = lessons
              .filter((l) => l.moduleId === module._id)
              .sort((a, b) => a.order - b.order);
            if (moduleLessons.length === 0) return null;
            return (
              <div key={module._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 border-b border-gray-50">
                  {module.title}
                </p>
                <ul className="divide-y divide-gray-50">
                  {moduleLessons.map((l, idx) => lessonRow(l, idx))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ── Countdown dialog ─────────────────────────────────────────────────────────

const COUNTDOWN_SECS = 5;

function CountdownDialog({
  nextLesson,
  courseId,
  onCancel,
}: {
  nextLesson: Lesson | null;
  courseId: string;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0); // ms since mount

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const e = Date.now() - start;
      setElapsed(e);
      if (e >= COUNTDOWN_SECS * 1000) {
        clearInterval(id);
        if (nextLesson) {
          router.push(`/courses/${courseId}/lessons/${nextLesson._id}`);
        } else {
          router.push(`/courses/${courseId}`);
        }
      }
    }, 50);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fraction   = Math.min(elapsed / (COUNTDOWN_SECS * 1000), 1);
  const secondsLeft = Math.max(0, Math.ceil(COUNTDOWN_SECS - elapsed / 1000));

  // SVG ring
  const r    = 30;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * fraction; // 0 = full ring → circ = empty

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full px-8 py-8 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-200">

        {/* Circular countdown ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg width="80" height="80" className="-rotate-90" aria-hidden="true">
            {/* Track */}
            <circle cx="40" cy="40" r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
            {/* Depleting arc */}
            <circle
              cx="40" cy="40" r={r}
              fill="none"
              stroke="#111827"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
            />
          </svg>
          {/* Number centred in the ring */}
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900 tabular-nums">
            {secondsLeft}
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 size={17} className="text-gray-700 flex-shrink-0" />
            <h2 className="text-base font-bold text-gray-900">Lesson complete!</h2>
          </div>
          {nextLesson ? (
            <p className="text-sm text-gray-500 leading-relaxed">
              Up next:{" "}
              <span className="font-medium text-gray-700 line-clamp-2">{nextLesson.title}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500 leading-relaxed">
              You've finished the course!<br />
              Heading back to the course page…
            </p>
          )}
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}


// ── Page ──────────────────────────────────────────────────────────────────────

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Server-side backstop: the lesson fetch returns 403 when the lesson is locked.
  const [locked, setLocked] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const [studyAnswers, setStudyAnswers] = useState<Record<number, string>>({});
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Reset per-lesson state when navigating between lessons (the route param
      // changes without remounting this component).
      setLoading(true);
      setError(null);
      setLocked(false);
      setCompleteError(null);
      try {
        // Course, modules, lessons and progress load regardless of the lock so
        // the outline/sidebar can still render even if the lesson body is gated.
        const [c, ms, ls, p] = await Promise.all([
          courseApi.getOne(courseId),
          courseApi.getModules(courseId).catch(() => [] as CourseModule[]),
          courseApi.getLessons(courseId),
          courseApi.getProgress(courseId).catch(() => null),
        ]);
        if (cancelled) return;
        setCourse(c);
        setModules(ms);
        setAllLessons(ls);
        setProgress(p);

        // The lesson body is auth-gated and lock-enforced server-side: a 403
        // means the lesson is locked. Keep the user out and show the locked
        // state rather than a crash/error screen.
        try {
          const l = await courseApi.getLesson(courseId, lessonId);
          if (!cancelled) setLesson(l);
        } catch (e) {
          if (e instanceof ApiError && e.status === 403) {
            if (!cancelled) setLocked(true);
          } else {
            throw e;
          }
        }
      } catch {
        if (!cancelled) setError("Lesson not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [courseId, lessonId]);

  // Lock/completion state comes straight from the backend (`progress.lessons`).
  // We never recompute it from `completedLessonIds` or lesson order.
  const completedIds = new Set(
    (progress?.lessons ?? []).filter((l) => l.completed).map((l) => l.lessonId),
  );
  const unlockedIds = new Set(
    (progress?.lessons ?? []).filter((l) => l.unlocked).map((l) => l.lessonId),
  );
  const isAlreadyComplete = completedIds.has(lessonId);

  // Display ordering only (modules in order, lessons in order within each), used
  // to pick the "up next" lesson. Not used for lock decisions.
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const orderedLessons: Lesson[] = sortedModules.length > 0
    ? sortedModules.flatMap((m) =>
        allLessons.filter((l) => l.moduleId === m._id).sort((a, b) => a.order - b.order))
    : [...allLessons].sort((a, b) => a.order - b.order);

  const currentIndex = orderedLessons.findIndex((l) => l._id === lessonId);
  const nextLesson = orderedLessons[currentIndex + 1] ?? null;

  // This lesson is locked when the server said so (403 → `locked`) or when
  // progress loaded and its `unlocked` flag is false. Fails open if progress
  // didn't load at all, so a transient error never traps the learner - the 403
  // backstop still applies in that case.
  const currentLocked = locked || (!!progress && !unlockedIds.has(lessonId));

  // Gate direct access: bounce a locked lesson back to the course outline.
  useEffect(() => {
    if (!loading && currentLocked) {
      router.replace(`/courses/${courseId}`);
    }
  }, [loading, currentLocked, courseId, router]);

  async function handleMarkComplete() {
    if (completing || isAlreadyComplete) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      // Build response payload from study + reflection answers
      const responses = [
        ...studyQs.map((q, i) => ({
          questionId:   `study-${i}`,
          questionText: q.text,
          questionType: "study",
          userResponse: (studyAnswers[i] ?? "").trim(),
        })),
        ...reflectionQs.map((q, i) => ({
          questionId:   `reflection-${i}`,
          questionText: q.text,
          questionType: "reflection",
          userResponse: (reflectionAnswers[i] ?? "").trim(),
        })),
      ];

      // Submit answers and mark complete in parallel
      await Promise.all([
        responses.length > 0
          ? courseApi.submitAnswers(courseId, lessonId, responses)
          : Promise.resolve(),
        courseApi.markComplete(courseId, lessonId),
      ]);

      // Re-fetch progress - it's the source of truth for completion + which
      // lesson is now unlocked. Fall back to an optimistic bump if it fails.
      const fresh = await courseApi.getProgress(courseId).catch(() => null);
      setProgress((p) =>
        fresh ?? {
          courseId,
          totalLessons: p?.totalLessons ?? allLessons.length,
          lessonsCompleted: (p?.lessonsCompleted ?? 0) + 1,
          completedLessonIds: [...(p?.completedLessonIds ?? []), lessonId],
          lessons: p?.lessons,
        },
      );
      // Brief "success flash" on the button before the countdown opens
      setJustCompleted(true);
      setTimeout(() => setShowCountdown(true), 650);
    } catch (e) {
      // Server-side backstop: completion is rejected with 403 if the lesson is
      // locked. Surface it instead of failing silently.
      if (e instanceof ApiError && e.status === 403) {
        setCompleteError("This lesson is locked. Complete the previous lesson first.");
      } else {
        setCompleteError("Something went wrong. Please try again.");
      }
    } finally {
      setCompleting(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      // unmarkComplete is the critical call - must succeed
      await courseApi.unmarkComplete(courseId, lessonId);
      // deleteSubmission is best-effort; never let it block the UI reset
      courseApi.deleteSubmission(courseId, lessonId).catch(() => {});
      // Re-fetch progress (source of truth for completion + lock flags). Fall
      // back to an optimistic decrement if the re-fetch fails.
      const fresh = await courseApi.getProgress(courseId).catch(() => null);
      setProgress((p) =>
        fresh ?? {
          courseId,
          totalLessons: p?.totalLessons ?? allLessons.length,
          lessonsCompleted: Math.max(0, (p?.lessonsCompleted ?? 1) - 1),
          completedLessonIds: (p?.completedLessonIds ?? []).filter((id) => id !== lessonId),
          lessons: p?.lessons,
        },
      );
      setJustCompleted(false);
      setStudyAnswers({});
      setReflectionAnswers({});
      setShowResetConfirm(false);
    } catch {
      // unmarkComplete failed - stay put so user can retry
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 items-start animate-pulse">
        <div className="w-full lg:flex-1 space-y-5">
          <div className="h-6 bg-gray-100 rounded w-1/4" />
          <div className="h-8 bg-gray-100 rounded w-2/3" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
        <div className="w-full lg:w-60 space-y-4">
          <div className="h-20 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Locked: either the server returned 403 (lesson body never loaded) or
  // progress says this lesson isn't unlocked. Show a "complete the previous
  // lesson first" state - never the lesson content, never an error/crash. The
  // redirect to the course outline fires from the effect above. This must come
  // before the not-found guard, because on a 403 `lesson` is intentionally null.
  if (currentLocked) {
    return (
      <div className="text-center py-16">
        <Lock size={32} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm mb-4">
          Complete the previous lesson first to unlock this one.
        </p>
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          Back to course
        </Link>
      </div>
    );
  }

  if (error || !lesson || !course) {
    return (
      <div className="text-center py-16">
        <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{error ?? "Lesson not found."}</p>
      </div>
    );
  }

  // ── Derived: can mark complete ──────────────────────────────────────────────
  const studyQs      = lesson.studyQuestions      ?? [];
  const reflectionQs = lesson.reflectionQuestions ?? [];

  const allStudyAnswered      = studyQs.every((_, i)      => (studyAnswers[i]      ?? "").trim().length > 0);
  const allReflectionAnswered = reflectionQs.every((_, i) => (reflectionAnswers[i] ?? "").trim().length > 0);

  const canMarkComplete =
    (studyQs.length === 0      || allStudyAnswered) &&
    (reflectionQs.length === 0 || allReflectionAnswered);

  return (
    <div>
      {/* Countdown dialog - shown after marking complete (next lesson or back to course) */}
      {showCountdown && (
        <CountdownDialog
          nextLesson={nextLesson}
          courseId={courseId}
          onCancel={() => { setShowCountdown(false); setJustCompleted(false); }}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <Link href="/courses" className="hover:text-gray-700 transition-colors">Courses</Link>
        <ChevronRight size={13} />
        <Link href={`/courses/${courseId}`} className="hover:text-gray-700 transition-colors line-clamp-1 max-w-[160px]">
          {course.title}
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-500 line-clamp-1 max-w-[160px]">{lesson.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Main ──────────────────────────────────────────────────────────── */}
        <div className="w-full lg:flex-1 min-w-0 space-y-5">

          {/* Lesson header */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {formatDuration(lesson.durationSec) && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} /> {formatDuration(lesson.durationSec)}
                </span>
              )}
              {isAlreadyComplete && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-900">
                  <CheckCircle2 size={12} /> Completed
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{lesson.title}</h1>
          </div>

          {/* Content - transparent, no card border */}
          <div className="py-1">
            {lesson.type === "video" && <VideoContent videoId={lesson.content} />}
            {lesson.type === "audio" && <AudioContent url={lesson.content} title={lesson.title} />}
            {lesson.type === "text"  && <TextContent html={lesson.content} />}
          </div>

          {/* Study guide sections */}
          {(studyQs.length > 0 ||
            reflectionQs.length > 0 ||
            lesson.prayer || lesson.furtherStudy) && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Study Guide</h2>

              {lesson.prayer && (
                <StudySection title="Prayer" defaultOpen>
                  <p className="whitespace-pre-wrap italic text-gray-500">{lesson.prayer}</p>
                </StudySection>
              )}

              {lesson.furtherStudy && (
                <StudySection title="Further Study" defaultOpen>
                  <div
                    className="prose prose-sm prose-green max-w-none leading-relaxed [&_a]:text-primary-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary-800"
                    dangerouslySetInnerHTML={{ __html: lesson.furtherStudy }}
                  />
                </StudySection>
              )}

              {studyQs.length > 0 && (
                <StudySection title={`Study Questions (${studyQs.length})`} defaultOpen>
                  <div className="space-y-5 pt-1">
                    {studyQs.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <p className="text-sm font-medium text-gray-800">
                          <span className="text-gray-400 mr-1.5">{i + 1}.</span>{q.text}
                        </p>
                        <textarea
                          value={studyAnswers[i] ?? ""}
                          onChange={(e) => setStudyAnswers((a) => ({ ...a, [i]: e.target.value }))}
                          rows={3}
                          placeholder="Your answer…"
                          className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none placeholder:text-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </StudySection>
              )}

              {reflectionQs.length > 0 && (
                <StudySection title={`Reflection Questions (${reflectionQs.length})`} defaultOpen>
                  <div className="space-y-5 pt-1">
                    {reflectionQs.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <p className="text-sm font-medium text-gray-800">
                          <span className="text-gray-400 mr-1.5">{i + 1}.</span>{q.text}
                        </p>
                        <textarea
                          value={reflectionAnswers[i] ?? ""}
                          onChange={(e) => setReflectionAnswers((a) => ({ ...a, [i]: e.target.value }))}
                          rows={3}
                          placeholder="Your answer…"
                          className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none placeholder:text-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </StudySection>
              )}
            </div>
          )}

          {/* Mark complete / Reset */}
          <div className="pt-2 pb-8 flex flex-col items-start gap-3">
            <button
              onClick={handleMarkComplete}
              disabled={!canMarkComplete || completing || isAlreadyComplete}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-500 ${
                justCompleted || isAlreadyComplete
                  ? "bg-gray-100 text-gray-700 border border-gray-200 cursor-default shadow-none"
                  : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {completing ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (justCompleted || isAlreadyComplete) ? (
                <CheckCircle2 size={16} className="text-gray-600" />
              ) : (
                <Circle size={16} />
              )}
              <span className="transition-all duration-300">
                {completing ? "Marking…" : (justCompleted || isAlreadyComplete) ? "Lesson completed" : "Mark as completed"}
              </span>
            </button>

            {/* Hint when blocked */}
            {!canMarkComplete && !isAlreadyComplete && !completing && (
              <p className="text-xs text-gray-400">
                Answer all study guide questions above to continue.
              </p>
            )}

            {/* Completion error (e.g. server rejected a locked lesson with 403) */}
            {completeError && !completing && (
              <p className="text-xs text-red-500">{completeError}</p>
            )}

            {/* Reset link - only once completed */}
            {isAlreadyComplete && !showResetConfirm && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <RotateCcw size={12} />
                Reset progress
              </button>
            )}

            {/* Inline warning + confirm */}
            {isAlreadyComplete && showResetConfirm && (
              <div className="flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 max-w-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p className="text-xs text-red-700 leading-relaxed">
                    This will mark the lesson as incomplete and permanently delete your submitted answers. This cannot be undone.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {resetting
                      ? <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Resetting…</>
                      : "Yes, reset"}
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    disabled={resetting}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-60 lg:flex-shrink-0 lg:sticky lg:top-6">
          <LessonSidebar
            courseId={courseId}
            currentLessonId={lessonId}
            modules={modules}
            lessons={allLessons}
            completedIds={completedIds}
            unlockedIds={unlockedIds}
          />
        </aside>
      </div>
    </div>
  );
}
