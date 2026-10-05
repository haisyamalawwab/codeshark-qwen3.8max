/* Deteksi perangkat sentuh — dipakai untuk badge "butuh keyboard" dan soft keyboard. */

let cached: boolean | null = null;

export function isCoarsePointer(): boolean {
  if (cached !== null) return cached;
  try {
    cached =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
  } catch {
    cached = false;
  }
  return cached;
}
