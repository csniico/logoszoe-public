"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { bibleApi, BibleBook, NT_BOOK_NAMES, sortByBibleOrder } from "@/lib/api";

type Testament = "NT" | "OT";

function BookSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-28 bg-gray-100 rounded" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function BiblePage() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Testament>("NT");
  const [search, setSearch] = useState("");

  useEffect(() => {
    bibleApi
      .getBooks()
      .then((data) => setBooks(sortByBibleOrder(data)))
      .catch((e) => setError(e.message ?? "Failed to load books"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = books.filter((b) =>
      tab === "NT" ? NT_BOOK_NAMES.has(b.name) : !NT_BOOK_NAMES.has(b.name),
    );
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q));
    }
    return list;
  }, [books, tab, search]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bible</h1>
        <p className="text-gray-500 text-sm mt-1">Read and explore the scriptures.</p>
      </div>

      {/* Testament tabs */}
      <div className="flex gap-2 mb-5">
        {(["NT", "OT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t === "NT" ? "New Testament" : "Old Testament"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search books…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 bg-white"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-5">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <BookSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No books found{search ? ` for "${search}"` : ""}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((book) => (
            <Link
              key={book._id}
              href={`/bible/${book.abbrev}`}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 hover:shadow-sm hover:border-gray-300 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">
                  {book.name}
                </p>
                <p className="text-xs text-gray-400">{book.chaptersCount} chapters</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-700 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
