import { useMemo, useState } from "react";
import type { Lesson } from "../data/lessons";
import { getModule } from "../data/lessons";
import { sfx } from "../lib/sound";
import { Highlight } from "../lib/highlight";
import { IconCheck, IconCopy, IconHome, IconRefresh, Panel } from "./bits";

export default function PreviewView({
  lesson,
  typed,
  onMenu,
  onRetry,
}: {
  lesson: Lesson;
  typed: string;
  onMenu: () => void;
  onRetry: () => void;
}) {
  const mod = getModule(lesson.module);
  const doc = useMemo(() => lesson.buildPreview(typed), [lesson, typed]);
  const [tab, setTab] = useState<"preview" | "kode">("preview");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      ?.writeText(typed)
      .then(() => {
        setCopied(true);
        sfx.click();
        setTimeout(() => setCopied(false), 1700);
      })
      .catch(() => {});
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="clip-tag font-code text-[11px] tracking-[0.18em] px-3.5 py-1.5 border font-bold"
          style={{ color: mod.color, borderColor: `${mod.color}55`, background: `${mod.color}14` }}
        >
          HASIL PRAKTIKUM
        </span>
        <h1 className="font-display font-bold text-lg sm:text-xl min-w-0 truncate">
          {lesson.title}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              sfx.click();
              onRetry();
            }}
            className="clip-btn border border-cyber/50 text-cyber hover:bg-cyber/10 px-4 py-2.5 font-display text-[12px] tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <IconRefresh className="w-4 h-4" />
            MAIN LAGI
          </button>
          <button
            onClick={() => {
              sfx.click();
              onMenu();
            }}
            className="clip-btn border border-line bg-panel/70 px-4 py-2.5 text-dim hover:text-foam hover:border-dim/60 font-display text-[12px] tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <IconHome className="w-4 h-4" />
            PETA MISI
          </button>
        </div>
      </div>

      {/* strip live */}
      <Panel clip="clip-panel-sm" className="mt-4 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-mint live-dot shrink-0" />
        <p className="text-[13px] text-foam/85">
          Preview di bawah <span className="font-bold text-foam">menjalankan kode yang KAMU ketik</span>{" "}
          — 100% hasil jarimu.
        </p>
        <button
          onClick={copy}
          className={`ml-auto clip-btn border px-3.5 py-2 font-code text-[11.5px] tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${
            copied
              ? "border-mint/60 text-mint bg-mint/10"
              : "border-line text-dim hover:text-foam hover:border-dim/60"
          }`}
        >
          {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
          {copied ? "TERSALIN!" : "SALIN KODE"}
        </button>
      </Panel>

      {/* tab mobile */}
      <div className="grid grid-cols-2 gap-2 mt-4 lg:hidden">
        {(["preview", "kode"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              sfx.click();
              setTab(t);
            }}
            className={`clip-btn font-display text-[12px] tracking-wider py-2.5 border transition-colors cursor-pointer ${
              tab === t
                ? "bg-cyber text-[#04222e] border-cyber"
                : "border-line text-dim hover:text-foam"
            }`}
          >
            {t === "preview" ? "PREVIEW" : "KODE"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <div className={`lg:col-span-3 ${tab === "preview" ? "block" : "hidden"} lg:block`}>
          <Panel clip="clip-panel-sm" className="overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-deep/70">
              <span className="w-2 h-2 rounded-full bg-mint live-dot" />
              <span className="font-code text-[11px] tracking-[0.2em] text-dim">
                PREVIEW LANGSUNG
              </span>
              <span
                className="ml-auto font-code text-[9.5px] tracking-[0.2em] px-2 py-0.5 border"
                style={{ color: mod.color, borderColor: `${mod.color}55` }}
              >
                {mod.label}
              </span>
            </div>
            <iframe
              title="Preview kode yang kamu ketik"
              srcDoc={doc}
              sandbox="allow-scripts"
              className="w-full flex-1 min-h-[380px] lg:min-h-[500px] bg-white"
            />
          </Panel>
        </div>
        <div className={`lg:col-span-2 ${tab === "kode" ? "block" : "hidden"} lg:block`}>
          <Panel clip="clip-panel-sm" className="overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-deep/70">
              <span className="font-code text-[11px] tracking-[0.2em] text-dim">KODE KETIKANMU</span>
              <span className="ml-auto font-code text-[10.5px] text-dim">
                {typed.length} karakter
              </span>
            </div>
            <div className="p-4 overflow-auto max-h-[420px] lg:max-h-[500px]">
              <Highlight code={typed} lang={lesson.module} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
