import { LESSONS, MODULES, moduleLessons } from "../data/lessons";
import type { LessonResult, Profile } from "./storage";

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon:
    | "play"
    | "shark"
    | "flame"
    | "target"
    | "clock"
    | "bolt"
    | "skull"
    | "refresh"
    | "trophy"
    | "star";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-win",
    name: "Langkah Pertama",
    desc: "Selesaikan misi pertamamu.",
    icon: "play",
  },
  {
    id: "rank-s",
    name: "Gigi Hiu",
    desc: "Raih Rank S di misi mana pun.",
    icon: "shark",
  },
  {
    id: "combo-50",
    name: "Rantai Api",
    desc: "Capai combo 50 tanpa salah.",
    icon: "flame",
  },
  {
    id: "perfect",
    name: "Tanpa Cela",
    desc: "Selesaikan misi tanpa satu pun salah ketik.",
    icon: "target",
  },
  {
    id: "speed-60",
    name: "Jari Kilat",
    desc: "Capai 60 WPM atau lebih.",
    icon: "clock",
  },
  {
    id: "overdrive",
    name: "Overdrive!",
    desc: "Picu mode Overdrive untuk pertama kali.",
    icon: "bolt",
  },
  {
    id: "comeback",
    name: "Nyaris Tenggelam",
    desc: "Selesaikan misi dengan HP tersisa ≤ 20.",
    icon: "skull",
  },
  {
    id: "nitro-win",
    name: "Penakluk Hiu Galak",
    desc: "Selesaikan misi apa pun di mode HIU GALAK.",
    icon: "refresh",
  },
  {
    id: "world-master",
    name: "Penakluk Dunia",
    desc: "Tuntaskan ketiga misi di satu dunia (HTML/CSS/JS).",
    icon: "trophy",
  },
  {
    id: "full-clear",
    name: "Master Samudra",
    desc: "Tuntaskan seluruh 9 misi CodeShark.",
    icon: "star",
  },
];

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);

/**
 * Cek pencapaian baru berdasarkan hasil misi terbaru.
 * `profile` adalah profil SETELAH hasil misi ini dicatat.
 * Mengembalikan daftar id pencapaian yang baru terbuka (belum pernah terbuka sebelumnya).
 */
export function evaluateAchievements(profile: Profile, r: LessonResult): string[] {
  const fresh: string[] = [];
  const claim = (id: string, ok: boolean) => {
    if (ok && !profile.achievements[id] && !fresh.includes(id)) fresh.push(id);
  };

  const results = profile.results;
  const doneCount = Object.keys(results).length;

  claim("first-win", doneCount >= 1);
  claim("rank-s", r.rank === "S");
  claim("combo-50", r.maxCombo >= 50);
  claim("perfect", r.errors === 0 && doneCount >= 1);
  claim("speed-60", r.wpm >= 60);
  claim("overdrive", r.overdriveUsed);
  claim("comeback", r.hpLeft > 0 && r.hpLeft <= 20);
  claim("nitro-win", r.mode === "nitro");
  claim(
    "world-master",
    MODULES.some((m) => moduleLessons(m.id).every((l) => !!results[l.id]))
  );
  claim("full-clear", LESSONS.every((l) => !!results[l.id]));

  return fresh;
}
