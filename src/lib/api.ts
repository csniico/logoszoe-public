import { getToken, getRefreshToken, setTokens, clearTokens } from "./tokens";

// Always relative - requests go to Next.js /api/... which proxies to the backend.
// The backend URL lives in API_URL (server-side env var, never in the bundle).
const BASE = "/api";

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  googleId?: string;
  role: "user";
  profilePicture: string | null;
  profilePictureKey: string | null;
  bookmarks: Bookmark[];
  session: "active" | "inactive" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  title: string;
  image?: string;
  type: "article" | "devotional" | "podcast" | "verse";
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  description?: string;
  bannerUrl?: string;
  /** The category's own article: a header + HTML body shown above its articles. */
  article_title?: string;
  article_body?: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  author?: string;
  category: Category | string;
  content?: string;
  imageUrl?: string;
  published: boolean;
  hits?: number;
  biblePassages?: { ref: string; passage: string[] }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  refreshToken: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Internal fetch with auth header + auto-refresh ───────────────────────────

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "No refresh token");

  const res = await fetch(`${BASE}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    // Do NOT call clearTokens() here - let AuthContext decide to sign out.
    // Prematurely clearing tokens here causes any 401 on any endpoint to
    // cascade into a full sign-out, even if other tokens are still valid.
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const data = await res.json();
  setTokens(data.token, data.refreshToken);
  return data.token;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
    }
    await refreshPromise;
    return apiFetch<T>(path, options, false);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(". ") : message);
  }

  // 204 No Content (and any empty body) - nothing to parse.
  // Calling res.json() on an empty body throws "Unexpected end of JSON input".
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// ── Auth endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  /** POST /auth/sign-up - sends verification email, does NOT return tokens */
  register(data: { firstname: string; lastname: string; email: string; password: string }) {
    return apiFetch<{ message: string; id: string }>("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** POST /auth/sign-in-password */
  login(data: { email: string; password: string }) {
    return apiFetch<AuthResponse>("/auth/sign-in-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/guest - signs in with the shared guest account. Credentials live
   * server-side (GUEST_EMAIL / GUEST_PASSWORD); the Next route handler performs
   * the actual backend sign-in and returns a standard AuthResponse.
   */
  guest() {
    return apiFetch<AuthResponse>("/auth/guest", { method: "POST" });
  },

  /** POST /auth/verify-email - sends a 6-digit code (also used for forgot-password) */
  sendVerificationEmail(email: string) {
    return apiFetch<{ message: string; id: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /** POST /auth/verify-code - confirms email with 6-digit code, returns tokens */
  verifyCode(email: string, code: string) {
    return apiFetch<AuthResponse>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },

  /** POST /auth/reset-password - code from verify-email + new password */
  resetPassword(data: { email: string; code: string; newPassword: string }) {
    return apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** POST /auth/sign-in-google-mobile - for web we pass idToken from Google */
  googleSignIn(idToken: string) {
    return apiFetch<AuthResponse>("/auth/sign-in-google-mobile", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },
};

// ── User endpoints ───────────────────────────────────────────────────────────

export const userApi = {
  /** GET /users/profile - requires Bearer token */
  me() {
    return apiFetch<User>("/users/profile");
  },
  /** PATCH /users/:id/firstname */
  updateFirstname(id: string, firstname: string) {
    return apiFetch<User>(`/users/${id}/firstname`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstname }),
    });
  },
  /** PATCH /users/:id/lastname */
  updateLastname(id: string, lastname: string) {
    return apiFetch<User>(`/users/${id}/lastname`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastname }),
    });
  },
  /** PATCH /users/:id/update-password */
  updatePassword(id: string, currentPassword: string, newPassword: string) {
    return apiFetch<{ message: string }>(`/users/${id}/update-password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  /** PATCH /users/:id/profile-picture */
  updateProfilePicture(id: string, fileKey: string, fileUrl: string) {
    return apiFetch<User>(`/users/${id}/profile-picture`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileKey, fileUrl }),
    });
  },
  /** DELETE /users/:id/profile-picture */
  deleteProfilePicture(id: string) {
    return apiFetch<{ message: string }>(`/users/${id}/profile-picture`, {
      method: "DELETE",
    });
  },
};

