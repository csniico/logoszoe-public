"use client";

import { useEffect, useRef, useState } from "react";
import { prayerApi, Prayer, PRAYER_TOPICS } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  HandHeart,
  Loader2,
  MessageSquareQuote,
  Send,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TOPIC_COLORS: Record<string, string> = {
  "Prayer":          "bg-rose-50 text-rose-600 border-rose-100",
  "Praise":          "bg-yellow-50 text-yellow-600 border-yellow-100",
  "Love":            "bg-pink-50 text-pink-600 border-pink-100",
  "Healing":         "bg-red-50 text-red-600 border-red-100",
  "Health":          "bg-gray-100 text-gray-900 border-gray-200",
  "Strength":        "bg-orange-50 text-orange-600 border-orange-100",
  "Financial":       "bg-gold-50 text-gold-700 border-gold-100",
  "Friend":          "bg-cyan-50 text-cyan-600 border-cyan-100",
  "Family":          "bg-primary-50 text-primary-700 border-primary-100",
  "Relationship":    "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
  "Loss":            "bg-slate-50 text-slate-600 border-slate-200",
  "Confusion":       "bg-amber-50 text-amber-600 border-amber-100",
  "Loneliness":      "bg-blue-50 text-blue-600 border-blue-100",
  "Suffering":       "bg-stone-50 text-stone-600 border-stone-200",
  "Faith":           "bg-primary-100 text-primary-700 border-primary-200",
  "Natural Disaster":"bg-primary-50 text-primary-600 border-primary-100",
  "Lust":            "bg-red-50 text-red-500 border-red-100",
  "Greed":           "bg-lime-50 text-lime-600 border-lime-100",
  "Jealousy":        "bg-primary-50 text-primary-600 border-primary-100",
  "Miracle":         "bg-sky-50 text-sky-600 border-sky-100",
  "Spiritual":       "bg-primary-50 text-primary-700 border-primary-100",
  "Wisdom":          "bg-amber-50 text-amber-700 border-amber-100",
  "Other":           "bg-gray-50 text-gray-500 border-gray-200",
};

// ── Prayer card ───────────────────────────────────────────────────────────────

function PrayerCard({
  prayer,
  onDelete,
}: {
  prayer: Prayer;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const topicColor = TOPIC_COLORS[prayer.topic] ?? "bg-gray-50 text-gray-500 border-gray-200";
  const hasResponses = prayer.responses && prayer.responses.length > 0;

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await prayerApi.delete(prayer._id);
      onDelete(prayer._id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${
      hasResponses ? "border-rose-200 shadow-sm" : "border-gray-100"
    }`}>
      {/* Pastoral response banner */}
      {hasResponses && (
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border-b border-rose-100">
          <MessageSquareQuote size={13} className="text-rose-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-rose-600">
            Pastoral response received
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${topicColor}`}>
              {prayer.topic}
            </span>
            {prayer.anonymous && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-400 border border-gray-100">
                <ShieldCheck size={10} /> Anonymous
              </span>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0 disabled:opacity-40"
            title="Delete prayer request"
          >
            {deleting
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />
            }
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1.5 leading-snug">
          {prayer.title}
        </h3>

        {/* Message */}
        <p className={`text-sm text-gray-600 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
          {prayer.message}
        </p>
        {prayer.message.length > 180 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 text-xs text-rose-500 hover:text-rose-600 font-medium"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
          <Clock size={11} />
          <span>{timeAgo(prayer.createdAt)}</span>
          {prayer.name && !prayer.anonymous && (
            <>
              <span className="mx-1">·</span>
              <UserRound size={11} />
              <span>{prayer.name}</span>
            </>
          )}
        </div>

        {/* Pastoral responses */}
        {hasResponses && (
          <div className="mt-4 space-y-2">
            {prayer.responses!.map((res, i) => (
              <div
                key={i}
                className="flex gap-3 bg-rose-50 rounded-xl px-4 py-3 border border-rose-100"
              >
                <HandHeart size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">{res}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Submit form ───────────────────────────────────────────────────────────────

const BLANK = {
  title: "",
  topic: "",
  message: "",
  name: "",
  email: "",
  phone: "",
  anonymous: false,
};

function SubmitForm({ userId, onSubmitted }: { userId: string; onSubmitted: (p: Prayer) => void }) {
  const [form, setForm]         = useState({ ...BLANK });
  const [showContact, setShowContact] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const topicRef = useRef<HTMLSelectElement>(null);

  function set<K extends keyof typeof BLANK>(key: K, val: (typeof BLANK)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const valid = form.title.trim() && form.topic && form.message.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const prayer = await prayerApi.submit({
        userId,
        title:     form.title.trim(),
        topic:     form.topic,
        message:   form.message.trim(),
        name:      form.name.trim() || undefined,
        email:     form.email.trim() || undefined,
        phone:     form.phone.trim() || undefined,
        anonymous: form.anonymous,
      });
      onSubmitted(prayer);
      setForm({ ...BLANK });
      setShowContact(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-5 pb-1">
        <h2 className="font-bold text-gray-900 text-base">Submit a prayer request</h2>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Topic + Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Topic <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <select
                ref={topicRef}
                value={form.topic}
                onChange={(e) => set("topic", e.target.value)}
                required
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent pr-8"
              >
                <option value="" disabled>Select a topic…</option>
                {PRAYER_TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Brief title for your request"
              required
              maxLength={120}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Prayer request <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Share what's on your heart…"
            required
            rows={4}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent resize-none"
          />
        </div>

        {/* Optional contact info */}
        <div>
          <button
            type="button"
            onClick={() => setShowContact((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${showContact ? "rotate-180" : ""}`}
            />
            {showContact ? "Hide" : "Add"} contact details (optional)
          </button>

          {showContact && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {(["name", "email", "phone"] as const).map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                    placeholder={field === "name" ? "Your name" : field === "email" ? "your@email.com" : "+1 000 000 0000"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1">
          {/* Anonymous toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <button
              type="button"
              role="switch"
              aria-checked={form.anonymous}
              onClick={() => set("anonymous", !form.anonymous)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                form.anonymous ? "bg-rose-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  form.anonymous ? "translate-x-4" : ""
                }`}
              />
            </button>
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
              Submit anonymously
            </span>
          </label>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!valid || submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={13} />
            }
            {submitting ? "Sending…" : "Submit request"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}
      </div>

      {/* Success toast */}
      {success && (
        <div className="mx-6 mb-5 flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-800 text-sm font-medium rounded-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check size={15} className="flex-shrink-0" />
          Your prayer request has been submitted. Our team will be praying for you.
        </div>
      )}
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PrayerPage() {
  const { user, loading: authLoading } = useAuth();
  const [prayers, setPrayers]   = useState<Prayer[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    prayerApi
      .getMine(user._id)
      .then(setPrayers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  function handleSubmitted(prayer: Prayer) {
    setPrayers((prev) => [prayer, ...prev]);
  }

  function handleDelete(id: string) {
    setPrayers((prev) => prev.filter((p) => p._id !== id));
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share your needs with our pastoral team. Every request is received with care and prayer.
        </p>
      </div>

      {/* Submit form */}
      {user && (
        <SubmitForm userId={user._id} onSubmitted={handleSubmitted} />
      )}

      {/* My requests */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
          My requests
        </h2>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-12 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : prayers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-gray-300 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={32} className="opacity-40" />
            <p className="text-sm text-gray-400 text-center max-w-xs">
              You haven't submitted any prayer requests yet. Share your heart above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {prayers.map((p) => (
              <PrayerCard key={p._id} prayer={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
