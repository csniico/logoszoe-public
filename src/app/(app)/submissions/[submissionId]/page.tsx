"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  Send,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  submissionsApi,
  LearnerSubmissionDetail,
  SubmissionRemark,
  ApiError,
} from "@/lib/api";

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);

  const [detail, setDetail] = useState<LearnerSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    submissionsApi
      .getDetail(submissionId)
      .then(setDetail)
      .catch(() => setError("Couldn't load this submission."))
      .finally(() => setLoading(false));
  }, [submissionId]);

  const remarks = detail?.remarks ?? [];
  const hasAdminRemark = remarks.some((r) => r.authorRole === "admin");
  const lastIsLearner = remarks.length > 0 && remarks[remarks.length - 1].authorRole === "learner";
  const canReply = hasAdminRemark && !lastIsLearner;

  async function handleReply() {
    const content = reply.trim();
    if (!content || sending || !canReply) return;
    setSending(true);
    setReplyError(null);
    try {
      const created: SubmissionRemark = await submissionsApi.reply(submissionId, content);
      // Optimistically append (backend returns the raw remark; force learner identity).
      setDetail((d) =>
        d
          ? {
              ...d,
              remarks: [
                ...d.remarks,
                {
                  ...created,
                  authorRole: "learner",
                  authorName: "You",
                  content,
                  createdAt: created?.createdAt ?? new Date().toISOString(),
                },
              ],
            }
          : d,
      );
      setReply("");
    } catch (e) {
      setReplyError(e instanceof ApiError ? e.message : "Couldn't send your reply.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [remarks.length]);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-1/3" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-56 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-3xl text-center py-16">
        <ClipboardList size={36} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{error ?? "Submission not found."}</p>
        <Link href="/submissions" className="inline-block mt-3 text-sm font-semibold text-primary-700">
          ← Back to submissions
        </Link>
      </div>
    );
  }

  const { submission } = detail;

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-5 flex-wrap">
        <Link href="/submissions" className="hover:text-gray-700 transition-colors">
          My Submissions
        </Link>
        <ChevronRight size={13} />
        <span className="text-gray-500 line-clamp-1">{submission.lessonTitle}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 leading-snug">{submission.lessonTitle}</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {submission.courseTitle} ·{" "}
          {new Date(submission.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Your answers */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Your answers
        </h2>
        <div className="space-y-3">
          {submission.responses.map((r, i) => (
            <div key={r.questionId || i} className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-sm font-medium text-gray-800 mb-2">
                <span className="text-gray-400 mr-1.5">{i + 1}.</span>
                {r.questionText}
                {r.questionType && (
                  <span className="ml-2 align-middle inline-block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {r.questionType}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2.5">
                {r.userResponse || <span className="text-gray-300">No answer</span>}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback thread */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Feedback</h2>

        {remarks.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-gray-200">
            <ShieldCheck size={28} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              The team hasn&apos;t reviewed this yet. You&apos;ll be able to reply once they respond.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {remarks.map((m) => {
              const mine = m.authorRole === "learner";
              return (
                <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    mine
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"
                  }`}>
                    <p className={`text-[11px] font-semibold mb-0.5 ${mine ? "text-primary-100" : "text-primary-700"}`}>
                      {mine ? "You" : m.authorName || "Team"}
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    <p className={`text-[10px] mt-1 ${mine ? "text-primary-200" : "text-gray-400"}`}>
                      {new Date(m.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={threadEndRef} />
          </div>
        )}

        {/* Reply box */}
        <div className="mt-4">
          {canReply ? (
            <>
              <div className="flex items-end gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Write a reply to the team…"
                  className="flex-1 text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none placeholder:text-gray-300"
                />
                <button
                  onClick={handleReply}
                  disabled={!reply.trim() || sending}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  Send
                </button>
              </div>
              {replyError && <p className="text-xs text-red-500 mt-1.5">{replyError}</p>}
            </>
          ) : remarks.length > 0 && lastIsLearner ? (
            <p className="text-xs text-gray-400 text-center py-2">
              Waiting for the team to respond before you can reply again.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
