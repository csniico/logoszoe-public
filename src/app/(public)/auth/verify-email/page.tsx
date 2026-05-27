"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, MailCheck, RefreshCw } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginSuccess } = useAuth();

  // mode=verify → after register (confirms email + logs in)
  // mode=reset  → after forgot-password (confirms code, then shows reset form)
  const email = searchParams.get("email") ?? "";
  const mode  = searchParams.get("mode") ?? "verify";

  const [code, setCode]       = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent]   = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleInput(i: number, value: string) {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...code];
    next[i] = value.slice(-1);
    setCode(next);
    if (value && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = text.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) return;

    setError(null);
    setLoading(true);

    try {
      if (mode === "verify") {
        // After register — verifies email and logs user in
        const res = await authApi.verifyCode(email, fullCode);
        loginSuccess(res);
        router.push("/dashboard");
      } else {
        // After forgot-password — just confirms code is valid, then go to reset
        router.push(
          `/auth/forgot-password?email=${encodeURIComponent(email)}&code=${fullCode}&step=reset`
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await authApi.sendVerificationEmail(email);
      setResent(true);
      setCountdown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend. Try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-xs">LZ</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Logos Zoe</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <MailCheck size={26} className="text-gray-900" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-sm text-gray-500 mb-1">
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-semibold text-gray-800 mb-8 truncate">{email}</p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 mb-6 text-left">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {resent && !error && (
              <div className="p-3 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800 mb-6">
                A new code has been sent.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 6-digit input */}
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInput(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-13 text-center text-lg font-bold border border-gray-200 rounded-xl outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || code.join("").length < 6}
                className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-4"
              >
                {loading ? "Verifying…" : "Verify code"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
              {countdown > 0
                ? `Resend in ${countdown}s`
                : resending
                ? "Sending…"
                : "Resend code"}
            </button>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <Link href="/auth/login" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
