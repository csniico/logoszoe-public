"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { categoryApi, Category, streakApi, videoApi } from "@/lib/api";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileText,
  Mic2,
  MessageSquare,
  Heart,
  ClipboardList,
  ShoppingBag,
  PlayCircle,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Flame,
  Bookmark,
  Search,
} from "lucide-react";
import { PODCAST_CATEGORIES, PodcastCategory } from "@/lib/api";
import { useState, useEffect, useRef } from "react";

// Override display names for video categories whose DB value differs from the desired label.
// Key: lowercase DB category value. Value: display string shown in the nav.
import { StreakCalendarModal } from "@/components/streak/StreakCalendarModal";

const VIDEO_CATEGORY_LABELS: Record<string, string> = {
  "inspirational":      "5-min Inspirational",
  "wisdom-nuggets":     "Wisdom Nuggets",
  "motivationals":      "Motivationals",
  "testimony-of-jesus": "Testimonies",
};

// ── Nav structure ─────────────────────────────────────────────────────────────

const topItems = [
  { label: "Dashboard",   href: "/dashboard",   icon: LayoutDashboard },
  { label: "Devotionals", href: "/devotionals",  icon: BookOpen },
  { label: "Courses",     href: "/courses",      icon: GraduationCap },
];

const bottomItems = [
  { label: "Bookmarks",   href: "/bookmarks",    icon: Bookmark },
  { label: "Submissions", href: "/submissions",  icon: ClipboardList },
  { label: "Community",   href: "/community",    icon: MessageSquare },
  { label: "Prayer",      href: "/prayer",       icon: Heart },
  { label: "Shop",        href: "/shop",         icon: ShoppingBag },
  { label: "Bible",       href: "/bible",        icon: BookOpen },
];

// ── Category dot ──────────────────────────────────────────────────────────────

function CategoryDot({ color }: { color?: string }) {
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color ?? "#16a34a" }}
    />
  );
}

// ── Articles section with expandable categories ───────────────────────────────