// ── Storage endpoints ─────────────────────────────────────────────────────────

export const storageApi = {
  /**
   * POST /storage/presigned-url - returns a short-lived S3 presigned PUT URL.
   * key must start with an allowed prefix (e.g. "profile-pictures/{userId}/...").
   */
  getPresignedUrl(key: string, mimeType: string) {
    return apiFetch<{
      uploadUrl: string;
      fileKey: string;
      fileUrl: string;
      expiresIn: number;
    }>("/storage/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, mimeType }),
    });
  },
};

// ── Streak types + endpoints ──────────────────────────────────────────────────

export interface StreakDay {
  day: number;
  month: number;
  year: number;
}

export interface CalendarDay {
  day: number;
  month: number;
  year: number;
  read: boolean;
  devotionalId?: string;
  devotionalTitle?: string;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  isNewDay: boolean;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  lastReadAt: string | null;
  recentReads: StreakDay[];
  calendar?: CalendarDay[];
  readCount?: number;
  totalDays?: number;
}

export const streakApi = {
  /**
   * POST /streaks/devotionals/:devotionalId/read
   * Records that the user opened this devotional today. Idempotent - safe
   * to call on every page load; the backend ignores duplicate same-day reads.
   */
  recordRead(devotionalId: string) {
    return apiFetch<StreakResult>(`/streaks/devotionals/${devotionalId}/read`, {
      method: "POST",
    });
  },

  /**
   * GET /streaks/me?days=7|30
   * Pass days=30 to get the full calendar array for the modal.
   */
  getMyStreak(days: 7 | 30 = 7) {
    return apiFetch<StreakSummary>(`/streaks/me?days=${days}`);
  },
};

// ── Category endpoints ───────────────────────────────────────────────────────

export const categoryApi = {
  /** GET /categories → { categories: Category[] } */
  getAll() {
    return apiFetch<{ categories: Category[] }>("/categories");
  },
};

// ── Podcast types + endpoints ────────────────────────────────────────────────

export type PodcastCategory = "word-of-faith" | "podcast" | "prayers";

export interface Podcast {
  _id: string;
  title: string;
  description: string;
  category: PodcastCategory;
  slug: string;
  audioUrl: string;
  imageUrl?: string;
  hits?: number;
  createdAt?: string;
}

export const PODCAST_CATEGORIES: { value: PodcastCategory; label: string; color: string }[] = [
  { value: "word-of-faith", label: "Word of Faith", color: "#7c3aed" },
  { value: "podcast",       label: "Podcast",       color: "#0891b2" },
  { value: "prayers",       label: "Prayers",       color: "#db2777" },
];

export const podcastApi = {
  /** GET /podcasts/:category → Podcast[] */
  getByCategory(category: PodcastCategory) {
    return apiFetch<Podcast[]>(`/podcasts/${category}`);
  },
  /** GET /podcasts?page=1&limit=25 → paginated */
  getAll(page = 1, limit = 25) {
    return apiFetch<{ data: Podcast[]; total: number; page: number; totalPages: number }>(
      `/podcasts?page=${page}&limit=${limit}`
    );
  },
};

// ── Devotional types + endpoints ─────────────────────────────────────────────

export interface BiblePassage {
  ref: string;
  passage: string[];
}

export interface Devotional {
  _id: string;
  day: number;
  month: number;
  year: number;
  title: string;
  themeScripture?: string;
  preparatoryQuestions?: string[];
  author?: string;
  content: string;
  furtherReading?: string;
  questionsToHelpYouMeditate?: string[];
  prayer?: string;
  oneYearBiblePlan?: string;
  biblePassages?: BiblePassage[];
  listOfImageAssets?: string[];
  published: boolean;
  fileUrl?: string;
  hits?: number;
  createdAt?: string;
}

