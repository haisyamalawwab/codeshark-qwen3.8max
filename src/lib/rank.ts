/* Helper UI syarat rank — murni tampilan, tidak mengubah aturan skor.
 * Ambang S: akurasi ≥97% + HP ≥70 (sama dengan getRank di TypingGame).
 * WPM belum masuk rumus rank — chip-nya indikator ritme (ambang 60). */

import type { Rank } from "./storage";

export type RankChip = {
  key: "acc" | "hp" | "wpm";
  label: string;
  ok: boolean;
  near: boolean; // sudah ≥80% ambang
  value: number;
};

export const S_ACC = 0.97;
export const S_HP = 70;
export const S_WPM = 60;

export function rankChips(acc: number, hp: number, wpm: number): RankChip[] {
  const accPct = Math.round(acc * 100);
  return [
    { key: "acc", label: "ACC", ok: acc >= S_ACC, near: acc >= S_ACC * 0.8, value: accPct },
    { key: "hp", label: "HP", ok: hp >= S_HP, near: hp >= S_HP * 0.8, value: hp },
    { key: "wpm", label: "WPM", ok: wpm >= S_WPM, near: wpm >= S_WPM * 0.8, value: wpm },
  ];
}

export const RANK_TOOLTIP = "Rank S butuh akurasi ≥97% + HP ≥70. Kecepatan (WPM ≥60) jadi pembeda ritme.";

/** Syarat yang belum terpenuhi — untuk kalimat coaching. */
export function unmetForS(chips: RankChip[]): string {
  return chips.filter((c) => !c.ok).map((c) => c.label).join(" + ");
}

export function nextRankName(rank: Rank): string {
  return rank === "S" ? "S" : rank === "A" ? "S" : rank === "B" ? "A" : "B";
}
