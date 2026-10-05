import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import type { Lesson } from "../data/lessons";
import { getModule } from "../data/lessons";
import { MODES, type ModeId } from "../lib/modes";
import type { LessonResult, Rank } from "../lib/storage";
import { sfx } from "../lib/sound";
import { rankChips, RANK_TOOLTIP } from "../lib/rank";
import {
  buildLineReports,
  coachingTips,
  getRankReason,
  summarizeScore,
  type ScoreEvent,
} from "../lib/rankReason";
import { isCoarsePointer } from "../lib/device";
import { useSoftKeyboard } from "../hooks/useSoftKeyboard";
import {
  IconFlame,
  IconHome,
  IconKeyboard,
  IconPause,
  IconPlay,
  IconRefresh,
  IconShark,
  IconSkull,
  IconTarget,
  KeyCap,
  Panel,
} from "./bits";
import { Crab, Fish, FishSprint, MiniFlag, Pufferfish, SharkSprint } from "./Sea";
import ResultScreen, { type SessionReport } from "./ResultScreen";

type Phase = "briefing" | "countdown" | "play" | "pause" | "done" | "fail";

export interface CompleteInfo {
  xpAdded: number;
  leveledUp: boolean;
  level: number;
  levelName: string;
}

/** Statistik saat misi gagal — untuk catatan riwayat. */
export interface FailStats {
  mode: ModeId;
  score: number;
  acc: number;
  wpm: number;
  maxCombo: number;
  errors: number;
  progressPct: number;
  timeSec: number;
}

const OD_DURATION = 8000;
const OD_TELEGRAPH_MS = 1500; // jeda "siap" sebelum overdrive benar-benar aktif
const OD_FILL_CHAR = 1.7;
const OD_FILL_LINE = 6;
const OD_DRAIN_ERR = 12;
const OD_SCORE_MULT = 2;
const PERFECT_LINE_BONUS = 80;
const PERFECT_LINE_HEAL = 2;
const HP_BONUS_PER_POINT = 15;
const CP_BONUS = 150; // bonus melewati checkpoint di bar progres
const PRACTICE_LIMIT_SEC = 60; // ruang latihan berakhir otomatis
const DMG_LOG_MAX = 8;
const TIPS_MAX = 3;

const MILESTONES: Record<number, { bonus: number; text: string; tier: number }> = {
  25: { bonus: 100, text: "MANTAP!", tier: 1 },
  50: { bonus: 250, text: "MENGAGUMKAN!", tier: 2 },
  75: { bonus: 400, text: "GILA!", tier: 3 },
  100: { bonus: 600, text: "LEGENNDARIS!", tier: 4 },
  150: { bonus: 800, text: "MITOS!", tier: 5 },
};

interface DmgEntry {
  id: number;
  typed: string;
  expected: string;
  at: number;
}

