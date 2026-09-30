import type { Profile } from "./types";
import type { TestResult } from "./fittest";
import type { ProgramState } from "./program";

export type Stats = { streak: number; lastDay: string | null; sessions: number };
export type Saved = { profile: Profile; stats: Stats; tests: TestResult[]; program: ProgramState | null; updatedAt: number };

export const defaultProfile: Profile = { name: "Abraham", weights: [], level: "Principiante", space: [], concerns: ["Ninguna"], days: 3, voice: false, setupDone: false, testWeight: null };
export const defaultStats: Stats = { streak: 0, lastDay: null, sessions: 0 };
const KEY = "onebell:state:v3";
const OLD_KEY = "onebell:profile:v2";

/** Copia local: abre al instante y funciona sin conexión. */
export function loadLocal(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); return { profile: { ...defaultProfile, ...s.profile }, stats: { ...defaultStats, ...s.stats }, tests: s.tests ?? [], program: s.program ?? null, updatedAt: s.updatedAt ?? 0 }; }
    const old = localStorage.getItem(OLD_KEY);
    if (old) return { profile: { ...defaultProfile, ...JSON.parse(old) }, stats: defaultStats, tests: [], program: null, updatedAt: 0 };
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

const day = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayKey = () => day(new Date());
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return day(d); };
/** Racha vigente: solo cuenta si entrenaste hoy o ayer. */
export const currentStreak = (s: Stats) => (s.lastDay === todayKey() || s.lastDay === yesterdayKey() ? s.streak : 0);
export const afterSession = (s: Stats): Stats => ({
  sessions: s.sessions + 1,
  lastDay: todayKey(),
  streak: s.lastDay === todayKey() ? s.streak : s.lastDay === yesterdayKey() ? s.streak + 1 : 1,
});
