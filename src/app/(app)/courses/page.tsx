"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { courseApi, Course, CourseProgress } from "@/lib/api";
import { GraduationCap } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(sec?: number) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`;
  return `${m}m`;
}

type FilterType = "all" | "progress" | "not-started" | "completed";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-100" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-2 bg-gray-100 rounded-full mt-2" />
        <div className="h-8 bg-gray-100 rounded-lg mt-4" />
      </div>
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────────────────────

function CourseCard({ course, progress }: { course: Course; progress?: CourseProgress }) {
  const pct =
    progress && progress.totalLessons > 0
      ? Math.round((progress.lessonsCompleted / progress.totalLessons) * 100)
      : 0;
  const started = (progress?.lessonsCompleted ?? 0) > 0;
  const done = pct === 100;

  const metaParts: string[] = [];
  if ((course.lessonCount ?? 0) > 0) {
    metaParts.push(`${course.lessonCount} lesson${course.lessonCount !== 1 ? "s" : ""}`);
  }
  const dur = formatDuration(course.totalDurationSec);
  if (dur) metaParts.push(dur);

  return (
    <Link
      href={`/courses/${course._id}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all"
    >
      {/* Thumbnail */}
      <div className="h-52 overflow-hidden bg-gray-100 relative">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap size={40} className="text-gray-400" />
          </div>
        )}
        {done && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm bg-gray-900/80 text-white">
            Completed
          </div>
        )}
        {!done && started && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm bg-primary-700/80 text-white">
            In Progress
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif font-bold text-gray-900 mb-1.5 group-hover:text-gray-800 transition-colors line-clamp-2 leading-snug">
          {course.title}
        </h3>

        {metaParts.length > 0 && (
          <p className="text-[11px] text-gray-400 mb-1">{metaParts.join(" · ")}</p>
        )}

        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4 mt-1">
          {course.description}
        </p>

        {/* Progress section */}
        {started && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                PROGRESS
              </span>
              <span className="text-[11px] font-semibold text-gray-700">{pct}%</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-600"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA button */}
        {done ? (
          <button className="w-full py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
            REVISIT JOURNEY
          </button>
        ) : started ? (
          <button className="w-full py-2 rounded-lg bg-primary-700 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-800 transition-colors">
            CONTINUE JOURNEY
          </button>
        ) : (
          <button className="w-full py-2 rounded-lg border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-widest hover:bg-primary-50 transition-colors">
            START JOURNEY
          </button>
        )}
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const FILTER_PILLS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All Journeys" },
  { value: "progress", label: "In Progress" },
  { value: "not-started", label: "Not Started" },
  { value: "completed", label: "Completed" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    courseApi
      .getAll()
      .then(async (list) => {
        setCourses(list);
        const results = await Promise.allSettled(
          list.map((c) => courseApi.getProgress(c._id).then((p) => ({ id: c._id, p })))
        );
        const map: Record<string, CourseProgress> = {};
        results.forEach((r) => {
          if (r.status === "fulfilled") map[r.value.id] = r.value.p;
        });
        setProgressMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) => {
    const p = progressMap[c._id];
    const lessonsCompleted = p?.lessonsCompleted ?? 0;
    const pct =
      p && p.totalLessons > 0
        ? Math.round((p.lessonsCompleted / p.totalLessons) * 100)
        : 0;
    if (filter === "all") return true;
    if (filter === "progress") return lessonsCompleted > 0 && pct < 100;
    if (filter === "not-started") return lessonsCompleted === 0;
    if (filter === "completed") return pct === 100;
    return true;
  });

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
          Your Path to Peace
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">
          Explore our curated library of spiritual growth journeys. Designed for the quiet moments
          of your day, these courses provide a sanctuary for biblical reflection and deep stillness.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setFilter(pill.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
              filter === pill.value
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap size={40} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">No courses available yet</p>
          <p className="text-xs text-gray-400 mt-1">Check back soon.</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap size={40} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">No courses match this filter</p>
          <p className="text-xs text-gray-400 mt-1">Try a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <CourseCard key={c._id} course={c} progress={progressMap[c._id]} />
          ))}
        </div>
      )}
    </div>
  );
}
