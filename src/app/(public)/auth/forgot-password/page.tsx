"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If arrived here from verify-email with a confirmed code, jump to reset step
  const prefillEmail = searchParams.get("email") ?? "";
  const prefillCode  = searchParams.get("code")  ?? "";
  const initialStep  = searchParams.get("step") === "reset" ? "reset" : "email";

  const [step, setStep]             = useState<"email" | "reset" | "done">(initialStep as "email" | "reset" | "done");
  const [email, setEmail]           = useState(prefillEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Step 1 — send verification email
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.sendVerificationEmail(email);
      // Go to verify-email page in reset mode
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&mode=reset`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send reset code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — reset password with the confirmed code
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.resetPassword({ email, code: prefillCode, newPassword });
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

            {/* ── Step: email ── */}
            {step === "email" && (
              <>
                <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot your password?</h1>
                <p className="text-sm text-gray-500 mb-8">Enter your email and we'll send you a 6-digit reset code.</p>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 mb-4">
                    <AlertCircle size={14} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending…" : "Send reset code"}
                  </button>
                </form>
              </>
            )}

            {/* ── Step: reset (arrived from verify-email with confirmed code) ── */}
            {step === "reset" && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h1>
                <p className="text-sm text-gray-500 mb-8">Choose a strong password for your account.</p>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 mb-4">
                    <AlertCircle size={14} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                  {["New password", "Confirm password"].map((label, i) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={i === 0 ? newPassword : confirmPassword}
                          onChange={(e) => i === 0 ? setNewPassword(e.target.value) : setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-colors placeholder:text-gray-400"
                        />
                        {i === 0 && (
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400">Min. 12 characters with uppercase, lowercase, number and symbol.</p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Resetting…" : "Reset password"}
                  </button>
                </form>
              </>
            )}

            {/* ── Step: done ── */}
            {step === "done" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-gray-900" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Password reset!</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Your password has been updated. Sign in with your new password.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
