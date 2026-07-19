"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Flame,
  User,
  LogOut,
  ChevronDown,
  BookOpen,
  FileText,
  Mic2,
  PlayCircle,
  ShoppingBag,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { obfuscateEmail } from "@/lib/utils";
import {
  streakApi,
  searchApi,
  SearchScope,
  SearchResult,
  SEARCH_SCOPES,
} from "@/lib/api";
import { StreakCalendarModal } from "@/components/streak/StreakCalendarModal";

// ── Scope config ──────────────────────────────────────────────────────────────

const SCOPE_ICON: Record<SearchScope, React.ElementType> = {
  devotionals: BookOpen,
  articles:    FileText,
  podcasts:    Mic2,
  videos:      PlayCircle,
  products:    ShoppingBag,
};

const SCOPE_COLOR: Record<SearchScope, string> = {
  devotionals: "bg-blue-50 text-blue-600",
  articles:    "bg-primary-50 text-primary-600",
  podcasts:    "bg-pink-50 text-pink-600",
  videos:      "bg-red-50 text-red-600",
  products:    "bg-amber-50 text-amber-600",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTitle(item: SearchResult) {
  return item.title ?? item.name ?? "Untitled";
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

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-100 text-gray-900 rounded-sm px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

// ── Mini result row ───────────────────────────────────────────────────────────

function ResultRow({
  item,
  scope,
  query,
  onClose,
}: {
  item: SearchResult;
  scope: SearchScope;
  query: string;
  onClose: () => void;
}) {
  const Icon = SCOPE_ICON[scope];
  const href = getHref(item, scope);
  const external = scope === "videos";
  const title = getTitle(item);
  const thumb =
    item.thumbnailUrl ??
    (scope === "videos" && item.youtubeId
      ? `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`
      : item.imageUrl ?? null);

  const inner = (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group cursor-pointer">
      {thumb ? (
        <img src={thumb} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
      ) : (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${SCOPE_COLOR[scope]}`}>
          <Icon size={14} />
        </div>
      )}
      <span className="text-sm text-gray-800 truncate flex-1 group-hover:text-gray-900">
        {highlight(title, query)}
      </span>
      {scope === "products" && item.price != null && (
        <span className="text-xs text-gray-400 flex-shrink-0">${item.price.toFixed(2)}</span>
      )}
    </div>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClose}>
      {inner}
    </a>
  ) : (
    <Link href={href} onClick={onClose}>
      {inner}
    </Link>
  );
}

// ── Search modal ──────────────────────────────────────────────────────────────

function SearchModal({
  query,
  onClose,
  onSeeAll,
}: {
  query: string;
  onClose: () => void;
  onSeeAll: (scope?: SearchScope) => void;
}) {
  const [activeScope, setActiveScope] = useState<SearchScope | "all">("all");
  const [allResults, setAllResults] = useState<Record<string, SearchResult[]>>({});
  const [allTotals, setAllTotals] = useState<Record<string, number>>({});
  const [scopeResults, setScopeResults] = useState<SearchResult[]>([]);
  const [scopeTotal, setScopeTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);

    if (activeScope === "all") {
      searchApi.searchAll(query, 4).then((results) => {
        const byScope: Record<string, SearchResult[]> = {};
        const byTotal: Record<string, number> = {};
        results.forEach((r) => {
          byScope[r.scope] = r.data;
          byTotal[r.scope] = r.total;
        });
        setAllResults(byScope);
        setAllTotals(byTotal);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      searchApi.search(query, activeScope, 1, 8).then((res) => {
        setScopeResults(res.data);
        setScopeTotal(res.total);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [query, activeScope]);

  const totalAll = Object.values(allTotals).reduce((a, b) => a + b, 0);
  const hasResults = activeScope === "all"
    ? Object.values(allResults).some((r) => r.length > 0)
    : scopeResults.length > 0;

  return (
    <div className="fixed top-14 left-64 right-0 z-30 px-6 pt-3 pb-6 pointer-events-none">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto max-h-[78vh] flex flex-col">

        {/* Scope tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-gray-50 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveScope("all")}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeScope === "all"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            All {totalAll > 0 && `(${totalAll})`}
          </button>
          {SEARCH_SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveScope(s.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                activeScope === s.value
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {s.label}
              {activeScope === "all" && (allTotals[s.value] ?? 0) > 0 && (
                <span className="ml-1 opacity-60">{allTotals[s.value]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="space-y-0.5 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="h-3.5 bg-gray-100 rounded flex-1" />
                </div>
              ))}
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : activeScope === "all" ? (
            <div className="py-1">
              {SEARCH_SCOPES.map((s) => {
                const items = allResults[s.value] ?? [];
                if (!items.length) return null;
                return (
                  <div key={s.value} className="mb-1">
                    {/* Scope label row */}
                    <div className="flex items-center justify-between px-4 pt-2 pb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {s.label}
                      </span>
                      {(allTotals[s.value] ?? 0) > items.length && (
                        <button
                          onClick={() => onSeeAll(s.value)}
                          className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-gray-700 font-medium"
                        >
                          {allTotals[s.value]} results <ChevronRight size={10} />
                        </button>
                      )}
                    </div>
                    {items.map((item) => (
                      <ResultRow
                        key={item._id}
                        item={item}
                        scope={s.value}
                        query={query}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-1">
              {scopeResults.map((item) => (
                <ResultRow
                  key={item._id}
                  item={item}
                  scope={activeScope as SearchScope}
                  query={query}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - see all on full search page */}
        {hasResults && (
          <div className="border-t border-gray-50 px-4 py-2.5 flex-shrink-0">
            <button
              onClick={() => onSeeAll()}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              <Search size={12} />
              See all results for &ldquo;{query}&rdquo;
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Profile dropdown ──────────────────────────────────────────────────────────

function ProfileDropdown({
  user,
  initials,
  logout,
}: {
  user: { firstname: string; lastname?: string | null; email: string; profilePicture?: string | null } | null;
  initials: string;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = user ? `${user.firstname} ${user.lastname ?? ""}`.trim() : "…";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {user?.profilePicture && !avatarError ? (
          <img
            src={user.profilePicture}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 text-xs font-semibold">{initials}</span>
          </div>
        )}
        <span className="hidden xl:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown size={13} className="hidden xl:block text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-primary-100 shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-primary-50">
            <p className="text-sm font-semibold text-primary-900 truncate">{displayName}</p>
            <p className="text-xs text-neutral-400 truncate">{obfuscateEmail(user?.email)}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <User size={15} /> View profile
          </Link>
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Desktop TopBar ────────────────────────────────────────────────────────────

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [streakCount, setStreakCount] = useState(0);
  const [calOpen, setCalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.firstname[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase()
    : "?";

  useEffect(() => {
    streakApi.getMyStreak().then((s) => setStreakCount(s.currentStreak)).catch(() => {});
  }, []);

  // Debounce query → trigger modal search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setModalOpen(!!debouncedQ.trim());
  }, [debouncedQ]);

  // Close modal on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        // also check the modal card (outside wrapperRef)
        const modal = document.getElementById("search-modal-card");
        if (modal && modal.contains(e.target as Node)) return;
        closeModal();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function closeModal() {
    setModalOpen(false);
    setQuery("");
    setDebouncedQ("");
  }

  function handleSeeAll(scope?: SearchScope) {
    closeModal();
    const url = scope
      ? `/search?q=${encodeURIComponent(query)}&scope=${scope}`
      : `/search?q=${encodeURIComponent(query)}`;
    router.push(url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) handleSeeAll();
  }

  return (
    <>
      {/* Backdrop - clicking outside closes modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 top-14 lg:left-64 z-20"
          onClick={closeModal}
        />
      )}

      <header className="hidden lg:flex fixed top-0 left-64 right-0 h-14 bg-white border-b border-primary-100 z-30 items-center px-6 gap-4">
        {/* Left spacer */}
        <div className="flex-1" />

        {/* Center: search */}
        <div ref={wrapperRef} className="w-full max-w-sm relative">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (debouncedQ.trim()) setModalOpen(true); }}
                onKeyDown={(e) => { if (e.key === "Escape") closeModal(); }}
                className="w-full pl-9 pr-8 py-2 text-sm bg-primary-50/50 border border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-colors placeholder:text-neutral-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: streak + profile */}
        <div className="flex-1 flex justify-end items-center gap-2">
          <button
            onClick={() => setCalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Flame size={15} className="text-gold-500" />
            <span className="text-sm font-semibold text-gold-600">{streakCount}</span>
          </button>
          <ProfileDropdown user={user} initials={initials} logout={logout} />
        </div>
      </header>

      {/* Search modal - rendered outside header so it can overflow */}
      {modalOpen && debouncedQ.trim() && (
        <div id="search-modal-card">
          <SearchModal
            query={debouncedQ}
            onClose={closeModal}
            onSeeAll={handleSeeAll}
          />
        </div>
      )}

      {calOpen && <StreakCalendarModal onClose={() => setCalOpen(false)} />}
    </>
  );
}
