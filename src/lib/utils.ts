import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Masks an email for display: keeps a short hint of the local part and hides
 * the rest — including the domain entirely. e.g. "guest@csniico.com" → "gu•••••".
 * Use for any read-only rendering of an existing email, never for editable /
 * submittable fields.
 */
export function obfuscateEmail(email?: string | null): string {
  if (!email) return "";
  const local = email.split("@")[0] ?? "";
  if (!local) return "";
  const lead = local.slice(0, local.length >= 2 ? 2 : 1);
  return `${lead}•••••`;
}

/**
 * True when the given email belongs to the shared guest account. Relies on the
 * public copy of the guest email (NEXT_PUBLIC_GUEST_EMAIL); returns false when
 * that env var isn't configured, so the UI safely degrades to normal.
 */
export function isGuestEmail(email?: string | null): boolean {
  const guest = process.env.NEXT_PUBLIC_GUEST_EMAIL?.trim().toLowerCase();
  if (!guest || !email) return false;
  return email.trim().toLowerCase() === guest;
}
