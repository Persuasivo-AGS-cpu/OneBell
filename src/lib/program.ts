import type { Level } from "./types";

export type DayType = "Fuerza" | "Acondicionamiento" | "Movilidad" | "Descarga" | "Prueba" | "Descanso";
export type PlanDay = { index: number; week: number; type: DayType };
export type ProgramState = { id: string; start: string; days: number; done: number[] };

export type Program = { id: string; name: string; level: Level; weeks: number; goal: string; ready: boolean; focus: string };
export const PROGRAMS: Program[] = [
  { id: "cero-a-100-swings", name: "De cero a 100 swings", level: "Principiante", weeks: 8, goal: "100 swings a dos manos en menos de 5 minutos", ready: true, focus: "Swing a dos manos" },
  { id: "primer-get-up", name: "Primer turkish get-up", level: "Principiante", weeks: 6, goal: "Get-up completo con técnica limpia", ready: false, focus: "Turkish get-up" },
  { id: "motor-acondicionamiento", name: "Motor de acondicionamiento", level: "Intermedio", weeks: 8, goal: "20 minutos de EMOM continuo", ready: false, focus: "EMOM" },
  { id: "sube-de-pesa", name: "Sube de pesa", level: "Intermedio", weeks: 10, goal: "Press con tu siguiente kettlebell", ready: false, focus: "Press militar" },
  { id: "prueba-snatch", name: "Prueba de snatch", level: "Avanzado", weeks: 12, goal: "100 snatches en 5 minutos", ready: false, focus: "Snatch" },
];
export const programById = (id?: string | null) => PROGRAMS.find((p) => p.id === id) ?? null;

// Días de entrenamiento dentro de cada semana (1 = primer día de la semana del programa).
const TRAINING_DAYS: Record<number, number[]> = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 5, 6] };
// Rotación de enfoques para que nunca se repita el mismo tipo de día seguido.
const ROTATION: Record<number, DayType[]> = {
  2: ["Fuerza", "Acondicionamiento"],
  3: ["Fuerza", "Acondicionamiento", "Movilidad"],
  4: ["Fuerza", "Acondicionamiento", "Movilidad", "Acondicionamiento"],
  5: ["Fuerza", "Acondicionamiento", "Movilidad", "Fuerza", "Acondicionamiento"],
};
const DELOAD_WEEKS = [4, 8];
export const TEST_DAYS = [1, 15, 29, 43, 57];

/** Genera el plan completo: 8 semanas más el día 57 de prueba final. */
export function buildPlan(program: Program, daysPerWeek: number): PlanDay[] {
  const days = TRAINING_DAYS[daysPerWeek] ?? TRAINING_DAYS[3];
  const rot = ROTATION[daysPerWeek] ?? ROTATION[3];
  const total = program.weeks * 7 + 1;
  const plan: PlanDay[] = [];
  for (let index = 1; index <= total; index++) {
    const week = Math.ceil(index / 7);
    const dow = ((index - 1) % 7) + 1;
    let type: DayType = "Descanso";
    const slot = days.indexOf(dow);
    if (TEST_DAYS.includes(index)) type = "Prueba";
    else if (slot >= 0) type = DELOAD_WEEKS.includes(week) ? (slot % 2 === 0 ? "Descarga" : "Movilidad") : rot[slot % rot.length];
    plan.push({ index, week: Math.min(week, program.weeks), type });
  }
  return plan;
}

/** Dosis semanal del ejercicio clave del programa (EMOM: series × repeticiones). */
const SWING_DOSE: [number, number][] = [[5, 10], [6, 10], [7, 10], [5, 10], [8, 10], [8, 12], [10, 10], [5, 10]];
export const programDose = (week: number) => SWING_DOSE[Math.max(0, Math.min(SWING_DOSE.length - 1, week - 1))];

const toDate = (key: string) => new Date(key + "T12:00:00");
export const dayIndexFor = (start: string, when = new Date()) => {
  const a = toDate(start); const b = new Date(when); b.setHours(12, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
};
export const dateForIndex = (start: string, index: number) => { const d = toDate(start); d.setDate(d.getDate() + index - 1); return d; };

export const TYPE_INFO: Record<DayType, { short: string; desc: string }> = {
  Fuerza: { short: "Fuerza", desc: "Ejercicios lentos y controlados: bisagra, sentadilla, empuje y jalón." },
  Acondicionamiento: { short: "Acond.", desc: "Swings del programa en EMOM más un circuito para subir el pulso." },
  Movilidad: { short: "Movil.", desc: "Core, rotación y movilidad para recuperar sin dejar de moverte." },
  Descarga: { short: "Ligero", desc: "Semana ligera: técnica del swing con menos volumen y movilidad." },
  Prueba: { short: "Prueba", desc: "Prueba OneBell: los mismos cinco ejercicios para medir tu avance." },
  Descanso: { short: "Libre", desc: "Día libre. Caminar o estirar suave también cuenta." },
};
