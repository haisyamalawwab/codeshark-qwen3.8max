import { useMemo } from "react";
import { Fish, Jellyfish, Pufferfish, Seaweed, Starfish, Turtle } from "./Sea";

export default function Background() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: (i * 61 + 7) % 100,
        size: 5 + ((i * 37) % 20),
        dur: 10 + ((i * 53) % 16),
        delay: -((i * 97) % 22),
        op: 0.06 + ((i * 29) % 10) / 80,
      })),
    []
  );
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-glow" />
      <div className="absolute inset-0 bg-grid" />
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            opacity: b.op,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {/* penghuni laut yang berenang perlahan di kejauhan */}
      <div
        className="absolute left-0 top-[14%] swim-across opacity-[0.17]"
        style={{ "--dur": "52s", animationDelay: "-18s" } as React.CSSProperties}
      >
        <Fish className="w-16" color="#35e0ff" />
      </div>
      <div
        className="absolute left-0 top-[30%] swim-across-rev opacity-[0.12]"
        style={{ "--dur": "72s", animationDelay: "-41s" } as React.CSSProperties}
      >
        <Fish className="w-10" color="#3dffa8" />
      </div>
      <div
        className="absolute left-0 top-[66%] swim-across opacity-[0.14]"
        style={{ "--dur": "96s", animationDelay: "-62s" } as React.CSSProperties}
      >
        <Turtle className="w-20" />
      </div>
      <div
        className="absolute left-0 top-[47%] swim-across opacity-[0.1]"
        style={{ "--dur": "84s", animationDelay: "-12s" } as React.CSSProperties}
      >
        <Pufferfish className="w-12" />
      </div>

      {/* ubur-ubur mengapung */}
      <div className="absolute right-[5%] top-[34%] jelly-drift opacity-[0.22]">
        <Jellyfish className="w-12" color="#ff5d73" />
      </div>
      <div
        className="absolute left-[3%] top-[52%] jelly-drift opacity-[0.15]"
        style={{ animationDelay: "-4.5s" }}
      >
        <Jellyfish className="w-8" color="#ffc65c" />
      </div>

      {/* dasar laut */}
      <div className="absolute -bottom-1 left-[2%] opacity-30 flex items-end gap-1">
        <Seaweed className="w-8 h-24" />
        <Seaweed className="w-6 h-16" color="#3db987" style={{ animationDelay: "-1s" }} />
        <Seaweed className="w-9 h-28" style={{ animationDelay: "-2s" }} />
      </div>
      <div className="absolute -bottom-1 right-[4%] opacity-25 flex items-end gap-1">
        <Seaweed className="w-7 h-20" color="#3db987" />
        <Seaweed className="w-9 h-28" style={{ animationDelay: "-1.6s" }} />
      </div>
      <Starfish className="w-10 absolute bottom-3 left-[13%] opacity-35 star-wiggle" color="#ff9db0" />
      <Starfish
        className="w-7 absolute bottom-4 right-[16%] opacity-30 star-wiggle"
        color="#ffc65c"
        style={{ animationDelay: "-1.4s" }}
      />

      <div className="absolute inset-0 scanlines" />
    </div>
  );
}