export const devotionalApi = {
  /** GET /devotionals/daily - today's devotional (falls back to most recent) */
  getDaily() {
    return apiFetch<Devotional>("/devotionals/daily");
  },

  /** GET /devotionals?page=1&limit=25 - paginated archive */
  getAll(page = 1, limit = 25) {
    return apiFetch<{ data: Devotional[]; total: number; page: number; totalPages: number }>(
      `/devotionals?page=${page}&limit=${limit}`
    );
  },

  /** GET /devotionals/:id - full detail, increments hits */
  getById(id: string) {
    return apiFetch<Devotional>(`/devotionals/${id}`);
  },
};

// ── Bookmark types + endpoints ────────────────────────────────────────────────

export type BookmarkType =
  | "article"
  | "devotional"
  | "podcast"
  | "course"
  | "lesson"
  | "audio"
  | "video"
  | "verse";

export interface BookmarkItem {
  _id: string;
  itemId: string;
  type: BookmarkType;
  title: string;
  imageUrl?: string;
  createdAt: string;
}

export const bookmarkApi = {
  /**
   * POST /bookmarks/toggle
   * Adds the bookmark if it doesn't exist, removes it if it does.
   * Returns { bookmarked: boolean } - use this to sync button state.
   */
  toggle(data: { itemId: string; type: BookmarkType; title: string; imageUrl?: string }) {
    return apiFetch<{ bookmarked: boolean }>("/bookmarks/toggle", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /bookmarks?type=devotional&page=1&limit=20
   * Paginated list of bookmarks, optionally filtered by type.
   */
  getAll(type?: BookmarkType, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.set("type", type);
    return apiFetch<{ data: BookmarkItem[]; total: number; page: number; totalPages: number }>(
      `/bookmarks?${params}`
    );
  },

  /**
   * POST /bookmarks/check
   * Bulk status check. Pass items you want to check, get back a
   * "type:itemId" → boolean map. Use on page load to restore button states.
   */
  checkMany(items: Array<{ itemId: string; type: BookmarkType }>) {
    return apiFetch<Record<string, boolean>>("/bookmarks/check", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  },
};

// ── Course types + endpoints ──────────────────────────────────────────────────

export type CourseLevel = "foundation" | "intermediate" | "advanced";

export const COURSE_LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "foundation",   label: "Foundation"   },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced",     label: "Advanced"     },
];

export interface EmbeddedQuestion {
  text: string;
}

export interface Course {
  _id: string;
  title: string;
  level: CourseLevel;
  imageUrl?: string;
  imageKey?: string;
  description?: string;
  lessonCount?: number;
  totalDurationSec?: number;
  createdAt?: string;
}

/** A bundle of lessons within a course (Course → Module → Lesson). */
export interface CourseModule {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  description?: string;
  imageUrl?: string;
  lessonCount?: number;
}

export type LessonType = "text" | "video" | "audio";

export interface Lesson {
  _id: string;
  courseId: string;
  moduleId?: string;
  order: number;
  title: string;
  type: LessonType;
  content: string;
  contentKey?: string;
  durationSec?: number;
  description?: string;
  studyQuestions?: EmbeddedQuestion[];
  reflectionQuestions?: EmbeddedQuestion[];
  prayer?: string;
  furtherStudy?: string;
}

export interface CourseVideo {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSec?: number;
}

/**
 * Per-lesson lock/completion state, as decided by the backend. This is the
 * source of truth for the lesson gate - the client must NOT recompute unlock
 * state from `completedLessonIds` or lesson order. Entries are returned in full
 * course sequence order (module order, then lesson order).
 */
export interface LessonProgress {
  lessonId: string;
  /** May be null for legacy lessons that predate modules. */
  moduleId: string | null;
  order: number;
  completed: boolean;
  unlocked: boolean;
}

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  lessonsCompleted: number;
  completedLessonIds: string[];
  /** Per-lesson lock/completion flags. Optional for resilience if an older
   *  backend response is ever received, but the current API always sends it. */
  lessons?: LessonProgress[];
}


