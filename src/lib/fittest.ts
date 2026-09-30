import { allowed, byId } from "./catalog";
import type { Exercise, Profile } from "./types";

/** Prueba OneBell: siempre los mismos ejercicios, tiempos, orden y pesa, para comparar. */
export type TestMove = { key: string; exerciseId: string; label: string; seconds: number; perSide: boolean; measure: "reps" | "hold" };
export const TEST_MOVES: TestMove[] = [
  { key: "swing", exerciseId: "swing-a-dos-manos", label: "Swings", seconds: 60, perSide: false, measure: "reps" },
  { key: "goblet", exerciseId: "goblet-squat", label: "Goblet squats", seconds: 60, perSide: false, measure: "reps" },
  { key: "press", exerciseId: "press-militar", label: "Press", seconds: 45, perSide: true, measure: "reps" },
  { key: "remo", exerciseId: "remo-inclinado", label: "Remos", seconds: 45, perSide: true, measure: "reps" },
  { key: "plancha", exerciseId: "plancha-alta", label: "Plancha", seconds: 120, perSide: false, measure: "hold" },
];
export const REST_SECONDS = 60;
export const TEST_EVERY_DAYS = 14;
export const TEST_COLUMNS = 5; // Día 1, 15, 29, 43 y 57 de un programa de 8 semanas

/** Con techo bajo, el press de pie se cambia por el press arrodillado (siempre el mismo, para que sea comparable). */
export const exerciseFor = (m: TestMove, p: Profile): Exercise =>
  byId(m.key === "press" && p.space.includes("Techo bajo") ? "press-arrodillado-a-una-mano" : m.exerciseId)!;

/** Ejercicio de la prueba que respeta el perfil. Si ya hay una prueba, se repite el mismo para poder comparar. */
export function resolveTestExercise(m: TestMove, profile: Profile, locked?: Record<string, string> | null): Exercise | null {
  const lockedId = locked?.[m.key];
  if (lockedId) return byId(lockedId) ?? null;
  const canonical = exerciseFor(m, profile);
  const pool = allowed(profile);
  if (pool.some((e) => e.id === canonical.id)) return canonical;
  return pool.filter((e) => e.pattern === canonical.pattern).sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id))[0] ?? null;
}

export type PlannedMove = { move: TestMove; exercise: Exercise };
export function plannedTest(profile: Profile, previous?: TestResult): PlannedMove[] {
  return TEST_MOVES.flatMap((move) => {
    const exercise = resolveTestExercise(move, profile, previous?.moves);
    return exercise ? [{ move, exercise }] : [];
  });
}

export function slotSides(move: TestMove, exercise: Exercise): ("izq" | "der" | null)[] {
  return move.measure === "hold" || !exercise.perSide ? [null] : ["izq", "der"];
}

export type TestResult = { date: string; weight: number; values: Record<string, number>; moves?: Record<string, string> };
/** values: swing, goblet, press-izq, press-der, remo-izq, remo-der, plancha (segundos). */
export const perSideFor = (m: TestMove, r?: TestResult) => {
  const ex = r?.moves?.[m.key] ? byId(r.moves[m.key]) : undefined;
  return (ex ? ex.perSide : m.perSide) && m.measure !== "hold";
};
export const valueKeys = (m: TestMove, r?: TestResult) => (perSideFor(m, r) ? [`${m.key}-izq`, `${m.key}-der`] : [m.key]);
export const totalFor = (m: TestMove, r?: TestResult) => {
  if (!r) return null;
  const vals = valueKeys(m, r).map((k) => r.values[k]).filter((v) => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
};
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const nextTestDate = (tests: TestResult[]) => {
  if (!tests.length) return null;
  const [year, month, day] = tests[tests.length - 1].date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + TEST_EVERY_DAYS);
  return d;
};
/** La prueba toca desde el inicio del día, no desde el mediodía. */
export const isTestDue = (tests: TestResult[], now = new Date()) => !tests.length || nextTestDate(tests)!.getTime() <= startOfDay(now).getTime();
export const fmtDate = (d: Date) => new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(d);
