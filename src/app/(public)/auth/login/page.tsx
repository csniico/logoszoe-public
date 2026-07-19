"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  Compass,
} from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Mode = "choice" | "signin" | "signup";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthGateway />
    </Suspense>
  );
}

function AuthGateway() {
  const [mode, setMode] = useState<Mode>("choice");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Slim header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" aria-label="The Noah's Project - home" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/top-banner.png" alt="The Noah's Project" className="h-8 w-auto object-contain" />
        </Link>
        <Link href="/" className="text-sm text-primary-900/60 hover:text-primary-900 transition-colors">
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl ring-1 ring-primary-100/70 shadow-sm p-8 sm:p-10">
            {mode === "choice" && <ChoiceView next={next} onMode={setMode} />}
            {mode === "signin" && <SignInView next={next} onMode={setMode} />}
            {mode === "signup" && <SignUpView onMode={setMode} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = `/api/auth/sign-in-google-web`;
      }}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 mb-4">
      <AlertCircle size={14} className="flex-shrink-0" />
      {message}
    </div>
  );
}

function BackToOptions({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-sm text-primary-900/50 hover:text-primary-900 transition-colors mb-6"
    >
      <ArrowLeft size={14} />
      All options
    </button>
  );
}

// ── Choice view (default - sign-in is not thrust at the visitor) ──────────────

function ChoiceView({ next, onMode }: { next: string; onMode: (m: Mode) => void }) {
  const router = useRouter();
  const { loginSuccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueAsGuest() {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.guest();
      loginSuccess(res);
      router.push(next);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We couldn't open a guest session just now. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="text-center">
      <h1 className="font-serif text-3xl font-bold text-primary-900 mb-2">Come on in</h1>
      <p className="text-sm text-primary-900/60 mb-8">
        Take a look around - you can always make it official later.
      </p>

      {error && <ErrorBanner message={error} />}

      {/* Primary path: explore as a guest */}
      <button
        type="button"
        onClick={continueAsGuest}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 text-white text-base font-semibold hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Compass size={18} />
        {loading ? "Opening the doors…" : "Explore freely"}
      </button>
      <p className="text-xs text-primary-900/45 mt-2">No account needed - jump right in.</p>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400">or</span>
        </div>
      </div>

      <GoogleButton label="Continue with Google" />

      {/* Secondary paths */}
      <div className="mt-8 space-y-2 text-sm">
        <p className="text-primary-900/60">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onMode("signin")}
            className="font-medium text-primary-600 hover:text-primary-800"
          >
            Sign in
          </button>
        </p>
        <p className="text-primary-900/60">
          New here?{" "}
          <button
            type="button"
            onClick={() => onMode("signup")}
            className="font-medium text-primary-600 hover:text-primary-800"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Sign-in view ─────────────────────────────────────────────────────────────

function SignInView({ next, onMode }: { next: string; onMode: (m: Mode) => void }) {
  const router = useRouter();
  const { loginSuccess } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      loginSuccess(res);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <BackToOptions onBack={() => onMode("choice")} />
      <h1 className="font-serif text-2xl font-bold text-primary-900 mb-1">Welcome back</h1>
      <p className="text-sm text-primary-900/60 mb-7">Sign in to continue your journey</p>

      <GoogleButton label="Continue with Google" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400">or sign in with email</span>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-primary-600 hover:text-primary-800">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-primary-900/60 text-center mt-6">
        New here?{" "}
        <button
          type="button"
          onClick={() => onMode("signup")}
          className="font-medium text-primary-600 hover:text-primary-800"
        >
          Create an account
        </button>
      </p>
    </div>
  );
}

// ── Sign-up view ─────────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "12+ characters", ok: password.length >= 12 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Lowercase", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {checks.map(({ label, ok }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
            ok ? "bg-primary-100 text-primary-800" : "bg-gray-100 text-gray-400"
          }`}
        >
          {ok && <CheckCircle size={10} />}
          {label}
        </span>
      ))}
    </div>
  );
}

function SignUpView({ onMode }: { onMode: (m: Mode) => void }) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.register(form);
      router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}&mode=verify`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <BackToOptions onBack={() => onMode("choice")} />
      <h1 className="font-serif text-2xl font-bold text-primary-900 mb-1">Create your account</h1>
      <p className="text-sm text-primary-900/60 mb-7">Join a family growing in faith daily</p>

      <GoogleButton label="Continue with Google" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400">or sign up with email</span>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
            <div className="relative">
              <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={form.firstname}
                onChange={(e) => set("firstname", e.target.value)}
                placeholder="John"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
            <input
              type="text"
              value={form.lastname}
              onChange={(e) => set("lastname", e.target.value)}
              placeholder="Doe"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min. 12 characters"
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </div>

        <p className="text-xs text-gray-400">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-primary-600 hover:underline">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account…" : "Create account"}
          {!loading && <ArrowRight size={15} />}
        </button>
      </form>

      <p className="text-sm text-primary-900/60 text-center mt-6">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onMode("signin")}
          className="font-medium text-primary-600 hover:text-primary-800"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
