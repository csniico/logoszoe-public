const TOKEN_KEY   = "lz_token";
const REFRESH_KEY = "lz_refresh_token";
const USER_KEY    = "lz_user";

export function setTokens(token: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  // Also write a plain cookie so middleware can read it
  // Both cookies last 30 days - the middleware only checks cookie *presence*
  // as a quick gate; real JWT validation happens on the NestJS backend.
  // The 1-hour access-token cookie was causing users to be bounced out by
  // middleware every hour even though their refresh token was still valid.
  document.cookie = `lz_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  document.cookie = `lz_refresh=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "lz_token=; path=/; max-age=0";
  document.cookie = "lz_refresh=; path=/; max-age=0";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function saveUser(user: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}
