import { byId } from "./catalog";
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

export type TestResult = { date: string; weight: number; values: Record<string, number> };
/** values: swing, goblet, press-izq, press-der, remo-izq, remo-der, plancha (segundos). */
export const valueKeys = (m: TestMove) => (m.perSide ? [`${m.key}-izq`, `${m.key}-der`] : [m.key]);
export const totalFor = (m: TestMove, r?: TestResult) => {
  if (!r) return null;
  const vals = valueKeys(m).map((k) => r.values[k]).filter((v) => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
};
export const nextTestDate = (tests: TestResult[]) => {
  if (!tests.length) return null;
  const d = new Date(tests[tests.length - 1].date + "T12:00:00"); d.setDate(d.getDate() + TEST_EVERY_DAYS); return d;
};
export const fmtDate = (d: Date) => new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(d);
