"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  courseApi, courseVideoApi, submissionRemarksApi,
  CourseVideo, Course, Lesson, Question, Submission, CourseProgress, Remark,
} from "@/lib/api";
import {
  BookOpen, CheckCircle2, Circle, Clock,
  ExternalLink, FileText, Link2, MessageCircle, Mic2, Pause, Play,
  PlayCircle, ChevronRight, PartyPopper,
  RotateCcw, RotateCw, Volume2, VolumeX,
} from "lucide-react";

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

const TYPE_ICON: Record<string, React.ElementType> = {
  text: FileText, document: FileText, video: PlayCircle, audio: Mic2, link: Link2,
};
const TYPE_LABEL: Record<string, string> = {
  text: "Reading", document: "Document", video: "Video", audio: "Audio", link: "Link",
};
const TYPE_COLOR: Record<string, string> = {
  text:     "bg-blue-50 text-blue-600",
  document: "bg-primary-50 text-primary-700",
  video:    "bg-rose-50 text-rose-600",
  audio:    "bg-gold-50 text-gold-700",
  link:     "bg-amber-50 text-amber-600",
};

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

  return (
    <video
      controls
      className="w-full rounded-xl bg-black"
      src={video.videoUrl}
      poster={video.thumbnailUrl}
    >
      Your browser does not support the video tag.
    </video>
  );
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

      {/* Hero band — no border, just gradient */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-t-2xl px-6 pt-8 pb-12 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
          <Mic2 size={34} className="text-white" />
        </div>
        <p className="text-white font-semibold text-center text-sm leading-snug line-clamp-2 max-w-[200px]">
          {title}
        </p>
      </div>

      {/* Controls card — the only bordered element */}
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

          {/* Volume — far right, with pop-up drawer */}
          <div ref={volumeRef} className="relative flex-shrink-0">

            {/* Drawer — slides up from button */}
            {showVolume && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl border border-gray-100 shadow-lg px-3 pt-3 pb-2 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 z-10">
                {/* Mute button at top of drawer */}
                <button
                  onClick={toggleMute}
                  className={`transition-colors ${muted || volume === 0 ? "text-red-400 hover:text-red-500" : "text-gray-500 hover:text-primary-700"}`}
                >
                  {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {/* Vertical slider — rotated range input */}
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

      {/* Transcript — disabled until backend ready */}
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

function DocumentContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm prose-green max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function LinkContent({ url }: { url: string }) {
  // Render YouTube/Vimeo as embed even when type=link
  const ytId = youtubeId(url);
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

  const vId = vimeoId(url);
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

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Link2 size={18} className="text-amber-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 mb-1">External resource</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-700 underline underline-offset-2 break-all hover:text-amber-900"
        >
          {url}
        </a>
        <div className="mt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
          >
            Open link <ExternalLink size={11} />
          </a>
        </div>
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

// ── Questions section ─────────────────────────────────────────────────────────

function QuestionsSection({
  courseId,
  lessonId,
  questions,
  onSubmitted,
}: {
  courseId: string;
  lessonId: string;
  questions: Question[];
  onSubmitted: (sub: Submission) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = questions.every((q) => (answers[q._id] ?? "").trim().length > 0);

  async function handleSubmit() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const responses = questions.map((q) => ({
        questionId: q._id,
        userResponse: answers[q._id] ?? "",
      }));
      const sub = await courseApi.submitAnswers(courseId, lessonId, responses);
      setSubmitted(true);
      onSubmitted(sub);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-gray-100 border border-gray-200 px-5 py-4 flex items-center gap-3">
        <CheckCircle2 size={18} className="text-gray-900 flex-shrink-0" />
        <p className="text-sm text-gray-900 font-medium">Answers submitted — you can now mark this lesson as complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900">Questions</h3>

      {questions.map((q, idx) => (
        <div key={q._id} className="space-y-3">
          <p className="text-sm font-medium text-gray-800">
            <span className="text-gray-400 mr-2">{idx + 1}.</span>
            {q.text}
          </p>

          {q.type === "multiple_choice" && q.options.length > 0 ? (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    answers[q._id] === opt.value
                      ? "border-gray-500 bg-gray-100"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    value={opt.value}
                    checked={answers[q._id] === opt.value}
                    onChange={() => setAnswers((a) => ({ ...a, [q._id]: opt.value }))}
                    className="accent-gray-900"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-400 mr-1.5">{opt.label}.</span>
                    {opt.value}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={answers[q._id] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q._id]: e.target.value }))}
              rows={3}
              placeholder="Your answer…"
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none placeholder:text-gray-300"
            />
          )}
        </div>
      ))}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit answers"}
      </button>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function LessonSidebar({
  courseId,
  currentLessonId,
  lessons,
  completedIds,
}: {
  courseId: string;
  currentLessonId: string;
  lessons: Lesson[];
  completedIds: Set<string>;
}) {
  const completed = completedIds.size;
  const total = lessons.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 border-b border-gray-50">
          Lessons
        </p>
        <ul className="divide-y divide-gray-50">
          {lessons.map((l, idx) => {
            const isCurrent = l._id === currentLessonId;
            const isDone = completedIds.has(l._id);
            return (
              <li key={l._id}>
                <Link
                  href={`/courses/${courseId}/lessons/${l._id}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${isCurrent ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  <span className="text-[11px] text-gray-400 w-4 flex-shrink-0">{idx + 1}</span>
                  <span className={`flex-1 text-xs leading-snug line-clamp-2 ${isCurrent ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                    {l.title}
                  </span>
                  {isDone
                    ? <CheckCircle2 size={13} className="text-gray-700 flex-shrink-0" />
                    : isCurrent
                      ? <ChevronRight size={13} className="text-gray-500 flex-shrink-0" />
                      : <Circle size={13} className="text-gray-200 flex-shrink-0" />
                  }
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ── Submitted answers view ────────────────────────────────────────────────────

function SubmissionView({
  questions,
  submission,
}: {
  questions: Question[];
  submission: Submission;
}) {
  const responseMap = Object.fromEntries(
    submission.responses.map((r) => [r.questionId, r.userResponse]),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-900">Questions</h3>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
          <CheckCircle2 size={11} /> Submitted
        </span>
      </div>

      {questions.map((q, idx) => {
        const userAnswer = responseMap[q._id] ?? "—";
        const isCorrect  = q.type === "multiple_choice" && q.correctOption
          ? userAnswer === q.correctOption
          : null;

        return (
          <div key={q._id} className="space-y-2.5">
            <p className="text-sm font-medium text-gray-800">
              <span className="text-gray-400 mr-2">{idx + 1}.</span>
              {q.text}
            </p>

            {q.type === "multiple_choice" ? (
              <div className="space-y-1.5">
                {q.options.map((opt) => {
                  const selected = userAnswer === opt.value;
                  const correct  = q.correctOption === opt.value;
                  return (
                    <div
                      key={opt.value}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${
                        selected && correct  ? "border-gray-400 bg-gray-100 text-gray-900" :
                        selected && !correct ? "border-red-200 bg-red-50 text-red-700" :
                        correct              ? "border-gray-200 bg-gray-100/40 text-gray-800" :
                        "border-gray-100 text-gray-400"
                      }`}
                    >
                      <span className="font-semibold text-xs w-4 flex-shrink-0">
                        {opt.label}.
                      </span>
                      <span className="flex-1">{opt.value}</span>
                      {selected && correct  && <CheckCircle2 size={14} className="text-gray-700 flex-shrink-0" />}
                      {selected && !correct && <Circle size={14} className="text-red-400 flex-shrink-0" />}
                      {!selected && correct && <CheckCircle2 size={14} className="text-gray-400 flex-shrink-0" />}
                    </div>
                  );
                })}
                <p className={`text-xs mt-1 ${isCorrect ? "text-gray-900" : "text-red-500"}`}>
                  {isCorrect ? "Correct ✓" : `Incorrect — correct answer: ${q.correctOption}`}
                </p>
              </div>
            ) : (
              <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{userAnswer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Next-lesson dialog ────────────────────────────────────────────────────────

function NextLessonDialog({
  nextLesson,
  courseId,
  onDismiss,
}: {
  nextLesson: Lesson;
  courseId: string;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onDismiss();
  }

  function handleNext() {
    onDismiss();
    router.push(`/courses/${courseId}/lessons/${nextLesson._id}`);
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
          <PartyPopper size={26} className="text-gray-900" />
        </div>

        {/* Copy */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Lesson complete!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Ready to continue to the next lesson?
          </p>
          <p className="text-xs font-medium text-gray-700 mt-2 line-clamp-2">
            {nextLesson.title}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Stay here
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Next lesson
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Feedback thread ───────────────────────────────────────────────────────────

function FeedbackThread({ submissionId }: { submissionId: string }) {
  const [remarks, setRemarks]           = useState<Remark[]>([]);
  const [loading, setLoading]           = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying]         = useState(false);
  const [replyError, setReplyError]     = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    submissionRemarksApi
      .getRemarks(submissionId)
      .then(setRemarks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [submissionId]);

  // Scroll to the newest message whenever the list grows
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [remarks.length, loading]);

  // Learner can reply when there's at least one admin remark AND the last
  // remark is not already from the learner (back-and-forth cadence).
  const hasAdminRemark = remarks.some((r) => r.authorRole === "admin");
  const lastRemark     = remarks[remarks.length - 1];
  const canReply       = hasAdminRemark && lastRemark?.authorRole !== "learner";

  async function handleReply() {
    const content = replyContent.trim();
    if (!content || replying) return;
    setReplying(true);
    setReplyError(null);
    try {
      const remark = await submissionRemarksApi.addReply(submissionId, content);
      setRemarks((prev) => [...prev, remark]);
      setReplyContent("");
    } catch {
      setReplyError("Failed to send reply. Please try again.");
    } finally {
      setReplying(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle size={15} className="text-gray-400" />
        <h3 className="font-semibold text-gray-900 text-sm">Feedback</h3>
        {remarks.length > 0 && (
          <span className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {remarks.length}
          </span>
        )}
      </div>

      {/* Thread body */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="flex justify-start">
            <div className="h-16 w-56 bg-gray-100 rounded-2xl rounded-tl-sm" />
          </div>
          <div className="flex justify-end">
            <div className="h-12 w-44 bg-gray-100 rounded-2xl rounded-tr-sm" />
          </div>
        </div>
      ) : remarks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-300">
          <MessageCircle size={28} className="opacity-40" />
          <p className="text-sm">No feedback yet — check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {remarks.map((r) => (
            <div
              key={r._id}
              className={`flex ${r.authorRole === "admin" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 space-y-1.5 ${
                  r.authorRole === "admin"
                    ? "bg-primary-50 border border-primary-100 rounded-tl-sm"
                    : "bg-gray-100 border border-gray-200 rounded-tr-sm"
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  r.authorRole === "admin" ? "text-primary-700" : "text-gray-900"
                }`}>
                  {r.authorName}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {r.content}
                </p>
                <p className="text-[10px] text-gray-400">
                  {new Date(r.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Reply box — only visible when admin has responded and it's the learner's turn */}
      {!loading && canReply && (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
            placeholder="Write a reply…"
            disabled={replying}
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none placeholder:text-gray-300 disabled:opacity-50"
          />
          {replyError && <p className="text-xs text-red-500">{replyError}</p>}
          <div className="flex justify-end">
            <button
              onClick={handleReply}
              disabled={!replyContent.trim() || replying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {replying
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <MessageCircle size={13} />
              }
              {replying ? "Sending…" : "Send reply"}
            </button>
          </div>
        </div>
      )}

      {/* Waiting hint — shown when learner has replied and is awaiting admin response */}
      {!loading && remarks.length > 0 && lastRemark?.authorRole === "learner" && (
        <p className="text-xs text-center text-gray-400 pt-1">
          Waiting for a response from our team…
        </p>
      )}
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

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [canMarkComplete, setCanMarkComplete] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showNextDialog, setShowNextDialog] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      courseApi.getOne(courseId),
      courseApi.getLesson(courseId, lessonId),
      courseApi.getLessons(courseId),
      courseApi.getQuestions(courseId, lessonId),
      courseApi.getProgress(courseId).catch(() => null),
      courseApi.getMySubmission(courseId, lessonId).catch(() => null),
    ])
      .then(([c, l, ls, qs, p, sub]) => {
        setCourse(c);
        setLesson(l);
        setAllLessons(ls);
        setQuestions(qs);
        setProgress(p);
        setSubmission(sub);
        // Can mark complete if no questions, or already has a submission
        if (qs.length === 0 || sub) setCanMarkComplete(true);
      })
      .catch(() => setError("Lesson not found."))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  // Auto-scroll to feedback when ?feedback=open is in the URL
  useEffect(() => {
    if (loading) return;
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("feedback") === "open") {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  const completedIds = new Set(progress?.completedLessonIds ?? []);
  const isAlreadyComplete = completedIds.has(lessonId);

  const currentIndex = allLessons.findIndex((l) => l._id === lessonId);
  const nextLesson = allLessons[currentIndex + 1] ?? null;

  async function handleMarkComplete() {
    if (completing || isAlreadyComplete) return;
    setCompleting(true);
    try {
      await courseApi.markComplete(courseId, lessonId);
      setProgress((p) => ({
        courseId,
        totalLessons: p?.totalLessons ?? allLessons.length,
        lessonsCompleted: (p?.lessonsCompleted ?? 0) + 1,
        completedLessonIds: [...(p?.completedLessonIds ?? []), lessonId],
      }));
      if (nextLesson) setShowNextDialog(true);
    } catch {
      // silent
    } finally {
      setCompleting(false);
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

  if (error || !lesson || !course) {
    return (
      <div className="text-center py-16">
        <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{error ?? "Lesson not found."}</p>
      </div>
    );
  }

  const TypeIcon = TYPE_ICON[lesson.type] ?? BookOpen;

  return (
    <div>
      {/* Next-lesson dialog */}
      {showNextDialog && nextLesson && (
        <NextLessonDialog
          nextLesson={nextLesson}
          courseId={courseId}
          onDismiss={() => setShowNextDialog(false)}
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
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLOR[lesson.type] ?? "bg-gray-100 text-gray-500"}`}>
                <TypeIcon size={11} />
                {TYPE_LABEL[lesson.type]}
              </span>
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

          {/* Content — transparent, no card border */}
          <div className="py-1">
            {lesson.type === "video"    && <VideoContent videoId={lesson.content} />}
            {lesson.type === "audio"    && <AudioContent url={lesson.content} title={lesson.title} />}
            {lesson.type === "document" && <DocumentContent html={lesson.content} />}
            {lesson.type === "link"     && <LinkContent url={lesson.content} />}
            {lesson.type === "text"     && <TextContent html={lesson.content} />}
          </div>

          {/* Questions — form while pending, read-only view once submitted */}
          {questions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {submission ? (
                <SubmissionView questions={questions} submission={submission} />
              ) : (
                <QuestionsSection
                  courseId={courseId}
                  lessonId={lessonId}
                  questions={questions}
                  onSubmitted={(sub) => {
                    setSubmission(sub);
                    setCanMarkComplete(true);
                  }}
                />
              )}
            </div>
          )}

          {/* Feedback thread — visible once the lesson is complete and has a submission */}
          {isAlreadyComplete && submission && (
            <div ref={feedbackRef}>
              <FeedbackThread submissionId={submission._id} />
            </div>
          )}

          {/* Mark complete — static badge once done, actionable button while pending */}
          <div className="pt-2 pb-8">
            {isAlreadyComplete ? (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                <CheckCircle2 size={16} />
                Lesson completed
              </div>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={!canMarkComplete || completing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {completing
                  ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <Circle size={16} />
                }
                Mark as completed
              </button>
            )}
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-60 lg:flex-shrink-0 lg:sticky lg:top-6">
          <LessonSidebar
            courseId={courseId}
            currentLessonId={lessonId}
            lessons={allLessons}
            completedIds={new Set(progress?.completedLessonIds ?? [])}
          />
        </aside>
      </div>
    </div>
  );
}