export const courseApi = {
  /** GET /courses */
  getAll() {
    return apiFetch<Course[]>("/courses");
  },
  /** GET /courses/:id */
  getOne(id: string) {
    return apiFetch<Course>(`/courses/${id}`);
  },
  /** GET /courses/:id/modules */
  getModules(id: string) {
    return apiFetch<CourseModule[]>(`/courses/${id}/modules`);
  },
  /** GET /courses/:id/lessons (all lessons across modules; group by moduleId) */
  getLessons(id: string) {
    return apiFetch<Lesson[]>(`/courses/${id}/lessons`);
  },
  /**
   * GET /courses/:id/lessons/:lessonId  [requires auth]
   * The backend enforces the sequential lock: it returns 403 when the lesson is
   * locked (previous lesson not completed). The auth token is attached by
   * apiFetch automatically. Callers should only reach here for lessons whose
   * `unlocked` flag from /progress is true; the 403 is the server-side backstop.
   */
  getLesson(id: string, lessonId: string) {
    return apiFetch<Lesson>(`/courses/${id}/lessons/${lessonId}`);
  },
  /** GET /courses/:id/progress  [requires auth] */
  getProgress(id: string) {
    return apiFetch<CourseProgress>(`/courses/${id}/progress`);
  },
  /** POST /courses/:id/lessons/:lessonId/complete  [requires auth]
   *  The backend rejects this with 403 if the lesson is locked. */
  markComplete(id: string, lessonId: string) {
    return apiFetch<void>(`/courses/${id}/lessons/${lessonId}/complete`, { method: "POST" });
  },
  /** DELETE /courses/:id/lessons/:lessonId/complete  [requires auth] */
  unmarkComplete(id: string, lessonId: string) {
    return apiFetch<void>(`/courses/${id}/lessons/${lessonId}/complete`, { method: "DELETE" });
  },
  /** POST /courses/:id/lessons/:lessonId/submissions - save study/reflection answers */
  submitAnswers(id: string, lessonId: string, responses: { questionId: string; questionText: string; questionType: string; userResponse: string }[]) {
    return apiFetch<void>(`/courses/${id}/lessons/${lessonId}/submissions`, {
      method: "POST",
      body: JSON.stringify({ responses }),
    });
  },
  /** DELETE /courses/:id/lessons/:lessonId/submissions - wipe the learner's submission */
  deleteSubmission(id: string, lessonId: string) {
    return apiFetch<void>(`/courses/${id}/lessons/${lessonId}/submissions`, { method: "DELETE" });
  },
};


export const courseVideoApi = {
  /** GET /course-videos/:id */
  getOne(id: string) {
    return apiFetch<CourseVideo>(`/course-videos/${id}`);
  },
};

// ── Donations ────────────────────────────────────────────────────────────────

export type DonationCategory = "partnership" | "oneTime";
export type DonationPlatform = "ios" | "android" | "web" | "unknown";

export interface Donation {
  _id: string;
  userId: string;
  transactionId: string;
  productIdentifier: string;
  category: DonationCategory;
  platform: DonationPlatform;
  purchaseDate: string;
  amount?: number;   // smallest currency unit (cents)
  currency?: string;
  createdAt: string;
}

export interface CreateDonationPayload {
  transactionId: string;
  productIdentifier: string;
  category: DonationCategory;
  platform?: DonationPlatform;
  purchaseDate?: string;
  amount?: number;
  currency?: string;
}