export default function TypingGame({
  lesson,
  mode,
  pbTimeSec,
  prevBest,
  onComplete,
  onFail,
  onExit,
  onPreview,
  onRetry,
}: {
  lesson: Lesson;
  mode: ModeId;
  pbTimeSec?: number;
  prevBest?: LessonResult;
  onComplete: (r: LessonResult, typed: string) => CompleteInfo;
  onFail?: (s: FailStats) => void;
  onExit: () => void;
  onPreview: () => void;
  onRetry: () => void;
}) {
  const mod = getModule(lesson.module);
  const MODE = MODES[mode];
  const code = lesson.exercise.code;
  const isPractice = lesson.id === "practice";

  const lines = useMemo(() => {
    const arr: { text: string; start: number }[] = [];
    let s = 0;
    code.split("\n").forEach((text) => {
      arr.push({ text, start: s });
      s += text.length + 1;
    });
    return arr;
  }, [code]);

  const coarse = useMemo(() => isCoarsePointer(), []);

  const [phase, setPhase] = useState<Phase>("briefing");
  const [count, setCount] = useState(3);
  const [goFlash, setGoFlash] = useState(false);
  const g = useRef({
    pos: 0,
    errors: 0,
    hp: 100,
    combo: 0,
    maxCombo: 0,
    score: 0,
    elapsed: 0,
    od: 0,
    odUntil: 0,
    odTelegraphUntil: 0,
    odRemain: 0, // sisa overdrive saat dijeda — dibekukan, bukan hangus
    odTeleRemain: 0,
    odUsed: false,
    errSinceLine: 0,
    consecErr: 0,
    perfects: 0,
    cp1: false,
    cp2: false,
    pauses: 0,
    errMap: {} as Record<string, number>,
    lineErrors: {} as Record<number, number>,
    lineCharErr: {} as Record<number, Record<string, number>>,
    linePerfect: {} as Record<number, boolean>,
    scoreEvents: [] as ScoreEvent[],
    dmgLog: [] as DmgEntry[],
    tipShown: {} as Record<string, boolean>,
    tipCount: 0,
  });
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [dmgKey, setDmgKey] = useState(0);
  const [healKey, setHealKey] = useState(0);
  const [cpPop, setCpPop] = useState(0);
  const [sharkDashKey, setSharkDashKey] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [ghost, setGhost] = useState<{ id: number; ch: string } | null>(null);
  const ghostId = useRef(0);
  const dmgSeq = useRef(0);
  const failSaved = useRef(false);
  const [milestone, setMilestone] = useState<{ key: number; text: string; bonus: number } | null>(
    null
  );
  const msId = useRef(0);
  const [tip, setTip] = useState<{ id: number; text: string } | null>(null);
  const tipId = useRef(0);
  const [result, setResult] = useState<LessonResult | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [info, setInfo] = useState<CompleteInfo | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;
  // rekor yang ada SAAT misi dimulai — bukan setelah handleComplete memperbarui profil
  const prevBestRef = useRef(prevBest);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (!ghost) return;
    const t = setTimeout(() => setGhost(null), 300);
    return () => clearTimeout(t);
  }, [ghost]);

  useEffect(() => {
    if (!tip) return;
    const t = setTimeout(() => setTip(null), 2800);
    return () => clearTimeout(t);
  }, [tip]);

  const showTip = (kind: string, text: string) => {
    const st = g.current;
    if (st.tipCount >= TIPS_MAX || st.tipShown[kind]) return;
    st.tipShown[kind] = true;
    st.tipCount += 1;
    tipId.current += 1;
    setTip({ id: tipId.current, text });
    sfx.tip();
  };

  /* ---------- overdrive: telegraph 1,5 dtk sebelum aktif ---------- */
  const armOverdrive = () => {
    const st = g.current;
    if (st.odTelegraphUntil || st.odUntil) return;
    st.od = 100;
    st.odTelegraphUntil = performance.now() + OD_TELEGRAPH_MS;
    sfx.odReady();
    showTip("od", "OVERDRIVE siap! Skor ×2 selama 8 detik — tetap presisi.");
  };

  /* ---------- mulai / jeda / lanjut ---------- */
  const beginPlay = () => {
    const st = g.current;
    const now = performance.now();
    // overdrive yang dibekukan saat jeda dilanjutkan, bukan hangus
    if (st.odTeleRemain > 0) {
      st.odTelegraphUntil = now + st.odTeleRemain;
      st.odTeleRemain = 0;
    } else if (st.odRemain > 0) {
      st.odUntil = now + st.odRemain;
      st.odRemain = 0;
    }
    setPhase("play");
    setGoFlash(true);
    sfx.go();
  };
  const beginPlayRef = useRef(beginPlay);
  beginPlayRef.current = beginPlay;

  const doPause = () => {
    const p = phaseRef.current;
    if (p === "play") {
      const st = g.current;
      const now = performance.now();
      st.pauses += 1;
      if (st.odTelegraphUntil > now) {
        st.odTeleRemain = st.odTelegraphUntil - now;
        st.odTelegraphUntil = 0;
      } else if (st.odUntil > now) {
        st.odRemain = st.odUntil - now;
        st.odUntil = 0;
      }
      setPhase("pause");
    } else if (p === "countdown") {
      setPhase("pause");
    }
  };
  const doPauseRef = useRef(doPause);
  doPauseRef.current = doPause;

  /** Auto-pause: tab disembunyikan atau window kehilangan fokus → timer tidak menghukum. */
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") doPauseRef.current();
    };
    window.addEventListener("blur", doPauseRef.current);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", doPauseRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  /* ---------- hitung mundur (juga dipakai resume dari jeda) ---------- */
  useEffect(() => {
    if (phase !== "countdown") return;
    setCount(3);
    sfx.count();
    const timers = [
      setTimeout(() => {
        setCount(2);
        sfx.count();
      }, 800),
      setTimeout(() => {
        setCount(1);
        sfx.count();
      }, 1600),
      setTimeout(() => beginPlayRef.current(), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (!goFlash) return;
    const t = setTimeout(() => setGoFlash(false), 850);
    return () => clearTimeout(t);
  }, [goFlash]);

  useEffect(() => {
    if (!milestone) return;
    const t = setTimeout(() => setMilestone(null), 1300);
    return () => clearTimeout(t);
  }, [milestone]);

  /* ---------- stopwatch + telegraph/pembersih overdrive + batas latihan ---------- */
  useEffect(() => {
    if (phase !== "play") return;
    let last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      const st = g.current;
      st.elapsed += (now - last) / 1000;
      last = now;
      if (st.odTelegraphUntil && now >= st.odTelegraphUntil) {
        st.odTelegraphUntil = 0;
        st.odUntil = now + OD_DURATION;
        st.odUsed = true;
        st.hp = Math.min(100, st.hp + 5);
        sfx.odGo();
        setHealKey((k) => k + 1);
        setSharkDashKey((k) => k + 1);
      }
      if (st.odUntil && now >= st.odUntil) {
        st.odUntil = 0;
        st.od = 0;
        sfx.odEnd();
      }
      if (isPractice && st.elapsed >= PRACTICE_LIMIT_SEC) {
        finish();
        return;
      }
      force();
    }, 200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const lineIdxAt = (p: number) => {
    let i = 0;
    lines.forEach((l, li) => {
      if (p >= l.start) i = li;
    });
    return i;
  };

  const finish = () => {
    const st = g.current;
    const now = performance.now();
    // garis terakhir tanpa Enter juga bisa sempurna (ANALISIS 4.6)
    const lastLine = lines[lines.length - 1];
    if (!code.endsWith("\n") && lastLine.text.length > 0 && st.errSinceLine === 0) {
      st.linePerfect[lines.length - 1] = true;
      st.perfects += 1;
      st.score += PERFECT_LINE_BONUS;
      st.scoreEvents.push({ kind: "perfect", at: now, pts: PERFECT_LINE_BONUS });
      if (st.hp < 100) st.hp = Math.min(100, st.hp + PERFECT_LINE_HEAL);
    }
    const hpBonus = st.hp * HP_BONUS_PER_POINT;
    st.scoreEvents.push({ kind: "hpbonus", at: now, pts: hpBonus });

    if (isPractice) {
      setPhase("done");
      sfx.win();
      return;
    }

    const acc = code.length / (code.length + st.errors);
    const mins = Math.max(st.elapsed, 2) / 60;
    const wpm = Math.round(code.length / 5 / mins);
    const rank: Rank =
      acc >= 0.97 && st.hp >= 70 ? "S" : acc >= 0.92 ? "A" : acc >= 0.84 ? "B" : "C";
    const mult = rank === "S" ? 1.5 : rank === "A" ? 1.25 : rank === "B" ? 1.1 : 1;
    const res: LessonResult = {
      rank,
      score: st.score + hpBonus,
      acc,
      wpm,
      xp: Math.round(lesson.xp * mult * MODE.xpMult),
      timeSec: Math.round(st.elapsed),
      mode,
      maxCombo: st.maxCombo,
      errors: st.errors,
      hpLeft: st.hp,
      overdriveUsed: st.odUsed,
    };
    const topErrs = Object.entries(st.errMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) as [string, number][];
    setResult(res);
    setReport({
      summary: summarizeScore(st.scoreEvents),
      reason: getRankReason({
        rank,
        acc,
        hp: st.hp,
        wpm,
        modeDmg: MODE.dmg,
        perfects: st.perfects,
        odUsed: st.odUsed,
        maxCombo: st.maxCombo,
      }),
      tips: coachingTips({
        rank,
        acc,
        hp: st.hp,
        wpm,
        modeDmg: MODE.dmg,
        errors: st.errors,
        maxCombo: st.maxCombo,
        odUsed: st.odUsed,
        allPerfect: st.perfects >= lines.length,
        topErrs,
        prevBestScore: prevBestRef.current?.score,
        score: res.score,
      }),
      lineReports: buildLineReports(lines, st.lineErrors, st.lineCharErr, st.linePerfect),
      maxCombo: st.maxCombo,
      hp: st.hp,
      perfects: st.perfects,
      prevBest: prevBestRef.current,
    });
    setPhase("done");
    setInfo(onCompleteRef.current(res, code));
    sfx.win();
  };

  /* ---------- inti ketikan — dipakai keyboard fisik & soft keyboard ---------- */
  const typeChar = (ch: string) => {
    if (phaseRef.current !== "play") return;
    const st = g.current;
    const target = code.slice(st.pos, st.pos + ch.length);
    const now = performance.now();
    const odActive = st.odUntil > now;
    if (target === ch) {
      let charPts = 0;
      let enterPts = 0;
      let lineBreak = false;
      for (const c of ch) {
        st.pos += 1;
        st.combo += 1;
        if (st.combo > st.maxCombo) st.maxCombo = st.combo;
        charPts += Math.round(10 * (1 + 0.5 * Math.min(4, Math.floor(st.combo / 12))));
        if (c === "\n") {
          enterPts += 40;
          lineBreak = true;
        }
      }
      st.consecErr = 0;
      const base = charPts + enterPts;
      st.score += odActive ? base * OD_SCORE_MULT : base;
      if (charPts > 0) st.scoreEvents.push({ kind: "char", at: now, pts: charPts });
      if (enterPts > 0) st.scoreEvents.push({ kind: "enter", at: now, pts: enterPts });
      if (odActive && base > 0)
        st.scoreEvents.push({ kind: "od", at: now, pts: base }); // porsi pengali ×2

      if (!odActive) {
        st.od = Math.min(100, st.od + (lineBreak ? OD_FILL_LINE : OD_FILL_CHAR));
        if (st.od >= 100) armOverdrive();
      }

      const ms = MILESTONES[st.combo];
      if (ms) {
        st.score += ms.bonus;
        st.scoreEvents.push({ kind: "milestone", at: now, pts: ms.bonus });
        msId.current += 1;
        setMilestone({ key: msId.current, text: `COMBO ${st.combo} — ${ms.text}`, bonus: ms.bonus });
        sfx.milestone(ms.tier);
      }

      if (lineBreak) {
        const li = lineIdxAt(st.pos - 1);
        if (st.errSinceLine === 0) {
          st.linePerfect[li] = true;
          st.perfects += 1;
          st.score += PERFECT_LINE_BONUS;
          st.scoreEvents.push({ kind: "perfect", at: now, pts: PERFECT_LINE_BONUS });
          if (st.hp < 100) {
            st.hp = Math.min(100, st.hp + PERFECT_LINE_HEAL);
            setHealKey((k) => k + 1);
          }
          sfx.heal();
        }
        st.errSinceLine = 0;
        sfx.line();
      } else {
        sfx.tick(st.combo);
      }

      // checkpoint jalur misi: ⅓ dan ⅔ dari kode
      const frac = st.pos / code.length;
      if (!st.cp1 && frac >= 1 / 3 && st.pos < code.length) {
        st.cp1 = true;
        st.score += CP_BONUS;
        st.scoreEvents.push({ kind: "checkpoint", at: now, pts: CP_BONUS });
        setCpPop((k) => k + 1);
        sfx.milestone(1);
      } else if (!st.cp2 && frac >= 2 / 3 && st.pos < code.length) {
        st.cp2 = true;
        st.score += CP_BONUS;
        st.scoreEvents.push({ kind: "checkpoint", at: now, pts: CP_BONUS });
        setCpPop((k) => k + 1);
        sfx.milestone(2);
      }

      if (st.pos >= code.length) finish();
    } else {
      st.errors += 1;
      st.combo = 0;
      st.errSinceLine += 1;
      st.consecErr += 1;
      const expected = code[st.pos] ?? "?";
      st.errMap[expected] = (st.errMap[expected] ?? 0) + 1;
      const li = lineIdxAt(st.pos);
      st.lineErrors[li] = (st.lineErrors[li] ?? 0) + 1;
      st.lineCharErr[li] = st.lineCharErr[li] ?? {};
      st.lineCharErr[li][expected] = (st.lineCharErr[li][expected] ?? 0) + 1;
      dmgSeq.current += 1;
      st.dmgLog.push({
        id: dmgSeq.current,
        typed: dispChar(ch),
        expected: dispChar(expected),
        at: now,
      });
      if (st.dmgLog.length > DMG_LOG_MAX) st.dmgLog.shift();
      if (!isPractice) st.hp = Math.max(0, st.hp - MODE.dmg);
      if (!odActive) {
        st.od = Math.max(0, st.od - OD_DRAIN_ERR);
        if (st.od < 100) st.odTelegraphUntil = 0; // salah saat telegraph membatalkan siap
      }
      setDmgKey((k) => k + 1);
      setFlashKey((k) => k + 1);
      ghostId.current += 1;
      setGhost({ id: ghostId.current, ch: dispChar(ch) });
      setShaking(true);
      setTimeout(() => setShaking(false), 340);
      sfx.error();

      // tips kontekstual — satu kalimat, maksimal tiga per misi
      if (st.errors === 1) {
        showTip("err1", "Tidak apa-apa — kursor tidak maju. Ketik karakter yang disorot.");
      } else if (expected === '"' || expected === "'") {
        showTip("quote", "Tanda kutip butuh Shift — lihat keycap 'berikutnya' di bawah papan.");
      } else if (st.consecErr >= 3) {
        showTip("streak", "Tarik napas dua detik, lalu lanjutkan — HP masih aman.");
      }

      if (st.hp <= 0 && !failSaved.current) {
        failSaved.current = true;
        onFailRef.current?.({
          mode,
          score: st.score,
          acc: code.length / (code.length + st.errors),
          // tanpa lantai 2 detik — gagal instan tidak boleh menghasilkan WPM absurd
          wpm: st.elapsed >= 1 ? Math.round(st.pos / 5 / (st.elapsed / 60)) : 0,
          maxCombo: st.maxCombo,
          errors: st.errors,
          progressPct: (st.pos / code.length) * 100,
          timeSec: Math.round(st.elapsed),
        });
        setPhase("fail");
        sfx.fail();
      }
    }
    force();
  };

  /* ---------- input keyboard ---------- */
  useEffect(() => {
    if (phase === "done" || phase === "fail") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        sfx.click();
        const p = phaseRef.current;
        if (p === "play") doPause();
        else if (p === "pause") setPhase("countdown"); // resume selalu lewat hitungan 3-2-1
        else if (p === "countdown") setPhase("briefing"); // batal → briefing, murah bagi pemain
        else if (p === "briefing") onExitRef.current();
        return;
      }
      const p = phaseRef.current;
      if (p === "countdown") {
        // tidak ada ketikan yang terbuang: satu tekan mulai langsung (keystroke ini tidak dihitung)
        if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key.length === 1 || e.key === "Enter")) {
          e.preventDefault();
          beginPlayRef.current();
        }
        return;
      }
      if (p === "briefing") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          sfx.click();
          setPhase("countdown");
        }
        return;
      }
      if (p !== "play") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.repeat) {
        e.preventDefault();
        return;
      }
      let ch = e.key;
      if (ch === "Backspace") {
        e.preventDefault();
        return;
      }
      if (ch === "Tab") {
        e.preventDefault();
        ch = "  ";
      } else if (ch === "Enter") {
        ch = "\n";
      } else if (ch.length !== 1) {
        return;
      } else {
        e.preventDefault();
      }
      typeChar(ch);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, code, mode]);

  /* ---------- auto-scroll baris aktif ---------- */
  const st = g.current;
  let curLine = 0;
  lines.forEach((l, i) => {
    if (st.pos >= l.start) curLine = i;
  });
  useEffect(() => {
    const el = lineRefs.current[curLine];
    const box = boxRef.current;
    if (el && box) {
      box.scrollTo({
        top: Math.max(0, el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2),
        behavior: "smooth",
      });
    }
  }, [curLine]);

  const mult = 1 + 0.5 * Math.min(4, Math.floor(st.combo / 12));
  const pct = (st.pos / code.length) * 100;
  const wpmLive = st.elapsed > 3 ? Math.round(st.pos / 5 / (st.elapsed / 60)) : 0;
  const accLive =
    st.pos + st.errors === 0 ? 100 : Math.round((st.pos / (st.pos + st.errors)) * 100);
  const accWarn = accLive < 92 && st.pos > 10;
  const hpColor = st.hp > 60 ? "#3dffa8" : st.hp > 30 ? "#ffc65c" : "#ff5d73";
  const chips = rankChips(accLive / 100, st.hp, wpmLive);

  const nowMs = performance.now();
  const inPlay = phase === "play";
  const odActive = inPlay && st.odUntil > nowMs;
  const odTelegraph = st.odTelegraphUntil > nowMs;
  const odPct = odTelegraph
    ? 100
    : st.odUntil > nowMs
      ? Math.max(0, ((st.odUntil - nowMs) / OD_DURATION) * 100)
      : Math.min(100, st.od);

  const topErrs = useMemo(
    () =>
      Object.entries(st.errMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase]
  );
  const dispChar = (c: string) => (c === "\n" ? "↵" : c === " " ? "␣" : c);

  const nextChars = useMemo(
    () =>
      code
        .slice(st.pos, st.pos + 3)
        .split("")
        .map(dispChar),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, st.pos]
  );

  const kbRef = useSoftKeyboard(
    coarse && inPlay,
    (ch) => typeChar(ch),
    () => typeChar("\n")
  );

  const charSpan = (idx: number, ch: string, key: ReactNode) => {
    const cls = idx < st.pos ? "ch-done" : idx === st.pos ? "ch-cur" : "ch-todo";
    const showGhost = idx === st.pos && ghost !== null && phase === "play";
    return (
      <span key={key as number} className={showGhost ? "ch-cur ch-wrong" : cls}>
        {showGhost ? ghost.ch : ch === " " ? "\u00A0" : ch}
      </span>
    );
  };

  const pbUsable = pbTimeSec != null && pbTimeSec >= 8;
  const paceDelta = pbUsable && inPlay ? st.elapsed - pbTimeSec * (st.pos / code.length) : 0;

  const briefLines = isPractice
    ? [
        <>Ketik ulang kode persis seperti tertulis — {lines.length} baris ringkas.</>,
        <>
          <b style={{ color: MODE.color }}>Ruang latihan</b>: HP tidak turun, tidak bisa gagal.
          Berakhir otomatis setelah 60 detik.
        </>,
        <>Fokus ke tanda baca: kutip ", kurung {"{}"} dan panah =&gt; adalah ranjau paling umum.</>,
      ]
    : [
        <>Ketik ulang kode persis seperti tertulis — {lines.length} baris, tidak ada backspace.</>,
        <>
          Mode <b style={{ color: MODE.color }}>{MODE.label}</b>: satu salah = −{MODE.dmg} HP dari
          total 100.
        </>,
        <>Rank S butuh akurasi ≥97% + HP ≥70 — chip syaratnya live di HUD bawah.</>,
      ];

  return (
    <div className="relative max-w-4xl mx-auto safe-b">
      {/* soft keyboard untuk perangkat sentuh */}
      {coarse && (
        <input
          ref={kbRef}
          className="soft-kb"
          aria-hidden="true"
          tabIndex={-1}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="done"
          onChange={(e) => {
            const v = e.currentTarget.value.slice(-1);
            e.currentTarget.value = "";
            if (v) typeChar(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              typeChar("\n");
            }
          }}
        />
      )}

      {/* peringatan HP kritis */}
      {inPlay && st.hp <= 30 && <div className="danger-vignette" aria-hidden="true" />}

      {/* bar atas */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            sfx.click();
            onExit();
          }}
          className="clip-btn border border-line bg-panel/70 px-3.5 py-2.5 text-dim hover:text-foam hover:border-dim/60 transition-colors text-[13px] font-medium cursor-pointer"
        >
          ← Keluar
        </button>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-[15px] sm:text-lg leading-tight truncate">
            {isPractice ? "RUANG LATIHAN" : `MISI ${lesson.number} — ${lesson.title}`}
          </h1>
        </div>
        <span
          className="clip-tag font-code text-[10.5px] tracking-[0.18em] px-3 py-1 border font-bold"
          style={{ color: mod.color, borderColor: `${mod.color}55`, background: `${mod.color}14` }}
        >
          {mod.label}
        </span>
        <span
          className="clip-tag font-code text-[10.5px] tracking-[0.18em] px-3 py-1 border font-bold"
          style={{
            color: MODE.color,
            borderColor: `${MODE.color}55`,
            background: `${MODE.color}14`,
          }}
        >
          {MODE.label} {MODE.xpLabel} XP
        </span>
        {(phase === "play" || phase === "pause") && (
          <button
            onClick={() => {
              sfx.click();
              doPause();
            }}
            className="ml-auto clip-btn border border-line bg-panel/70 px-3.5 py-2.5 text-dim hover:text-gold hover:border-gold/50 transition-colors flex items-center gap-2 text-[12.5px] font-code cursor-pointer"
          >
            <IconPause className="w-4 h-4" />
            JEDA
          </button>
        )}
      </div>

      {/* HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
        <HudCell label="SKOR">
          <span key={st.score} className="pop font-display font-black text-[22px] text-gold leading-none tnum">
            {st.score.toLocaleString("id-ID")}
          </span>
        </HudCell>
        <HudCell label="COMBO">
          <span className="flex items-center gap-2">
            <span key={st.combo} className="pop font-display font-black text-[22px] text-cyber leading-none tnum">
              {st.combo}
            </span>
            <span
              className={`font-code text-[11px] font-bold px-1.5 py-0.5 border tnum ${
                mult > 1 ? "text-coral border-coral/50 bg-coral/10" : "text-dim border-line"
              }`}
            >
              x{mult.toFixed(1)}
            </span>
            {mult > 1 && <IconFlame className="w-4 h-4 text-coral" />}
          </span>
        </HudCell>
        <HudCell label="HP HIU">
          <div className="relative w-full">
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className="h-3 flex-1 clip-tag transition-all duration-300"
                  style={{
                    background: i < Math.ceil(st.hp / 10) ? hpColor : "#132c44",
                    boxShadow: i < Math.ceil(st.hp / 10) ? `0 0 6px ${hpColor}66` : "none",
                  }}
                />
              ))}
            </div>
            {!isPractice && dmgKey > 0 && (
              <span
                key={dmgKey}
                className="damage-float absolute -top-1 right-0 font-code text-[11px] font-bold text-coral"
              >
                -{MODE.dmg}
              </span>
            )}
            {healKey > 0 && (
              <span
                key={`h${healKey}`}
                className="heal-float absolute -top-6 right-0 font-code text-[11px] font-bold text-mint"
              >
                +HP
              </span>
            )}
          </div>
          <span className="font-code text-[11px] mt-1 flex items-center gap-1.5 tnum" style={{ color: hpColor }}>
            <span
              key={dmgKey}
              className={`shark-mood inline-flex ${dmgKey > 0 ? "shark-hit" : ""} ${
                st.hp <= 30 ? "shark-critical" : ""
              }`}
              style={{
                color: hpColor,
                transform: `rotate(${((100 - st.hp) * 0.14).toFixed(1)}deg) translateY(${((100 - st.hp) * 0.05).toFixed(1)}px)`,
              }}
            >
              <IconShark className="w-4 h-4" />
            </span>
            {st.hp}/100
          </span>
        </HudCell>
        <HudCell label="LIVE">
          <div className="flex gap-3 font-code text-[12px]">
            <span>
              <b className="text-mint tnum" title="WPM tampil setelah 3 detik pertama">
                {wpmLive > 0 ? wpmLive : "—"}
              </b>{" "}
              <span className="text-dim">wpm</span>
            </span>
            <span>
              <b
                className="tnum"
                style={{ color: accWarn ? "#ffc65c" : "#35e0ff" }}
                title={accWarn ? "Di bawah ambang rank A (92%) — perlahan dan presisi" : "Akurasi live"}
              >
                {accLive}%
              </b>{" "}
              <span className="text-dim">akr</span>
            </span>
            <span>
              <b className="text-foam tnum">{Math.floor(st.elapsed)}s</b>
            </span>
          </div>
        </HudCell>

        {/* syarat rank S — live, selalu terlihat (SPESIFIKASI 8.6) */}
        <HudCell label="SYARAT RANK S" className="col-span-2 md:col-span-2">
          <div className="flex flex-wrap gap-1.5" role="status" aria-live="polite" title={RANK_TOOLTIP}>
            {chips.map((c) => (
              <span
                key={c.key}
                className={`rank-chip font-code ${c.ok ? "is-ok" : c.near ? "is-near" : ""}`}
                title={
                  c.ok
                    ? `${c.label} terpenuhi (${c.value})`
                    : `Untuk S: ${c.label} butuh ${c.key === "acc" ? "≥97%" : c.key === "hp" ? "≥70" : "≥60"} — sekarang ${c.value}`
                }
              >
                <span aria-hidden="true">{c.ok ? "✓" : c.near ? "◐" : "○"}</span> {c.label}{" "}
                {c.key === "acc" ? `${c.value}%` : c.value}
              </span>
            ))}
          </div>
        </HudCell>

        {/* damage log — pola salah yang berulang langsung terlihat (SPESIFIKASI 8.3) */}
        <HudCell label="RANJAU TERAKHIR" className="col-span-2 md:col-span-2">
          {st.dmgLog.length === 0 ? (
            <span className="font-code text-[11px] text-dim/70">
              {isPractice ? "belum ada salah — lanjutkan" : "bersih — jaga ritme!"}
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {[...st.dmgLog]
                .slice(-DMG_LOG_MAX)
                .reverse()
                .map((d) => {
                  const age = nowMs - d.at;
                  const op = age < 2500 ? 1 : Math.max(0.3, 1 - (age - 2500) / 5000);
                  return (
                    <span
                      key={d.id}
                      className="dmg-pair font-code"
                      style={{ opacity: op }}
                      title={`Kamu ketik "${d.typed}" — seharusnya "${d.expected}"`}
                    >
                      <b className="text-coral">{d.typed}</b>
                      <i className="text-dim">{d.expected}</i>
                    </span>
                  );
                })}
            </div>
          )}
        </HudCell>
      </div>

      {/* meter overdrive */}
      <div
        title="Ketik tanpa salah untuk mengisi — penuh = skor ×2 selama 8 detik!"
        className={`mt-2.5 flex items-center gap-3 border px-3.5 py-2 clip-panel-sm transition-colors ${
          odActive
            ? "border-mint/60 bg-mint/[0.06] od-active"
            : odTelegraph
              ? "border-gold/60 bg-gold/[0.07] od-ready"
              : "border-line bg-panel/70"
        }`}
      >
        <span
          className="font-code text-[9.5px] tracking-[0.22em] font-bold"
          style={{ color: odActive ? "#3dffa8" : odTelegraph ? "#ffc65c" : "#7fa3c2" }}
        >
          OVERDRIVE
        </span>
        <div className="flex-1 h-1.5 bg-deep overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${odTelegraph ? "od-ready-bar" : ""}`}
            style={{
              width: `${odPct}%`,
              background: odTelegraph ? "#ffc65c" : "#3dffa8",
              boxShadow: `0 0 8px ${odTelegraph ? "#ffc65c" : "#3dffa8"}`,
            }}
          />
        </div>
        <span
          className="font-code text-[10.5px] font-bold tnum"
          style={{ color: odActive ? "#3dffa8" : odTelegraph ? "#ffc65c" : "#7fa3c2" }}
        >
          {odActive
            ? `AKTIF ×${OD_SCORE_MULT} — ${Math.ceil((st.odUntil - nowMs) / 1000)}s`
            : odTelegraph
              ? `SIAP ×2 — ${Math.ceil((st.odTelegraphUntil - nowMs) / 1000)}s`
              : `${Math.round(odPct)}%`}
        </span>
      </div>

      {/* instruksi */}
      <Panel clip="clip-panel-sm" className="mt-3 px-4 py-3 flex items-start gap-3">
        <IconTarget className="w-4.5 h-4.5 mt-0.5 shrink-0" />
        <p className="text-[13.5px] text-foam/85 leading-relaxed">
          <span className="font-bold text-foam">Tugas: </span>
          {lesson.exercise.instruction}
        </p>
      </Panel>

      {/* papan kode */}
      <div
        className={`relative mt-3 ${shaking ? "shake" : odActive ? "od-frame" : ""} ${
          mult > 1 && inPlay && !odActive ? "combo-glow" : ""
        }`}
        style={
          mult > 1
            ? ({ "--aura": `rgba(255,93,115,${Math.min(0.5, 0.12 + (mult - 1) * 0.16).toFixed(2)})` } as React.CSSProperties)
            : undefined
        }
      >
        <Panel className="overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-deep/70">
            <span className="w-2.5 h-2.5 rounded-full bg-coral/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-gold/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-mint/80" />
            <span className="ml-2 font-code text-[11px] text-dim tracking-wider">
              KETIK ULANG KODE INI — PERSIS!
            </span>
            <span className="ml-auto flex items-center gap-2.5">
              {pbUsable && inPlay && (
                <span
                  className="clip-tag font-code text-[10.5px] font-bold px-2.5 py-0.5"
                  style={{
                    color: paceDelta < 0 ? "#3dffa8" : "#ff5d73",
                    background: paceDelta < 0 ? "rgba(61,255,168,0.1)" : "rgba(255,93,115,0.1)",
                  }}
                >
                  PB {paceDelta < 0 ? "−" : "+"}
                  {Math.abs(paceDelta).toFixed(1)}s
                </span>
              )}
              {pbUsable && !inPlay && (
                <span className="font-code text-[10.5px] text-dim">PB {pbTimeSec}s</span>
              )}
              <span className="font-code text-[11px] text-dim tnum">{Math.round(pct)}%</span>
            </span>
          </div>
          <div className="h-1.5 bg-deep relative" title="Checkpoint: +150 skor">
            <div
              className="h-full transition-all duration-200"
              style={{ width: `${pct}%`, background: mod.color, boxShadow: `0 0 8px ${mod.color}` }}
            />
            {[
              { at: 1 / 3, hit: st.cp1 },
              { at: 2 / 3, hit: st.cp2 },
            ].map((cp, i) => (
              <span
                key={`${i}-${cpPop}`}
                className={`absolute top-1/2 cp-flag ${
                  cp.hit ? "cp-hit" : ""
                } transition-colors duration-300`}
                style={{ left: `${cp.at * 100}%`, color: cp.hit ? "#ffc65c" : "#2a4a6b" }}
              >
                <MiniFlag className="w-3 h-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
              </span>
            ))}
          </div>
          <div
            ref={boxRef}
            className="relative px-3 sm:px-5 py-5 overflow-y-auto max-h-[46vh] min-h-[280px] font-code text-[15px] sm:text-[16.5px] leading-[2]"
          >
            {lines.map((line, li) => (
              <div
                key={li}
                ref={(el) => {
                  lineRefs.current[li] = el;
                }}
                className={`flex -mx-1 px-1 rounded-sm transition-colors duration-200 ${
                  li === curLine && (phase === "play" || phase === "pause")
                    ? "bg-cyber/[0.045]"
                    : ""
                }`}
              >
                <span
                  className={`w-7 shrink-0 text-right pr-3 text-[10.5px] select-none pt-[8px] ${
                    (li < lines.length - 1
                      ? st.pos >= line.start + line.text.length + 1
                      : st.pos >= code.length)
                      ? "ln-done"
                      : "text-dim/50"
                  }`}
                >
                  {li + 1}
                </span>
                <div className="whitespace-pre">
                  {line.text.split("").map((ch, j) => charSpan(line.start + j, ch, line.start + j))}
                  {li < lines.length - 1 && charSpan(line.start + line.text.length, "↵", line.start + line.text.length)}
                </div>
              </div>
            ))}
            {flashKey > 0 && (
              <div key={flashKey} className="flash-red absolute inset-0 pointer-events-none" />
            )}
          </div>
        </Panel>

        {milestone && (
          <>
            <div
              key={milestone.key}
              className="milestone-banner pointer-events-none absolute left-1/2 top-5 z-20 text-center"
            >
              <div className="clip-tag inline-block bg-gold/15 border border-gold/60 px-5 py-2 font-display font-black text-lg text-gold drop-shadow-[0_0_18px_rgba(255,198,92,0.45)]">
                {milestone.text}
              </div>
              <div className="font-code text-[11px] font-bold text-gold/85 mt-1">
                +{milestone.bonus} BONUS
              </div>
            </div>
            {/* sekawanan ikan ikut merayakan combo */}
            <div
              key={`sf-${milestone.key}`}
              className="absolute inset-0 overflow-hidden pointer-events-none z-10"
              aria-hidden="true"
            >
              <div className="absolute left-0 top-[30%] sprint-fish">
                <Fish className="swim-bob" color="#ffc65c" style={{ width: 46 }} />
              </div>
              <div
                className="absolute left-0 top-[55%] sprint-fish"
                style={{ animationDelay: "90ms" }}
              >
                <Fish className="swim-bob" color="#35e0ff" style={{ width: 32 }} />
              </div>
              <div
                className="absolute left-0 top-[16%] sprint-fish"
                style={{ animationDelay: "160ms" }}
              >
                <Fish className="swim-bob" color="#3dffa8" style={{ width: 24 }} />
              </div>
            </div>
          </>
        )}

        {/* hiu menerjang saat Overdrive aktif */}
        {sharkDashKey > 0 && <SharkSprint key={`sd-${sharkDashKey}`} />}
      </div>

      {/* petunjuk + keycap hint (SPESIFIKASI 8.7) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5 text-[12px] text-dim">
        <span className="flex items-center gap-1.5">
          <KeyCap>Esc</KeyCap> jeda
        </span>
        <span className="flex items-center gap-1.5">
          <KeyCap>Enter</KeyCap> baris baru <span className="font-code text-cyber/70">↵</span>
        </span>
        <span className="flex items-center gap-1.5">
          <KeyCap>Tab</KeyCap> = 2 spasi
        </span>
        {(phase === "play" || phase === "pause") && nextChars.length > 0 && (
          <span className="flex items-center gap-1.5" title="Tiga karakter berikutnya">
            <span className="text-dim/70 hidden sm:inline">berikutnya</span>
            {nextChars.map((c, i) => (
              <span key={i} className={`keycap ${i === 0 ? "keycap-next" : ""}`}>
                {c}
              </span>
            ))}
          </span>
        )}
        <span className="ml-auto hidden sm:flex items-center gap-2">
          <IconKeyboard className="w-4 h-4" />
          Paling nyaman dengan keyboard fisik
        </span>
      </div>

      {/* tips kontekstual — satu kalimat, tidak pernah memblokir */}
      {tip && (
        <div
          key={tip.id}
          role="status"
          className="tip-toast mt-2 border border-cyber/40 bg-cyber/[0.07] clip-panel-sm px-3.5 py-2 text-[12.5px] text-foam/90 flex items-center gap-2"
        >
          <IconTarget className="w-3.5 h-3.5 text-cyber shrink-0" />
          {tip.text}
        </div>
      )}

      {/* ---------- overlay: briefing pra-misi ---------- */}
      {phase === "briefing" && (
        <div className="absolute inset-0 z-30 bg-abyss/90 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="anim-slide w-full max-w-md text-left">
            <Panel className="p-5 sm:p-6">
              <p className="font-code text-[10px] tracking-[0.25em] text-dim">BRIEFING PRA-MISI</p>
              <h2 className="font-display font-black text-xl mt-1.5">
                {isPractice ? "Ruang Latihan" : `Misi ${lesson.number} — ${lesson.title}`}
              </h2>
              <ol className="mt-4 space-y-3 text-[13.5px] text-foam/85 leading-relaxed">
                {briefLines.map((l, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="font-code font-bold text-cyber shrink-0">{i + 1}</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2.5 mt-5">
                <button
                  onClick={() => {
                    sfx.click();
                    setPhase("countdown");
                  }}
                  className="clip-btn bg-cyber text-[#04222e] font-display font-bold text-[13px] tracking-wider px-5 py-3 flex items-center gap-2.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
                >
                  <IconPlay className="w-4 h-4" />
                  MULAI
                  <KeyCap>Enter</KeyCap>
                </button>
                <button
                  onClick={() => {
                    sfx.click();
                    onExit();
                  }}
                  className="clip-btn border border-line px-4 py-3 text-dim hover:text-foam font-display text-[12px] tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  KELUAR <KeyCap>Esc</KeyCap>
                </button>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* ---------- overlay: hitung mundur ---------- */}
      {phase === "countdown" && (
        <div className="absolute inset-0 z-30 bg-abyss/85 flex flex-col items-center justify-center">
          <FishSprint top="24%" delay={250} color="#35e0ff" w={44} />
          <FishSprint top="68%" delay={850} color="#3dffa8" w={32} />
          <div key={count} className="anim-slide text-center">
            <div className="font-display font-black text-8xl text-cyber drop-shadow-[0_0_30px_rgba(53,224,255,0.4)]">
              {count}
            </div>
            <p className="font-code text-[12px] tracking-[0.4em] text-dim mt-3">BERSIAP…</p>
            {/* primer karakter: lima karakter pertama yang harus diketik */}
            <div className="font-code text-base sm:text-lg tracking-[0.3em] text-foam/80 mt-4 select-none">
              {code.slice(0, 5)}
              <span className="text-cyber animate-pulse">▏</span>
            </div>
          </div>
          <p className="font-code text-[11px] text-dim/80 mt-4">
            Tekan tombol apa saja untuk langsung mulai · Esc batal
          </p>
        </div>
      )}
      {goFlash && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <span className="go-zoom font-display font-black text-7xl text-mint drop-shadow-[0_0_36px_rgba(61,255,168,0.5)]">
            GO!
          </span>
        </div>
      )}

      {/* ---------- overlay: jeda ---------- */}
      {phase === "pause" && (
        <div className="absolute inset-0 z-30 bg-abyss/90 flex items-center justify-center p-4">
          <div className="text-center anim-slide">
            <IconPause className="w-12 h-12 text-gold mx-auto" />
            <h2 className="font-display font-black text-3xl mt-4">JEDA</h2>
            <p className="text-dim text-sm mt-2">Tarik napas, regangkan jari, lanjutkan.</p>
            <p className="font-code text-[12.5px] text-foam/80 mt-3 tnum">
              Skor saat ini: {st.score.toLocaleString("id-ID")} · Progres {Math.round(pct)}% ·{" "}
              {Math.floor(st.elapsed)} dtk
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center mt-6">
              <button
                onClick={() => {
                  sfx.click();
                  setPhase("countdown");
                }}
                className="clip-btn bg-cyber text-[#04222e] font-display font-bold text-[13px] tracking-wider px-6 py-3 flex items-center gap-2 hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <IconPlay className="w-4 h-4" />
                LANJUT
              </button>
              <button
                onClick={() => {
                  sfx.click();
                  onRetry();
                }}
                className="clip-btn border border-line px-5 py-3 text-dim hover:text-coral hover:border-coral/50 font-display text-[12px] tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <IconRefresh className="w-4 h-4" />
                ULANGI
              </button>
              <button
                onClick={() => {
                  sfx.click();
                  onExit();
                }}
                className="clip-btn border border-line px-5 py-3 text-dim hover:text-foam font-display text-[12px] tracking-wider cursor-pointer"
              >
                KELUAR
              </button>
            </div>
            <p className="font-code text-[10.5px] text-dim/80 mt-4">
              Lanjut selalu lewat hitungan 3-2-1 — biar nggak langsung kehilangan nyawa.
            </p>
          </div>
        </div>
      )}

      {/* ---------- overlay: gagal ---------- */}
      {phase === "fail" && (
        <Overlay>
          <IconSkull className="w-16 h-16 text-coral mx-auto anim-slide" />
          <h2 className="font-display font-black text-3xl sm:text-4xl text-coral mt-4 stamp inline-block">
            HIU TENGGELAM
          </h2>
          <p className="text-dim text-sm mt-3 max-w-sm mx-auto leading-relaxed">
            HP habis di baris {curLine + 1} dari {lines.length}. Kode hebat lahir dari error yang
            diperbaiki — <span className="text-foam">coba lagi, Kadet.</span>
          </p>
          <div className="flex items-end justify-center gap-6 mt-3" aria-hidden="true">
            <Pufferfish className="w-14" color="#ff9db0" />
            <Crab className="w-16" color="#ff8a5c" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5 max-w-xs mx-auto">
            <FailStat label="PROGRES" value={`${Math.round(pct)}%`} />
            <FailStat label="COMBO MAKS" value={`${st.maxCombo}`} />
            <FailStat label="SALAH" value={`${st.errors}`} />
          </div>
          {curLine >= 1 && (
            <p className="font-code text-[11.5px] text-mint/90 mt-3">
              Sudah dikuasai: baris 1–{curLine}. Titik bocor: baris {curLine + 1}
              {(st.lineErrors[curLine] ?? 0) > 0 ? " — fokus di situ dulu." : "."}
            </p>
          )}
          {topErrs.length > 0 && (
            <p className="font-code text-[11.5px] text-dim mt-2">
              Ranjau terkuat:{" "}
              {topErrs.map(([c, n], i) => (
                <span key={i} className="font-bold text-coral mx-1">
                  “{dispChar(c)}”×{n}
                </span>
              ))}
            </p>
          )}
          <div className="grid gap-2.5 mt-6 max-w-xs mx-auto">
            <button
              onClick={() => {
                sfx.click();
                onRetry();
              }}
              className="clip-btn bg-coral text-[#2b050c] font-display font-bold text-[13px] tracking-wider px-6 py-3.5 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,93,115,0.35)] transition-all cursor-pointer"
            >
              <IconRefresh className="w-4 h-4" />
              COBA LAGI
            </button>
            <button
              onClick={() => {
                sfx.click();
                onExit();
              }}
              className="clip-btn border border-line px-5 py-3 text-dim hover:text-foam font-display text-[12px] tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <IconHome className="w-4 h-4" />
              PETA MISI
            </button>
          </div>
        </Overlay>
      )}

      {/* ---------- overlay: selesai ---------- */}
      {phase === "done" && isPractice && (
        <Overlay>
          <span className="text-5xl mx-auto block anim-slide" aria-hidden="true">
            🦈
          </span>
          <h2 className="font-display font-black text-3xl text-mint mt-4 stamp inline-block">
            JARI SUDAH PANAS!
          </h2>
          <p className="text-dim text-sm mt-3 max-w-sm mx-auto leading-relaxed">
            60 detik latihan selesai — tanpa satu HP pun berkurang. Lanjut ke{" "}
            <span className="text-foam font-bold">Misi 01 dengan Mode Santai</span>: damage ringan
            buat pemanasan, dan masih ada backspace mental gratis.
          </p>
          <div className="grid gap-2.5 mt-6 max-w-xs mx-auto">
            <button
              onClick={() => {
                sfx.click();
                onExit();
              }}
              className="clip-btn bg-cyber text-[#04222e] font-display font-bold text-[13px] tracking-wider px-6 py-3.5 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <IconHome className="w-4 h-4" />
              KE PETA MISI
            </button>
            <button
              onClick={() => {
                sfx.click();
                onRetry();
              }}
              className="clip-btn border border-line px-5 py-3 text-dim hover:text-foam font-display text-[12px] tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <IconRefresh className="w-4 h-4" />
              LATIHAN LAGI
            </button>
          </div>
        </Overlay>
      )}
      {phase === "done" && result && report && !isPractice && (
        <ResultScreen
          result={result}
          report={report}
          info={info}
          mode={MODE}
          mod={mod}
          onPreview={onPreview}
          onRetry={onRetry}
          onExit={onExit}
        />
      )}
    </div>
  );
}

/* ---------- sub-komponen ---------- */

function HudCell({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`bg-panel/85 border border-line clip-panel-sm px-3.5 py-2.5 ${className}`}>
      <p className="text-[9px] font-code tracking-[0.22em] text-dim mb-1">{label}</p>
      {children}
    </div>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 bg-abyss/90 backdrop-blur-[3px] overflow-y-auto">
      <Panel className="max-w-md w-full mx-auto my-6 sm:my-10 p-6 sm:p-8 text-center relative overflow-hidden">
        {children}
      </Panel>
    </div>
  );
}

function FailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-deep/70 border border-line px-2 py-2">
      <p className="text-[8.5px] font-code tracking-[0.15em] text-dim">{label}</p>
      <p className="font-code font-bold text-sm text-coral mt-0.5 tnum">{value}</p>
    </div>
  );
}
