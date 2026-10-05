import { useEffect, useState } from "react";
import type { Lesson } from "../data/lessons";
import { getModule } from "../data/lessons";
import { MODE_LIST, type ModeId } from "../lib/modes";
import { sfx } from "../lib/sound";
import { Highlight } from "../lib/highlight";
import {
  DiffDots,
  IconArrowLeft,
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconPlay,
  IconTarget,
  Panel,
  Reveal,
} from "./bits";

export default function LessonView({
  lesson,
  initialMode,
  onBack,
  onStart,
}: {
  lesson: Lesson;
  initialMode: ModeId;
  onBack: () => void;
  onStart: (mode: ModeId) => void;
}) {
  const mod = getModule(lesson.module);
  const slides = lesson.theory;
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<ModeId>(initialMode);
  const slide = slides[i];
  const last = i === slides.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((v) => Math.min(slides.length - 1, v + 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const go = (n: number) => {
    sfx.click();
    setI(n);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* bar atas */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            sfx.click();
            onBack();
          }}
          className="clip-btn border border-line bg-panel/70 px-3.5 py-2.5 text-dim hover:text-foam hover:border-dim/60 transition-colors flex items-center gap-2 text-[13px] font-medium cursor-pointer"
        >
          <IconArrowLeft className="w-4 h-4" />
          Peta Misi
        </button>
        <span
          className="clip-tag font-code text-[11px] tracking-[0.18em] px-3.5 py-1.5 border font-bold"
          style={{
            color: mod.color,
            borderColor: `${mod.color}55`,
            background: `${mod.color}14`,
          }}
        >
          DUNIA {mod.label} • MISI {lesson.number}/3
        </span>
        <div className="ml-auto flex items-center gap-3 text-dim">
          <DiffDots n={lesson.difficulty} color={mod.color} />
          <span className="font-code text-[11.5px]">+{lesson.xp} XP</span>
        </div>
      </div>

      <Reveal className="mt-6">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* teori */}
          <div key={`t-${i}`} className="anim-slide flex flex-col">
            <span
              className="clip-tag self-start font-code text-[10.5px] tracking-[0.22em] px-3 py-1 font-bold"
              style={{ background: `${mod.color}1c`, color: mod.color }}
            >
              {slide.kicker}
            </span>
            <h1 className="font-display font-bold text-[26px] sm:text-[32px] leading-tight mt-3.5">
              {slide.title}
            </h1>
            <div className="space-y-3.5 mt-4">
              {slide.body.map((p, j) => (
                <p key={j} className="text-foam/85 text-[15px] leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-auto pt-6">
              <button
                onClick={() => onStart(mode)}
                className="font-code text-[12px] text-dim hover:text-cyber transition-colors cursor-pointer"
              >
                Lewati teori, langsung praktikum →
              </button>
            </div>
          </div>

          {/* contoh kode / panel konsep */}
          <div key={`c-${i}`} className="anim-slide" style={{ animationDelay: "90ms" }}>
            {slide.code ? (
              <Panel clip="clip-panel-sm" className="overflow-hidden flex flex-col h-full">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-deep/70">
                  <span className="w-2.5 h-2.5 rounded-full bg-coral/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gold/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-mint/80" />
                  <span className="ml-2 font-code text-[11px] text-dim">
                    contoh.{lesson.module === "js" ? "js" : lesson.module}
                  </span>
                  <span
                    className="ml-auto font-code text-[9.5px] tracking-[0.2em] px-2 py-0.5 border"
                    style={{ color: mod.color, borderColor: `${mod.color}55` }}
                  >
                    {mod.label}
                  </span>
                </div>
                <div className="p-4 sm:p-5 overflow-x-auto flex-1">
                  <Highlight code={slide.code} lang={lesson.module} />
                </div>
                {slide.caption && (
                  <div className="px-4 py-2.5 border-t border-line/70 bg-deep/50 flex items-start gap-2 text-[12.5px] text-gold/90">
                    <IconBolt className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {slide.caption}
                  </div>
                )}
              </Panel>
            ) : (
              <Panel clip="clip-panel-sm" className="h-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center font-code font-bold text-[150px] text-hollow select-none pointer-events-none">
                  {mod.watermark}
                </span>
                <span
                  className="w-16 h-16 clip-panel-sm border flex items-center justify-center relative float-y"
                  style={{ borderColor: `${mod.color}55`, color: mod.color, background: `${mod.color}12` }}
                >
                  <IconTarget className="w-8 h-8" />
                </span>
                <p className="font-display font-bold text-lg mt-5 relative">Slide konsep murni</p>
                <p className="text-dim text-sm mt-2 max-w-xs relative">
                  Contoh kodenya langsung kamu ketik sendiri di praktikum. Lebih nempel di kepala!
                </p>
              </Panel>
            )}
          </div>
        </div>
      </Reveal>

      {/* pilih tantangan */}
      <Reveal delay={40}>
        <Panel clip="clip-panel-sm" className="mt-6 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <IconTarget className="w-4.5 h-4.5 text-coral shrink-0" />
            <div>
              <p className="font-display font-bold text-[14px]">PILIH TANTANGAN</p>
              <p className="font-code text-[10.5px] text-dim mt-0.5">
                Makin galak hiunya, makin besar XP-nya.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-2.5 mt-4">
            {MODE_LIST.map((m) => {
              const on = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sfx.click();
                    setMode(m.id);
                  }}
                  className={`clip-panel-sm border text-left px-4 py-3.5 transition-all duration-150 cursor-pointer ${
                    on ? "-translate-y-0.5" : "border-line hover:border-dim/50"
                  }`}
                  style={
                    on
                      ? {
                          borderColor: `${m.color}aa`,
                          background: `${m.color}14`,
                          boxShadow: `0 8px 24px ${m.color}22`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display font-black text-[14px] tracking-wide"
                      style={{ color: on ? m.color : "#dbeeff" }}
                    >
                      {m.label}
                    </span>
                    {on && (
                      <span style={{ color: m.color }}>
                        <IconCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-dim text-[12px] mt-1 leading-snug">{m.tagline}</p>
                  <div className="flex items-center gap-2 mt-2.5 font-code text-[10.5px] font-bold">
                    <span className="px-2 py-0.5 border" style={{ color: m.color, borderColor: `${m.color}55` }}>
                      XP {m.xpLabel}
                    </span>
                    <span className="text-dim">HP −{m.dmg}/salah</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      </Reveal>

      {/* navigasi slide */}
      <div className="flex items-center gap-4 mt-8">
        <div className="flex items-center gap-2.5">
          {slides.map((_, d) => (
            <button
              key={d}
              onClick={() => go(d)}
              aria-label={`Slide ${d + 1}`}
              className={`w-2.5 h-2.5 rotate-45 transition-all duration-200 cursor-pointer ${
                d === i ? "scale-125" : "opacity-40 hover:opacity-80"
              }`}
              style={{ background: d === i ? mod.color : "#7fa3c2" }}
            />
          ))}
          <span className="font-code text-[11px] text-dim ml-2">
            {i + 1}/{slides.length}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <button
            onClick={() => go(i - 1)}
            disabled={i === 0}
            className={`clip-btn border border-line px-4.5 py-3 text-[13px] font-display font-bold tracking-wider flex items-center gap-2 transition-colors ${
              i === 0
                ? "opacity-35 pointer-events-none text-dim"
                : "text-dim hover:text-foam hover:border-dim/60 cursor-pointer"
            }`}
          >
            <IconArrowLeft className="w-4 h-4" />
            MUNDUR
          </button>
          {last ? (
            <button
              onClick={() => {
                sfx.click();
                onStart(mode);
              }}
              className="clip-btn bg-gold text-[#231a05] font-display font-bold text-[13px] tracking-wider px-6 py-3 flex items-center gap-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,198,92,0.35)] active:translate-y-0 cursor-pointer"
            >
              <IconPlay className="w-4 h-4" />
              MULAI PRAKTIKUM
            </button>
          ) : (
            <button
              onClick={() => go(i + 1)}
              className="clip-btn bg-cyber text-[#04222e] font-display font-bold text-[13px] tracking-wider px-6 py-3 flex items-center gap-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(53,224,255,0.3)] active:translate-y-0 cursor-pointer"
            >
              LANJUT
              <IconArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