export const donationApi = {
  /** GET /donations - the current user's own donation history (newest first). */
  getMine() {
    return apiFetch<Donation[]>("/donations");
  },
  /** POST /donations - log a completed RevenueCat web purchase. */
  log(payload: CreateDonationPayload) {
    return apiFetch<Donation>("/donations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  /** POST /donations/paystack/initialize - start a Mobile Money transaction. */
  paystackInitialize(productIdentifier: string, category: DonationCategory, amount: number) {
    return apiFetch<{ accessCode: string; reference: string; authorizationUrl: string }>(
      "/donations/paystack/initialize",
      { method: "POST", body: JSON.stringify({ productIdentifier, category, amount }) },
    );
  },
  /** GET /donations/paystack/verify/:reference - verify + record a Mobile Money donation. */
  paystackVerify(reference: string) {
    return apiFetch<Donation>(`/donations/paystack/verify/${encodeURIComponent(reference)}`);
  },
};

// ── Submissions (learner-facing) ─────────────────────────────────────────────

export interface SubmissionResponseItem {
  questionId: string;
  questionText: string;
  questionType: string; // "study" | "reflection"
  userResponse: string;
}

/** Row in GET /courses/submissions/mine */
export interface MySubmissionItem {
  _id: string;
  courseId: string;
  courseTitle: string;
  courseImage: string | null;
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  responses: SubmissionResponseItem[];
  createdAt: string;
}

export interface SubmissionRemark {
  _id: string;
  submissionId: string;
  authorId: string;
  authorName: string;
  authorRole: "admin" | "learner";
  content: string;
  readByLearner: boolean;
  createdAt: string;
}

export interface LearnerSubmissionDetail {
  submission: {
    _id: string;
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    lessonType: string;
    responses: SubmissionResponseItem[];
    createdAt: string;
  };
  remarks: SubmissionRemark[];
}

export const submissionsApi = {
  /** GET /courses/submissions/mine */
  getMine() {
    return apiFetch<MySubmissionItem[]>("/courses/submissions/mine");
  },
  /** GET /courses/submissions/:submissionId - detail + remarks thread */
  getDetail(submissionId: string) {
    return apiFetch<LearnerSubmissionDetail>(`/courses/submissions/${submissionId}`);
  },
  /** POST /courses/submissions/:submissionId/replies - learner reply */
  reply(submissionId: string, content: string) {
    return apiFetch<SubmissionRemark>(`/courses/submissions/${submissionId}/replies`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
};

// ── Prayer types + endpoints ─────────────────────────────────────────────────

export interface Prayer {
  _id: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  topic: string;
  title: string;
  message: string;
  anonymous: boolean;
  responses?: string[];
  createdAt: string;
  updatedAt: string;
}

export const PRAYER_TOPICS = [
  "Prayer",
  "Praise",
  "Love",
  "Healing",
  "Health",
  "Strength",
  "Financial",
  "Friend",
  "Family",
  "Relationship",
  "Loss",
  "Confusion",
  "Loneliness",
  "Suffering",
  "Faith",
  "Natural Disaster",
  "Lust",
  "Greed",
  "Jealousy",
  "Miracle",
  "Spiritual",
  "Wisdom",
  "Other",
] as const;

export const prayerApi = {
  /** POST /prayers  [requires auth] */
  submit(data: {
    userId: string;
    title: string;
    topic: string;
    message: string;
    name?: string;
    email?: string;
    phone?: string;
    anonymous: boolean;
  }) {
    return apiFetch<Prayer>("/prayers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  /** GET /prayers/user/:userId  [requires auth, own prayers only] */
  getMine(userId: string) {
    return apiFetch<Prayer[]>(`/prayers/user/${userId}`);
  },
  /** DELETE /prayers/:id  [requires auth, own prayers only] */
  delete(id: string) {
    return apiFetch<void>(`/prayers/${id}`, { method: "DELETE" });
  },
};

// ── Bible types + endpoints ──────────────────────────────────────────────────

export interface BibleBook {
  _id: string;
  name: string;
  abbrev: string;
  chaptersCount: number;
}

export interface BibleChapter {
  versesCount: number;
  verses: string[];
}

export interface BibleBookDetail {
  name: string;
  abbrev: string;
  chapters: BibleChapter[];
}

export interface BiblePassageResult {
  ref: string;
  passage: string[];
}

// Canonical Bible book order - used to sort API results correctly.
export const BIBLE_BOOK_ORDER: string[] = [
  // ── Old Testament (39) ──────────────────────────────────────────────────────
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther",
  "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  // ── New Testament (27) ──────────────────────────────────────────────────────
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

const _BIBLE_ORDER_MAP = new Map(BIBLE_BOOK_ORDER.map((name, i) => [name, i]));

/** Sort a BibleBook array by canonical scripture order. */
export function sortByBibleOrder<T extends { name: string }>(books: T[]): T[] {
  return [...books].sort(
    (a, b) =>
      (_BIBLE_ORDER_MAP.get(a.name) ?? 999) -
      (_BIBLE_ORDER_MAP.get(b.name) ?? 999),
  );
}

// Canonical NT book names - anything not in this set is OT.
export const NT_BOOK_NAMES = new Set([
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
]);

export const bibleApi = {
  /** GET /bible/books */
  getBooks() {
    return apiFetch<BibleBook[]>("/bible/books");
  },
  /** GET /bible/:abbrev/chapters */
  getChapters(abbrev: string) {
    return apiFetch<BibleBookDetail>(`/bible/${abbrev}/chapters`);
  },
  /** GET /bible/:abbrev/chapters/:chapter/verses */
  getVerses(abbrev: string, chapter: number) {
    return apiFetch<BibleChapter>(`/bible/${abbrev}/chapters/${chapter}/verses`);
  },
};

// ── Video types + endpoints ──────────────────────────────────────────────────

export interface Video {
  _id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export const videoApi = {
  /** GET /videos - no auth required */
  getAll() {
    return apiFetch<Video[]>("/videos");
  },
  /** GET /videos/:category - no auth required */
  getByCategory(category: string) {
    return apiFetch<Video[]>(`/videos/${encodeURIComponent(category)}`);
  },
};

// ── Shop types + endpoints ───────────────────────────────────────────────────

export type ProductStatus = "coming_soon" | "available" | "out_of_stock" | "pre-order";
export type ProductCategory =
  | "electronics"
  | "fashion"
  | "home"
  | "books"
  | "toys"
  | "beauty"
  | "sports"
  | "automotive"
  | "grocery"
  | "health";

export const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "available",    label: "Available" },
  { value: "coming_soon",  label: "Coming Soon" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "pre-order",    label: "Pre-order" },
];

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "books",       label: "Books" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion",     label: "Fashion" },
  { value: "home",        label: "Home" },
  { value: "toys",        label: "Toys" },
  { value: "beauty",      label: "Beauty" },
  { value: "sports",      label: "Sports" },
  { value: "automotive",  label: "Automotive" },
  { value: "grocery",     label: "Grocery" },
  { value: "health",      label: "Health" },
];

export interface Product {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageKey: string;
  price: number;
  slug: string;
  category: ProductCategory;
  quantity: number;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const shopApi = {
  /** GET /shop/products - no auth required */
  getAll() {
    return apiFetch<Product[]>("/shop/products");
  },
  /** GET /shop/products/:id - no auth required */
  getById(id: string) {
    return apiFetch<Product>(`/shop/products/${id}`);
  },
};

// ── Community types + endpoints ──────────────────────────────────────────────

export interface CommunityPost {
  _id: string;
  parentId: string | null;
  anonymous: boolean;
  userId?: string;
  userName?: string;
  userAvatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  text: string;
  images: { url: string; key: string }[];
  likeCount: number;
  bookmarkCount: number;
  replyCount: number;
  shareCount: number;
  liked: boolean;
  bookmarked: boolean;
}

export const communityApi = {
  /** GET /posts?cursor=ISO&limit=20 - no auth required */
  getFeed(cursor?: string, limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiFetch<CommunityPost[]>(`/posts?${params}`);
  },
  /** GET /posts/:id - no auth required */
  getPost(id: string) {
    return apiFetch<CommunityPost>(`/posts/${id}`);
  },
  /** GET /posts/:id/replies?cursor=ISO&limit=20 */
  getReplies(id: string, cursor?: string, limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiFetch<CommunityPost[]>(`/posts/${id}/replies?${params}`);
  },
  /** POST /posts - requires auth */
  createPost(data: { text: string; parentId?: string; anonymous?: boolean; images?: { url: string; key: string }[] }) {
    return apiFetch<CommunityPost>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  /** DELETE /posts/:id - requires auth, owner only */
  deletePost(id: string) {
    return apiFetch<void>(`/posts/${id}`, { method: "DELETE" });
  },
  /** POST /posts/:id/like - toggles like, requires auth */
  toggleLike(id: string) {
    return apiFetch<CommunityPost>(`/posts/${id}/like`, { method: "POST" });
  },
  /** POST /posts/:id/bookmark - toggles bookmark, requires auth */
  toggleBookmark(id: string) {
    return apiFetch<CommunityPost>(`/posts/${id}/bookmark`, { method: "POST" });
  },
};

// ── Search types + endpoints ─────────────────────────────────────────────────

export type SearchScope = "devotionals" | "articles" | "podcasts" | "videos" | "products";

export const SEARCH_SCOPES: { value: SearchScope; label: string }[] = [
  { value: "devotionals", label: "Devotionals" },
  { value: "articles",    label: "Articles" },
  { value: "podcasts",    label: "Podcasts" },
  { value: "videos",      label: "Videos" },
  { value: "products",    label: "Products" },
];

export interface SearchResult {
  // Common
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  // Devotional
  author?: string;
  day?: number;
  month?: number;
  year?: number;
  // Article
  slug?: string;
  // Podcast
  audioUrl?: string;
  category?: string;
  // Video
  youtubeId?: string;
  thumbnailUrl?: string;
  // Product
  price?: number;
  status?: string;
}

export interface SearchResponse {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  scope: string;
}

export const searchApi = {
  /** GET /search?q=&scope=&page=&limit= */
  search(q: string, scope: SearchScope, page = 1, limit = 25) {
    const params = new URLSearchParams({
      q,
      scope,
      page: String(page),
      limit: String(limit),
    });
    return apiFetch<SearchResponse>(`/search?${params}`);
  },
  /** Fire all scopes in parallel - for the "All" combined view */
  searchAll(q: string, limit = 5) {
    return Promise.all(
      SEARCH_SCOPES.map((s) =>
        searchApi.search(q, s.value, 1, limit).then((res) => ({ ...res, scope: s.value as SearchScope })),
      ),
    );
  },
};

// ── Article endpoints ────────────────────────────────────────────────────────

export const articleApi = {
  /** GET /articles → Article[] (all articles, category populated) */
  getAll() {
    return apiFetch<Article[]>("/articles");
  },

  /** GET /articles/category/:slug → Article[] */
  getByCategory(slug: string) {
    return apiFetch<Article[]>(`/articles/category/${slug}`);
  },

  /** GET /articles/:slug → { article, relatedArticles } */
  getBySlug(slug: string) {
    return apiFetch<{ article: Article; relatedArticles: Article[] }>(`/articles/${slug}`);
  },
};

// ── Feedback endpoint ─────────────────────────────────────────────────────────

export const feedbackApi = {
  /** POST /feedback [requires auth] - emailed to the developer server-side. */
  send(data: {
    message: string;
    email?: string;
    name?: string;
    platform?: string;
    appVersion?: string;
  }) {
    return apiFetch<{ message: string }>("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
