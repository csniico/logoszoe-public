"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setTokens, saveUser } from "@/lib/tokens";
import { userApi } from "@/lib/api";

/**
 * Landing page after Google OAuth redirect-flow.
 *
 * The NestJS backend redirects here as:
 *   /auth/callback?token=<jwt>&refreshToken=<jwt>
 *
 * This page stores the tokens, fetches the user profile, and
 * redirects to the dashboard — or falls back to the login page
 * on any error.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");

    if (!token || !refreshToken) {
      setStatus("error");
      router.replace("/auth/login?error=google_failed");
      return;
    }

    // Store tokens so apiFetch picks them up immediately
    setTokens(token, refreshToken);

    userApi
      .me()
      .then((user) => {
        saveUser(user);
        // Hard-navigate so the AuthProvider re-runs its mount effect
        // and picks up the tokens/user from localStorage.
        window.location.replace("/dashboard");
      })
      .catch(() => {
        setStatus("error");
        router.replace("/auth/login?error=google_failed");
      });
  }, [router]);

  if (status === "error") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <svg
        className="animate-spin h-8 w-8 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <p className="text-sm text-gray-500">Signing you in…</p>
    </div>
  );
}
