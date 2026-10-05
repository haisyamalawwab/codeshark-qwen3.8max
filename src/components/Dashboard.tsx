import { useEffect, useState } from "react";
import { LESSONS, MODULES, moduleLessons, getModule } from "../data/lessons";
import type { ModuleInfo } from "../data/lessons";
import { ACHIEVEMENTS } from "../lib/achievements";
import { fetchHistory, getDeviceId } from "../lib/api";
import type { HistoryItem, HistoryResponse } from "../lib/api";
import { isCoarsePointer } from "../lib/device";
import { RANK_META } from "../lib/ranks";
import type { Profile } from "../lib/storage";
import { levelFromXp, levelName } from "../lib/storage";
import {
  Bar,
  CountUp,
  DiffDots,
  IconBolt,
  IconBrush,
  IconCheck,
  IconClock,
  IconFlame,
  IconHistory,
  IconLock,
  IconPlay,
  IconRefresh,
  IconShark,
  IconSkull,
  IconStar,
  IconTag,
  IconTarget,
  IconTrophy,
  Panel,
  Reveal,
} from "./bits";
import { Jellyfish, Mascot as MascotWrap, Octopus, PathLink, Seahorse, Sharky, Starfish } from "./Sea";
import type { CSSProperties } from "react";

const TIPS = [
  "HTML = kerangka halaman",
  "CSS = gaya & warna",
  "JavaScript = otak interaktif",
  "Combo 12+ = pengali skor naik",
  "Overdrive penuh = skor ×2 selama 8 detik",
  "Garis sempurna = +80 skor & +2 HP",
  "Mode HIU GALAK = XP ×1.6",
  "Tekan Tab untuk 2 spasi",
  "Tekan Enter untuk pindah baris",
  "Akurasi 97% + HP 70 = Rank S",
  "console.log() = sahabat debugging",
  "display: flex merapikan barisan",
  "Kode error itu biasa, menyerah yang tidak",
];

const MODULE_ICONS = { tag: IconTag, brush: IconBrush, bolt: IconBolt };

/** Maskot setiap dunia — sahabat perjalanan si kadet. */
const MODULE_MASCOTS: Record<
  ModuleInfo["id"],
  { C: (p: { className?: string; color?: string; style?: CSSProperties }) => React.ReactElement; say: string }
> = {
  html: { C: Seahorse, say: "Siap navigasi, Kapten!" },
  css: { C: Jellyfish, say: "Warna-warni, cantik!" },
  js: { C: Octopus, say: "Delapan laci logika!" },
};

const ACH_ICONS = {
  play: IconPlay,
  shark: IconShark,
  flame: IconFlame,
  target: IconTarget,
  clock: IconClock,
  bolt: IconBolt,
  skull: IconSkull,
  refresh: IconRefresh,
  trophy: IconTrophy,
  star: IconStar,
} as const;

