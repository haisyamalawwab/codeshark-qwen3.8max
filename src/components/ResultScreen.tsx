import type { LessonResult } from "../lib/storage";
import type { ModuleInfo } from "../data/lessons";
import type { ModeInfo } from "../lib/modes";
import { RANK_META } from "../lib/ranks";
import { SCORE_KIND_LABEL, type LineReport, type ScoreEventKind, type ScoreSlice } from "../lib/rankReason";
import { IconEye, IconHome, IconRefresh, Panel } from "./bits";
import { Fish, Octopus } from "./Sea";
import type { CompleteInfo } from "./TypingGame";

const CONFETTI = ["#35e0ff", "#ffc65c", "#ff5d73", "#3dffa8"];

const KIND_COLOR: Record<ScoreEventKind, string> = {
  char: "#3dffa8",
  enter: "#35e0ff",
  milestone: "#ffc65c",
  perfect: "#3dffa8",
  checkpoint: "#ffc65c",
  od: "#ff5d73",
  hpbonus: "#ffc65c",
};

/** Laporan lengkap satu sesi — dirakit TypingGame saat finish(). */
export interface SessionReport {
  summary: ScoreSlice[];
  reason: string;
  tips: string[];
  lineReports: LineReport[];
  maxCombo: number;
  hp: number;
  perfects: number;
  prevBest?: LessonResult;
}

const disp = (c: string) => (c === "\n" ? "↵" : c === " " ? "␣" : c);
const trunc = (s: string, n = 34) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const fmt = (n: number) => n.toLocaleString("id-ID");

