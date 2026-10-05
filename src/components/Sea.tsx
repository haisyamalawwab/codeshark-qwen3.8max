import type { CSSProperties, ReactNode } from "react";

/**
 * Kumpulan makhluk laut lucu (SVG murni, tanpa aset) + elemen jalur/checkpoint.
 * Semua animasi murni CSS (lihat bagian "sea creatures" di index.css).
 */

interface SeaProps {
  className?: string;
  color?: string;
  style?: CSSProperties;
}

const INK = "#0b2233";

/* ---------------- Ikan ---------------- */

export function Fish({ className = "w-14", color = "#35e0ff", style }: SeaProps) {
  return (
    <svg viewBox="0 0 76 46" className={className} style={style} aria-hidden="true">
      <g className="fish-tail">
        <path d="M18 23 L3 11 Q8 23 3 35 Z" fill={color} opacity=".9" />
      </g>
      <path d="M32 9.5 Q40 1 48 9.5 Q40 12.5 32 9.5 Z" fill={color} opacity=".85" />
      <path d="M30 35.5 Q35 42.5 42 36.5 Q36 33 30 35.5 Z" fill={color} opacity=".8" />
      <ellipse cx="38" cy="23" rx="23" ry="15" fill={color} />
      <ellipse cx="34" cy="29" rx="13" ry="6" fill="#ffffff" opacity=".22" />
      <path d="M36 24 Q44 28 38 33 Q34 28.5 36 24 Z" fill={color} opacity=".75" />
      <path d="M50 14 Q46 23 50 32" stroke="rgba(0,0,0,.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="56" cy="18" r="3.4" fill={INK} />
      <circle cx="57.2" cy="16.8" r="1.1" fill="#fff" />
      <path d="M57.5 26.5 Q59.5 28.5 61.5 26.5" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="53" cy="24" r="1.8" fill="#ff9db0" opacity=".55" />
    </svg>
  );
}

/* ---------------- Hiu maskot ---------------- */

export function Sharky({ className = "w-20", color = "#5fb9e6", style }: SeaProps) {
  return (
    <svg viewBox="0 0 92 58" className={className} style={style} aria-hidden="true">
      <g className="shark-tail">
        <path d="M20 29 L4 15 Q11 29 4 43 Z" fill={color} opacity=".9" />
      </g>
      <path d="M42 12.5 Q50 0 58 12.5 Q50 15.5 42 12.5 Z" fill={color} opacity=".9" />
      <ellipse cx="48" cy="29" rx="30" ry="18" fill={color} />
      <ellipse cx="44" cy="38" rx="20" ry="7" fill="#eaf6ff" opacity=".35" />
      <path d="M52 34 Q58 42 48 44 Q46 38 52 34 Z" fill={color} opacity=".75" />
      <path d="M58 22 Q56 29 58 36" stroke="rgba(0,0,0,.22)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M63 22 Q61 29 63 36" stroke="rgba(0,0,0,.22)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="70" cy="22" r="3.6" fill={INK} />
      <circle cx="71.2" cy="20.8" r="1.2" fill="#fff" />
      <path d="M68 35 Q72 39 77 35" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M71 36.4 L73 39.4 L75 36.6 Z" fill="#fff" />
      <circle cx="66" cy="30" r="2" fill="#ff9db0" opacity=".5" />
    </svg>
  );
}

/* ---------------- Ubur-ubur ---------------- */

export function Jellyfish({ className = "w-12", color = "#ff5d73", style }: SeaProps) {
  const tent = [
    "M16 40 Q12 52 18 62 Q22 68 18 74",
    "M27 42 Q25 54 29 64 Q31 70 28 75",
    "M37 42 Q39 54 35 64 Q33 70 36 75",
    "M48 40 Q52 52 46 62 Q42 68 46 74",
  ];
  return (
    <svg viewBox="0 0 64 78" className={className} style={style} aria-hidden="true">
      {tent.map((d, i) => (
        <path
          key={i}
          d={d}
          className="tentacle"
          style={{ animationDelay: `${-0.55 * i}s` }}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity=".85"
        />
      ))}
      <path
        d="M10 34 Q10 8 32 8 Q54 8 54 34 Q54 39 47 37 Q40 43 32 38 Q24 43 17 37 Q10 39 10 34 Z"
        fill={color}
      />
      <ellipse cx="32" cy="21" rx="14" ry="9" fill="#ffffff" opacity=".18" />
      <circle cx="25" cy="24" r="2.6" fill={INK} />
      <circle cx="39" cy="24" r="2.6" fill={INK} />
      <circle cx="26" cy="23" r=".9" fill="#fff" />
      <circle cx="40" cy="23" r=".9" fill="#fff" />
      <path d="M28 29 Q32 32 36 29" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="28" r="1.7" fill="#ff9db0" opacity=".6" />
      <circle cx="44" cy="28" r="1.7" fill="#ff9db0" opacity=".6" />
    </svg>
  );
}

