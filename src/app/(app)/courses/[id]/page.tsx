"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  courseApi, Course, CourseModule, Lesson, CourseProgress, COURSE_LEVELS,
} from "@/lib/api";
import {
  ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronRight,
  Clock, FileText, GraduationCap, Lock, LockOpen, Mic2, PlayCircle,
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
  text: FileText, video: PlayCircle, audio: Mic2,
};

const TYPE_LABEL: Record<string, string> = {
  text: "Reading", video: "Video", audio: "Audio",
};

const MODULE_BADGE: Record<string, string> = {
  foundation:   "bg-emerald-50 text-emerald-700 border border-emerald-100",
  intermediate: "bg-amber-50 text-amber-700 border border-amber-100",
  advanced:     "bg-rose-50 text-rose-700 border border-rose-100",
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

// ── Collapsible content section ───────────────────────────────────────────────

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
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

// ── Lesson card ───────────────────────────────────────────────────────────────
// A lesson renders as a single card labelled "Lesson N: Title" that opens the
// lesson directly. Lock/completion state comes straight from the backend
// (`/progress` → `lessons[]`); the client never decides it. A locked lesson is
// non-clickable and never navigates into the lesson. The completion indicator is
// a plain (non-interactive) green check - there is no way to mark a lesson
// complete from here.

function LessonCard({
  lesson,
  index,
  courseId,
  completed,
  unlocked,
}: {
  lesson: Lesson;
  index: number;
  courseId: string;
  completed: boolean;
  unlocked: boolean;
}) {
  const Icon = TYPE_ICON[lesson.type] ?? BookOpen;
  const dur = formatDuration(lesson.durationSec);
  const isLocked = !unlocked;

  const body = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors ${
        isLocked
          ? "border-gray-100 bg-gray-50/60 cursor-not-allowed"
          : "border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200"
      }`}
    >
      <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${isLocked ? "text-gray-300" : "text-gray-500"}`}>
        <Icon size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${isLocked ? "text-gray-400" : completed ? "text-gray-500" : "text-gray-800"}`}>
          Lesson {index + 1}: {lesson.title}
        </p>
        <span className="text-[11px] text-gray-400">
          {TYPE_LABEL[lesson.type]}{dur ? ` · ${dur}` : ""}
        </span>
      </div>

      {completed ? (
        <CheckCircle2 size={17} className="text-emerald-600 flex-shrink-0" aria-label="Completed" />
      ) : unlocked ? (
        <LockOpen size={15} className="text-gray-500 flex-shrink-0" aria-label="Unlocked" />
      ) : (
        <Lock size={15} className="text-gray-300 flex-shrink-0" aria-label="Locked" />
      )}
    </div>
  );

  // Locked lessons are inert: no link, no navigation.
  if (isLocked) {
    return (
      <div aria-disabled title="Complete the previous lessons to unlock this one.">
        {body}
      </div>
    );
  }

  return <Link href={`/courses/${courseId}/lessons/${lesson._id}`}>{body}</Link>;
}

// ── Module accordion ──────────────────────────────────────────────────────────

function ModuleAccordion({
  module,
  lessons,
  courseId,
  completedIds,
  unlockedIds,
  defaultOpen,
}: {
  module: CourseModule;
  lessons: Lesson[];
  courseId: string;
  completedIds: Set<string>;
  unlockedIds: Set<string>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const done = lessons.filter((l) => completedIds.has(l._id)).length;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-snug">
            {module.title}
          </p>
          <span className="text-[11px] text-gray-400">
            {done}/{lessons.length} lesson{lessons.length !== 1 ? "s" : ""} completed
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 bg-gray-50/40 border-t border-gray-50">
          {module.description && (
            <p className="text-xs text-gray-400 leading-relaxed px-1 py-2">{module.description}</p>
          )}
          {lessons.length === 0 ? (
            <p className="text-xs text-gray-300 px-1 py-2">No lessons in this module yet.</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, idx) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  index={idx}
                  courseId={courseId}
                  completed={completedIds.has(lesson._id)}
                  unlocked={unlockedIds.has(lesson._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      courseApi.getOne(id),
      courseApi.getModules(id).catch(() => [] as CourseModule[]),
      courseApi.getLessons(id),
      courseApi.getProgress(id).catch(() => null),
    ])
      .then(([c, ms, ls, p]) => {
        setCourse(c);
        setModules(ms);
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

  // Lock/completion state is decided by the backend and delivered per-lesson in
  // `progress.lessons`. We never recompute it from `completedLessonIds` or lesson
  // order. Lessons without an entry (e.g. progress failed to load) default to
  // locked - the server enforces the gate regardless.
  const completedIds = new Set(
    (progress?.lessons ?? []).filter((l) => l.completed).map((l) => l.lessonId),
  );
  const unlockedIds = new Set(
    (progress?.lessons ?? []).filter((l) => l.unlocked).map((l) => l.lessonId),
  );
  const pct = progress && progress.totalLessons > 0
    ? Math.round((progress.lessonsCompleted / progress.totalLessons) * 100)
    : 0;
  const totalDuration = lessons.reduce((sum, l) => sum + (l.durationSec ?? 0), 0);

  const moduleLabel = COURSE_LEVELS.find((m) => m.value === course.level)?.label ?? course.level;
  const moduleBadge = MODULE_BADGE[course.level] ?? "bg-gray-100 text-gray-500";

  // Sorted modules, each with its lessons grouped underneath.
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const lessonsByModule = (moduleId: string) =>
    lessons.filter((l) => l.moduleId === moduleId).sort((a, b) => a.order - b.order);

  // Display ordering only (modules in order, then lessons in order) for the
  // no-modules fallback list. Lock state still comes from the server flags.
  const orderedLessons: Lesson[] = sortedModules.length > 0
    ? sortedModules.flatMap((m) => lessonsByModule(m._id))
    : [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> All courses
      </Link>

      {/* Course header */}
      <div className="mb-6">
        {/* Cover image */}
        {course.imageUrl && (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-48 object-cover rounded-2xl mb-5 border border-gray-100"
          />
        )}

        {/* Module badge */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${moduleBadge}`}>
            {moduleLabel}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">{course.title}</h1>

        {course.description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-4">{course.description}</p>
        )}

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

      {/* Modules (accordions) → lesson cards */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Modules</h2>
      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center mb-8">
          <BookOpen size={30} className="text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No lessons added yet.</p>
        </div>
      ) : sortedModules.length === 0 ? (
        // Fallback (no modules): a flat list of lesson cards with the same lock rules.
        <div className="space-y-2 mb-8">
          {orderedLessons.map((lesson, idx) => (
            <LessonCard
              key={lesson._id}
              lesson={lesson}
              index={idx}
              courseId={id}
              completed={completedIds.has(lesson._id)}
              unlocked={unlockedIds.has(lesson._id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {sortedModules.map((module) => (
            <ModuleAccordion
              key={module._id}
              module={module}
              lessons={lessonsByModule(module._id)}
              courseId={id}
              completedIds={completedIds}
              unlockedIds={unlockedIds}
              defaultOpen={false}
            />
          ))}
        </div>
      )}


      {/* "Continue" CTA if in progress */}
      {progress && progress.lessonsCompleted > 0 && pct < 100 && (() => {
        // The next actionable lesson is the first unlocked-but-not-completed one.
        const nextLesson = orderedLessons.find(
          (l) => unlockedIds.has(l._id) && !completedIds.has(l._id),
        );
        if (!nextLesson) return null;
        return (
          <div className="mt-2 mb-8 p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Up next</p>
              <p className="text-sm font-medium text-gray-800 line-clamp-1">{nextLesson.title}</p>
            </div>
            <Link
              href={`/courses/${id}/lessons/${nextLesson._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              Continue <ChevronRight size={13} />
            </Link>
          </div>
        );
      })()}

    </div>
  );
}