export default function ResultScreen({
  result,
  report,
  info,
  mode,
  mod,
  onPreview,
  onRetry,
  onExit,
}: {
  result: LessonResult;
  report: SessionReport;
  info: CompleteInfo | null;
  mode: ModeInfo;
  mod: ModuleInfo;
  onPreview: () => void;
  onRetry: () => void;
  onExit: () => void;
}) {
  const rank = RANK_META[result.rank];
  const maxPts = Math.max(1, ...report.summary.map((s) => s.pts));
  const sumPts = report.summary.reduce((a, s) => a + s.pts, 0);
  const prev = report.prevBest;
  const delta = prev ? result.score - prev.score : null;
  const failedLines = report.lineReports.filter((l) => l.errors > 0);

  return (
    <div className="absolute inset-0 z-40 bg-abyss/90 backdrop-blur-[3px] overflow-y-auto">
      <Panel className="max-w-2xl w-full mx-auto my-6 sm:my-10 relative overflow-hidden">
        <div className="p-5 sm:p-8 text-center relative">
          {(result.rank === "S" || result.rank === "A") &&
            Array.from({ length: 36 }, (_, i) => (
              <span
                key={i}
                className="confetti"
                style={{
                  left: `${(i * 37) % 100}%`,
                  background: CONFETTI[i % 4],
                  animationDelay: `${(i % 12) * 0.07}s`,
                  animationDuration: `${1 + ((i * 13) % 10) / 10}s`,
                }}
              />
            ))}

          {/* sekawanan ikan merayakan */}
          <div className="flex items-end justify-center gap-3 mt-1" aria-hidden="true">
            <Fish className="w-9 swim-bob" color="#35e0ff" />
            <Fish className="w-12 swim-bob" color="#ffc65c" style={{ animationDelay: "-0.8s" }} />
            <Fish className="w-8 swim-bob" color="#3dffa8" style={{ animationDelay: "-1.6s" }} />
          </div>
          <span className="absolute top-3 right-3" aria-hidden="true">
            <Octopus className="w-11" color="#ff5d73" />
          </span>

          {/* stamp rank */}
          <div
            className="stamp w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full border-4 flex items-center justify-center font-display font-black text-5xl"
            style={{
              borderColor: rank.color,
              color: rank.color,
              boxShadow: `0 0 40px ${rank.color}55, inset 0 0 24px ${rank.color}22`,
            }}
          >
            {result.rank}
          </div>
          <p className="font-code text-[11px] tracking-[0.35em] text-dim mt-4">
            RANK {result.rank} — {rank.label}
          </p>
          <p className="text-foam/80 text-sm mt-2 max-w-md mx-auto">{rank.quote}</p>

          <span
            className="clip-tag inline-block font-code text-[10px] tracking-[0.2em] px-3 py-1 border font-bold mt-3"
            style={{ color: mode.color, borderColor: `${mode.color}55`, background: `${mode.color}14` }}
          >
            MODE {mode.label} — XP {mode.xpLabel}
          </span>

          {/* headline: kenapa rank ini (SPESIFIKASI 9.2) */}
          <div className="border-y border-line/70 py-3.5 mt-4 text-left">
            <p className="font-code text-[9.5px] tracking-[0.24em] text-dim">
              KENAPA RANK INI?
            </p>
            <p className="text-[13.5px] text-foam/90 leading-relaxed mt-1.5">{report.reason}</p>
          </div>

          {/* metrik inti */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <Stat label="SKOR" value={fmt(result.score)} accent="#ffc65c" big />
            <Stat label="WPM" value={`${result.wpm}`} accent="#3dffa8" big />
            <Stat label="AKURASI" value={`${Math.round(result.acc * 100)}%`} accent="#35e0ff" big />
            <Stat label="COMBO MAKS" value={`${report.maxCombo}`} accent="#ff5d73" big />
            <Stat label="HP SISA" value={`${report.hp}`} accent={report.hp > 60 ? "#3dffa8" : report.hp > 30 ? "#ffc65c" : "#ff5d73"} />
            <Stat label="WAKTU" value={`${result.timeSec}s`} accent="#dbeeff" />
            <Stat label="GARIS SEMPURNA" value={`${report.perfects}`} accent="#3dffa8" />
            <Stat label="SALAH" value={`${result.errors}`} accent={result.errors === 0 ? "#3dffa8" : "#ff9db0"} />
          </div>

          {/* rekor */}
          {delta == null ? (
            <p className="font-code text-[11px] text-dim mt-3.5">
              Upaya pertama misi ini — rekor tersimpan.
            </p>
          ) : delta > 0 ? (
            <p className="inline-flex items-center gap-2 mt-3.5 border border-gold/55 bg-gold/10 clip-tag px-4 py-1.5 font-code text-[11.5px] font-bold text-gold record-badge">
              ▲ REKOR BARU — +{fmt(delta)} dari {fmt(prev!.score)}
            </p>
          ) : (
            <p className="font-code text-[11px] text-dim mt-3.5 tnum">
              Rekor masih {fmt(prev!.score)} — butuh +{fmt(prev!.score - result.score + 1)} untuk
              mengungguli.
            </p>
          )}

          {/* waterfall skor (SPESIFIKASI 9.3) */}
          <section className="text-left mt-6">
            <p className="font-code text-[9.5px] tracking-[0.24em] text-dim">
              DARI MANA SKORNYA
            </p>
            <div className="mt-2.5">
              {report.summary.map((s) => (
                <div key={s.kind} className="flex items-center gap-2.5 py-1">
                  <span className="w-24 sm:w-28 shrink-0 text-[11.5px] text-dim">
                    {SCORE_KIND_LABEL[s.kind]}
                  </span>
                  <span
                    className="w-16 shrink-0 text-right font-code font-bold text-[12px] tnum"
                    style={{ color: KIND_COLOR[s.kind] }}
                  >
                    {fmt(s.pts)}
                  </span>
                  <span className="flex-1 h-2 bg-deep overflow-hidden">
                    <span
                      className="block h-full wf-bar"
                      style={{
                        width: `${(s.pts / maxPts) * 100}%`,
                        background: KIND_COLOR[s.kind],
                        boxShadow: `0 0 6px ${KIND_COLOR[s.kind]}66`,
                      }}
                    />
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 py-1.5 border-t border-line/60 mt-1">
                <span className="w-24 sm:w-28 shrink-0 text-[11.5px] font-bold text-foam">
                  TOTAL
                </span>
                <span className="w-16 shrink-0 text-right font-code font-bold text-[12.5px] text-gold tnum">
                  {fmt(result.score)}
                </span>
                {sumPts !== result.score && (
                  <span
                    className="font-code text-[9.5px] text-dim/70"
                    title="Ada selisih pembulatan — sumber poin belum tercatat semua"
                  >
                    (selisih {fmt(result.score - sumPts)})
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* peta kesalahan per baris (SPESIFIKASI 9.4) */}
          <section className="text-left mt-6">
            <p className="font-code text-[9.5px] tracking-[0.24em] text-dim">PETA KESALAHAN</p>
            {failedLines.length === 0 ? (
              <p className="text-[12.5px] text-mint/90 mt-2">
                ✓ Semua {report.lineReports.length} baris sempurna — nol ranjau tersentuh.
              </p>
            ) : (
              <div className="mt-2">
                {report.lineReports.map((r) => (
                  <LineRow key={r.idx} r={r} />
                ))}
              </div>
            )}
          </section>

          {/* coaching (SPESIFIKASI 9.5) */}
          <section className="text-left mt-6 border border-cyber/30 bg-cyber/[0.05] clip-panel-sm p-4">
            <p className="font-code text-[9.5px] tracking-[0.24em] text-cyber font-bold">
              COACHING — LANGKAH BERIKUTNYA
            </p>
            {report.tips.length === 0 ? (
              <p className="text-[12.5px] text-foam/85 mt-2 leading-relaxed">
                Bersih — tidak ada catatan pelajaran. Satu-satunya tantangan tersisa: pecahkan
                rekor sendirimu.
              </p>
            ) : (
              <ul className="mt-2.5 space-y-2">
                {report.tips.map((t, i) => (
                  <li key={i} className="text-[12.5px] text-foam/85 leading-relaxed flex gap-2">
                    <span className="text-cyber shrink-0 font-bold">→</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* progresi XP */}
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 border border-gold/45 bg-gold/10 px-4 py-2.5 clip-tag">
            <span className="font-code font-bold text-gold text-sm">+{info?.xpAdded ?? 0} XP</span>
            {info?.leveledUp && (
              <span className="font-code text-[11.5px] text-cyber">
                • LEVEL UP → Lv.{info.level} {info.levelName}!
              </span>
            )}
            {(info?.xpAdded ?? 0) === 0 && (
              <span className="font-code text-[11.5px] text-dim">
                (skor terbaikmu sudah tercatat)
              </span>
            )}
          </div>

          {/* CTA — hierarki: Ulangi utama untuk perbaikan, preview sebagai reward */}
          <div className="grid gap-2.5 mt-6">
            <button
              onClick={onPreview}
              className="clip-btn bg-gold text-[#231a05] font-display font-bold text-[13px] tracking-wider px-6 py-3.5 flex items-center justify-center gap-2.5 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,198,92,0.35)] transition-all cursor-pointer"
            >
              <IconEye className="w-4 h-4" />
              LIHAT PREVIEW KODEMU
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onRetry}
                className="clip-btn border border-cyber/50 text-cyber hover:bg-cyber/10 font-display text-[12px] tracking-wider px-4 py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <IconRefresh className="w-4 h-4" />
                ULANGI
              </button>
              <button
                onClick={onExit}
                className="clip-btn border border-line text-dim hover:text-foam font-display text-[12px] tracking-wider px-4 py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <IconHome className="w-4 h-4" />
                PETA MISI
              </button>
            </div>
          </div>

          <p className="font-code text-[9.5px] tracking-[0.2em] text-dim/60 mt-5 uppercase">
            {mod.label} · rank S = akurasi ≥97% + HP ≥70
          </p>
        </div>
      </Panel>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  big = false,
}: {
  label: string;
  value: string;
  accent: string;
  big?: boolean;
}) {
  return (
    <div className="bg-deep/70 border border-line px-2 py-2.5">
      <p className="text-[9px] font-code tracking-[0.18em] text-dim">{label}</p>
      <p
        className={`font-code font-bold mt-0.5 tnum ${big ? "text-[17px]" : "text-[15px]"}`}
        style={{ color: accent }}
      >
        {value}
      </p>
    </div>
  );
}

function LineRow({ r }: { r: LineReport }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-line/40 last:border-b-0">
      <span className="font-code text-[10px] text-dim w-5 text-right shrink-0 tnum">
        {r.idx + 1}
      </span>
      <code className="font-code text-[11.5px] text-foam/70 truncate flex-1 whitespace-pre">
        {trunc(r.text)}
      </code>
      {r.errors === 0 ? (
        <span className="font-code text-[10px] font-bold text-mint shrink-0">
          {r.perfect ? "✓ sempurna" : "—"}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 shrink-0">
          {r.worst.map(([c, n]) => (
            <span key={c} className="dmg-pair font-code" title={`${n}× salah di sini`}>
              <b className="text-coral">✗</b>
              <i className="text-dim">
                {disp(c)}×{n}
              </i>
            </span>
          ))}
          <span className="font-code text-[10px] font-bold text-coral tnum">
            {r.errors} salah
          </span>
        </span>
      )}
    </div>
  );
}
