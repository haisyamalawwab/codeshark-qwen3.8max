/* Laporan hasil sesi: alasan rank, coaching, waterfall skor, peta kesalahan per baris.
 * Semua murni turunan data attempt — tidak menyentuh mekanik game. */

import { MODES } from "./modes";
import { unmetForS, type RankChip } from "./rank";
import type { Rank } from "./storage";

/* ---------- waterfall skor ---------- */

export type ScoreEventKind =
  | "char"
  | "enter"
  | "milestone"
  | "perfect"
  | "checkpoint"
  | "od"
  | "hpbonus";

export interface ScoreEvent {
  kind: ScoreEventKind;
  at: number;
  pts: number;
}

export const SCORE_KIND_LABEL: Record<ScoreEventKind, string> = {
  char: "Ketik karakter",
  enter: "Baris selesai",
  milestone: "Bonus combo",
  perfect: "Garis sempurna",
  checkpoint: "Checkpoint",
  od: "Overdrive ×2",
  hpbonus: "Bonus HP",
};

export interface ScoreSlice {
  kind: ScoreEventKind;
  pts: number;
}

/** Rangkum event per jenis, terurut dari poin terbesar. */
export function summarizeScore(events: ScoreEvent[]): ScoreSlice[] {
  const by = new Map<ScoreEventKind, number>();
  for (const e of events) by.set(e.kind, (by.get(e.kind) ?? 0) + e.pts);
  return [...by.entries()]
    .map(([kind, pts]) => ({ kind, pts }))
    .filter((s) => s.pts > 0)
    .sort((a, b) => b.pts - a.pts);
}

export function totalScore(events: ScoreEvent[]): number {
  return events.reduce((a, e) => a + e.pts, 0);
}

/* ---------- peta kesalahan per baris ---------- */

export interface LineReport {
  idx: number;
  text: string;
  errors: number;
  perfect: boolean;
  worst: [string, number][]; // 1–2 karakter yang paling sering salah
}

export function buildLineReports(
  lines: { text: string }[],
  lineErrors: Record<number, number>,
  lineCharErr: Record<number, Record<string, number>>,
  linePerfect: Record<number, boolean>
): LineReport[] {
  return lines.map((l, i) => ({
    idx: i,
    text: l.text,
    errors: lineErrors[i] ?? 0,
    perfect: !!linePerfect[i] && (lineErrors[i] ?? 0) === 0,
    worst: Object.entries(lineCharErr[i] ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2) as [string, number][],
  }));
}

/* ---------- headline alasan rank ---------- */

export function getRankReason(r: {
  rank: Rank;
  acc: number; // 0..1
  hp: number;
  wpm: number;
  modeDmg: number;
  perfects: number;
  odUsed: boolean;
  maxCombo: number;
}): string {
  const accPct = Math.round(r.acc * 100);
  const maxErrForS = Math.floor(30 / r.modeDmg); // HP 100 → toleran ≥70
  if (r.rank === "S") {
    return (
      `Akurasi ${accPct}% + HP ${r.hp} — dua syarat S terpenuhi. ` +
      `${r.perfects} garis sempurna, combo terbaik ×${r.maxCombo}${r.odUsed ? ", Overdrive terpakai" : ""}.`
    );
  }
  if (r.rank === "A") {
    if (r.hp < 70) {
      return (
        `Akurasi ${accPct}% sudah kelas S, tapi HP tinggal ${r.hp} (butuh ≥70). ` +
        `Di mode ini S hanya toleran ${maxErrForS} salah — ketik lebih konservatif.`
      );
    }
    return (
      `HP aman di ${r.hp}, tapi akurasi ${accPct}% — S butuh ≥97%. ` +
      `Lihat peta kesalahan: di situlah rank ini tertahan.`
    );
  }
  if (r.rank === "B") {
    return (
      `Akurasi ${accPct}% — ambang A ada di ≥92%. ${unmetChipText(r)} ` +
      `Kejar garis sempurna (+80 skor, +2 HP) sebelum mengejar kecepatan.`
    );
  }
  return (
    `Akurasi ${accPct}% masih jauh dari ambang mana pun. ` +
    `Ulangi di Mode Santai (damage −${MODES.santai.dmg}), kejar garis sempurna dulu.`
  );
}

