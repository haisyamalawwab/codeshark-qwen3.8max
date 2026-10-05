import type { Rank } from "./storage";

export const RANK_META: Record<Rank, { label: string; color: string; quote: string }> = {
  S: {
    label: "SEMPURNA",
    color: "#ffc65c",
    quote: "Nyaris tanpa cela. Jari-jarimu lahir untuk keyboard ini!",
  },
  A: {
    label: "HEBAT",
    color: "#35e0ff",
    quote: "Akurasi kelas atas. Sedikit lagi menuju Rank S!",
  },
  B: {
    label: "BAGUS",
    color: "#3dffa8",
    quote: "Solid! Jaga combo biar skor makin ngebut.",
  },
  C: {
    label: "LULUS",
    color: "#7fa3c2",
    quote: "Misi selesai. Ulangi kapan saja untuk skor lebih tinggi!",
  },
};
