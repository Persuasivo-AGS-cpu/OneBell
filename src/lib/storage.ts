import type { Profile } from "./types";
import type { TestResult } from "./fittest";
import { buildPlan, dateForIndex, dayIndexFor, programById, type ProgramState } from "./program";

export type Stats = { streak: number; lastDay: string | null; sessions: number; bestStreak: number };
export type SessionNote = { date: string; seconds: number; ratings: { id: string; name: string; rating: string }[] };
export type Saved = { profile: Profile; stats: Stats; tests: TestResult[]; program: ProgramState | null; notes: SessionNote[]; updatedAt: number };
export type StreakCtx = { start: string; plan: { index: number; type: string }[] };

export const defaultProfile: Profile = { name: "", weights: [], level: "Principiante", space: [], concerns: ["Ninguna"], days: 3, voice: false, setupDone: false, testWeight: null };
export const defaultStats: Stats = { streak: 0, lastDay: null, sessions: 0, bestStreak: 0 };
const KEY = "onebell:state:v3";
const OLD_KEY = "onebell:profile:v2";

export function normalizeSaved(raw?: Partial<Saved> | null): Saved {
  const stats = { ...defaultStats, ...raw?.stats };
  stats.bestStreak = Math.max(stats.bestStreak || 0, stats.streak || 0);
  return { profile: { ...defaultProfile, ...raw?.profile }, stats, tests: raw?.tests ?? [], program: raw?.program ?? null, notes: raw?.notes ?? [], updatedAt: raw?.updatedAt ?? 0 };
}

/** Copia local: abre al instante y funciona sin conexión. */
export function loadLocal(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalizeSaved(JSON.parse(raw));
    const old = localStorage.getItem(OLD_KEY);
    if (old) return normalizeSaved({ profile: JSON.parse(old), updatedAt: 0 });
  } catch { /* sin almacenamiento local */ }
  return null;
}
export function saveLocal(s: Saved) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* nada */ } }
export function clearLocal() { try { localStorage.removeItem(KEY); localStorage.removeItem(OLD_KEY); } catch { /* nada */ } }

type DocRef = { get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>; set(d: Record<string, unknown>): Promise<void> };
/** Copia en tu cuenta de Claude (privada): te sigue en cualquier dispositivo. */
export async function cloudDoc(): Promise<DocRef | null> {
  const c = (window as unknown as { claude?: { use(n: string): Promise<any> } }).claude;
  if (!c?.use) return null;
  try {
    const [db, user] = await Promise.all([c.use("db"), c.use("user")]);
    if (!db || !user) return null;
    const id = await user.id();
    return id ? (db.doc(`data/users/${id}/onebell`) as DocRef) : null;
  } catch { return null; }
}

export const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayKey = (now = new Date()) => dateKey(now);
const dayBefore = (now: Date) => { const d = new Date(now); d.setDate(d.getDate() - 1); return dateKey(d); };
const parseKey = (key: string) => { const [y, m, d] = key.split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1, 12); };

export function streakContext(program: ProgramState | null): StreakCtx | null {
  const preset = programById(program?.id);
  if (!program || !preset) return null;
  return { start: program.start, plan: buildPlan(preset, program.days) };
}

/** Marca los días de prueba cuya fecha ya tiene un resultado, para no pedir la misma prueba dos veces. */
export function doneIncludingTests(state: ProgramState, tests: { date: string }[]) {
  const preset = programById(state.id);
  if (!preset) return state.done;
  const extra = buildPlan(preset, state.days)
    .filter((d) => d.type === "Prueba" && tests.some((t) => t.date === dateKey(dateForIndex(state.start, d.index))))
    .map((d) => d.index);
  return [...new Set([...state.done, ...extra])];
}

function missedTrainingDay(ctx: StreakCtx, lastDay: string, now: Date) {
  const lastIndex = dayIndexFor(ctx.start, parseKey(lastDay));
  const todayIndex = dayIndexFor(ctx.start, now);
  for (let index = lastIndex + 1; index < todayIndex; index++) {
    const day = ctx.plan[index - 1];
    if (day && day.type !== "Descanso") return true;
  }
  return false;
}

/** Con programa, un descanso del calendario no rompe la racha. Sin programa, cuenta días de calendario seguidos. */
export const currentStreak = (s: Stats, ctx?: StreakCtx | null, now = new Date()) => {
  if (!s.lastDay || s.streak <= 0) return 0;
  if (ctx) return missedTrainingDay(ctx, s.lastDay, now) ? 0 : s.streak;
  return s.lastDay === todayKey(now) || s.lastDay === dayBefore(now) ? s.streak : 0;
};
export const afterSession = (s: Stats, ctx?: StreakCtx | null, now = new Date()): Stats => {
  const today = todayKey(now);
  const streak = s.lastDay === today ? Math.max(1, s.streak) : !s.lastDay ? 1 : ctx ? (missedTrainingDay(ctx, s.lastDay, now) ? 1 : s.streak + 1) : s.lastDay === dayBefore(now) ? s.streak + 1 : 1;
  return { sessions: s.sessions + 1, lastDay: today, streak, bestStreak: Math.max(s.bestStreak || 0, s.streak || 0, streak) };
};
