"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookmarkApi, BookmarkItem, BookmarkType } from "@/lib/api";
import { Bookmark, BookOpen, Mic2, FileText, PlayCircle, BookMarked } from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_FILTERS: { value: BookmarkType | "all"; label: string }[] = [
  { value: "all",        label: "All" },
  { value: "devotional", label: "Devotionals" },
  { value: "article",    label: "Articles" },
  { value: "podcast",    label: "Podcasts" },
  { value: "course",     label: "Courses" },
  { value: "video",      label: "Videos" },
];

function typeHref(item: BookmarkItem): string {
  switch (item.type) {
    case "devotional": return `/devotionals/${item.itemId}`;
    case "article":    return `/articles/${item.itemId}`;
    case "podcast":    return `/podcasts`;
    case "course":     return `/courses/${item.itemId}`;
    case "video":      return `/videos/${item.itemId}`;
    default:           return "#";
  }
}

function TypeIcon({ type }: { type: BookmarkType }) {
  const cls = "w-full h-full object-cover";
  switch (type) {
    case "devotional": return <BookOpen size={18} className="text-gray-900" />;
    case "article":    return <FileText size={18} className="text-blue-500" />;
    case "podcast":    return <Mic2 size={18} className="text-primary-600" />;
    case "video":      return <PlayCircle size={18} className="text-rose-500" />;
    default:           return <BookMarked size={18} className="text-gray-400" />;
  }
}

const TYPE_BG: Record<BookmarkType, string> = {
  devotional: "bg-gray-100",
  article:    "bg-blue-50",
  podcast:    "bg-primary-50",
  course:     "bg-amber-50",
  lesson:     "bg-amber-50",
  audio:      "bg-gold-50",
  video:      "bg-rose-50",
  verse:      "bg-primary-100",
};

const TYPE_LABEL: Record<BookmarkType, string> = {
  devotional: "Devotional",
  article:    "Article",
  podcast:    "Podcast",
  course:     "Course",
  lesson:     "Lesson",
  audio:      "Audio",
  video:      "Video",
  verse:      "Verse",
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="divide-y divide-gray-50 animate-pulse">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookmarksPage() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<BookmarkType | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const type = activeType === "all" ? undefined : activeType;
    bookmarkApi
      .getAll(type, page, 20)
      .then((res) => {
        setItems(res.data);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeType, page]);

  // Reset to page 1 when filter changes
  function handleTypeChange(t: BookmarkType | "all") {
    setActiveType(t);
    setPage(1);
  }

  async function handleRemove(item: BookmarkItem) {
    // Optimistic remove
    setItems((prev) => prev.filter((b) => b._id !== item._id));
    setTotal((n) => n - 1);
    try {
      await bookmarkApi.toggle({
        itemId: item.itemId,
        type: item.type,
        title: item.title,
        imageUrl: item.imageUrl,
      });
    } catch {
      // Revert on failure by refetching
      const type = activeType === "all" ? undefined : activeType;
      bookmarkApi.getAll(type, page, 20).then((res) => {
        setItems(res.data);
        setTotal(res.total);
      }).catch(() => {});
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
          <Bookmark size={18} className="text-gray-900" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Bookmarks</h1>
          {!loading && (
            <p className="text-xs text-gray-400">{total} saved item{total !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleTypeChange(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeType === value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100">
        {loading ? (
          <div className="px-5 py-2">
            <Skeleton />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Bookmark size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No bookmarks yet</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeType === "all"
                ? "Tap the bookmark icon on any devotional, article, or podcast to save it here."
                : `You haven't bookmarked any ${TYPE_LABEL[activeType as BookmarkType]?.toLowerCase()}s yet.`}
            </p>
            <Link
              href="/devotionals"
              className="mt-5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse devotionals
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <li key={item._id} className="flex items-center gap-4 px-5 py-3.5 group">
                {/* Thumbnail */}
                <Link href={typeHref(item)} className="flex-shrink-0">
                  <div className={`w-11 h-11 rounded-xl ${TYPE_BG[item.type] ?? "bg-gray-50"} flex items-center justify-center overflow-hidden`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <TypeIcon type={item.type} />
                    )}
                  </div>
                </Link>

                {/* Text */}
                <Link href={typeHref(item)} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <span className="inline-block mt-0.5 text-[11px] text-gray-400 capitalize">
                    {TYPE_LABEL[item.type]}
                  </span>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item)}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-700 hover:text-gray-400 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove bookmark"
                >
                  <Bookmark size={15} fill="currentColor" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
