"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import { bibleApi, BibleBookDetail } from "@/lib/api";

export default function BibleBookPage({
  params,
}: {
  params: Promise<{ abbrev: string }>;
}) {
  const { abbrev } = use(params);
  const [book, setBook] = useState<BibleBookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bibleApi
      .getChapters(abbrev)
      .then(setBook)
      .catch((e) => setError(e.message ?? "Failed to load book"))
      .finally(() => setLoading(false));
  }, [abbrev]);

  if (loading) {
    return (
      <div>
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div>
        <Link href="/bible" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> Bible
        </Link>
        <p className="text-red-500 text-sm">{error ?? "Book not found."}</p>
      </div>
    );
  }

  const chapterCount = book.chapters.length;

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/bible" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Bible
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <BookOpen size={22} className="text-gray-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{book.name}</h1>
          <p className="text-sm text-gray-400">{chapterCount} chapter{chapterCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Chapter grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
        {book.chapters.map((_, i) => {
          const chapterNum = i + 1;
          return (
            <Link
              key={chapterNum}
              href={`/bible/${abbrev}/${chapterNum}`}
              className="aspect-square flex items-center justify-center rounded-xl border border-gray-100 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 transition-all"
            >
              {chapterNum}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
