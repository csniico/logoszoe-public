"use client";

import { useState } from "react";
import { feedbackApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LifeBuoy, CheckCircle2 } from "lucide-react";

export default function SupportPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await feedbackApi.send({
        message: message.trim(),
        email: email.trim() || undefined,
        name: user?.firstname,
        platform: "web",
      });
      setSent(true);
      setMessage("");
    } catch {
      setError("Could not send your feedback. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2.5 mb-2">
        <LifeBuoy size={22} className="text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Found a bug or have a suggestion? Send the team a message and we&apos;ll
        get back to you.
      </p>

      {sent ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-900 mb-1">Thank you!</h2>
          <p className="text-sm text-gray-500 mb-5">
            Your feedback has been sent to the team.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 underline"
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              maxLength={5000}
              placeholder="Tell us what's on your mind…"
              className="w-full resize-none text-sm text-gray-800 placeholder:text-gray-400 outline-none border border-gray-200 rounded-xl p-3 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-sm text-gray-800 placeholder:text-gray-400 outline-none border border-gray-200 rounded-xl px-3 py-2.5 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">So we can reply to you.</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending…" : "Send feedback"}
          </button>
        </form>
      )}
    </div>
  );
}
