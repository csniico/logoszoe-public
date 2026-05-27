"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { courseApi, Course, Lesson, CourseProgress } from "@/lib/api";
import {
  ArrowLeft, BookOpen, CheckCircle2, ChevronDown, Circle,
  Clock, ExternalLink, FileText, GraduationCap, Link2, Mic2, PlayCircle,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(sec?: number) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`;
  return `${m}m`;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  text: FileText, document: FileText, video: PlayCircle, audio: Mic2, link: Link2,
};

const TYPE_LABEL: Record<string, string> = {
  text: "Reading", document: "Document", video: "Video", audio: "Audio", link: "Link",
};

const TYPE_COLOR: Record<string, string> = {
  text:     "text-gray-700",
  document: "text-gray-700",
  video:    "text-gray-700",
  audio:    "text-gray-700",
  link:     "text-gray-700",
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="animate-pulse max-w-2xl space-y-4">
      <div className="h-8 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-2 bg-gray-100 rounded-full mt-4" />
      <div className="space-y-2 pt-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

// ── Lesson accordion item ─────────────────────────────────────────────────────

function LessonAccordionItem({
  lesson,
  index,
  courseId,
  isComplete,
}: {
  lesson: Lesson;
  index: number;
  courseId: string;
  isComplete: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = TYPE_ICON[lesson.type] ?? BookOpen;

  return (
    <div className={`border border-gray-100 rounded-xl overflow-hidden transition-all ${open ? "shadow-sm" : ""}`}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        {/* Order */}
        <span className="w-6 text-center text-xs font-medium text-gray-400 flex-shrink-0">
          {index + 1}
        </span>

        {/* Type icon */}
        <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[lesson.type] ?? "text-gray-700"}`}>
          <Icon size={13} />
        </div>

        {/* Title + type */}
        <div className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-medium leading-snug ${isComplete ? "text-gray-400" : "text-gray-800"}`}>
            {lesson.title}
          </p>
          <span className="text-[11px] text-gray-400">{TYPE_LABEL[lesson.type]}</span>
        </div>

        {/* Completion indicator */}
        <div className="flex-shrink-0 mr-1">
          {isComplete
            ? <CheckCircle2 size={16} className="text-gray-700" />
            : <Circle size={16} className="text-gray-200" />
          }
        </div>

        {/* Chevron */}
        <ChevronDown
          size={15}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 pt-1 bg-white border-t border-gray-50">
          {lesson.description && (
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{lesson.description}</p>
          )}

          <div className="flex items-center justify-between">
            {/* Duration */}
            <div>
              {formatDuration(lesson.durationSec) ? (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} /> {formatDuration(lesson.durationSec)}
                </span>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              )}
            </div>

            {/* Open lesson button */}
            <Link
              href={`/courses/${courseId}/lessons/${lesson._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-800 text-xs font-semibold hover:bg-gray-200 hover:border-gray-400 transition-colors"
            >
              Open lesson <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      courseApi.getOne(id),
      courseApi.getLessons(id),
      courseApi.getProgress(id).catch(() => null),
    ])
      .then(([c, ls, p]) => {
        setCourse(c);
        setLessons(ls);
        setProgress(p);
      })
      .catch(() => setError("Course not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSkeleton />;

  if (error || !course) {
    return (
      <div className="text-center py-16">
        <GraduationCap size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{error ?? "Course not found."}</p>
      </div>
    );
  }

  const completedIds = new Set(progress?.completedLessonIds ?? []);
  const pct = progress && progress.totalLessons > 0
    ? Math.round((progress.lessonsCompleted / progress.totalLessons) * 100)
    : 0;
  const totalDuration = lessons.reduce((sum, l) => sum + (l.durationSec ?? 0), 0);

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> All courses
      </Link>

      {/* Course header — no image */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">{course.title}</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">{course.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <BookOpen size={12} /> {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </span>
          {totalDuration > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {formatDuration(totalDuration)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {progress && progress.totalLessons > 0 && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              {progress.lessonsCompleted} of {progress.totalLessons} lessons completed
            </span>
            <span className={`text-xs font-semibold ${pct === 100 ? "text-gray-900" : "text-gray-500"}`}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-gray-700" : "bg-gray-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Lessons accordion */}
      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen size={30} className="text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No lessons added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, idx) => (
            <LessonAccordionItem
              key={lesson._id}
              lesson={lesson}
              index={idx}
              courseId={id}
              isComplete={completedIds.has(lesson._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
