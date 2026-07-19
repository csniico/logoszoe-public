"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Flame, BookOpen, GraduationCap, ChevronRight, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { streakApi, courseApi, Course, CourseProgress, CalendarDay } from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Build last `days` days with read flag from calendar data */
function buildActivityData(calendar: CalendarDay[], days: number) {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const day   = d.getDate();
    const month = d.getMonth() + 1;
    const year  = d.getFullYear();
    const found = calendar.find(c => c.day === day && c.month === month && c.year === year);
    // Show a date label every 5 entries + first + last
    const showLabel = i === 0 || i === days - 1 || (days - 1 - i) % 6 === 0;
    return {
      label: showLabel ? `${month}/${day}` : "",
      dateStr: `${month}/${day}/${year}`,
      read: found?.read ?? false,
      value: found?.read ? 1 : 0,
    };
  });
}

// ── Custom tooltips ────────────────────────────────────────────────────────────

function ActivityTooltip({ active, payload }: { active?: boolean; payload?: { payload: { dateStr: string; read: boolean } }[] }) {
  if (!active || !payload?.length) return null;
  const { dateStr, read } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-3 py-2 text-xs pointer-events-none">
      <p className="font-semibold text-gray-700">{dateStr}</p>
      <p className={read ? "text-gold-600 font-medium" : "text-gray-400"}>
        {read ? "✓ Devotional read" : "Not read"}
      </p>
    </div>
  );
}

function CourseTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const completed = payload.find(p => p.dataKey === "completed")?.value ?? 0;
  const remaining = payload.find(p => p.dataKey === "remaining")?.value ?? 0;
  const total = completed + remaining;
  const pct   = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-3 py-2 text-xs pointer-events-none max-w-[200px]">
      <p className="font-semibold text-gray-700 mb-1 break-words">{label}</p>
      <p className="text-primary-600">{completed}/{total} lessons · {pct}%</p>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  bg,
  iconColor,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

// Deterministic pseudo-random height so the skeleton renders identically on
// the server and client (avoids a hydration mismatch that Math.random() causes).
function barHeight(i: number) {
  const seeded = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
  return 20 + seeded * 60;
}

