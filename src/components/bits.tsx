import { useEffect, useRef, useState, type ReactNode } from "react";

type IconProps = { className?: string };

const S = ({
  children,
  className = "w-5 h-5",
}: IconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconShark = ({ className = "w-5 h-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M3 18.5C8 17 10.8 10.5 13.5 4.5c.9 4.2 1.3 9 1.6 14Z" fill="currentColor" />
    <path
      d="M2.5 20.2h19"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      opacity={0.6}
    />
  </svg>
);

export const IconTag = ({ className }: IconProps) => (
  <S className={className}>
    <path d="m8 7-5 5 5 5" />
    <path d="m16 7 5 5-5 5" />
    <path d="m13 5-2 14" />
  </S>
);

export const IconBrush = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M12 3c3.2 4.2 6 7.2 6 10.2a6 6 0 1 1-12 0C6 10.2 8.8 7.2 12 3Z" />
    <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
  </S>
);

export const IconBolt = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </S>
);

export const IconLock = ({ className }: IconProps) => (
  <S className={className}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </S>
);

export const IconPlay = ({ className = "w-5 h-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M7 4.8v14.4L19.5 12Z" fill="currentColor" />
  </svg>
);

export const IconPause = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M9 5v14" />
    <path d="M15 5v14" />
  </S>
);

export const IconTrophy = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
    <path d="M8 5H5v1.5A3.5 3.5 0 0 0 8.5 10" />
    <path d="M16 5h3v1.5A3.5 3.5 0 0 1 15.5 10" />
    <path d="M12 13v4" />
    <path d="M8 21h8" />
    <path d="M9 17h6v4H9z" />
  </S>
);

export const IconKeyboard = ({ className }: IconProps) => (
  <S className={className}>
    <rect x="2" y="7" width="20" height="11" rx="2" />
    <path d="M6 11h.01M10 11h.01M14 11h.01M18 11h.01M6 14.5h.01M18 14.5h.01M9 14.5h6" />
  </S>
);

export const IconSoundOn = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M4 10v4h3l4 4V6L7 10H4Z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
    <path d="M18 7a7 7 0 0 1 0 10" />
  </S>
);

export const IconSoundOff = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M4 10v4h3l4 4V6L7 10H4Z" />
    <path d="m16 9.5 5 5" />
    <path d="m21 9.5-5 5" />
  </S>
);

export const IconArrowLeft = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </S>
);

export const IconArrowRight = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </S>
);

export const IconChevronR = ({ className }: IconProps) => (
  <S className={className}>
    <path d="m9 5 7 7-7 7" />
  </S>
);

export const IconCheck = ({ className }: IconProps) => (
  <S className={className}>
    <path d="m4 12.5 5 5L20 6.5" />
  </S>
);

export const IconRefresh = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </S>
);

export const IconHome = ({ className }: IconProps) => (
  <S className={className}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </S>
);

export const IconEye = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);

export const IconCopy = ({ className }: IconProps) => (
  <S className={className}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </S>
);

export const IconSkull = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M12 3a8 8 0 0 0-8 8c0 3.2 1.8 5 3 6.2V21h10v-3.8c1.2-1.2 3-3 3-6.2a8 8 0 0 0-8-8Z" />
    <circle cx="9" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
    <path d="M10.5 21v-2.5M13.5 21v-2.5" />
  </S>
);

export const IconStar = ({ className }: IconProps) => (
  <S className={className}>
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.2 6-5.5-3-5.5 3 1.2-6L3.2 9.4l6.1-.8Z" />
  </S>
);

export const IconFlame = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 2.5s5.5 4.5 5.5 9.7a5.5 5.5 0 0 1-11 0c0-2.2 1-4.3 2.6-6C10.5 7.7 12 5.5 12 2.5Z"
      fill="currentColor"
    />
  </svg>
);

export const IconTarget = ({ className }: IconProps) => (
  <S className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </S>
);

export const IconClock = ({ className }: IconProps) => (
  <S className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </S>
);

export const IconHistory = ({ className }: IconProps) => (
  <S className={className}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.4" />
    <path d="M3.5 3.5v5h5" />
    <path d="M12 7.5V12l3 2" />
  </S>
);

/* ---------------- UI kit ---------------- */

export function Panel({
  children,
  className = "",
  clip = "clip-panel",
}: {
  children: ReactNode;
  className?: string;
  clip?: "clip-panel" | "clip-panel-sm" | "clip-btn" | "";
}) {
  return (
    <div className={`bg-panel/85 border border-line ${clip} ${className}`}>{children}</div>
  );
}

export function KeyCap({ children }: { children: ReactNode }) {
  return <span className="keycap">{children}</span>;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${on ? "revealed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CountUp({
  value,
  className = "",
  duration = 900,
  suffix = "",
}: {
  value: number;
  className?: string;
  duration?: number;
  suffix?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      setV(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <span className={className}>
      {v.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

export function Bar({
  pct,
  color = "var(--color-cyber)",
  className = "",
}: {
  pct: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`h-2 bg-deep border border-line/70 overflow-hidden ${className}`}>
      <div
        className="h-full transition-all duration-700 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </div>
  );
}

export function DiffDots({ n, color }: { n: number; color: string }) {
  return (
    <span className="inline-flex gap-1 items-center" title={`Kesulitan ${n}/3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i <= n ? color : "#1c3a57" }}
        />
      ))}
    </span>
  );
}
