"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  BookOpen,
  FileText,
  Mic2,
  PlayCircle,
  ShoppingBag,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  searchApi,
  SearchScope,
  SearchResult,
  SearchResponse,
  SEARCH_SCOPES,
} from "@/lib/api";

// ── Scope config ──────────────────────────────────────────────────────────────

const SCOPE_ICON: Record<SearchScope, React.ElementType> = {
  devotionals: BookOpen,
  articles:    FileText,
  podcasts:    Mic2,
  videos:      PlayCircle,
  products:    ShoppingBag,
};

const SCOPE_COLOR: Record<SearchScope, string> = {
  devotionals: "bg-blue-50 text-blue-700",
  articles:    "bg-primary-50 text-primary-700",
  podcasts:    "bg-pink-50 text-pink-700",
  videos:      "bg-red-50 text-red-700",
  products:    "bg-amber-50 text-amber-700",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTitle(item: SearchResult) {
  return item.title ?? item.name ?? "Untitled";
}

function getSnippet(item: SearchResult, query: string) {
  const raw = item.description ?? item.content ?? "";
  if (!raw) return null;
  const plain = raw.replace(/<[^>]*>/g, "");
  const idx = plain.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return plain.slice(0, 120);
  const start = Math.max(0, idx - 40);
  return (start > 0 ? "…" : "") + plain.slice(start, start + 140) + (start + 140 < plain.length ? "…" : "");
}

function getHref(item: SearchResult, scope: SearchScope): string {
  switch (scope) {
    case "devotionals": return `/devotionals/${item._id}`;
    case "articles":    return item.slug ? `/articles/${item.slug}` : `/dashboard`;
    case "podcasts":    return item.category ? `/podcasts/${item.category}` : `/podcasts`;
    case "videos":      return item.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : `/videos`;
    case "products":    return `/shop/${item._id}`;
    default:            return "/";
  }
}

function isExternal(scope: SearchScope) {
  return scope === "videos";
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-100 text-gray-900 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({
  item,
  scope,
  query,
}: {
  item: SearchResult;
  scope: SearchScope;
  query: string;
}) {
  const Icon = SCOPE_ICON[scope];
  const href = getHref(item, scope);
  const external = isExternal(scope);
  const title = getTitle(item);
  const snippet = getSnippet(item, query);

  const thumb = item.thumbnailUrl
    ?? (scope === "videos" && item.youtubeId
      ? `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`
      : item.imageUrl ?? null);

  const inner = (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm hover:border-gray-200 transition-all group">
      {/* Thumbnail / icon */}
      {thumb ? (
        <img
          src={thumb}
          alt=""
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100"
        />
      ) : (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${SCOPE_COLOR[scope]}`}>
          <Icon size={17} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
          {highlight(title, query)}
        </p>
        {snippet && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
            {highlight(snippet, query)}
          </p>
        )}
        {scope === "devotionals" && item.day && item.month && item.year && (
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(item.year, item.month - 1, item.day).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <Link href={href}>{inner}</Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
    </div>
  );
}

// ── Section (used in All-scope view) ─────────────────────────────────────────

function ScopeSection({
  scope,
  results,
  query,
  total,
  onScopeClick,
}: {
  scope: SearchScope;
  results: SearchResult[];
  query: string;
  total: number;
  onScopeClick: (s: SearchScope) => void;
}) {
  if (results.length === 0) return null;
  const label = SEARCH_SCOPES.find((s) => s.value === scope)?.label ?? scope;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</h2>
        {total > results.length && (
          <button
            onClick={() => onScopeClick(scope)}
            className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            See all {total} <ChevronRight size={12} />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {results.map((item) => (
          <ResultCard key={item._id} item={item} scope={scope} query={query} />
        ))}
      </div>
    </div>
  );
}

// ── Main search content ───────────────────────────────────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") ?? "";
  const [inputQ, setInputQ] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);
  const [scope, setScope] = useState<SearchScope | "all">("all");

  // Per-scope results (for individual scope view)
  const [scopeResult, setScopeResult] = useState<SearchResponse | null>(null);
  const [scopePage, setScopePage] = useState(1);

  // All-scope combined results
  const [allResults, setAllResults] = useState<Record<SearchScope, SearchResult[]>>({} as Record<SearchScope, SearchResult[]>);
  const [allTotals, setAllTotals] = useState<Record<SearchScope, number>>({} as Record<SearchScope, number>);

  const [loading, setLoading] = useState(false);

  // Run search
  const runSearch = useCallback(async (q: string, sc: SearchScope | "all", page = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      if (sc === "all") {
        const results = await searchApi.searchAll(q, 5);
        const byScope: Record<string, SearchResult[]> = {};
        const byTotal: Record<string, number> = {};
        results.forEach((r) => {
          byScope[r.scope] = r.data;
          byTotal[r.scope] = r.total;
        });
        setAllResults(byScope as Record<SearchScope, SearchResult[]>);
        setAllTotals(byTotal as Record<SearchScope, number>);
        setScopeResult(null);
      } else {
        const res = await searchApi.search(q, sc, page);
        setScopeResult(res);
        setAllResults({} as Record<SearchScope, SearchResult[]>);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // On URL param change (e.g. from topbar)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setInputQ(q);
    setActiveQuery(q);
    setScope("all");
    setScopePage(1);
    if (q) runSearch(q, "all");
  }, [searchParams, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputQ.trim();
    if (!q) return;
    setActiveQuery(q);
    setScope("all");
    setScopePage(1);
    router.replace(`/search?q=${encodeURIComponent(q)}`);
    runSearch(q, "all");
  }

  function handleScopeChange(s: SearchScope | "all") {
    setScope(s);
    setScopePage(1);
    if (activeQuery) runSearch(activeQuery, s, 1);
  }

  function handlePage(page: number) {
    setScopePage(page);
    runSearch(activeQuery, scope as SearchScope, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalAllResults = Object.values(allTotals).reduce((a, b) => a + b, 0);
  const hasAllResults = Object.values(allResults).some((r) => r.length > 0);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search bar */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              autoFocus
              type="text"
              placeholder="Search devotionals, articles, videos…"
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            />
          </div>
        </form>
      </div>

      {/* Scope tabs */}
      {activeQuery && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
          <button
            onClick={() => handleScopeChange("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              scope === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All {totalAllResults > 0 && `(${totalAllResults})`}
          </button>
          {SEARCH_SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleScopeChange(s.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                scope === s.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
              {scope === "all" && allTotals[s.value] > 0 && (
                <span className="ml-1 opacity-60">{allTotals[s.value]}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <ResultSkeleton key={i} />)}
        </div>
      ) : !activeQuery ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Type something to search across the app.</p>
        </div>
      ) : scope === "all" ? (
        hasAllResults ? (
          <div className="space-y-8">
            {SEARCH_SCOPES.map((s) =>
              allResults[s.value]?.length > 0 ? (
                <ScopeSection
                  key={s.value}
                  scope={s.value}
                  results={allResults[s.value]}
                  query={activeQuery}
                  total={allTotals[s.value] ?? 0}
                  onScopeClick={handleScopeChange}
                />
              ) : null,
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Search size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm">No results for &ldquo;{activeQuery}&rdquo;</p>
          </div>
        )
      ) : scopeResult ? (
        <>
          {scopeResult.data.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No {SEARCH_SCOPES.find((s) => s.value === scope)?.label.toLowerCase()} found for &ldquo;{activeQuery}&rdquo;</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-4">{scopeResult.total} result{scopeResult.total !== 1 ? "s" : ""}</p>
              <div className="space-y-2">
                {scopeResult.data.map((item) => (
                  <ResultCard key={item._id} item={item} scope={scope as SearchScope} query={activeQuery} />
                ))}
              </div>

              {/* Pagination */}
              {scopeResult.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    disabled={scopePage === 1}
                    onClick={() => handlePage(scopePage - 1)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {scopePage} of {scopeResult.totalPages}
                  </span>
                  <button
                    disabled={scopePage === scopeResult.totalPages}
                    onClick={() => handlePage(scopePage + 1)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="flex justify-center py-10">
          <Loader2 size={20} className="animate-spin text-gray-300" />
        </div>
      )}
    </div>
  );
}

// ── Page wrapper (Suspense for useSearchParams) ───────────────────────────────

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto">
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