function ChartSkeleton({ height = 140 }: { height?: number }) {
  return (
    <div className="animate-pulse flex items-end gap-1.5 w-full" style={{ height }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-100 rounded-t-sm"
          style={{ height: `${barHeight(i)}%` }}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface CourseChartRow {
  name: string;
  fullName: string;
  completed: number;
  remaining: number;
  pct: number;
  id: string;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [streak, setStreak] = useState<{
    current: number;
    longest: number;
    calendar: CalendarDay[];
  } | null>(null);

  const [courseRows, setCourseRows] = useState<CourseChartRow[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [streakData, courses] = await Promise.all([
          streakApi.getMyStreak(30),
          courseApi.getAll(),
        ]);

        setStreak({
          current: streakData.currentStreak,
          longest: streakData.longestStreak,
          calendar: streakData.calendar ?? [],
        });

        // Fetch progress for each course (up to 7)
        const withLessons = courses.filter(c => (c.lessonCount ?? 0) > 0).slice(0, 7);
        const results = await Promise.allSettled(
          withLessons.map(c =>
            courseApi.getProgress(c._id).then(p => ({ course: c, progress: p }))
          )
        );

        const rows: CourseChartRow[] = results
          .filter((r): r is PromiseFulfilledResult<{ course: Course; progress: CourseProgress }> =>
            r.status === "fulfilled"
          )
          .map(({ value: { course, progress } }) => {
            const completed = progress.lessonsCompleted ?? 0;
            const total     = progress.totalLessons ?? course.lessonCount ?? 0;
            const remaining = Math.max(0, total - completed);
            const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
            const name      = course.title.length > 24 ? course.title.slice(0, 24) + "…" : course.title;
            return { name, fullName: course.title, completed, remaining, pct, id: course._id };
          })
          .filter(r => r.completed + r.remaining > 0);

        setCourseRows(rows);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const firstName     = user?.firstname ?? "friend";
  const activityData  = streak ? buildActivityData(streak.calendar, 30) : [];
  const readDays      = activityData.filter(d => d.read).length;
  const inProgress    = courseRows.filter(r => r.pct > 0 && r.pct < 100).length;
  const courseBarH    = Math.max(courseRows.length * 56 + 24, 100);

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 leading-tight">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1.5">{getTodayLabel()}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Flame}
          value={loading ? "-" : `${streak?.current ?? 0} days`}
          label="Current streak"
          bg="bg-gold-50"
          iconColor="text-gold-500"
        />
        <StatCard
          icon={BookOpen}
          value={loading ? "-" : `${readDays} / 30`}
          label="Days read this month"
          bg="bg-primary-50"
          iconColor="text-primary-600"
        />
        <StatCard
          icon={GraduationCap}
          value={loading ? "-" : inProgress}
          label="Courses in progress"
          bg="bg-gray-100"
          iconColor="text-gray-700"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* 30-Day Activity */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-semibold text-gray-900">Reading activity</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 30 days - gold bars are days you read</p>
              </div>
              {!loading && (
                <span className="text-xs font-semibold text-gold-600 bg-gold-50 border border-gold-100 px-2.5 py-1 rounded-full flex-shrink-0">
                  {readDays} day{readDays !== 1 ? "s" : ""} read
                </span>
              )}
            </div>

            <div className="mt-5">
              {loading ? (
                <ChartSkeleton height={128} />
              ) : (
                <ResponsiveContainer width="100%" height={128}>
                  <BarChart data={activityData} barCategoryGap={3} barSize={6}>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "#9ca3af" }}
                      interval={0}
                    />
                    <YAxis hide domain={[0, 1]} />
                    <Tooltip
                      content={<ActivityTooltip />}
                      cursor={{ fill: "#f9fafb", radius: 4 }}
                    />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={14}>
                      {activityData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.read ? "#c9a059" : "#f3f4f6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Week-label legend */}
            {!loading && streak && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-gold-400" />
                  <span className="text-xs text-gray-500">Read</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-gray-100" />
                  <span className="text-xs text-gray-500">Not read</span>
                </div>
                <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                  <TrendingUp size={11} />
                  Longest streak: <span className="font-semibold text-gray-600">{streak.longest} days</span>
                </div>
              </div>
            )}
          </div>

          {/* Course progress */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900">Course progress</h2>
                <p className="text-xs text-gray-400 mt-0.5">Lessons completed vs remaining</p>
              </div>
              <Link
                href="/courses"
                className="text-xs text-primary-600 font-medium hover:text-primary-800 flex items-center gap-1 flex-shrink-0"
              >
                All courses <ChevronRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-4 items-center">
                    <div className="h-3 bg-gray-100 rounded w-36 flex-shrink-0" />
                    <div className="h-4 bg-gray-100 rounded flex-1" />
                  </div>
                ))}
              </div>
            ) : courseRows.length === 0 ? (
              <div className="py-10 text-center">
                <GraduationCap size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No courses enrolled yet.</p>
                <Link href="/courses" className="text-xs text-primary-600 font-medium mt-1 inline-block hover:underline">
                  Browse courses →
                </Link>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={courseBarH}>
                  <BarChart
                    layout="vertical"
                    data={courseRows}
                    barSize={18}
                    barGap={0}
                    margin={{ left: 0, right: 8, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={148}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#374151" }}
                    />
                    <Tooltip
                      content={<CourseTooltip />}
                      cursor={{ fill: "#f9fafb" }}
                    />
                    <Bar dataKey="completed" stackId="a" fill="#5a82a8" name="completed" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="remaining"  stackId="a" fill="#e5e7eb" name="remaining" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-primary-400" />
                    <span className="text-xs text-gray-500">Completed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-gray-200" />
                    <span className="text-xs text-gray-500">Remaining</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-5">

          {/* Streak card */}
          <div className="bg-white rounded-xl border border-gold-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={18} className="text-gold-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Your streak</h3>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-gray-100 rounded w-1/2 mx-auto" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mx-auto" />
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <span className="text-5xl font-bold text-gold-600">{streak?.current ?? 0}</span>
                  <p className="text-sm text-gray-500 mt-0.5">day{streak?.current !== 1 ? "s" : ""} in a row</p>
                </div>

                {/* Mini 7-day indicator */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {activityData.slice(-7).map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-full aspect-square rounded-md ${d.read ? "bg-gold-400" : "bg-gray-100"}`} />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>Best: <span className="font-semibold text-gray-700">{streak?.longest ?? 0} days</span></span>
                  <span>{readDays} / 30 this month</span>
                </div>

                {(streak?.current ?? 0) === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Read today's devotional to start your streak 🙏
                  </p>
                )}
                {(streak?.current ?? 0) > 0 && (
                  <p className="text-xs text-gold-600 text-center mt-3 font-medium">
                    {(streak?.current ?? 0) >= 7 ? "You're on fire! Keep it up 🔥" : "Great progress - keep going!"}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Verse of the day */}
          <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={11} className="text-primary-300" />
              <span className="text-[10px] font-bold text-primary-300 uppercase tracking-widest">
                Verse of the day
              </span>
            </div>
            <p className="text-sm leading-relaxed font-medium mb-3">
              "Trust in the Lord with all your heart and lean not on your own understanding."
            </p>
            <p className="text-xs text-primary-300">- Proverbs 3:5</p>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick links</h3>
            <div className="space-y-1">
              {[
                { href: "/devotionals", label: "Today's devotional",  icon: BookOpen },
                { href: "/courses",     label: "Continue learning",   icon: GraduationCap },
                { href: "/prayer",      label: "Prayer wall",         icon: Star },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary-50 transition-colors group"
                >
                  <Icon size={14} className="text-primary-400 group-hover:text-primary-600 flex-shrink-0 transition-colors" />
                  <span className="text-sm text-gray-600 group-hover:text-primary-700 transition-colors">{label}</span>
                  <ChevronRight size={12} className="text-gray-300 group-hover:text-primary-400 ml-auto flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