export default function Dashboard({
  profile,
  onOpen,
  welcome = false,
  onPractice,
  onSkipWelcome,
}: {
  profile: Profile;
  onOpen: (id: string) => void;
  welcome?: boolean;
  onPractice?: () => void;
  onSkipWelcome?: () => void;
}) {
  const lvl = levelFromXp(profile.xp);
  const done = Object.keys(profile.results).length;
  const results = Object.values(profile.results);
  // fallback offline: rata-rata rekor per misi (labelnya jujur menyebut itu)
  const localAvgAcc = results.length
    ? results.reduce((a, r) => a + r.acc, 0) / results.length
    : 0;
  const sCount = results.filter((r) => r.rank === "S").length;
  const achCount = Object.keys(profile.achievements).filter((id) =>
    ACHIEVEMENTS.some((a) => a.id === id)
  ).length;

  // statistik jujur dari database — rata-rata SELURUH upaya selesai, bukan rekor terbaik
  const [hist, setHist] = useState<{ data: HistoryResponse | null; err: string | null }>({
    data: null,
    err: null,
  });
  useEffect(() => {
    let live = true;
    fetchHistory(getDeviceId(), 12)
      .then((d) => {
        if (live) setHist({ data: d, err: null });
      })
      .catch((e: unknown) => {
        if (live) setHist({ data: null, err: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      live = false;
    };
  }, []);

  const dbDone = hist.data?.stats.done ?? 0;
  const dbAvg = hist.data?.stats.avgAcc;
  const useDb = dbAvg != null && dbDone > 0;
  const accValue = useDb ? Math.round(dbAvg) : Math.round(localAvgAcc * 100);
  const accNote = useDb
    ? `n=${dbDone} upaya selesai · dari DB`
    : `n=${done} misi · rekor lokal`;

  return (
    <div className="space-y-8">
      {/* ---------- onboarding: tiga aturan main (sekali, flag cs.onboarded.v3) ---------- */}
      {welcome && onPractice && (
        <Reveal>
          <Panel className="p-5 sm:p-6 border-cyber/45 relative overflow-hidden">
            <div className="flex flex-wrap items-start gap-4">
              <span
                className="w-12 h-12 clip-panel-sm border border-cyber/50 bg-cyber/12 text-cyber flex items-center justify-center text-2xl shrink-0"
                aria-hidden="true"
              >
                🦈
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-code text-[10px] tracking-[0.25em] text-cyber">
                  SELAMAT DATANG DI AKADEMI
                </p>
                <h2 className="font-display font-black text-lg sm:text-xl mt-1">
                  Tiga hal sebelum menyelam
                </h2>
                <ol className="mt-3 space-y-1.5 text-[13px] text-foam/85 leading-relaxed">
                  <li>
                    <b className="text-cyber font-code">1</b> · Baca slide teori, lalu ketik ulang
                    kode <b>persis</b> seperti tertulis — preview-nya langsung hidup.
                  </li>
                  <li>
                    <b className="text-cyber font-code">2</b> · Salah ketik = HP turun,{" "}
                    <b>tidak ada backspace</b> — kursor cuma maju kalau ketikanmu benar.
                  </li>
                  <li>
                    <b className="text-cyber font-code">3</b> · Rank S butuh akurasi ≥97% + HP ≥70 —
                    chip syaratnya live di layar selama bermain.
                  </li>
                </ol>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    onClick={onPractice}
                    className="clip-btn bg-cyber text-[#04222e] font-display font-bold text-[12.5px] tracking-wider px-5 py-3 flex items-center gap-2 hover:-translate-y-0.5 transition-transform cursor-pointer"
                  >
                    ⌨ MULAI RUANG LATIHAN — 60 DTK
                  </button>
                  <button
                    onClick={onSkipWelcome}
                    className="font-code text-[11.5px] text-dim hover:text-foam transition-colors cursor-pointer"
                  >
                    Lewati — langsung ke peta misi →
                  </button>
                </div>
                <p className="font-code text-[10.5px] text-dim/70 mt-2.5">
                  Ruang latihan tidak bisa gagal: HP tidak turun, sesi berakhir otomatis setelah 60
                  detik.
                </p>
              </div>
            </div>
          </Panel>
        </Reveal>
      )}

      {/* ---------- pembuka: konsol misi ---------- */}
      <section className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <Reveal>
          <div>
            <span className="clip-tag inline-block bg-cyber/10 border border-cyber/30 text-cyber font-code text-[11px] tracking-[0.22em] px-4 py-1.5">
              AKADEMI FRONT-END • MODE ARCADE • v0.3
            </span>
            <h1 className="font-display font-black text-[42px] leading-[1.02] sm:text-6xl mt-5">
              PETA <span className="text-cyber">MISI</span>
            </h1>
            <p className="text-dim text-[15.5px] leading-relaxed max-w-xl mt-4">
              Pahami teorinya, <span className="text-foam font-medium">ketik ulang kodenya</span>{" "}
              ala typing game, lalu saksikan preview-nya hidup — dari jarimu sendiri.{" "}
              <span className="text-foam">9 misi</span> •{" "}
              <span className="text-cyber">HTML</span> •{" "}
              <span className="text-gold">CSS</span> •{" "}
              <span className="text-coral">JavaScript</span>.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              {MODULES.map((m) => {
                const total = moduleLessons(m.id).length;
                const d = moduleLessons(m.id).filter((l) => profile.results[l.id]).length;
                const Icon = MODULE_ICONS[m.icon];
                return (
                  <span
                    key={m.id}
                    className="clip-btn flex items-center gap-2 border border-line bg-panel/70 px-4 py-2 text-[13px] font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    <span style={{ color: m.color }}>{m.label}</span>
                    <span className="font-code text-[11px] text-dim">
                      {d}/{total}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <Panel className="p-5 relative overflow-hidden">
            <div className="absolute -right-6 -top-8 font-display font-black text-[110px] text-hollow select-none pointer-events-none leading-none">
              {lvl.level}
            </div>
            <div className="flex items-center justify-between relative">
              <span className="font-code text-[11px] tracking-[0.25em] text-dim">
                PROFIL KADET
              </span>
              <IconStar className="w-4 h-4 text-gold" />
            </div>
            <div className="flex items-baseline gap-3 mt-4 relative">
              <span className="font-display font-black text-4xl text-gold">
                Lv.{lvl.level}
              </span>
              <span className="text-dim text-sm font-medium">{levelName(lvl.level)}</span>
            </div>
            <div className="mt-3 relative">
              <Bar pct={(lvl.into / lvl.need) * 100} color="#ffc65c" />
              <div className="flex justify-between mt-1.5 font-code text-[10.5px] text-dim">
                <span>{lvl.into} XP</span>
                <span>
                  berikutnya: {lvl.need - lvl.into} XP
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-line border-t border-line mt-4 pt-4 relative">
              <div className="pr-2">
                <p className="text-[10px] font-code tracking-widest text-dim">SKOR</p>
                <CountUp
                  value={profile.score}
                  className="font-display font-bold text-[17px] text-foam"
                />
              </div>
              <div className="px-2">
                <p className="text-[10px] font-code tracking-widest text-dim">MISI</p>
                <p className="font-display font-bold text-[17px] text-foam">
                  {done}
                  <span className="text-dim text-xs font-body font-medium">/{LESSONS.length}</span>
                </p>
              </div>
              <div className="pl-2">
                <p className="text-[10px] font-code tracking-widest text-dim">RANK S</p>
                <p className="font-display font-bold text-[17px] text-gold">{sCount}</p>
              </div>
            </div>
          </Panel>
        </Reveal>
      </section>

      {/* ---------- ticker ---------- */}
      <Reveal delay={60}>
        <div className="border-y border-line bg-deep/60 overflow-hidden py-2.5">
          <div className="ticker flex gap-10 w-max px-4">
            {[...TIPS, ...TIPS].map((t, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-[12.5px] text-dim whitespace-nowrap"
              >
                <span className="text-cyber font-code">▸</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ---------- statistik ---------- */}
      <Reveal delay={80}>
        <Panel clip="clip-panel-sm" className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line">
          {[
            { label: "MISI SELESAI", icon: IconTrophy, value: done, suffix: `/${LESSONS.length}`, color: "var(--color-cyber)", note: `dari ${LESSONS.length} misi terdaftar` },
            { label: "TOTAL XP", icon: IconStar, value: profile.xp, suffix: "", color: "var(--color-gold)", note: undefined },
            { label: "WPM TERBAIK", icon: IconClock, value: profile.bestWpm, suffix: "", color: "var(--color-mint)", note: "rekor satu sesi" },
            { label: "AKURASI RATA-RATA", icon: IconTarget, value: accValue, suffix: "%", color: "var(--color-coral)", note: accNote },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="p-4 sm:p-5 flex items-center gap-3.5">
                <span
                  className="w-10 h-10 shrink-0 clip-panel-sm flex items-center justify-center border border-line"
                  style={{ background: `color-mix(in srgb, ${s.color} 12%, transparent)`, color: s.color }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[9.5px] font-code tracking-[0.18em] text-dim">{s.label}</p>
                  <CountUp
                    value={s.value}
                    suffix={s.suffix}
                    className="font-display font-bold text-xl leading-tight"
                  />
                  {s.note && (
                    <p className="font-code text-[8.5px] text-dim/70 mt-0.5">{s.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </Panel>
      </Reveal>

      {/* ---------- riwayat permainan (database) ---------- */}
      <Reveal delay={85}>
        <HistoryPanel data={hist.data} err={hist.err} />
      </Reveal>

      {/* ---------- papan lencana ---------- */}
      <Reveal delay={90}>
        <Panel className="p-5 sm:p-7 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 relative">
            <span className="w-11 h-11 clip-panel-sm flex items-center justify-center border border-gold/45 bg-gold/12 text-gold">
              <IconTrophy className="w-5.5 h-5.5" />
            </span>
            <div>
              <h2 className="font-display font-bold text-lg">PAPAN LENCANA</h2>
              <p className="text-dim text-[12.5px] mt-0.5">
                Buktikan kelasmu — kumpulkan semua pencapaian.
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-code text-[11px] tracking-widest text-dim">
                {achCount}/{ACHIEVEMENTS.length} LENCANA
              </p>
              <Bar
                pct={(achCount / ACHIEVEMENTS.length) * 100}
                color="#ffc65c"
                className="w-28 sm:w-36 mt-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5 relative">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = !!profile.achievements[a.id];
              const Icon = ACH_ICONS[a.icon];
              return (
                <div
                  key={a.id}
                  className={`border px-3.5 py-3.5 clip-panel-sm transition-colors ${
                    unlocked ? "border-gold/40 bg-gold/[0.06]" : "border-line/70 bg-deep/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`w-8 h-8 clip-panel-sm border flex items-center justify-center ${
                        unlocked ? "border-gold/50 text-gold" : "border-line text-dim/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    {unlocked ? (
                      <IconCheck className="w-4 h-4 text-mint shrink-0" />
                    ) : (
                      <IconLock className="w-3.5 h-3.5 text-dim/50 shrink-0" />
                    )}
                  </div>
                  <p
                    className={`font-bold text-[13px] mt-2.5 ${unlocked ? "text-foam" : "text-dim"}`}
                  >
                    {a.name}
                  </p>
                  <p className="text-[11px] text-dim mt-1 leading-snug">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </Reveal>

      {/* ---------- dunia / modul ---------- */}
      {MODULES.map((m, mi) => (
        <ModuleTrack key={m.id} m={m} index={mi} profile={profile} onOpen={onOpen} />
      ))}
    </div>
  );
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

function HistoryPanel({
  data,
  err,
}: {
  data: HistoryResponse | null;
  err: string | null;
}) {
  return (
    <Panel className="p-5 sm:p-7 relative overflow-hidden">
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-11 h-11 clip-panel-sm flex items-center justify-center border border-cyber/45 bg-cyber/12 text-cyber">
          <IconHistory className="w-5.5 h-5.5" />
        </span>
        <div>
          <h2 className="font-display font-bold text-lg">RIWAYAT PERMAINAN</h2>
          <p className="text-dim text-[12.5px] mt-0.5">
            Setiap upaya — berhasil maupun gagal — tercatat di database MySQL.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {data && (
            <span className="clip-tag font-code text-[11px] tracking-widest text-dim border border-line bg-deep/60 px-3 py-1.5">
              {data.total} UPAYA TOTAL
            </span>
          )}
          <span
            className="w-2.5 h-2.5 rounded-full live-dot"
            style={{ background: err ? "#ff5d73" : data ? "#3dffa8" : "#ffc65c" }}
            title={err ? "Database offline" : data ? "Database tersambung" : "Menghubungi database…"}
          />
        </div>
      </div>

      <div className="mt-5">
        {err ? (
          <div className="border border-coral/40 bg-coral/[0.06] clip-panel-sm px-4 py-3.5 text-[13px] leading-relaxed">
            <p className="font-bold text-coral">Database belum tersambung.</p>
            <p className="text-dim mt-1">
              {err} — nyalakan <span className="text-foam">Apache &amp; MySQL</span> di Laragon,
              lalu muat ulang halaman.
            </p>
          </div>
        ) : !data ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-11 bg-deep/50 border border-line/60 clip-panel-sm animate-pulse" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <p className="text-dim text-[13px] py-3 text-center">
            Belum ada riwayat — selesaikan misi pertamamu, Kadet!
          </p>
        ) : (
          <div className="divide-y divide-line/70">
            {data.items.map((it) => (
              <HistoryRow key={it.clientUuid} it={it} />
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

function HistoryRow({ it }: { it: HistoryItem }) {
  const lesson = LESSONS.find((l) => l.id === it.lessonId);
  const modColor = MODULES.find((m) => m.id === it.module)?.color ?? "#7fa3c2";
  const failed = it.status === "fail";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5">
      <span className="font-code text-[10.5px] text-dim w-20 shrink-0">{timeAgo(it.createdAt)}</span>

      {failed ? (
        <span className="clip-tag font-code text-[9.5px] font-bold tracking-[0.15em] px-2.5 py-1 bg-coral/12 border border-coral/50 text-coral flex items-center gap-1.5">
          <IconSkull className="w-3 h-3" />
          GAGAL
        </span>
      ) : (
        <span
          className="clip-tag font-display font-black text-[12px] px-3 py-1 border"
          style={{
            color: RANK_META[it.rank ?? "C"].color,
            borderColor: `${RANK_META[it.rank ?? "C"].color}55`,
            background: `${RANK_META[it.rank ?? "C"].color}14`,
          }}
        >
          {it.rank}
        </span>
      )}

      <span className="flex items-center gap-2 min-w-0 flex-1">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: modColor }} />
        <span className={`text-[13px] font-medium truncate ${failed ? "text-dim" : "text-foam"}`}>
          {lesson ? `Misi ${lesson.number} — ${lesson.title}` : it.lessonId}
        </span>
        <span className="font-code text-[9px] tracking-widest text-dim/70 hidden sm:inline">
          {getModule((lesson?.module ?? it.module) as "html" | "css" | "js").label}
          {it.mode !== "standar" && ` • ${it.mode.toUpperCase()}`}
        </span>
      </span>

      <span className="flex items-center gap-3.5 font-code text-[11px] shrink-0">
        <span className="text-dim">
          <b className="text-gold">{it.score.toLocaleString("id-ID")}</b> skor
        </span>
        <span className="text-dim">
          <b className="text-mint">{it.wpm}</b> wpm
        </span>
        <span className="text-dim">
          <b className="text-cyber">{Math.round(it.acc * 100)}%</b> akr
        </span>
        <span className="text-dim hidden sm:inline">
          <b className="text-foam">{it.maxCombo}</b> combo
        </span>
      </span>
    </div>
  );
}

function ModuleTrack({
  m,
  index,
  profile,
  onOpen,
}: {
  m: ModuleInfo;
  index: number;
  profile: Profile;
  onOpen: (id: string) => void;
}) {
  const list = moduleLessons(m.id);
  const doneCount = list.filter((l) => profile.results[l.id]).length;
  const firstOpenIdx = list.findIndex(
    (l, idx) => !profile.results[l.id] && (idx === 0 || !!profile.results[list[idx - 1].id])
  );
  const Icon = MODULE_ICONS[m.icon];
  const Mascot = MODULE_MASCOTS[m.id].C;

  return (
    <Reveal delay={index * 70}>
      <section className="Panel p-5 sm:p-7 relative overflow-hidden">
        <span className="absolute -right-3 top-1/2 -translate-y-1/2 font-code font-bold text-[110px] leading-none text-hollow select-none pointer-events-none hidden md:block">
          {m.watermark}
        </span>

        <div className="flex flex-wrap items-center gap-4 relative">
          <span
            className="w-13 h-13 sm:w-14 sm:h-14 clip-panel-sm flex items-center justify-center border"
            style={{
              background: `color-mix(in srgb, ${m.color} 13%, transparent)`,
              borderColor: `color-mix(in srgb, ${m.color} 45%, transparent)`,
              color: m.color,
            }}
          >
            <Icon className="w-7 h-7" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-lg sm:text-xl">
              DUNIA {index + 1} — <span style={{ color: m.color }}>{m.label}</span>
            </h2>
            <p className="text-dim text-[13px] mt-0.5">{m.blurb}</p>
          </div>
          {doneCount === list.length && (
            <span className="hidden md:block ml-auto" title="Dunia tuntas! Kamu hebat!">
              <MascotWrap>
                <Starfish className="w-9 h-9 star-wiggle" color="#ffc65c" />
              </MascotWrap>
            </span>
          )}
          <div className={`${doneCount === list.length ? "" : "ml-auto"} text-right relative`}>
            <p className="font-code text-[11px] tracking-widest text-dim">
              {doneCount}/{list.length} MISI
            </p>
            <Bar pct={(doneCount / list.length) * 100} color={m.color} className="w-32 sm:w-40 mt-1.5" />
          </div>
          <span className="absolute -bottom-10 -right-1 hidden lg:block" title={MODULE_MASCOTS[m.id].say}>
            <MascotWrap>
              <Mascot className="w-11 swim-bob" color={m.color} />
            </MascotWrap>
          </span>
        </div>

        <div className="flex flex-wrap items-stretch gap-3 mt-6 relative">
          {list.map((lesson, i) => {
            const res = profile.results[lesson.id];
            const prevOk = i === 0 || !!profile.results[list[i - 1].id];
            const status: "done" | "open" | "locked" = res ? "done" : prevOk ? "open" : "locked";
            const locked = status === "locked";
            const isCurrent = i === firstOpenIdx;
            return (
              <div key={lesson.id} className="flex items-center gap-3 relative">
                {isCurrent && (
                  <span
                    className="absolute -top-7 right-1.5 z-10 pointer-events-none"
                    title="Kamu di sini!"
                    aria-hidden="true"
                  >
                    <Sharky className="w-12 swim-bob drop-shadow-[0_5px_10px_rgba(0,0,0,0.45)]" color={m.color} />
                  </span>
                )}
                <button
                  onClick={() => !locked && onOpen(lesson.id)}
                  disabled={locked}
                  className={`group relative w-[186px] text-left p-4 clip-panel-sm border transition-all duration-200 ${
                    locked
                      ? "bg-deep/40 border-line/60 opacity-45 cursor-not-allowed"
                      : "bg-raise/70 border-line cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_14px_36px_var(--glow)] hover:border-dim/50"
                  } ${isCurrent ? "pulse-ring" : ""}`}
                  style={{ "--glow": `${m.color}30` } as React.CSSProperties}
                >
                <div className="flex items-start justify-between">
                  <span
                    className="w-7 h-7 flex items-center justify-center font-code text-[12px] font-bold border clip-panel-sm"
                    style={
                      status === "done"
                        ? { color: m.color, borderColor: `${m.color}66`, background: `${m.color}1a` }
                        : { color: "#7fa3c2", borderColor: "#1c3a57" }
                    }
                  >
                      {lesson.number}
                    </span>
                    {status === "done" && res ? (
                      <span
                        className="font-display font-black text-xl leading-none"
                        style={{ color: m.color }}
                        title={`Rank ${res.rank}`}
                      >
                        {res.rank}
                      </span>
                    ) : status === "locked" ? (
                      <IconLock className="w-4 h-4 text-dim mt-1" />
                    ) : (
                      <span
                        className="clip-tag font-code text-[9.5px] tracking-[0.18em] px-2.5 py-1 font-bold"
                        style={{ background: `${m.color}1f`, color: m.color }}
                      >
                        {isCurrent ? "MULAI ▸" : "TERBUKA"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[14.5px] leading-snug mt-3 min-h-[40px]">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <DiffDots n={lesson.difficulty} color={m.color} />
                    <span className="font-code text-[10.5px] text-dim">+{lesson.xp} XP</span>
                  </div>
                  {isCoarsePointer() && lesson.exercise.code.split("\n").length > 5 && (
                    <p
                      className="font-code text-[9px] text-gold/85 mt-1.5"
                      title="Game ini butuh keyboard fisik — keyboard virtual HP sering gagal mengetik tanda baca kode"
                    >
                      ⌨ butuh keyboard fisik
                    </p>
                  )}
                </button>
                {i < list.length - 1 && (
                  <PathLink
                    state={res ? "passed" : prevOk ? "next" : "locked"}
                    color={m.color}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}
