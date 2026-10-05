/* Klien API riwayat permainan — PHP + MySQL (api/index.php).
 * Server tidak wajib: bila gagal dihubungi, progres lokal (localStorage) tetap berjalan. */

export type AttemptStatus = "done" | "fail";

export interface HistoryPayload {
  clientUuid: string;
  deviceId: string;
  lessonId: string;
  module: string;
  mode: string; // santai | standar | nitro
  status: AttemptStatus;
  rank: "S" | "A" | "B" | "C" | null;
  score: number;
  acc: number; // 0..1
  wpm: number;
  maxCombo: number;
  errors: number;
  hpLeft: number;
  progressPct: number;
  timeSec: number;
  xpGained: number;
  typed: string | null;
}

export interface HistoryItem {
  clientUuid: string;
  lessonId: string;
  module: string;
  mode: string;
  status: AttemptStatus;
  rank: "S" | "A" | "B" | "C" | null;
  score: number;
  acc: number;
  wpm: number;
  maxCombo: number;
  errors: number;
  hpLeft: number;
  progressPct: number;
  timeSec: number;
  xpGained: number;
  createdAt: string; // "YYYY-MM-DDTHH:MM:SS" (waktu lokal server)
}

export interface HistoryResponse {
  ok: true;
  total: number;
  items: HistoryItem[];
  stats: { done: number; fail: number; xpTotal: number; bestWpm: number; avgAcc: number };
}

/** Dev: lewat proxy Vite (/api → Apache). Prod: relatif terhadap folder aplikasi di Apache. */
const API = import.meta.env.DEV ? "/api/index.php" : "api/index.php";

const DEVICE_KEY = "codeshark:device:v1";

export function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** ID perangkat persisten — satu profil riwayat per browser. */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "codeshark-unknown-device";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const data = (await res.json()) as T & { ok?: boolean; error?: string };
    if (!res.ok || data.ok === false) {
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/** Simpan satu upaya. Melempar error bila server tidak tersedia — panggilan wajib menangkap. */
export function saveAttempt(payload: HistoryPayload): Promise<{ ok: true; saved: boolean }> {
  return request(`${API}?action=attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Cek ketersediaan API + database (dipakai untuk indikator status di footer). */
export function checkHealth(): Promise<{ ok: true; db: boolean }> {
  return request(`${API}?action=health`);
}

/** Ambil riwayat upaya terbaru + agregat milik perangkat ini. */
export function fetchHistory(deviceId: string, limit = 12): Promise<HistoryResponse> {
  return request(`${API}?action=history&device=${encodeURIComponent(deviceId)}&limit=${limit}`);
}
