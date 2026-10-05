import { useEffect, useMemo, useRef, useState } from "react";
import Background from "./components/Background";
import Dashboard from "./components/Dashboard";
import LessonView from "./components/LessonView";
import PreviewView from "./components/PreviewView";
import TypingGame from "./components/TypingGame";
import { Bar, IconShark, IconSoundOff, IconSoundOn } from "./components/bits";
import { getLesson, makePracticeLesson } from "./data/lessons";
import { getAchievement, evaluateAchievements } from "./lib/achievements";
import { getDeviceId, saveAttempt, uuid, checkHealth } from "./lib/api";
import type { ModeId } from "./lib/modes";
import { setMuted, sfx } from "./lib/sound";
import {
  clearProfile,
  defaultProfile,
  isOnboarded,
  levelFromXp,
  levelName,
  loadProfile,
  saveProfile,
  setOnboarded,
  type LessonResult,
  type Profile,
} from "./lib/storage";
import type { FailStats } from "./components/TypingGame";

type View =
  | { name: "dashboard" }
  | { name: "lesson"; id: string }
  | { name: "game"; id: string; mode: ModeId }
  | { name: "preview"; id: string };

interface Toast {
  id: number;
  text: string;
  kind: "xp" | "level" | "info" | "badge";
}

export default function App() {
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [view, setView] = useState<View>({ name: "dashboard" });
  const [run, setRun] = useState<{ typed: string; xpAdded: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [gameKey, setGameKey] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [dbOk, setDbOk] = useState<boolean | null>(null);
  const [onboarded, setOnboardedState] = useState(isOnboarded);
  const practiceLesson = useMemo(makePracticeLesson, []);
  const toastId = useRef(0);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);
  useEffect(() => {
    setMuted(!profile.sound);
  }, [profile.sound]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);
  useEffect(() => {
    checkHealth()
      .then(() => setDbOk(true))
      .catch(() => setDbOk(false));
  }, []);

  const pushToast = (text: string, kind: Toast["kind"]) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const handleComplete = (lessonId: string) => (result: LessonResult, typed: string) => {
    const old = profile.results[lessonId];
    const xpAdded = Math.max(0, result.xp - (old?.xp ?? 0));
    const scoreAdded = Math.max(0, result.score - (old?.score ?? 0));
    const newXp = profile.xp + xpAdded;
    const before = levelFromXp(profile.xp).level;
    const after = levelFromXp(newXp).level;
    const best = !old || result.score >= old.score ? result : old;
    const next: Profile = {
      ...profile,
      xp: newXp,
      score: profile.score + scoreAdded,
      bestWpm: Math.max(profile.bestWpm, result.wpm),
      results: { ...profile.results, [lessonId]: best },
    };

    // lencana baru?
    const fresh = evaluateAchievements(next, result);
    if (fresh.length > 0) {
      next.achievements = { ...profile.achievements };
      fresh.forEach((id) => {
        next.achievements[id] = Date.now();
      });
    }
    setProfile(next);
    setRun({ typed, xpAdded });

    // catat upaya ini ke database riwayat (api/index.php) — gagal sinkron tidak mengganggu main
    saveAttempt({
      clientUuid: uuid(),
      deviceId: getDeviceId(),
      lessonId,
      module: getLesson(lessonId)?.module ?? "html",
      mode: result.mode,
      status: "done",
      rank: result.rank,
      score: result.score,
      acc: result.acc,
      wpm: result.wpm,
      maxCombo: result.maxCombo,
      errors: result.errors,
      hpLeft: result.hpLeft,
      progressPct: 100,
      timeSec: result.timeSec,
      xpGained: xpAdded,
      typed,
    })
      .then(() => setDbOk(true))
      .catch(() => setDbOk(false));

    if (xpAdded > 0) pushToast(`+${xpAdded} XP masuk kantong!`, "xp");
    fresh.forEach((id, i) => {
      const def = getAchievement(id);
      if (!def) return;
      setTimeout(() => {
        pushToast(`LENCANA BARU — ${def.name}!`, "badge");
        sfx.level();
      }, 700 + i * 900);
    });
    if (after > before) {
      pushToast(`LEVEL UP! Lv.${after} — ${levelName(after)}`, "level");
      setTimeout(() => sfx.level(), 400);
    }
    return {
      xpAdded,
      leveledUp: after > before,
      level: after,
      levelName: levelName(after),
    };
  };

  const handleFail = (lessonId: string) => (s: FailStats) => {
    saveAttempt({
      clientUuid: uuid(),
      deviceId: getDeviceId(),
      lessonId,
      module: getLesson(lessonId)?.module ?? "html",
      mode: s.mode,
      status: "fail",
      rank: null,
      score: s.score,
      acc: s.acc,
      wpm: s.wpm,
      maxCombo: s.maxCombo,
      errors: s.errors,
      hpLeft: 0,
      progressPct: s.progressPct,
      timeSec: s.timeSec,
      xpGained: 0,
      typed: null,
    })
      .then(() => setDbOk(true))
      .catch(() => setDbOk(false));
  };

  const toggleSound = () => {
    setProfile({ ...profile, sound: !profile.sound });
    if (!profile.sound) setTimeout(() => sfx.click(), 30);
  };

  const doReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 2600);
      return;
    }
    clearProfile();
    setProfile(defaultProfile());
    setRun(null);
    setView({ name: "dashboard" });
    setConfirmReset(false);
    pushToast("Progres direset. Lembar baru, Kadet!", "info");
  };

  /** Ruang Latihan (misi #0) — tidak bisa gagal, tidak mengubah profil/riwayat. */
  const startPractice = () => {
    sfx.click();
    setOnboarded();
    setOnboardedState(true);
    setProfile({ ...profile, lastMode: "santai" });
    setGameKey((k) => k + 1);
    setView({ name: "game", id: "practice", mode: "santai" });
  };

  const skipWelcome = () => {
    sfx.click();
    setOnboarded();
    setOnboardedState(true);
  };

  const lvl = levelFromXp(profile.xp);
  const lesson = view.name !== "dashboard" ? getLesson(view.id) : undefined;
  const gameLesson =
    view.name === "game" ? (view.id === "practice" ? practiceLesson : lesson) : undefined;

  return (
    <div className="min-h-screen relative">
      <Background />

      {/* ---------- header HUD ---------- */}
      <header className="sticky top-0 z-40 border-b border-line bg-abyss/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => {
              sfx.click();
              setView({ name: "dashboard" });
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <span className="w-9 h-9 clip-panel-sm bg-cyber/12 border border-cyber/40 flex items-center justify-center text-cyber group-hover:bg-cyber/20 transition-colors">
              <IconShark className="w-5.5 h-5.5" />
            </span>
            <span className="text-left leading-none">
              <span className="font-display font-black text-[15px] tracking-wide block">
                CODE<span className="text-cyber">SHARK</span>
              </span>
              <span className="font-code text-[8.5px] tracking-[0.32em] text-dim block mt-1">
                FRONT-END ARCADE
              </span>
            </span>
          </button>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-3.5">
            <span className="clip-tag bg-gold/10 border border-gold/40 text-gold font-display font-bold text-[12px] px-3 py-1.5">
              Lv.{lvl.level}
            </span>
            <span className="hidden md:inline text-dim text-[12px] font-medium -ml-1">
              {levelName(lvl.level)}
            </span>
            <div className="hidden sm:block w-28 lg:w-36">
              <Bar pct={(lvl.into / lvl.need) * 100} color="#ffc65c" />
              <p className="font-code text-[9px] text-dim mt-1 text-right">
                {profile.xp.toLocaleString("id-ID")} XP
              </p>
            </div>
            <button
              onClick={toggleSound}
              title={profile.sound ? "Matikan suara" : "Nyalakan suara"}
              className={`w-10 h-10 clip-btn border flex items-center justify-center transition-colors cursor-pointer ${
                profile.sound
                  ? "border-cyber/45 text-cyber bg-cyber/10 hover:bg-cyber/20"
                  : "border-line text-dim hover:text-foam"
              }`}
            >
              {profile.sound ? (
                <IconSoundOn className="w-4.5 h-4.5" />
              ) : (
                <IconSoundOff className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ---------- konten ---------- */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-8 sm:pt-10 pb-6">
        {view.name === "dashboard" && (
          <Dashboard
            profile={profile}
            welcome={!onboarded}
            onPractice={startPractice}
            onSkipWelcome={skipWelcome}
            onOpen={(id) => {
              sfx.click();
              setView({ name: "lesson", id });
            }}
          />
        )}

        {view.name === "lesson" && lesson && (
          <LessonView
            lesson={lesson}
            initialMode={profile.lastMode}
            onBack={() => setView({ name: "dashboard" })}
            onStart={(mode) => {
              sfx.click();
              setProfile({ ...profile, lastMode: mode });
              setGameKey((k) => k + 1);
              setView({ name: "game", id: lesson.id, mode });
            }}
          />
        )}

        {view.name === "game" && gameLesson && (
          <TypingGame
            key={gameKey}
            lesson={gameLesson}
            mode={view.mode}
            pbTimeSec={
              gameLesson.id === "practice" ? undefined : profile.results[gameLesson.id]?.timeSec
            }
            prevBest={gameLesson.id === "practice" ? undefined : profile.results[gameLesson.id]}
            onComplete={handleComplete(gameLesson.id)}
            onFail={handleFail(gameLesson.id)}
            onExit={() => setView({ name: "dashboard" })}
            onPreview={() => setView({ name: "preview", id: gameLesson.id })}
            onRetry={() => setGameKey((k) => k + 1)}
          />
        )}

        {view.name === "preview" && lesson && run ? (
          <PreviewView
            lesson={lesson}
            typed={run.typed}
            onMenu={() => setView({ name: "dashboard" })}
            onRetry={() => {
              setGameKey((k) => k + 1);
              setView({ name: "game", id: lesson.id, mode: profile.lastMode });
            }}
          />
        ) : view.name === "preview" ? (
          <Dashboard
            profile={profile}
            onOpen={(id) => setView({ name: "lesson", id })}
          />
        ) : null}
      </main>

      {/* ---------- footer ---------- */}
      <footer className="relative z-10 border-t border-line mt-12">
        <div className="max-w-6xl mx-auto px-4 py-7 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="text-[12.5px] text-dim leading-relaxed">
            <span className="font-code text-foam/80">CodeShark v0.3.0</span>
            <p className="mt-0.5">
              Progres utama tersimpan di <span className="text-cyber">localStorage</span> browser
              ini; riwayat permainan tercatat ke database{" "}
              <span className="text-cyber">MySQL</span> lewat{" "}
              <span className="font-code">api/index.php</span>.{" "}
              {dbOk === null ? (
                <span className="text-dim">● memeriksa database…</span>
              ) : dbOk ? (
                <span className="text-mint">● riwayat tersambung</span>
              ) : (
                <span className="text-coral">
                  ● database offline — riwayat tidak terekam, progres lokal tetap aman
                </span>
              )}
            </p>
          </div>
          <button
            onClick={doReset}
            className={`clip-btn border px-4 py-2.5 font-code text-[11.5px] tracking-wider transition-colors cursor-pointer shrink-0 ${
              confirmReset
                ? "border-coral bg-coral/15 text-coral font-bold"
                : "border-line text-dim hover:text-coral hover:border-coral/50"
            }`}
          >
            {confirmReset ? "KLIK LAGI UNTUK YAKIN!" : "RESET PROGRES"}
          </button>
        </div>
      </footer>

      {/* ---------- toasts ---------- */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`anim-slide clip-panel-sm px-4 py-3 border bg-panel text-[13px] font-medium max-w-[280px] ${
              t.kind === "xp"
                ? "border-gold/55 text-gold"
                : t.kind === "level"
                  ? "border-cyber/60 text-cyber"
                  : t.kind === "badge"
                    ? "border-mint/60 text-mint font-bold"
                    : "border-line text-foam"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
