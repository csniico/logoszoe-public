"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bibleApi, BibleChapter } from "@/lib/api";

export default function BibleChapterPage({
  params,
}: {
  params: Promise<{ abbrev: string; chapter: string }>;
}) {
  const { abbrev, chapter } = use(params);
  const chapterNum = parseInt(chapter, 10);

  const [data, setData] = useState<BibleChapter | null>(null);
  const [bookName, setBookName] = useState<string>("");
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedVerse(null);

    // Fetch verses + book info in parallel
    Promise.all([
      bibleApi.getVerses(abbrev, chapterNum),
      bibleApi.getChapters(abbrev),
    ])
      .then(([verses, book]) => {
        setData(verses);
        setBookName(book?.name ?? abbrev);
        setTotalChapters(book?.chapters.length ?? 0);
      })
      .catch((e) => setError(e.message ?? "Failed to load chapter"))
      .finally(() => setLoading(false));
  }, [abbrev, chapterNum]);

  const hasPrev = chapterNum > 1;
  const hasNext = totalChapters > 0 && chapterNum < totalChapters;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="h-7 w-48 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-5 bg-gray-100 rounded animate-pulse flex-shrink-0 mt-0.5" />
              <div className="h-4 bg-gray-100 rounded animate-pulse flex-1" style={{ width: `${65 + (i % 4) * 10}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href={`/bible/${abbrev}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> {abbrev}
        </Link>
        <p className="text-red-500 text-sm">{error ?? "Chapter not found."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/bible" className="hover:text-gray-700">Bible</Link>
        <ChevronRight size={13} className="text-gray-300" />
        <Link href={`/bible/${abbrev}`} className="hover:text-gray-700">{bookName}</Link>
        <ChevronRight size={13} className="text-gray-300" />
        <span className="text-gray-700 font-medium">Chapter {chapterNum}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {bookName} {chapterNum}
      </h1>
      <p className="text-sm text-gray-400 mb-8">{data.versesCount} verses</p>

      {/* Verses */}
      <div className="space-y-1">
        {data.verses.map((verse, i) => {
          const verseNum = i + 1;
          const isSelected = selectedVerse === verseNum;
          return (
            <button
              key={verseNum}
              onClick={() => setSelectedVerse(isSelected ? null : verseNum)}
              className={`w-full text-left flex gap-3 px-3 py-2 rounded-lg transition-colors group ${
                isSelected
                  ? "bg-gray-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <span
                className={`text-xs font-bold flex-shrink-0 w-5 text-right mt-0.5 select-none ${
                  isSelected ? "text-gray-900" : "text-gray-300 group-hover:text-gray-400"
                }`}
              >
                {verseNum}
              </span>
              <span
                className={`text-sm leading-relaxed ${
                  isSelected ? "text-gray-900 font-medium" : "text-gray-700"
                }`}
              >
                {verse}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chapter navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
        {hasPrev ? (
          <Link
            href={`/bible/${abbrev}/${chapterNum - 1}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-all"
          >
            <ChevronLeft size={15} />
            Chapter {chapterNum - 1}
          </Link>
        ) : (
          <div />
        )}

        <Link
          href={`/bible/${abbrev}`}
          className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
        >
          {bookName}
        </Link>

        {hasNext ? (
          <Link
            href={`/bible/${abbrev}/${chapterNum + 1}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-all"
          >
            Chapter {chapterNum + 1}
            <ChevronRight size={15} />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
