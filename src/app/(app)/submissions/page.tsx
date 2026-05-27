"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { submissionRemarksApi, MySubmissionItem } from "@/lib/api";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Mic2,
  PlayCircle,
  Link2,
  MessageCircle,
  Clock,
} from "lucide-react";

const TYPE_ICON: Record<string, React.ElementType> = {
  text: FileText, document: FileText, video: PlayCircle, audio: Mic2, link: Link2,
};
const TYPE_LABEL: Record<string, string> = {
  text: "Reading", document: "Document", video: "Video", audio: "Audio", link: "Link",
};
const TYPE_COLOR: Record<string, string> = {
  text:     "bg-blue-50 text-blue-600",
  document: "bg-primary-50 text-primary-700",
  video:    "bg-rose-50 text-rose-600",
  audio:    "bg-gold-50 text-gold-700",
  link:     "bg-amber-50 text-amber-600",
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubmissionsPage() {
  const [items, setItems]   = useState<MySubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    submissionRemarksApi
      .getMine()
      .then(setItems)
      .catch(() => setError("Failed to load your submissions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track your course assignments and view instructor feedback.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-300">
          <BookOpen size={36} className="opacity-40" />
          <p className="text-sm text-gray-400">
            No submissions yet. Complete a lesson with questions to get started.
          </p>
          <Link
            href="/courses"
            className="mt-2 text-xs font-semibold text-gray-900 hover:text-gray-800"
          >
            Browse courses →
          </Link>
        </div>
      )}

      {/* List */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = TYPE_ICON[item.lessonType] ?? BookOpen;
            return (
              <Link
                key={item._id}
                href={`/submissions/${item._id}`}
                className="group block bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5 truncate">{item.courseTitle}</p>
                    <h3 className="font-semibold text-gray-900 leading-snug line-clamp-1">
                      {item.lessonTitle}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${TYPE_COLOR[item.lessonType] ?? "bg-gray-100 text-gray-500"}`}>
                    <Icon size={11} />
                    {TYPE_LABEL[item.lessonType] ?? "Lesson"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    Submitted {fmt(item.createdAt)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <MessageCircle size={11} /> Feedback
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-gray-500 transition-colors"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
