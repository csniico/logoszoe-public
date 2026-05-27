"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Trash2,
  Send,
  EyeOff,
  Loader2,
  X,
  ZoomIn,
} from "lucide-react";
import { communityApi, CommunityPost } from "@/lib/api";
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
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Image lightbox ────────────────────────────────────────────────────────────

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close image"
      >
        <X size={20} />
      </button>

      {/* Image — stop propagation so clicking the image itself doesn't close */}
      <img
        src={src}
        alt=""
        className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
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
      <EyeOff size={size === 9 ? 14 : 12} className="text-gray-400" />
    </div>
  );
}

// ── Post body (used for root post and replies) ────────────────────────────────

function PostBody({
  post,
  isRoot = false,
  currentUserId,
  onLike,
  onBookmark,
  onDelete,
}: {
  post: CommunityPost;
  isRoot?: boolean;
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
    <div className={`bg-white rounded-xl border border-gray-100 p-5 ${isRoot ? "mb-1" : ""}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {post.anonymous ? <AnonAvatar /> : <Avatar name={displayName} avatarUrl={post.userAvatarUrl} />}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-gray-900 ${isRoot ? "text-sm" : "text-sm"}`}>{displayName}</p>
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(post._id)}
            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Text */}
      <p className={`text-gray-700 leading-relaxed mb-3 ${isRoot ? "text-base" : "text-sm"}`}>
        {post.text}
      </p>

      {/* Images */}
      {post.images.length > 0 && (
        <div className={`grid gap-1.5 mb-3 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxSrc(img.url)}
              className="relative group rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              <img src={img.url} alt="" className="w-full rounded-lg object-cover max-h-72" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-gray-50 pt-3">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            post.liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
          }`}
        >
          <Heart size={13} fill={post.liked ? "currentColor" : "none"} />
          {post.likeCount > 0 && <span>{post.likeCount}</span>}
        </button>

        {isRoot && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <MessageCircle size={13} />
            {post.replyCount > 0 && <span>{post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}</span>}
            {post.replyCount === 0 && <span>No replies yet</span>}
          </span>
        )}

        <button
          onClick={() => onBookmark(post._id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${
            post.bookmarked ? "text-gray-900" : "text-gray-400 hover:text-gray-900"
          }`}
        >
          <Bookmark size={13} fill={post.bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

// ── Reply compose ─────────────────────────────────────────────────────────────

function ReplyCompose({
  postId,
  userName,
  userAvatarUrl,
  onReplied,
}: {
  postId: string;
  userName: string;
  userAvatarUrl?: string | null;
  onReplied: (reply: CommunityPost) => void;
}) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX = 400;

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const reply = await communityApi.createPost({
        text: text.trim(),
        parentId: postId,
        anonymous,
      });
      setText("");
      setAnonymous(false);
      onReplied(reply);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reply");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mt-4">
      <div className="flex gap-3">
        {anonymous ? (
          <AnonAvatar size={8} />
        ) : (
          <Avatar name={userName} avatarUrl={userAvatarUrl} size={8} />
        )}
        <div className="flex-1">
          <textarea
            placeholder="Write a reply…"
            rows={2}
            maxLength={MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none text-sm text-gray-800 placeholder:text-gray-400 outline-none border border-gray-200 rounded-lg p-3 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setAnonymous((a) => !a)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                anonymous ? "bg-gray-100 text-gray-700 font-medium" : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              <EyeOff size={11} />
              Anonymous
            </button>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${text.length >= MAX ? "text-red-400" : "text-gray-300"}`}>
                {MAX - text.length}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityPost[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);
  const LIMIT = 20;

  useEffect(() => {
    communityApi
      .getPost(id)
      .then(setPost)
      .catch((e) => setError(e.message ?? "Post not found"))
      .finally(() => setLoadingPost(false));

    communityApi
      .getReplies(id, undefined, LIMIT)
      .then((data) => {
        setReplies(data);
        if (data.length < LIMIT) setHasMore(false);
        else cursorRef.current = data[data.length - 1]?.createdAt;
      })
      .catch(() => {})
      .finally(() => setLoadingReplies(false));
  }, [id]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const data = await communityApi.getReplies(id, cursorRef.current, LIMIT);
      setReplies((prev) => [...prev, ...data]);
      if (data.length < LIMIT) setHasMore(false);
      else cursorRef.current = data[data.length - 1]?.createdAt;
    } catch { /* ignore */ }
    setLoadingMore(false);
  }

  async function handleLike(targetId: string) {
    if (!user) return;
    try {
      const updated = await communityApi.toggleLike(targetId);
      if (targetId === id) setPost(updated);
      else setReplies((prev) => prev.map((r) => (r._id === targetId ? updated : r)));
    } catch { /* ignore */ }
  }

  async function handleBookmark(targetId: string) {
    if (!user) return;
    try {
      const updated = await communityApi.toggleBookmark(targetId);
      if (targetId === id) setPost(updated);
      else setReplies((prev) => prev.map((r) => (r._id === targetId ? updated : r)));
    } catch { /* ignore */ }
  }

  async function handleDelete(targetId: string) {
    if (!user) return;
    try {
      await communityApi.deletePost(targetId);
      if (targetId === id) {
        // Root post deleted — go back
        window.history.back();
      } else {
        setReplies((prev) => prev.filter((r) => r._id !== targetId));
        setPost((prev) => prev ? { ...prev, replyCount: Math.max(0, prev.replyCount - 1) } : prev);
      }
    } catch { /* ignore */ }
  }

  function handleReplied(reply: CommunityPost) {
    setReplies((prev) => [...prev, reply]);
    setPost((prev) => prev ? { ...prev, replyCount: prev.replyCount + 1 } : prev);
  }

  const userName = user ? `${user.firstname} ${user.lastname ?? ""}`.trim() : "";

  if (loadingPost) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-4 w-24 bg-gray-100 rounded mb-6" />
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <div className="flex gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-2.5 w-16 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${90 - i * 10}%` }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> Community
        </Link>
        <p className="text-red-500 text-sm">{error ?? "Post not found."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} /> Community
      </Link>

      {/* Root post */}
      <PostBody
        post={post}
        isRoot
        currentUserId={user?._id}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onDelete={handleDelete}
      />

      {/* Reply compose */}
      {user && (
        <ReplyCompose
          postId={id}
          userName={userName}
          userAvatarUrl={user.profilePicture}
          onReplied={handleReplied}
        />
      )}

      {/* Replies */}
      {replies.length > 0 || loadingReplies ? (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Replies
          </p>
          <div className="space-y-3">
            {loadingReplies ? (
              [1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-4/5" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              replies.map((reply) => (
                <PostBody
                  key={reply._id}
                  post={reply}
                  currentUserId={user?._id}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {hasMore && !loadingReplies && (
            <div className="text-center mt-4">
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
                  "Load more replies"
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        !user && (
          <p className="text-center text-sm text-gray-400 mt-6">
            <Link href="/login" className="text-gray-900 hover:underline">Sign in</Link> to reply.
          </p>
        )
      )}
    </div>
  );
}