function unmetChipText(r: { acc: number; hp: number; wpm: number }): string {
  const chips: RankChip[] = [
    { key: "acc", label: "ACC", ok: r.acc >= 0.92, near: false, value: Math.round(r.acc * 100) },
    { key: "hp", label: "HP", ok: r.hp >= 70, near: false, value: r.hp },
    { key: "wpm", label: "WPM", ok: r.wpm >= 60, near: false, value: r.wpm },
  ];
  const unmet = unmetForS(chips);
  return unmet ? `Untuk S: ${unmet.replace(" + ", " dan ")} belum cukup.` : "";
}

/* ---------- coaching: maksimal 3 tips, integritas → kecepatan → kekuatan → kilau ---------- */

export interface AttemptFacts {
  rank: Rank;
  acc: number; // 0..1
  hp: number;
  wpm: number;
  modeDmg: number;
  errors: number;
  maxCombo: number;
  odUsed: boolean;
  allPerfect: boolean;
  topErrs: [string, number][]; // karakter salah terbanyak, terurut
  prevBestScore?: number;
  score: number;
}

const PUNCT = new Set(['"', "'", ";", "{", "}", "(", ")", ",", ".", ":", "=", "<", ">"]);

export function coachingTips(f: AttemptFacts): string[] {
  const tips: string[] = [];
  const accPct = Math.round(f.acc * 100);

  // integritas
  const punctErrors = f.topErrs.filter(([c]) => PUNCT.has(c)).reduce((a, [, n]) => a + n, 0);
  if (f.topErrs.length > 0 && punctErrors / Math.max(1, f.errors) >= 0.6) {
    const chars = f.topErrs
      .filter(([c]) => PUNCT.has(c))
      .slice(0, 2)
      .map(([c]) => `“${disp(c)}”`)
      .join(" dan ");
    tips.push(
      `${punctErrors} dari ${f.errors} salah terpusat di ${chars}. Perlambat di tanda baca — ketik karakter yang disorot, bukan yang dikejar.`
    );
  }
  if (f.rank !== "S" && f.hp < 70) {
    const maxErr = Math.floor(30 / f.modeDmg);
    tips.push(
      `Butuh maksimal ${maxErr} salah untuk S di mode ini; kamu salah ${f.errors} kali. Mode Santai (−${MODES.santai.dmg}/salah) memberi ruang ${Math.floor(30 / MODES.santai.dmg)} salah.`
    );
  }

  // kecepatan
  if (f.acc >= 0.92 && f.wpm < 40) {
    tips.push(
      `Akurasi ${accPct}% bagus, ritme ${f.wpm} WPM pelan. Tekan Enter segera di akhir baris — itu sumber WPM paling aman.`
    );
  }

  // kekuatan
  if (!f.odUsed) {
    tips.push("Overdrive tidak terpakai. Ketik bersih 1,7 karakter tanpa jeda mengisi gauge — ×2 selama 8 detik adalah lompatan skor terbesar.");
  }
  if (f.allPerfect && f.wpm < 60) {
    tips.push(`Semua baris sempurna — yang menahan rank cuma kecepatan (${f.wpm} WPM, ambang S 60). Naikkan ritme pelan-pelan.`);
  }

  // kilau
  if (f.prevBestScore != null && f.score <= f.prevBestScore) {
    tips.push(`Rekor masih ${f.prevBestScore.toLocaleString("id-ID")} — butuh +${(f.prevBestScore - f.score + 1).toLocaleString("id-ID")} poin untuk unggul.`);
  }

  return tips.slice(0, 3);
}

function disp(c: string): string {
  return c === "\n" ? "↵" : c === " " ? "␣" : c;
}
