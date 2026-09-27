"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { bibleApi, BibleDictionaryEntry, ApiError } from "@/lib/api";

function ResultSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse space-y-2">
      <div className="h-4 w-24 bg-gray-100 rounded" />
      <div className="h-3 w-full bg-gray-100 rounded" />
      <div className="h-3 w-4/5 bg-gray-100 rounded" />
    </div>
  );
}

function DictionaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTerm = searchParams.get("term") ?? "";
  const [inputTerm, setInputTerm] = useState(initialTerm);
  const [activeTerm, setActiveTerm] = useState(initialTerm);
  const [results, setResults] = useState<BibleDictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bibleApi.searchDictionary(term.trim());
      setResults(data);
    } catch (e) {
      setResults([]);
      setError(e instanceof ApiError ? e.message : "Failed to search the dictionary");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    const term = searchParams.get("term") ?? "";
    setInputTerm(term);
    setActiveTerm(term);
    if (term) runSearch(term);
  }, [searchParams, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = inputTerm.trim();
    if (!term) return;
    setActiveTerm(term);
    router.replace(`/bible/dictionary?term=${encodeURIComponent(term)}`);
    runSearch(term);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/bible" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Bible
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dictionary</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            autoFocus
            type="text"
            placeholder="Search a biblical term…"
            value={inputTerm}
            onChange={(e) => setInputTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          />
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ResultSkeleton key={i} />
          ))}
        </div>
      ) : searched && !error && results.length === 0 ? (
        <p className="text-sm text-gray-400">No entries found for &ldquo;{activeTerm}&rdquo;.</p>
      ) : (
        <div className="space-y-3">
          {results.map((entry) => (
            <div key={entry.slug} className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="text-base font-bold text-gray-900 mb-1.5">{entry.term}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {entry.definition}
              </p>
              {entry.scriptureRefs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {entry.scriptureRefs.map((ref) => (
                    <span
                      key={ref}
                      className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BibleDictionaryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto">
          <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mb-4" />
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-6" />
        </div>
      }
    >
      <DictionaryContent />
    </Suspense>
  );
}
