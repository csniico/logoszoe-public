"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, ChevronRight, MessageSquare } from "lucide-react";
import { submissionsApi, MySubmissionItem } from "@/lib/api";

export default function SubmissionsPage() {
  const [items, setItems] = useState<MySubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    submissionsApi
      .getMine()
      .then(setItems)
      .catch(() => setError("Couldn't load your submissions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center">
            <ClipboardList size={18} className="text-primary-700" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        </div>
        <p className="text-sm text-gray-500">
          Your lesson answers and feedback from the team.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !error && items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
          <ClipboardList size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            You haven&apos;t submitted any lesson answers yet.
          </p>
          <Link
            href="/courses"
            className="inline-block mt-3 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            Browse courses →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((s) => (
            <Link
              key={s._id}
              href={`/submissions/${s._id}`}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare size={17} className="text-primary-700" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{s.lessonTitle}</p>
                <p className="text-xs text-gray-400 truncate">
                  {s.courseTitle} · {s.responses.length} answer{s.responses.length === 1 ? "" : "s"} ·{" "}
                  {new Date(s.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <ChevronRight
                size={17}
                className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