/* ---------------- Kepiting ---------------- */

export function Crab({ className = "w-16", color = "#ff8a5c", style }: SeaProps) {
  return (
    <svg viewBox="0 0 76 54" className={className} style={style} aria-hidden="true">
      <g stroke={color} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M20 34 L8 42" />
        <path d="M22 38 L10 48" />
        <path d="M26 41 L18 52" />
        <path d="M56 34 L68 42" />
        <path d="M54 38 L66 48" />
        <path d="M50 41 L58 52" />
      </g>
      <g className="claw-snap">
        <path d="M20 26 Q12 20 10 14" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M12 5 A6.5 6.5 0 1 0 12 15" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
      <path d="M56 26 Q64 20 66 14" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M64 5 A6.5 6.5 0 1 1 64 15" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <ellipse cx="38" cy="32" rx="17" ry="12" fill={color} />
      <path d="M32 22 L30 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 22 L46 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="10" r="4.5" fill="#fff" />
      <circle cx="46" cy="10" r="4.5" fill="#fff" />
      <circle cx="30.6" cy="10.6" r="2" fill={INK} />
      <circle cx="45.4" cy="10.6" r="2" fill={INK} />
      <path d="M34 34 Q38 37.5 42 34" stroke={INK} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <circle cx="27" cy="34" r="1.8" fill="#ffd0d8" opacity=".7" />
      <circle cx="49" cy="34" r="1.8" fill="#ffd0d8" opacity=".7" />
    </svg>
  );
}

/* ---------------- Penyu ---------------- */