function ArticlesNav({
  collapsed,
  categories,
  pathname,
  onNavClick,
}: {
  collapsed: boolean;
  categories: Category[];
  pathname: string;
  onNavClick?: () => void;
}) {
  const onArticlesPath = pathname === "/articles" || pathname.startsWith("/articles/");
  const [open, setOpen] = useState(onArticlesPath);

  // Auto-open when navigating into articles
  useEffect(() => {
    if (onArticlesPath) setOpen(true);
  }, [onArticlesPath]);

  if (collapsed) {
    return (
      <Link
        href="/articles"
        title="Articles"
        className={cn(
          "flex items-center justify-center px-0 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors",
          onArticlesPath ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-primary-50/60 hover:text-primary-800"
        )}
      >
        <FileText size={18} className="flex-shrink-0" />
      </Link>
    );
  }

  return (
    <div className="mb-0.5">
      {/* Articles header — click toggles category list */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          onArticlesPath ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-primary-50/60 hover:text-primary-800"
        )}
      >
        <FileText size={18} className="flex-shrink-0" />
        <span className="flex-1 text-left">Articles</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200 flex-shrink-0", open && "rotate-180")}
        />
      </button>

      {/* Category list */}
      {open && categories.length > 0 && (
        <div className="ml-4 pl-3 border-l border-primary-100 mt-0.5 space-y-0.5">
          {categories.map((cat) => {
            const href = `/articles/${cat.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={cat._id}
                href={href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-neutral-400 hover:bg-primary-50/60 hover:text-primary-700"
                )}
              >
                <CategoryDot color={cat.color} />
                <span className="truncate">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Loading shimmer */}
      {open && categories.length === 0 && (
        <div className="ml-4 pl-3 border-l border-gray-100 mt-0.5 space-y-1.5 py-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Podcasts section with expandable categories ───────────────────────────────

function PodcastsNav({
  collapsed,
  pathname,
  onNavClick,
}: {
  collapsed: boolean;
  pathname: string;
  onNavClick?: () => void;
}) {
  const onPodcastsPath = pathname === "/podcasts" || pathname.startsWith("/podcasts/");
  const [open, setOpen] = useState(onPodcastsPath);

  useEffect(() => {
    if (onPodcastsPath) setOpen(true);
  }, [onPodcastsPath]);

  if (collapsed) {
    return (
      <Link
        href="/podcasts"
        title="Podcasts"
        className={cn(
          "flex items-center justify-center px-0 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors",
          onPodcastsPath ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-primary-50/60 hover:text-primary-800"
        )}
      >
        <Mic2 size={18} className="flex-shrink-0" />
      </Link>
    );
  }

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          onPodcastsPath ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-primary-50/60 hover:text-primary-800"
        )}
      >
        <Mic2 size={18} className="flex-shrink-0" />
        <span className="flex-1 text-left">Podcasts</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200 flex-shrink-0", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="ml-4 pl-3 border-l border-primary-100 mt-0.5 space-y-0.5">
          {PODCAST_CATEGORIES.map((cat) => {
            const href = `/podcasts/${cat.value}`;
            const active = pathname === href;
            return (
              <Link
                key={cat.value}
                href={href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-neutral-400 hover:bg-primary-50/60 hover:text-primary-700"
                )}
              >
                <CategoryDot color={cat.color} />
                <span className="truncate">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Videos section with expandable categories ────────────────────────────────

function VideosNav({
  collapsed,
  pathname,
  onNavClick,
}: {
  collapsed: boolean;
  pathname: string;
  onNavClick?: () => void;
}) {
  const onVideosPath = pathname === "/videos" || pathname.startsWith("/videos/");
  const [open, setOpen] = useState(onVideosPath);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (onVideosPath) setOpen(true);
  }, [onVideosPath]);

  useEffect(() => {
    videoApi.getAll()
      .then((videos) => {
        const seen = new Set<string>();
        videos.forEach((v) => { if (v.category?.trim()) seen.add(v.category.trim()); });
        const sorted = Array.from(seen).sort((a, b) => {
          // Wisdom Nuggets always first
          const aKey = a.toLowerCase();
          const bKey = b.toLowerCase();
          if (aKey.includes("wisdom")) return -1;
          if (bKey.includes("wisdom")) return 1;
          return a.localeCompare(b);
        });
        setCategories(sorted);
      })
      .catch(() => {});
  }, []);

  if (collapsed) {
    return (
      <Link
        href="/videos"
        title="Videos"
        className={cn(
          "flex items-center justify-center px-0 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors",
          onVideosPath ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-primary-50/60 hover:text-primary-800"
        )}
      >
        <PlayCircle size={18} className="flex-shrink-0" />
      </Link>
    );
  }

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          onVideosPath ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-primary-50/60 hover:text-primary-800"
        )}
      >
        <PlayCircle size={18} className="flex-shrink-0" />
        <span className="flex-1 text-left">Videos</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200 flex-shrink-0", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="ml-4 pl-3 border-l border-primary-100 mt-0.5 space-y-0.5">
          {/* Per-category links */}
          {categories.map((cat) => {
            const href = `/videos/${encodeURIComponent(cat)}`;
            const active = pathname === href;
            const displayName = VIDEO_CATEGORY_LABELS[cat.toLowerCase()] ?? cat;
            return (
              <Link
                key={cat}
                href={href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-neutral-400 hover:bg-primary-50/60 hover:text-primary-700"
                )}
              >
                <CategoryDot color="#ef4444" />
                <span className="truncate">{displayName}</span>
              </Link>
            );
          })}

          {/* Shimmer while loading */}
          {categories.length === 0 && (
            <div className="space-y-1.5 py-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
  pathname,
  onNavClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  pathname: string;
  onNavClick?: () => void;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onNavClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors",
        active ? "bg-primary-50 text-primary-700" : "text-neutral-500 hover:bg-primary-50/60 hover:text-primary-800",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.categories)).catch(() => {});
  }, []);

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-primary-100 z-40 transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-4 h-14 border-b border-primary-100 flex-shrink-0",
          collapsed && "justify-center px-0"
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Logos Zoe" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          {!collapsed && <span className="font-semibold text-primary-900 text-sm tracking-wide">Logos Zoe</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {topItems.map((item) => (
            <NavLink key={item.href} {...item} collapsed={collapsed} pathname={pathname} />
          ))}

          <ArticlesNav
            collapsed={collapsed}
            categories={categories}
            pathname={pathname}
          />

          <PodcastsNav
            collapsed={collapsed}
            pathname={pathname}
          />

          <VideosNav
            collapsed={collapsed}
            pathname={pathname}
          />

          {bottomItems.map((item) => (
            <NavLink key={item.href} {...item} collapsed={collapsed} pathname={pathname} />
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}

// ── Mobile header + drawer ────────────────────────────────────────────────────

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);
  const initials = user
    ? `${user.firstname[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase()
    : "?";
  const displayName = user ? `${user.firstname} ${user.lastname ?? ""}`.trim() : "…";

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.categories)).catch(() => {});
    streakApi.getMyStreak().then((s) => setStreakCount(s.currentStreak)).catch(() => {});
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-primary-100">
        {/* Main bar */}
        <div className="h-14 flex items-center px-4 gap-3">
          {/* Hamburger */}
          <button onClick={() => setOpen(true)} className="p-1.5 -ml-1.5 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Menu size={20} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Logos Zoe" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            <span className="font-semibold text-primary-900 text-sm tracking-wide">Logos Zoe</span>
          </div>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-1">
            {/* Search icon */}
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Streak */}
            <button
              onClick={() => setCalOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Flame size={15} className="text-gold-500" />
              <span className="text-sm font-semibold text-gold-600">{streakCount}</span>
            </button>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative ml-1">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="p-1"
              >
                {user?.profilePicture && !avatarError ? (
                  <img
                    src={user.profilePicture}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 text-xs font-semibold">{initials}</span>
                  </div>
                )}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-primary-100 shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-primary-50">
                    <p className="text-sm font-semibold text-primary-900 truncate">{displayName}</p>
                    <p className="text-xs text-neutral-400 truncate">{user?.email ?? ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <User size={15} /> View profile
                  </Link>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expandable search bar */}
        {searchOpen && (
          <div className="px-4 pb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQ.trim();
                if (q) {
                  setSearchOpen(false);
                  setSearchQ("");
                  router.push(`/search?q=${encodeURIComponent(q)}`);
                }
              }}
            >
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors"
                  onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                />
              </div>
            </form>
          </div>
        )}
      </header>

      {calOpen && <StreakCalendarModal onClose={() => setCalOpen(false)} />}

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white flex flex-col shadow-xl">
            <div className="flex items-center gap-3 px-4 h-14 border-b border-primary-100">
              <div className="w-7 h-7 rounded-lg bg-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">LZ</span>
              </div>
              <span className="font-semibold text-primary-900 text-sm tracking-wide">Logos Zoe</span>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {topItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  collapsed={false}
                  pathname={pathname}
                  onNavClick={() => setOpen(false)}
                />
              ))}

              <ArticlesNav
                collapsed={false}
                categories={categories}
                pathname={pathname}
                onNavClick={() => setOpen(false)}
              />

              <PodcastsNav
                collapsed={false}
                pathname={pathname}
                onNavClick={() => setOpen(false)}
              />

              <VideosNav
                collapsed={false}
                pathname={pathname}
                onNavClick={() => setOpen(false)}
              />

              {bottomItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  collapsed={false}
                  pathname={pathname}
                  onNavClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
