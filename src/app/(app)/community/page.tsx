"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Trash2,
  Send,
  EyeOff,
  Loader2,
  ImagePlus,
  X,
  ZoomIn,
} from "lucide-react";
import { communityApi, storageApi, CommunityPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({
  name,
  avatarUrl,
  size = 9,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const cls = `w-${size} h-${size} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden`;
  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${cls} object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`${cls} bg-gray-200`}>
      <span className="text-gray-800 text-xs font-semibold">{initials(name)}</span>
    </div>
  );
}

function AnonAvatar({ size = 9 }: { size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}
    >
      <EyeOff size={14} className="text-gray-400" />
    </div>
  );
}

// ── Post card skeleton ────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-2.5 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex gap-4 pt-3 border-t border-gray-50">
        <div className="h-3 w-10 bg-gray-100 rounded" />
        <div className="h-3 w-10 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ── Image lightbox ────────────────────────────────────────────────────────────

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Close">
        <X size={20} />
      </button>
      <img src={src} alt="" className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
  onLike,
  onBookmark,
  onDelete,
}: {
  post: CommunityPost;
  currentUserId?: string;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const displayName = post.anonymous ? "Anonymous" : (post.userName ?? "Unknown");
  const isOwn = !!currentUserId && post.userId === currentUserId;
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {post.anonymous ? <AnonAvatar /> : <Avatar name={displayName} avatarUrl={post.userAvatarUrl} />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
        {isOwn && (
          <button onClick={() => onDelete(post._id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0" title="Delete post">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Text */}
      <Link href={`/community/${post._id}`}>
        <p className="text-sm text-gray-700 leading-relaxed mb-3 hover:text-gray-900 transition-colors">{post.text}</p>
      </Link>

      {/* Images */}
      {post.images.length > 0 && (
        <div className={`grid gap-1.5 mb-3 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.images.map((img, i) => (
            <button key={i} type="button" onClick={() => setLightboxSrc(img.url)} className="relative group rounded-lg overflow-hidden focus:outline-none">
              <img src={img.url} alt="" className="w-full rounded-lg object-cover max-h-64" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-gray-50 pt-3">
        <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 text-xs transition-colors ${post.liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
          <Heart size={13} fill={post.liked ? "currentColor" : "none"} />
          {post.likeCount > 0 && <span>{post.likeCount}</span>}
        </button>

        <Link href={`/community/${post._id}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors">
          <MessageCircle size={13} />
          {post.replyCount > 0 ? <span>{post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}</span> : <span>Reply</span>}
        </Link>

        <button onClick={() => onBookmark(post._id)} className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${post.bookmarked ? "text-gray-900" : "text-gray-400 hover:text-gray-900"}`}>
          <Bookmark size={13} fill={post.bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />}
    </div>
  );
}

// ── Shared image upload hook ───────────────────────────────────────────────────

interface Attachment { file: File; preview: string; }

async function uploadAttachments(attachments: Attachment[]): Promise<{ url: string; key: string }[]> {
  return Promise.all(
    attachments.map(async ({ file }) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const key = `community/${crypto.randomUUID()}.${ext}`;
      const { uploadUrl, fileKey, fileUrl } = await storageApi.getPresignedUrl(key, file.type);
      // Upload directly to S3 — do NOT go through the Next.js proxy
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      return { url: fileUrl, key: fileKey };
    }),
  );
}

// ── Compose box ───────────────────────────────────────────────────────────────

function ComposeBox({
  currentUserId,
  userName,
  userAvatarUrl,
  onPosted,
}: {
  currentUserId?: string;
  userName: string;
  userAvatarUrl?: string | null;
  onPosted: (post: CommunityPost) => void;
}) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX = 400;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    const remaining = 4 - attachments.length;
    if (remaining <= 0) return;
    selected.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) =>
        setAttachments((prev) =>
          prev.length < 4 ? [...prev, { file, preview: evt.target?.result as string }] : prev,
        );
      reader.readAsDataURL(file);
    });
  }

  function removeAttachment(i: number) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!text.trim() || !currentUserId) return;
    setSubmitting(true);
    setError(null);
    try {
      const images = attachments.length > 0 ? await uploadAttachments(attachments) : [];
      const post = await communityApi.createPost({ text: text.trim(), anonymous, images });
      setText("");
      setAnonymous(false);
      setAttachments([]);
      onPosted(post);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  if (!currentUserId) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 text-center text-sm text-gray-400">
        <Link href="/login" className="text-gray-900 hover:underline font-medium">Sign in</Link> to post in the community.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
      <div className="flex gap-3">
        {anonymous ? <AnonAvatar /> : <Avatar name={userName} avatarUrl={userAvatarUrl} />}
        <div className="flex-1">
          <textarea
            placeholder="Share something with the community…"
            rows={3}
            maxLength={MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none text-sm text-gray-800 placeholder:text-gray-400 outline-none border border-gray-200 rounded-lg p-3 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors"
          />

          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {attachments.map((att, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={att.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {attachments.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors text-xs"
                >
                  <ImagePlus size={16} />
                  Add
                </button>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {/* Attach image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= 4}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={attachments.length >= 4 ? "Maximum 4 images" : "Attach images"}
              >
                <ImagePlus size={13} />
                {attachments.length > 0 ? `${attachments.length}/4` : "Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Anonymous toggle */}
              <button
                onClick={() => setAnonymous((a) => !a)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${anonymous ? "bg-gray-100 text-gray-700 font-medium" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <EyeOff size={12} />
                Anonymous
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs ${text.length >= MAX ? "text-red-400" : "text-gray-300"}`}>{MAX - text.length}</span>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);
  const LIMIT = 20;

  const loadFeed = useCallback(async (reset = false) => {
    try {
      const cursor = reset ? undefined : cursorRef.current;
      const data = await communityApi.getFeed(cursor, LIMIT);
      if (reset) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      if (data.length < LIMIT) {
        setHasMore(false);
      } else {
        cursorRef.current = data[data.length - 1]?.createdAt;
        setHasMore(true);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    cursorRef.current = undefined;
    setHasMore(true);
    loadFeed(true).finally(() => setLoading(false));
  }, [loadFeed]);

  async function handleLoadMore() {
    setLoadingMore(true);
    await loadFeed(false);
    setLoadingMore(false);
  }

  function handlePosted(post: CommunityPost) {
    setPosts((prev) => [post, ...prev]);
  }

  async function handleLike(id: string) {
    if (!user) return;
    try {
      const updated = await communityApi.toggleLike(id);
      setPosts((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch { /* ignore */ }
  }

  async function handleBookmark(id: string) {
    if (!user) return;
    try {
      const updated = await communityApi.toggleBookmark(id);
      setPosts((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch { /* ignore */ }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    try {
      await communityApi.deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch { /* ignore */ }
  }

  const userName = user ? `${user.firstname} ${user.lastname ?? ""}`.trim() : "";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect, share, and grow with fellow believers.
        </p>
      </div>

      {/* Compose */}
      <ComposeBox
        currentUserId={user?._id}
        userName={userName}
        userAvatarUrl={user?.profilePicture}
        onPosted={handlePosted}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageCircle size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user?._id}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onDelete={handleDelete}
            />
          ))}

          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Loading…
                  </span>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
