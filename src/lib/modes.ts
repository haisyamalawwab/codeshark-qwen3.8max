export type ModeId = "santai" | "standar" | "nitro";

export interface ModeInfo {
  id: ModeId;
  label: string;
  tagline: string;
  color: string;
  /** HP yang hilang per salah ketik */
  dmg: number;
  /** Pengali XP saat misi selesai */
  xpMult: number;
  xpLabel: string;
}

export const MODES: Record<ModeId, ModeInfo> = {
  santai: {
    id: "santai",
    label: "SANTAI",
    tagline: "Damage ringan untuk pemanasan jari.",
    color: "#3dffa8",
    dmg: 5,
    xpMult: 0.8,
    xpLabel: "×0.8",
  },
  standar: {
    id: "standar",
    label: "STANDAR",
    tagline: "Keseimbangan klasik arcade.",
    color: "#35e0ff",
    dmg: 9,
    xpMult: 1,
    xpLabel: "×1",
  },
  nitro: {
    id: "nitro",
    label: "HIU GALAK",
    tagline: "Damage brutal — hanya untuk pemberani.",
    color: "#ff5d73",
    dmg: 14,
    xpMult: 1.6,
    xpLabel: "×1.6",
  },
};

export const MODE_LIST: ModeInfo[] = [MODES.santai, MODES.standar, MODES.nitro];

export const isModeId = (v: unknown): v is ModeId =>
  v === "santai" || v === "standar" || v === "nitro";
