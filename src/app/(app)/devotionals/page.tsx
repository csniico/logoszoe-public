"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Flame } from "lucide-react";
import { devotionalApi, streakApi, Devotional, StreakSummary } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS_SHORT = [
  "JAN","FEB","MAR","APR","MAY","JUN",
  "JUL","AUG","SEP","OCT","NOV","DEC",
];
const DOW_ABBR = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

function formatDateShort(d: Devotional) {
  return `${MONTHS_SHORT[d.month - 1]} ${d.day}, ${d.year}`;
}

function formatDateLong(d: Devotional) {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  return `${months[d.month - 1]} ${d.day}, ${d.year}`;
}

function stripHtml(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isToday(d: Devotional) {
  const now = new Date();
  return d.day === now.getDate() && d.month === now.getMonth() + 1 && d.year === now.getFullYear();
}

// ── Streak ring ───────────────────────────────────────────────────────────────

function StreakRing({ count }: { count: number }) {
  const size = 128;
  const strokeWidth = 9;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = count > 0 ? Math.min(count / 30, 1) : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="#c9a059"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="text-3xl font-bold text-gray-800 leading-none">{count}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">DAYS</span>
      </div>
    </div>
  );
}

// ── My Journey panel ──────────────────────────────────────────────────────────

function MyJourneyPanel({ scripture }: { scripture: string }) {
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    streakApi.getMyStreak(7)
      .then(setStreak)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currentStreak = streak?.currentStreak ?? 0;
  const calendar = streak?.calendar ?? [];
  const last7 = calendar.slice(-7);
  const today = new Date();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full bg-gray-100" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="aspect-square rounded-full bg-gray-100" />
          ))}
        </div>
        <div className="h-14 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">My Journey</h2>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gold-600">
          <Flame size={13} className="text-gold-500" />
          {currentStreak}-Day Streak
        </span>
      </div>

      {/* Circular progress */}
      <div className="flex justify-center">
        <StreakRing count={currentStreak} />
      </div>

      {/* 7-day mini calendar */}
      {last7.length > 0 && (
        <div>
          {/* DOW labels */}
          <div className="grid grid-cols-7 mb-1.5">
            {last7.map((cell, i) => {
              const dow = new Date(cell.year, cell.month - 1, cell.day).getDay();
              return (
                <div key={i} className="text-center text-[9px] font-bold text-gray-400 uppercase">
                  {DOW_ABBR[dow]}
                </div>
              );
            })}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {last7.map((cell) => {
              const key = `${cell.year}-${cell.month}-${cell.day}`;
              const isTodayCell =
                cell.day === today.getDate() &&
                cell.month === today.getMonth() + 1 &&
                cell.year === today.getFullYear();
              return (
                <div
                  key={key}
                  className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                    isTodayCell
                      ? "bg-primary-700 text-white ring-2 ring-gold-400 ring-offset-1"
                      : cell.read
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider + scripture quote */}
      {scripture && (
        <div className="bg-gold-50 border border-gold-100 rounded-xl px-4 py-3">
          <p className="text-xs text-gold-800 italic text-center leading-relaxed">
            &ldquo;{scripture}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

// ── Hero card ─────────────────────────────────────────────────────────────────

function HeroCard({ devotional, loading }: { devotional: Devotional | null; loading: boolean }) {
  if (loading) {
    return <div className="rounded-2xl bg-gray-100 animate-pulse h-72 lg:h-full lg:min-h-[300px]" />;
  }
  if (!devotional) return null;

  const image = devotional.fileUrl ?? null;
  const scripture = stripHtml(devotional.themeScripture);

  return (
    <Link
      href={`/devotionals/${devotional._id}`}
      className="block rounded-2xl overflow-hidden relative group h-72 lg:h-full lg:min-h-[300px]"
    >
      {/* Background image */}
      {image ? (
        <img
          src={image}
          alt={devotional.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-900" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        {/* Badge */}
        <div>
          <span className="inline-block bg-gold-400 text-gold-900 text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
            Sceptre of Power
          </span>
        </div>

        {/* Title + scripture + CTA */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-white leading-tight mb-2 drop-shadow-sm">
            {devotional.title}
          </h2>
          {scripture && (
            <p className="text-sm text-white/80 italic mb-5 line-clamp-2 leading-relaxed">
              &ldquo;{scripture}&rdquo;
            </p>
          )}
          <span className="inline-flex items-center px-5 py-2.5 bg-primary-700/90 backdrop-blur-sm hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Read Now
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Recent devotional card ────────────────────────────────────────────────────

function RecentCard({ devotional }: { devotional: Devotional }) {
  return (
    <Link
      href={`/devotionals/${devotional._id}`}
      className="flex-shrink-0 w-44 sm:w-48 bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all group flex flex-col gap-3"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          {formatDateShort(devotional)}
        </p>
        <p className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-gray-900 transition-colors line-clamp-3">
          {devotional.title}
        </p>
      </div>
      <div className="mt-auto">
        <span className="inline-block border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg group-hover:border-gray-300 transition-colors">
          Reflect
        </span>
      </div>
    </Link>
  );
}

// ── Archive row ───────────────────────────────────────────────────────────────

function ArchiveRow({ devotional }: { devotional: Devotional }) {
  const today = isToday(devotional);
  const image = devotional.fileUrl ?? null;

  return (
    <Link
      href={`/devotionals/${devotional._id}`}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      <div className="w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden">
        {image ? (
          <img src={image} alt={devotional.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${today ? "bg-gray-800" : "bg-gray-100"}`}>
            <span className={`text-xs font-bold ${today ? "text-white" : "text-gray-400"}`}>
              {devotional.day}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors truncate">
          {devotional.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDateLong(devotional)}
          {today && <span className="ml-2 text-gray-700 font-semibold">· Today</span>}
        </p>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DevotionalsPage() {
  const [daily, setDaily] = useState<Devotional | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);

  const [recent, setRecent] = useState<Devotional[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const [archive, setArchive] = useState<Devotional[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    devotionalApi.getDaily()
      .then(setDaily)
      .catch(() => {})
      .finally(() => setDailyLoading(false));
  }, []);

  useEffect(() => {
    // First page gives us the recent ones; skip index 0 (today) for the recent row
    devotionalApi.getAll(1, 10)
      .then((res) => setRecent(res.data.slice(1, 7)))
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, []);

  useEffect(() => {
    setArchiveLoading(true);
    devotionalApi.getAll(page, 10)
      .then((res) => {
        setArchive(res.data);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => setArchiveLoading(false));
  }, [page]);

  // Use today's themeScripture for the My Journey quote, or fallback
  const journeyScripture =
    daily?.themeScripture
      ? stripHtml(daily.themeScripture)
      : "Be still, and know that I am God.";

  return (
    <div className="space-y-8">
      {/* ── Hero + My Journey ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 lg:gap-5">
        <HeroCard devotional={daily} loading={dailyLoading} />
        <MyJourneyPanel scripture={journeyScripture} />
      </div>

      {/* ── Recent Devotionals ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Devotionals</h2>
          <button
            onClick={() => document.getElementById("all-devotionals")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-0.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {recentLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44 sm:w-48 h-36 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {recent.map((d) => (
              <RecentCard key={d._id} devotional={d} />
            ))}
          </div>
        ) : null}
      </div>

      {/* ── All Devotionals (paginated) ── */}
      <div id="all-devotionals" className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">All Devotionals</h2>

        {archiveLoading ? (
          <div className="space-y-2">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-11 h-11 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-0.5">
              {archive.map((d) => (
                <ArchiveRow key={d._id} devotional={d} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <span className="text-xs text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
