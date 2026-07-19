import { NextResponse } from "next/server";

// Server-side only - the shared guest credentials never reach the browser bundle.
const BACKEND = process.env.API_URL ?? "http://localhost:3001";

/**
 * POST /api/auth/guest
 *
 * Signs in with the shared guest account (GUEST_EMAIL / GUEST_PASSWORD) via the
 * backend's normal password endpoint - the backend auto-activates the guest
 * account, so no email verification is required. Returns the standard
 * AuthResponse so the client can call loginSuccess() exactly as for a real login.
 *
 * This is a specific route, so it takes precedence over the /api/[[...path]]
 * catch-all proxy.
 */
export async function POST() {
  const email = process.env.GUEST_EMAIL?.trim();
  const password = process.env.GUEST_PASSWORD?.trim();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Guest access is not available right now." },
      { status: 503 },
    );
  }

  const res = await fetch(`${BACKEND}/auth/sign-in-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