export function Turtle({ className = "w-20", color = "#57d9a3", style }: SeaProps) {
  return (
    <svg viewBox="0 0 84 56" className={className} style={style} aria-hidden="true">
      <g className="flapper">
        <path d="M16 34 Q8 40 6 46 Q14 46 20 40 Z" fill={color} opacity=".85" />
      </g>
      <g className="flapper" style={{ animationDelay: "-.7s" }}>
        <path d="M56 38 Q58 50 48 52 Q46 44 52 40 Z" fill={color} opacity=".9" />
      </g>
      <path
        d="M16 34 Q16 12 42 12 Q68 12 68 34 Q55 40 42 40 Q29 40 16 34 Z"
        fill={color}
      />
      <circle cx="31" cy="24" r="4" fill="rgba(0,0,0,.14)" />
      <circle cx="45" cy="20" r="3.5" fill="rgba(0,0,0,.14)" />
      <circle cx="55" cy="28" r="4" fill="rgba(0,0,0,.14)" />
      <circle cx="74" cy="26" r="8" fill={color} />
      <circle cx="76.5" cy="24" r="1.8" fill={INK} />
      <circle cx="77.2" cy="23.3" r=".6" fill="#fff" />
      <path d="M77 29.5 Q79 31 81 29.5" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M20 36 Q42 43 64 36" stroke="rgba(0,0,0,.12)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- Kuda laut ---------------- */

export function Seahorse({ className = "w-9", color = "#ff9db0", style }: SeaProps) {
  return (
    <svg viewBox="0 0 44 74" className={className} style={style} aria-hidden="true">
      <path d="M36 28 Q44 34 38 42 Q34 38 34 32 Z" fill={color} opacity=".8" />
      <path
        d="M28 18 Q36 32 27 46 Q22 54 30 60"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 60 Q22 66 27 70 Q31 71 32 67"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="27" cy="13" r="10" fill={color} />
      <path d="M19 11 L6 15" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path d="M27 3 L24 7 L30 7 Z" fill={color} />
      <circle cx="29" cy="11" r="2" fill={INK} />
      <circle cx="29.7" cy="10.3" r=".7" fill="#fff" />
      <circle cx="22" cy="16" r="1.6" fill="#ffd0d8" opacity=".8" />
    </svg>
  );
}

/* ---------------- Gurita ---------------- */

export function Octopus({ className = "w-12", color = "#ff5d73", style }: SeaProps) {
  const tent = [
    "M16 38 Q10 50 18 58 Q22 63 18 67",
    "M26 42 Q23 54 28 62 Q30 66 27 68",
    "M38 42 Q41 54 36 62 Q34 66 37 68",
    "M48 38 Q54 50 46 58 Q42 63 46 67",
  ];
  return (
    <svg viewBox="0 0 64 70" className={className} style={style} aria-hidden="true">
      {tent.map((d, i) => (
        <path
          key={i}
          d={d}
          className="tentacle"
          style={{ animationDelay: `${-0.5 * i}s` }}
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity=".9"
        />
      ))}
      <ellipse cx="32" cy="24" rx="21" ry="17" fill={color} />
      <ellipse cx="26" cy="15" rx="6" ry="4" fill="#fff" opacity=".2" />
      <circle cx="24" cy="22" r="5" fill="#fff" />
      <circle cx="40" cy="22" r="5" fill="#fff" />
      <circle cx="24.8" cy="22.8" r="2.4" fill={INK} />
      <circle cx="39.2" cy="22.8" r="2.4" fill={INK} />
      <circle cx="25.6" cy="22" r=".8" fill="#fff" />
      <circle cx="40" cy="22" r=".8" fill="#fff" />
      <path d="M28 30 Q32 34 36 30" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="17" cy="27" r="2" fill="#ffd0d8" opacity=".7" />
      <circle cx="47" cy="27" r="2" fill="#ffd0d8" opacity=".7" />
    </svg>
  );
}

/* ---------------- Bintang laut ---------------- */

export function Starfish({ className = "w-10", color = "#ffc65c", style }: SeaProps) {
  return (
    <svg viewBox="0 0 56 56" className={className} style={style} aria-hidden="true">
      <path
        d="M28 4 Q33 18 47 22 Q35 29 38 45 Q28 36 18 45 Q21 29 9 22 Q23 18 28 4 Z"
        fill={color}
      />
      <circle cx="28" cy="15" r="1.5" fill="rgba(0,0,0,.13)" />
      <circle cx="20" cy="24" r="1.5" fill="rgba(0,0,0,.13)" />
      <circle cx="36" cy="24" r="1.5" fill="rgba(0,0,0,.13)" />
      <circle cx="24" cy="34" r="1.5" fill="rgba(0,0,0,.13)" />
      <circle cx="32" cy="34" r="1.5" fill="rgba(0,0,0,.13)" />
      <circle cx="24" cy="26" r="2" fill={INK} />
      <circle cx="32" cy="26" r="2" fill={INK} />
      <circle cx="24.7" cy="25.3" r=".7" fill="#fff" />
      <circle cx="32.7" cy="25.3" r=".7" fill="#fff" />
      <path d="M25 31 Q28 34 31 31" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="19.5" cy="29.5" r="1.8" fill="#ffd0d8" opacity=".75" />
      <circle cx="36.5" cy="29.5" r="1.8" fill="#ffd0d8" opacity=".75" />
    </svg>
  );
}

/* ---------------- Ikan buntal ---------------- */

export function Pufferfish({ className = "w-14", color = "#ffd479", style }: SeaProps) {
  return (
    <svg viewBox="0 0 64 56" className={className} style={style} aria-hidden="true">
      <g className="puff">
        <circle cx="31" cy="28" r="21" fill="none" stroke={color} strokeWidth="4" strokeDasharray="4 6" opacity=".9" />
        <path d="M12 26 L2 20 L5 28 L2 36 L12 30 Z" fill={color} opacity=".85" />
        <circle cx="32" cy="28" r="17" fill={color} />
        <ellipse cx="29" cy="35" rx="11" ry="6" fill="#fff" opacity=".25" />
        <path d="M30 26 Q38 28 34 36 Q28 32 30 26 Z" fill={color} opacity=".7" />
        <circle cx="42" cy="23" r="5.5" fill="#fff" />
        <circle cx="43" cy="23.6" r="2.6" fill={INK} />
        <circle cx="44" cy="22.6" r=".9" fill="#fff" />
        <path d="M44 32.5 Q46 34 48 32.5" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="38" cy="31" r="2" fill="#ff9db0" opacity=".6" />
      </g>
    </svg>
  );
}

/* ---------------- Rumput laut ---------------- */

export function Seaweed({ className = "w-8 h-20", color = "#2f9e6e", style }: SeaProps) {
  return (
    <svg viewBox="0 0 40 84" className={className} style={style} aria-hidden="true">
      <path
        d="M10 84 Q4 64 12 48 Q18 36 10 20"
        className="seaweed"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 84 Q28 60 20 42 Q14 28 24 10"
        className="seaweed"
        style={{ animationDelay: "-1.2s" }}
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity=".9"
      />
      <path
        d="M33 84 Q38 66 30 52 Q25 42 32 30"
        className="seaweed"
        style={{ animationDelay: "-2.1s" }}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity=".8"
      />
    </svg>
  );
}

/* ---------------- Pelampung checkpoint ---------------- */

export function Buoy({
  state,
  color = "#35e0ff",
  className = "w-8",
  style,
}: SeaProps & { state: "passed" | "next" | "locked" }) {
  const flagColor = state === "passed" ? "#ffc65c" : state === "next" ? color : "#3a5470";
  const bodyColor = state === "locked" ? "#22384f" : state === "passed" ? "#ffc65c" : color;
  return (
    <svg viewBox="0 0 44 62" className={className} style={style} aria-hidden="true">
      <rect x="20.5" y="6" width="3" height="30" rx="1.5" fill={state === "locked" ? "#3a5470" : "#7fa3c2"} />
      {state === "locked" ? (
        <path d="M23.5 9 L36 14.5 L23.5 19 Z" fill={flagColor} opacity=".7" />
      ) : (
        <path className="flag-wave" d="M23.5 7 L42 13.5 L23.5 20 Z" fill={flagColor} />
      )}
      <path
        d="M12 40 Q12 35 18 35 L26 35 Q32 35 32 40 L30 53 Q30 57 25 57 L19 57 Q14 57 14 53 Z"
        fill={bodyColor}
      />
      <path d="M12.6 44 L31.4 44 L30.7 49 L13.3 49 Z" fill="#ffffff" opacity=".28" />
      <circle
        cx="22"
        cy="32"
        r="3"
        fill={state === "passed" ? "#fff3c4" : "#dbeeff"}
        opacity={state === "locked" ? 0.4 : 1}
      />
      {state === "passed" && (
        <circle cx="22" cy="32" r="5.5" fill="none" stroke="#ffc65c" strokeWidth="1.2" opacity=".6" />
      )}
      <path
        d="M0 59 Q5 55 10 59 T20 59 T30 59 T40 59"
        fill="none"
        stroke={state === "locked" ? "#1c3a57" : "#35e0ff"}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={state === "locked" ? 0.5 : 0.65}
      />
    </svg>
  );
}

/* ---------------- Penghubung jalur antar misi ---------------- */

export function PathLink({
  state,
  color = "#35e0ff",
}: {
  state: "passed" | "next" | "locked";
  color?: string;
}) {
  const lineColor = state === "passed" ? "#ffc65c" : state === "next" ? color : "#1c3a57";
  return (
    <div
      className="hidden sm:flex flex-col items-center justify-center gap-1 w-11 shrink-0 self-center relative"
      aria-hidden="true"
    >
      <Buoy state={state} color={color} className="w-7 h-10" />
      <svg viewBox="0 0 44 12" className="w-11 h-3">
        <path
          d="M0 6 Q5.5 0 11 6 T22 6 T33 6 T44 6"
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={state === "passed" ? undefined : "1 7"}
          className={state === "next" ? "dash-march" : undefined}
          opacity={state === "locked" ? 0.5 : 0.9}
        />
      </svg>
    </div>
  );
}

/* ---------------- Bendera checkpoint mini (bar progres) ---------------- */

export function MiniFlag({ className = "w-2.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 16" className={className} aria-hidden="true">
      <rect x="1" y="1" width="2" height="15" rx="1" fill="currentColor" />
      <path d="M4 2 L11 4.5 L4 7 Z" fill="currentColor" />
    </svg>
  );
}

/* ---------------- Sprint lintas panel (micro-interaction) ---------------- */

export function FishSprint({
  top = "30%",
  delay = 0,
  color = "#35e0ff",
  w = 48,
}: {
  top?: string;
  delay?: number;
  color?: string;
  w?: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
      <div className="absolute left-0 sprint-fish" style={{ top, animationDelay: `${delay}ms` }}>
        <Fish className="swim-bob" color={color} style={{ width: w }} />
      </div>
    </div>
  );
}

/** Hiu berlari mengejar sekawanan ikan kecil — dipicu Overdrive. */
export function SharkSprint() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30" aria-hidden="true">
      <div className="absolute left-0 top-[6%] sprint-fish" style={{ animationDuration: "1.15s" }}>
        <Fish className="swim-bob" color="#3dffa8" style={{ width: 26 }} />
      </div>
      <div
        className="absolute left-0 top-[22%] sprint-fish"
        style={{ animationDelay: "50ms", animationDuration: "1.2s" }}
      >
        <Fish className="swim-bob" color="#35e0ff" style={{ width: 34 }} />
      </div>
      <div className="absolute left-0 top-[13%] sprint-shark" style={{ animationDelay: "160ms" }}>
        <Sharky className="w-24" />
      </div>
    </div>
  );
}

/* ---------------- Maskot dengan gelembung saat disentuh ---------------- */

export function Mascot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block mascot ${className}`} aria-hidden="true">
      {children}
      <span className="bubble-mini absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-cyber/60" />
      <span className="bubble-mini absolute -top-2.5 right-2.5 w-2 h-2 rounded-full bg-cyber/40" />
      <span className="bubble-mini absolute top-0 right-5 w-1 h-1 rounded-full bg-cyber/50" />
    </span>
  );
}
