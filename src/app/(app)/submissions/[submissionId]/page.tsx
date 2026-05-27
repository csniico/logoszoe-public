"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  submissionRemarksApi,
  LearnerSubmissionDetail,
  Remark,
} from "@/lib/api";
import {
  BookOpen,
  ChevronRight,
  MessageCircle,
  FileText,
  Mic2,
  PlayCircle,
  Link2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, React.ElementType> = {
  text: FileText, document: FileText, video: PlayCircle, audio: Mic2, link: Link2,
};
const TYPE_LABEL: Record<string, string> = {
  text: "Reading", document: "Document", video: "Video", audio: "Audio", link: "Link",
};
const TYPE_COLOR: Record<string, string> = {
  text:     "bg-blue-50 text-blue-600",
  document: "bg-purple-50 text-purple-600",
  video:    "bg-rose-50 text-rose-600",
  audio:    "bg-teal-50 text-teal-600",
  link:     "bg-amber-50 text-amber-600",
};

function fmt(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── Feedback thread ───────────────────────────────────────────────────────────

function FeedbackThread({
  submissionId,
  initialRemarks,
}: {
  submissionId: string;
  initialRemarks: Remark[];
}) {
  const [remarks, setRemarks]           = useState<Remark[]>(initialRemarks);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying]         = useState(false);
  const [replyError, setReplyError]     = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to newest when remarks change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [remarks.length]);

  const hasAdminRemark = remarks.some((r) => r.authorRole === "admin");
  const lastRemark     = remarks[remarks.length - 1];
  const canReply       = hasAdminRemark && lastRemark?.authorRole !== "learner";

  async function handleReply() {
    const content = replyContent.trim();
    if (!content || replying) return;
    setReplying(true);
    setReplyError(null);
    try {
      const remark = await submissionRemarksApi.addReply(submissionId, content);
      setRemarks((prev) => [...prev, remark]);
      setReplyContent("");
    } catch {
      setReplyError("Failed to send reply. Please try again.");
    } finally {
      setReplying(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Thread */}
      {remarks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-gray-300">
          <MessageCircle size={28} className="opacity-40" />
          <p className="text-sm">No feedback yet — check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {remarks.map((r) => (
            <div
              key={r._id}
              className={`flex ${r.authorRole === "admin" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 space-y-1.5 ${
                  r.authorRole === "admin"
                    ? "bg-teal-50 border border-teal-100 rounded-tl-sm"
                    : "bg-gray-100 border border-gray-200 rounded-tr-sm"
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  r.authorRole === "admin" ? "text-teal-600" : "text-gray-900"
                }`}>
                  {r.authorName}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {r.content}
                </p>
                <p className="text-[10px] text-gray-400">{fmt(r.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Reply box */}
      {canReply && (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
            placeholder="Write a reply…"
            disabled={replying}
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none placeholder:text-gray-300 disabled:opacity-50"
          />
          {replyError && <p className="text-xs text-red-500">{replyError}</p>}
          <div className="flex justify-end">
            <button
              onClick={handleReply}
              disabled={!replyContent.trim() || replying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {replying
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <MessageCircle size={13} />
              }
              {replying ? "Sending…" : "Send reply"}
            </button>
          </div>
        </div>
      )}

      {/* Waiting hint */}
      {remarks.length > 0 && lastRemark?.authorRole === "learner" && (
        <p className="text-xs text-center text-gray-400 pt-1">
          Waiting for a response from our team…
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);

  const [submission, setSubmission] = useState<LearnerSubmissionDetail | null>(null);
  const [remarks, setRemarks]       = useState<Remark[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    submissionRemarksApi
      .getDetail(submissionId)
      .then(({ submission: sub, remarks: rem }) => {
        setSubmission(sub);
        setRemarks(rem);
      })
      .catch(() => setError("Submission not found or access denied."))
      .finally(() => setLoading(false));
  }, [submissionId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-7 w-1/2 bg-gray-100 rounded" />
        <div className="h-5 w-1/3 bg-gray-100 rounded" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl ml-auto w-2/3" />
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !submission) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{error ?? "Submission not found."}</p>
        <Link
          href="/submissions"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-900 hover:text-gray-800 font-medium"
        >
          <ArrowLeft size={14} /> Back to submissions
        </Link>
      </div>
    );
  }

  const TypeIcon = TYPE_ICON[submission.lessonType] ?? BookOpen;
  const adminRemarkCount  = remarks.filter((r) => r.authorRole === "admin").length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
        <Link href="/submissions" className="hover:text-gray-700 transition-colors">
          My submissions
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-500 line-clamp-1">{submission.lessonTitle}</span>
      </div>

      {/* Context header */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLOR[submission.lessonType] ?? "bg-gray-100 text-gray-500"}`}>
            <TypeIcon size={11} />
            {TYPE_LABEL[submission.lessonType] ?? "Lesson"}
          </span>
          <span className="text-xs text-gray-400">{fmt(submission.createdAt)}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">
          {submission.lessonTitle}
        </h1>
        <p className="text-sm text-gray-500">{submission.courseTitle}</p>
      </div>

      {/* "View lesson" link */}
      <Link
        href={`/courses/${submission.courseId}/lessons/${submission.lessonId}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-900 hover:text-gray-800 transition-colors"
      >
        <BookOpen size={13} /> View lesson
        <ChevronRight size={12} />
      </Link>

      {/* Feedback thread card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <MessageCircle size={15} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900 text-sm">Feedback</h2>
          {adminRemarkCount > 0 && (
            <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-semibold text-gray-900 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={9} />
              {adminRemarkCount} {adminRemarkCount === 1 ? "response" : "responses"}
            </span>
          )}
        </div>

        <FeedbackThread submissionId={submissionId} initialRemarks={remarks} />
      </div>

    </div>
  );
}
