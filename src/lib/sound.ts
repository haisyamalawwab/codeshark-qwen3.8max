/* Mesin suara mini berbasis WebAudio — tanpa file aset. */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "square",
  vol = 0.05,
  when = 0,
  slideTo = 0
) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    const t0 = c.currentTime + when;
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo > 0) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  } catch {
    /* abaikan */
  }
}

export const sfx = {
  tick(combo: number) {
    tone(500 + Math.min(combo, 40) * 13, 0.045, "square", 0.024);
  },
  error() {
    tone(160, 0.16, "sawtooth", 0.055, 0, 90);
    tone(95, 0.2, "sawtooth", 0.045, 0.03);
  },
  line() {
    tone(660, 0.07, "square", 0.04);
    tone(990, 0.1, "square", 0.04, 0.06);
  },
  count() {
    tone(440, 0.09, "square", 0.05);
  },
  go() {
    tone(880, 0.12, "square", 0.055);
    tone(1320, 0.16, "square", 0.045, 0.09);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.15, "square", 0.05, i * 0.11));
  },
  fail() {
    [330, 262, 185].forEach((f, i) => tone(f, 0.22, "sawtooth", 0.05, i * 0.15));
  },
  click() {
    tone(700, 0.05, "triangle", 0.04);
  },
  level() {
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.16, "triangle", 0.05, i * 0.09));
  },
  milestone(tier: number) {
    const base = 620 + tier * 110;
    tone(base, 0.08, "square", 0.05);
    tone(base * 1.5, 0.12, "square", 0.045, 0.07);
  },
  heal() {
    tone(660, 0.07, "sine", 0.05);
    tone(990, 0.1, "sine", 0.04, 0.06);
  },
  overdrive() {
    tone(200, 0.5, "sawtooth", 0.05, 0, 900);
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, "square", 0.045, 0.1 + i * 0.06));
  },
  /** Overdrive aktif setelah telegraph — ledakan singkat. */
  odGo() {
    tone(90, 0.3, "sawtooth", 0.06, 0, 45);
    tone(523, 0.1, "square", 0.05);
    tone(1046, 0.16, "square", 0.045, 0.08);
  },
  /** Telegraph 1,5 dtk sebelum overdrive aktif — riser. */
  odReady() {
    tone(160, 1.3, "sawtooth", 0.04, 0, 760);
  },
  /** Toast tips kontekstual — halus, tidak mengganggu. */
  tip() {
    tone(880, 0.06, "sine", 0.028);
    tone(1174, 0.09, "sine", 0.022, 0.07);
  },
  odEnd() {
    tone(500, 0.16, "triangle", 0.035, 0, 240);
  },
};
