"use client";

import { Suspense, useEffect, useState } from "react";
import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  bibleApi,
  BibleChapter,
  BibleTranslation,
  BibleCommentary,
} from "@/lib/api";

type Mode = "read" | "commentary";

function BibleChapterContent({
  abbrev,
  chapterNum,
}: {
  abbrev: string;
  chapterNum: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const translationParam = searchParams.get("translation");
  const commentaryParam = searchParams.get("commentary");
  const mode: Mode = searchParams.get("mode") === "commentary" ? "commentary" : "read";

  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [commentaries, setCommentaries] = useState<BibleCommentary[]>([]);
  const [data, setData] = useState<BibleChapter | null>(null);
  const [bookName, setBookName] = useState<string>("");
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [bookNotFound, setBookNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  // Content-area error only - a translation/commentary not covering this
  // particular book/chapter is an expected, recoverable state, not a page
  // crash, so the header/breadcrumb/pickers stay usable.
  const [contentError, setContentError] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  // Book info + offered translations/commentaries - only needs abbrev, not mode/selection.
  useEffect(() => {
    setBookNotFound(false);
    bibleApi
      .getChapters(abbrev)
      .then((book) => {
        setBookName(book?.name ?? abbrev);
        setTotalChapters(book?.chapters.length ?? 0);
      })
      .catch(() => setBookNotFound(true));
    bibleApi.getTranslations().then(setTranslations).catch(() => setTranslations([]));
    bibleApi.getCommentaries().then(setCommentaries).catch(() => setCommentaries([]));
  }, [abbrev]);

  // Chapter content - depends on mode + selected translation/commentary.
  useEffect(() => {
    if (mode === "commentary" && !commentaryParam) {
      setData(null);
      setContentError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setContentError(null);
    setSelectedVerse(null);

    const request =
      mode === "commentary" && commentaryParam
        ? bibleApi.getCommentaryChapter(commentaryParam, abbrev, chapterNum)
        : mode === "read" && translationParam
          ? bibleApi.getTranslationChapter(translationParam, abbrev, chapterNum)
          : bibleApi.getVerses(abbrev, chapterNum);

    request
      .then((result) => setData(result))
      .catch((e) => {
        setData(null);
        setContentError(e.message ?? "Failed to load this chapter.");
      })
      .finally(() => setLoading(false));
  }, [abbrev, chapterNum, mode, translationParam, commentaryParam]);

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.replace(`/bible/${abbrev}/${chapterNum}${qs ? `?${qs}` : ""}`);
  }

  function selectMode(next: Mode) {
    updateParams({ mode: next === "read" ? null : next });
  }

  function selectTranslation(translationId: string) {
    updateParams({ translation: translationId || null });
  }

  function selectCommentary(commentaryId: string) {
    updateParams({ commentary: commentaryId || null });
  }

  const hasPrev = chapterNum > 1;
  const hasNext = totalChapters > 0 && chapterNum < totalChapters;
  const navQuery = searchParams.toString();
  const navSuffix = navQuery ? `?${navQuery}` : "";

  const selectedCommentaryName = commentaries.find(
    (c) => c.commentaryId === commentaryParam,
  )?.englishName;

  if (bookNotFound) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href="/bible" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> Bible
        </Link>
        <p className="text-red-500 text-sm">Book &ldquo;{abbrev}&rdquo; not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/bible" className="hover:text-gray-700">Bible</Link>
        <ChevronRight size={13} className="text-gray-300" />
        <Link href={`/bible/${abbrev}`} className="hover:text-gray-700">{bookName || abbrev}</Link>
        <ChevronRight size={13} className="text-gray-300" />
        <span className="text-gray-700 font-medium">Chapter {chapterNum}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {bookName || abbrev} {chapterNum}
      </h1>
      <p className="text-sm text-gray-400 mb-5">
        {data ? `${data.versesCount} verses` : " "}
      </p>

      {/* Read / Commentary toggle */}
      {commentaries.length > 0 && (
        <div className="flex gap-2 mb-4">
          {(["read", "commentary"] as const).map((m) => (
            <button
              key={m}
              onClick={() => selectMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mode === m
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {m === "read" ? "Read" : "Commentary"}
            </button>
          ))}
        </div>
      )}

      {/* Translation dropdown */}
      {mode === "read" && translations.length > 0 && (
        <div className="mb-5">
          <label htmlFor="translation-select" className="sr-only">Bible version</label>
          <select
            id="translation-select"
            value={translationParam ?? ""}
            onChange={(e) => selectTranslation(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Default</option>
            {translations.map((t) => (
              <option key={t.translationId} value={t.translationId}>
                {t.englishName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Commentary dropdown */}
      {mode === "commentary" && commentaries.length > 0 && (
        <div className="mb-5">
          <label htmlFor="commentary-select" className="sr-only">Commentary</label>
          <select
            id="commentary-select"
            value={commentaryParam ?? ""}
            onChange={(e) => selectCommentary(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Choose a commentary…</option>
            {commentaries.map((c) => (
              <option key={c.commentaryId} value={c.commentaryId}>
                {c.englishName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content area */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-5 bg-gray-100 rounded animate-pulse flex-shrink-0 mt-0.5" />
              <div className="h-4 bg-gray-100 rounded animate-pulse flex-1" style={{ width: `${65 + (i % 4) * 10}%` }} />
            </div>
          ))}
        </div>
      ) : mode === "commentary" && !commentaryParam ? (
        <p className="text-sm text-gray-400 mb-8">Choose a commentary above to read it.</p>
      ) : contentError ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm mb-8">
          {mode === "commentary" ? (
            <>
              <strong>{selectedCommentaryName ?? "This commentary"}</strong> has no notes on{" "}
              {bookName || abbrev} {chapterNum}.{" "}
              <button onClick={() => selectMode("read")} className="underline font-medium hover:text-amber-900">
                Switch to Read
              </button>{" "}
              or try another commentary above.
            </>
          ) : (
            <>
              This translation isn&apos;t available for {bookName || abbrev} {chapterNum}.{" "}
              <button onClick={() => selectTranslation("")} className="underline font-medium hover:text-amber-900">
                Switch to Default
              </button>
            </>
          )}
        </div>
      ) : data ? (
        <div className="space-y-1">
          {data.verses.map((verse, i) => {
            const verseNum = i + 1;
            const isSelected = selectedVerse === verseNum;
            return (
              <button
                key={verseNum}
                onClick={() => setSelectedVerse(isSelected ? null : verseNum)}
                className={`w-full text-left flex gap-3 px-3 py-2 rounded-lg transition-colors group ${
                  isSelected ? "bg-gray-100" : "hover:bg-gray-50"
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
      ) : null}

      {/* Chapter navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
        {hasPrev ? (
          <Link
            href={`/bible/${abbrev}/${chapterNum - 1}${navSuffix}`}
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
          {bookName || abbrev}
        </Link>

        {hasNext ? (
          <Link
            href={`/bible/${abbrev}/${chapterNum + 1}${navSuffix}`}
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

export default function BibleChapterPage({
  params,
}: {
  params: Promise<{ abbrev: string; chapter: string }>;
}) {
  const { abbrev, chapter } = use(params);
  const chapterNum = parseInt(chapter, 10);

  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto">
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-6" />
          <div className="h-7 w-48 bg-gray-100 rounded animate-pulse mb-8" />
        </div>
      }
    >
      <BibleChapterContent abbrev={abbrev} chapterNum={chapterNum} />
    </Suspense>
  );
}
