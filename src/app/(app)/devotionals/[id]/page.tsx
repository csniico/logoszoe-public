"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { devotionalApi, Devotional } from "@/lib/api";
import { ArrowLeft, BookOpen, Clock, Share2, Bookmark, Eye, Flame } from "lucide-react";
import { streakApi, StreakSummary, bookmarkApi } from "@/lib/api";
import { StreakCalendarModal } from "@/components/streak/StreakCalendarModal";

function thumb(d: Devotional) {
  return d.fileUrl ?? null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(d: Devotional) {
  return `${MONTHS[d.month - 1]} ${d.day}, ${d.year}`;
}

function formatShortDate(d: Devotional) {
  return `${MONTHS[d.month - 1].slice(0, 3)} ${d.day}`;
}

function readTime(html?: string) {
  if (!html) return "2 min read";
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

/** Return the last 7 calendar days (oldest first) */
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function MainSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-6">
      <div className="h-48 bg-gray-100 rounded-xl" />
      <div className="h-7 bg-gray-100 rounded w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="space-y-2 pt-2">
        {[95, 88, 100, 75, 90, 82].map((w, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 h-36" />
      <div className="bg-white rounded-2xl border border-gray-100 p-5 h-56" />
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  currentId,
  recent,
  streakData,
  loading,
}: {
  currentId: string;
  recent: Devotional[];
  streakData: StreakSummary | null;
  loading: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <SidebarSkeleton />;

  const days = last7Days();
  const recentSet = new Set(
    (streakData?.recentReads ?? []).map((r) => `${r.year}-${r.month}-${r.day}`)
  );
  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;

  const others = recent.filter((d) => d._id !== currentId).slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Streak card - hidden on mobile (shown in top bar instead), click opens calendar modal */}
      <button
        onClick={() => setModalOpen(true)}
        className="hidden lg:block w-full bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-orange-200 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Daily Streak</span>
          </div>
          <span className="text-[11px] text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
            View history →
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-4xl font-bold text-gray-900">{currentStreak}</span>
          <span className="text-sm text-gray-400">day{currentStreak !== 1 ? "s" : ""}</span>
        </div>
        {longestStreak > 0 && (
          <p className="text-xs text-gray-400 mb-4">
            Best: <span className="font-medium text-gray-600">{longestStreak}</span> day{longestStreak !== 1 ? "s" : ""}
          </p>
        )}
        {/* Last 7 days bar chart */}
        <div className="flex items-end justify-between gap-1">
          {days.map((day, i) => {
            const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
            const isToday = i === 6;
            const hasDevo = recentSet.has(key);
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-full rounded-full transition-all ${isToday ? "h-7" : "h-5"} ${
                    hasDevo
                      ? isToday ? "bg-orange-500" : "bg-orange-300"
                      : "bg-gray-100"
                  }`}
                />
                <span className={`text-[10px] ${isToday ? "font-semibold text-gray-700" : "text-gray-400"}`}>
                  {DAYS_SHORT[day.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </button>

      {/* Recent devotionals */}
      <div className="pt-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Recent</p>
        {others.length === 0 && (
          <p className="text-xs text-gray-400">No recent devotionals.</p>
        )}
        <div className="space-y-1">
          {others.map((d) => {
            const image = thumb(d);
            return (
              <Link
                key={d._id}
                href={`/devotionals/${d._id}`}
                className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden mt-0.5">
                  {image ? (
                    <img src={image} alt={d.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <BookOpen size={13} className="text-gray-900" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-2 leading-snug">
                    {d.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatShortDate(d)}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <Link
          href="/devotionals"
          className="mt-3 block text-xs text-gray-900 hover:text-gray-800 font-medium transition-colors px-1"
        >
          View all →
        </Link>
      </div>

      {/* Modal */}
      {modalOpen && (
        <StreakCalendarModal onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DevotionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [recent, setRecent] = useState<Devotional[]>([]);
  const [streakData, setStreakData] = useState<StreakSummary | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  useEffect(() => {
    // Load devotional content
    devotionalApi
      .getById(id)
      .then(setDevotional)
      .catch(() => setError("Devotional not found."))
      .finally(() => setLoading(false));

    // Load sidebar data in parallel: recent archive + record read + streak + bookmark status
    Promise.all([
      devotionalApi.getAll(1, 8),
      streakApi.recordRead(id),   // idempotent - safe every page load
      streakApi.getMyStreak(),
      bookmarkApi.checkMany([{ itemId: id, type: "devotional" }]),
    ])
      .then(([archive, _readResult, streak, bookmarkMap]) => {
        setRecent(archive.data);
        setStreakData(streak);
        setBookmarked(bookmarkMap[`devotional:${id}`] ?? false);
      })
      .catch(() => {
        // Streak / bookmark errors are non-fatal - sidebar just shows zeros
        devotionalApi.getAll(1, 8)
          .then((archive) => setRecent(archive.data))
          .catch(() => {});
      })
      .finally(() => setSidebarLoading(false));
  }, [id]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: devotional?.title ?? "", url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  }

  async function handleBookmark() {
    if (!devotional || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const result = await bookmarkApi.toggle({
        itemId: id,
        type: "devotional",
        title: devotional.title,
        imageUrl: thumb(devotional) ?? undefined,
      });
      setBookmarked(result.bookmarked);
    } catch {
      // Non-fatal - button reverts visually on next load
    } finally {
      setBookmarkLoading(false);
    }
  }

  const hasReflection =
    devotional &&
    (devotional.furtherReading ||
      (devotional.questionsToHelpYouMeditate?.length ?? 0) > 0 ||
      devotional.prayer ||
      devotional.oneYearBiblePlan);

  return (
    <div>
      {/* Back */}
      <Link
        href="/devotionals"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> All devotionals
      </Link>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Main column ─────────────────────────────────────────────── */}
        <div className="w-full lg:flex-1 min-w-0 space-y-5">
          {loading && <MainSkeleton />}

          {error && (
            <div className="text-center py-16">
              <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          )}

          {devotional && !loading && (
            <>
              {/* Main reading card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Banner image */}
                {thumb(devotional) && (
                  <div className="h-56 overflow-hidden">
                    <img
                      src={thumb(devotional)!}
                      alt={devotional.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Date */}
                  <p className="text-xs text-gray-400 mb-3">{formatDate(devotional)}</p>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-4">
                    {devotional.title}
                  </h1>

                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {readTime(devotional.content)}
                      </span>
                      {(devotional.hits ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {devotional.hits!.toLocaleString()} reads
                        </span>
                      )}
                      {devotional.author && (
                        <span>· {devotional.author}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={handleShare}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        title="Share"
                      >
                        <Share2 size={15} />
                      </button>
                      <button
                        onClick={handleBookmark}
                        disabled={bookmarkLoading}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${bookmarked ? "text-gray-900 bg-gray-100" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}
                        title={bookmarked ? "Remove bookmark" : "Bookmark"}
                      >
                        <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>

                  {/* Theme scripture */}
                  {devotional.themeScripture && (
                    <div
                      className="text-gray-800 text-sm italic border-l-2 border-gray-500 pl-4 py-1 mb-8 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: devotional.themeScripture }}
                    />
                  )}

                  {/* Preparatory questions - italic, no heading */}
                  {devotional.preparatoryQuestions && devotional.preparatoryQuestions.length > 0 && (
                    <div className="mb-8 space-y-1.5">
                      {devotional.preparatoryQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="text-sm text-gray-500 italic leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: q }}
                        />
                      ))}
                    </div>
                  )}

                  <hr className="border-gray-100 mb-8" />

                  {/* Devotional body */}
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm prose-green max-w-none"
                    dangerouslySetInnerHTML={{ __html: devotional.content }}
                  />
                </div>
              </div>

              {/* Reflection card (warm) */}
              {hasReflection && (
                <div
                  className="rounded-2xl p-6 sm:p-8 space-y-7"
                  style={{
                    background: "#fffbf0",
                    border: "2px solid #f59e0b40",
                    boxShadow: "inset 0 0 0 1px #f59e0b20",
                  }}
                >
                  {devotional.questionsToHelpYouMeditate && devotional.questionsToHelpYouMeditate.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
                        Questions to Meditate On
                      </p>
                      <div className="space-y-2">
                        {devotional.questionsToHelpYouMeditate.map((q, i) => (
                          <div
                            key={i}
                            className="text-sm text-amber-900 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: q }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {devotional.prayer && (
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
                        Prayer
                      </p>
                      <div
                        className="text-sm text-amber-900 italic leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: devotional.prayer }}
                      />
                    </div>
                  )}

                  {devotional.furtherReading && (
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                        Further Reading
                      </p>
                      <div
                        className="text-sm text-amber-900 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: devotional.furtherReading }}
                      />
                    </div>
                  )}

                  {devotional.oneYearBiblePlan && (
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                        One Year Bible Plan
                      </p>
                      <div
                        className="text-sm text-amber-900 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: devotional.oneYearBiblePlan }}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right sidebar ───────────────────────────────────────────── */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-6">
          <Sidebar currentId={id} recent={recent} streakData={streakData} loading={sidebarLoading} />
        </aside>
      </div>
    </div>
  );
}
