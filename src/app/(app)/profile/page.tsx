"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Mail, Lock, Flame, Save, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userApi, storageApi, streakApi, ApiError } from "@/lib/api";
import { obfuscateEmail, isGuestEmail } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatMemberSince(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ── Inline feedback ────────────────────────────────────────────────────────────

function Feedback({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
      type === "success"
        ? "bg-primary-50 text-primary-700 border border-primary-100"
        : "bg-red-50 text-red-700 border border-red-100"
    }`}>
      {type === "success"
        ? <CheckCircle size={14} className="flex-shrink-0" />
        : <AlertCircle size={14} className="flex-shrink-0" />}
      {msg}
    </div>
  );
}

// ── Avatar with upload ─────────────────────────────────────────────────────────

function AvatarUpload({
  userId,
  profilePicture,
  initials,
  onUploaded,
}: {
  userId: string;
  profilePicture: string | null;
  initials: string;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : ".jpg";
      const key = `profile-pictures/${userId}/avatar${ext}`;

      // 1. Get presigned URL
      const { uploadUrl, fileKey, fileUrl } = await storageApi.getPresignedUrl(key, file.type);

      // 2. Upload directly to S3
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!s3Res.ok) throw new Error("Upload to storage failed.");

      // 3. Save the reference on the user record
      await userApi.updateProfilePicture(userId, fileKey, fileUrl);
      onUploaded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
        >
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 text-2xl font-bold">{initials}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Camera size={20} className="text-white" />}
          </div>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
      </div>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      <p className="text-xs text-gray-400">Click to change photo</p>
    </div>
  );
}

// ── Personal info form ─────────────────────────────────────────────────────────

function PersonalInfoForm({
  userId,
  initialFirstname,
  initialLastname,
  email,
  onSaved,
}: {
  userId: string;
  initialFirstname: string;
  initialLastname: string;
  email: string;
  onSaved: () => void;
}) {
  const [firstname, setFirstname] = useState(initialFirstname);
  const [lastname, setLastname] = useState(initialLastname);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Sync if parent user refreshes
  useEffect(() => { setFirstname(initialFirstname); }, [initialFirstname]);
  useEffect(() => { setLastname(initialLastname); }, [initialLastname]);

  const dirty = firstname.trim() !== initialFirstname || lastname.trim() !== initialLastname;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || saving) return;
    setFeedback(null);
    setSaving(true);
    try {
      const calls: Promise<unknown>[] = [];
      if (firstname.trim() !== initialFirstname) calls.push(userApi.updateFirstname(userId, firstname.trim()));
      if (lastname.trim() !== initialLastname)   calls.push(userApi.updateLastname(userId, lastname.trim()));
      await Promise.all(calls);
      onSaved();
      setFeedback({ type: "success", msg: "Name updated successfully." });
    } catch (err) {
      setFeedback({ type: "error", msg: err instanceof ApiError ? err.message : "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
          <input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
          <input
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
        <div className="relative">
          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={obfuscateEmail(email)}
            readOnly
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!dirty || saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save changes"}
        </button>
        {feedback && <Feedback type={feedback.type} msg={feedback.msg} />}
      </div>
    </form>
  );
}

// ── Change password form ───────────────────────────────────────────────────────

function ChangePasswordForm({ userId }: { userId: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving]   = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 12) {
      setFeedback({ type: "error", msg: "New password must be at least 12 characters." });
      return;
    }
    setSaving(true);
    try {
      await userApi.updatePassword(userId, currentPassword, newPassword);
      setFeedback({ type: "success", msg: "Password updated successfully." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setFeedback({ type: "error", msg: err instanceof ApiError ? err.message : "Failed to update password." });
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors placeholder:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: "Current password",     value: currentPassword, set: setCurrentPassword },
        { label: "New password",          value: newPassword,     set: setNewPassword },
        { label: "Confirm new password",  value: confirmPassword, set: setConfirmPassword },
      ].map(({ label, value, set }) => (
        <div key={label}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder="••••••••••••"
              required
              className={inputCls}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400">
        New password must be at least 12 characters and include uppercase, lowercase, a number, and a symbol.
      </p>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lock size={14} />
          {saving ? "Updating…" : "Update password"}
        </button>
        {feedback && <Feedback type={feedback.type} msg={feedback.msg} />}
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// ── Identity card (avatar + name + email + role + member since) ──────────────────

function IdentityCard({
  user,
  initials,
  displayName,
  onUploaded,
}: {
  user: import("@/lib/api").User;
  initials: string;
  displayName: string;
  onUploaded: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
      <AvatarUpload
        userId={user._id}
        profilePicture={user.profilePicture}
        initials={initials}
        onUploaded={onUploaded}
      />
      <h2 className="font-serif font-bold text-gray-900 mt-4 text-lg">{displayName}</h2>
      <p className="text-sm text-gray-400 mt-0.5">{obfuscateEmail(user.email)}</p>
      <span className="inline-block mt-3 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full capitalize">
        {user.role}
      </span>
      <p className="text-xs text-gray-400 mt-3">
        Member since {formatMemberSince(user.createdAt)}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const guest = user ? isGuestEmail(user.email) : false;

  useEffect(() => {
    if (guest) return; // guests have no personal streak to fetch
    streakApi.getMyStreak().then((s) => setStreakCount(s.currentStreak)).catch(() => {});
  }, [guest]);

  if (!user) return null;

  const initials = `${user.firstname[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase();
  const displayName = `${user.firstname} ${user.lastname ?? ""}`.trim();

  // Guest session: identity only — no editable fields, streak, or danger zone.
  if (guest) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900 leading-tight">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1.5">You&apos;re exploring as a guest.</p>
        </div>
        <div className="max-w-sm">
          <IdentityCard
            user={user}
            initials={initials}
            displayName={displayName}
            onUploaded={refreshUser}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 leading-tight">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1.5">Manage your account details and password.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left - avatar + identity */}
        <div className="space-y-4">
          <IdentityCard
            user={user}
            initials={initials}
            displayName={displayName}
            onUploaded={refreshUser}
          />

          {/* Stats card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Flame size={14} className="text-gold-500" />
                Current streak
              </div>
              <span className="text-sm font-bold text-gold-600">
                {streakCount === null ? "…" : `${streakCount} day${streakCount !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right - forms */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Personal information</h3>
            <PersonalInfoForm
              userId={user._id}
              initialFirstname={user.firstname}
              initialLastname={user.lastname ?? ""}
              email={user.email}
              onSaved={refreshUser}
            />
          </div>

          {/* Change password */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Change password</h3>
            <p className="text-xs text-gray-400 mb-5">
              {user.googleId
                ? "Your account uses Google sign-in - password change is not available."
                : "Choose a strong password you don't use anywhere else."}
            </p>
            {user.googleId ? (
              <p className="text-sm text-gray-400 italic">Signed in with Google</p>
            ) : (
              <ChangePasswordForm userId={user._id} />
            )}
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-xl border border-red-100 p-6">
            <h3 className="font-semibold text-red-700 mb-1">Danger zone</h3>
            <p className="text-xs text-gray-400 mb-4">
              Once you delete your account, all your data will be permanently removed.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure? This cannot be undone.")) {
                  userApi.deleteProfilePicture(user._id).catch(() => {});
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Delete my account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
