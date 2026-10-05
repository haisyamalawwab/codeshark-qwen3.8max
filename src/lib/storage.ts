import { isModeId, type ModeId } from "./modes";

export type Rank = "S" | "A" | "B" | "C";

export interface LessonResult {
  rank: Rank;
  score: number;
  acc: number; // 0..1
  wpm: number;
  xp: number; // xp terbaik yang tercatat untuk lesson ini
  timeSec: number;
  mode: ModeId;
  maxCombo: number;
  errors: number;
  hpLeft: number;
  overdriveUsed: boolean;
}

export interface Profile {
  xp: number;
  score: number;
  bestWpm: number;
  results: Record<string, LessonResult>;
  sound: boolean;
  lastMode: ModeId;
  /** id pencapaian -> timestamp terbuka */
  achievements: Record<string, number>;
}

const KEY = "codeshark:profile:v1";

export const defaultProfile = (): Profile => ({
  xp: 0,
  score: 0,
  bestWpm: 0,
  results: {},
  sound: true,
  lastMode: "standar",
  achievements: {},
});

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      ...defaultProfile(),
      ...parsed,
      results: parsed.results && typeof parsed.results === "object" ? parsed.results : {},
      lastMode: isModeId(parsed.lastMode) ? parsed.lastMode : "standar",
      achievements:
        parsed.achievements && typeof parsed.achievements === "object"
          ? parsed.achievements
          : {},
    };
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage penuh / private mode — abaikan */
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
}

/* ---------- flag onboarding v3 (kunci terpisah — skema profil lama tidak diubah) ---------- */

const ONBOARD_KEY = "codeshark:onboarded:v3";

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARD_KEY) === "1";
  } catch {
    return false;
  }
}

export function setOnboarded() {
  try {
    localStorage.setItem(ONBOARD_KEY, "1");
  } catch {
    /* abaikan */
  }
}

export const LEVEL_NAMES = [
  "Kadet Kode",
  "Penjelajah Tag",
  "Perakit Halaman",
  "Penyihir Style",
  "Penata Layout",
  "Ninja DOM",
  "Master Front-End",
];

/** Naik level tiap 150 × level XP (kurva makin menanjak). */
export function levelFromXp(xp: number) {
  let level = 1;
  let base = 0;
  while (xp >= base + 150 * level) {
    base += 150 * level;
    level++;
  }
  return { level, into: xp - base, need: 150 * level };
}

export function levelName(level: number) {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
}
