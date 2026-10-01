import { allowed, byId } from "./catalog";
import type { Level, Profile } from "./types";

export type DayType = "Fuerza" | "Acondicionamiento" | "Movilidad" | "Descarga" | "Prueba" | "Descanso";
export type PlanDay = { index: number; week: number; type: DayType };
export type ProgramState = { id: string; start: string; days: number; done: number[] };

/** Prescripción del ejercicio clave de un día: ejercicio, series (o minutos de EMOM), repeticiones y textos. */
export type Rx = { ids: string[]; sets: number; reps: number; emom: boolean; note: (n: number) => string; plain: (n: number) => string };
export type Metric = { label: string; goal: number; of: (rx: Rx) => number; hint: string };
export type Program = {
  id: string; name: string; level: Level; weeks: number; goal: string; ready: boolean; focus: string;
  /** Ejercicio clave por semana y tipo de día; null si ese día no lleva bloque del programa. */
  rx: (week: number, type: DayType) => Rx | null;
  metric: Metric;
  /** Explicación extra de la meta y, si aplica, ritmo por minuto que se compara con la Prueba OneBell. */
  goalNote?: string; pace?: number;
  desc?: Partial<Record<DayType, string>>;
};

const at = <T,>(table: T[], week: number) => table[Math.max(0, Math.min(table.length - 1, week - 1))];
const series = (reps: number) => (n: number) => `${n} series de ${reps}. Descansa lo que necesites`;
const emomRx = (id: string, sets: number, reps: number, unit: string, extra = ""): Rx => ({
  ids: [id], sets, reps, emom: true,
  note: (n) => `EMOM: ${reps} ${unit} al inicio de cada minuto, ${n} minutos${extra}`, plain: series(reps),
});
const setsRx = (ids: string[], sets: number, reps: number, note: string, plain?: string): Rx => ({ ids, sets, reps, emom: false, note: () => note, plain: plain ? () => plain : series(reps) });

const SWING = "swing-a-dos-manos";
const swingEmom = (sets: number, reps: number) => emomRx(SWING, sets, reps, "swings");
/** Acondicionamiento general: los swings en EMOM acompañan a cualquier programa que no los usa como clave. */
export const conditioningRx = (week: number) => { const [sets, reps] = programDose(week); return swingEmom(sets, reps); };

// Tablas semanales: [series o minutos, repeticiones]. Las semanas 4, 8 y 12 son de descarga.
const MOTOR: [number, number][] = [[10, 10], [12, 10], [14, 10], [10, 10], [16, 10], [18, 10], [20, 10], [10, 10]];
const PRESS: [number, number][] = [[3, 5], [4, 5], [5, 5], [3, 3], [4, 6], [5, 6], [5, 8], [3, 4], [5, 9], [5, 10]];
const GETUP: [string, number, number][] = [
  ["get-up-sin-peso", 3, 3], ["get-up-sin-peso", 4, 3], ["half-get-up", 3, 3], ["half-get-up", 2, 2], ["turkish-get-up", 3, 1], ["turkish-get-up", 4, 2],
];
const SNATCH: [string, number, number][] = [
  ["half-snatch", 8, 6], ["half-snatch", 10, 6], ["half-snatch", 10, 8], ["half-snatch", 6, 5],
  ["snatch", 8, 6], ["snatch", 10, 8], ["snatch", 10, 10], ["snatch", 6, 6],
  ["snatch", 6, 12], ["snatch", 6, 16], ["snatch", 5, 20], ["snatch", 5, 10],
];

export const PROGRAMS: Program[] = [
  {
    id: "cero-a-100-swings", name: "De cero a 100 swings", level: "Principiante", weeks: 8, goal: "100 swings a dos manos en menos de 5 minutos", ready: true, focus: "Swing a dos manos",
    rx: (week, type) => type === "Acondicionamiento" ? conditioningRx(week)
      : type === "Descarga" ? setsRx([SWING], 3, 10, "Técnica: 3 series de 10 swings sin prisa, descansa lo que necesites", "Técnica: 3 series de 10, sin prisa. Descansa lo que necesites") : null,
    metric: { label: "Swings por sesión esta semana", goal: 100, of: (rx) => rx.sets * rx.reps, hint: "El volumen sube cada semana hasta llegar a 100 en la semana 7." },
    goalNote: "Equivale a 20 swings por minuto durante 5 minutos seguidos.", pace: 20,
  },
  {
    id: "primer-get-up", name: "Primer turkish get-up", level: "Principiante", weeks: 6, goal: "Get-up completo con técnica limpia", ready: true, focus: "Turkish get-up",
    rx: (week, type) => {
      if (type !== "Fuerza" && type !== "Descarga") return null;
      const [id, sets, reps] = at(GETUP, week);
      return setsRx([id], sets, reps, `${sets} series de ${reps} por lado. Sin prisa: haz una pausa de un segundo en cada posición`);
    },
    metric: { label: "Repeticiones de get-up por lado esta semana", goal: 8, of: (rx) => rx.sets * rx.reps, hint: "Pasas del get-up sin peso al completo con pesa: la semana 6 haces 4 series de 2 por lado." },
    desc: {
      Fuerza: "Práctica lenta de get-up según tu etapa, más bisagra, sentadilla, empuje y jalón.",
      Descarga: "Semana ligera: get-up con menos volumen y movilidad.",
    },
  },
  {
    id: "motor-acondicionamiento", name: "Motor de acondicionamiento", level: "Intermedio", weeks: 8, goal: "20 minutos de EMOM continuo", ready: true, focus: "EMOM",
    rx: (week, type) => type === "Acondicionamiento" || type === "Descarga" ? (([sets, reps]) => swingEmom(sets, reps))(at(MOTOR, week)) : null,
    metric: { label: "Minutos de EMOM esta semana", goal: 20, of: (rx) => rx.sets, hint: "Cada semana sumas minutos continuos hasta llegar a 20 en la semana 7. Con sesiones cortas el EMOM se recorta al tiempo que elegiste." },
    desc: {
      Acondicionamiento: "EMOM largo de swings más un circuito para subir el pulso.",
      Descarga: "Semana ligera: EMOM corto de swings y movilidad.",
    },
  },
  {
    id: "sube-de-pesa", name: "Sube de pesa", level: "Intermedio", weeks: 10, goal: "Press con tu siguiente kettlebell", ready: true, focus: "Press militar",
    rx: (week, type) => {
      if (type !== "Fuerza" && type !== "Descarga") return null;
      const [sets, reps] = at(PRESS, week);
      return setsRx(["press-militar", "press-arrodillado-a-una-mano"], sets, reps, `${sets} series de ${reps} por lado. Descansa de 1 a 2 minutos entre series${week >= 10 ? ". Si terminas todo con buena técnica, ya puedes subir de pesa" : ""}`);
    },
    metric: { label: "Repeticiones de press por lado esta semana", goal: 50, of: (rx) => rx.sets * rx.reps, hint: "Llegas a 5 series de 10 por lado en la semana 10. Con eso y buena técnica, subes de pesa." },
    desc: {
      Fuerza: "Press como ejercicio principal, más bisagra, sentadilla y jalón.",
      Descarga: "Semana ligera: press con menos volumen y movilidad.",
    },
  },
  {
    id: "prueba-snatch", name: "Prueba de snatch", level: "Avanzado", weeks: 12, goal: "100 snatches en 5 minutos", ready: true, focus: "Snatch",
    rx: (week, type) => {
      if (type !== "Acondicionamiento" && type !== "Descarga") return null;
      const [id, sets, reps] = at(SNATCH, week);
      return emomRx(id, sets, reps, "snatches", ". Cambia de mano cada minuto");
    },
    metric: { label: "Repeticiones por minuto esta semana", goal: 20, of: (rx) => rx.reps, hint: "Subes el ritmo hasta 20 por minuto en la semana 11: 100 snatches en 5 minutos." },
    goalNote: "Equivale a 20 snatches por minuto durante 5 minutos seguidos.",
    desc: {
      Acondicionamiento: "EMOM de snatch cambiando de mano cada minuto, más un circuito.",
      Descarga: "Semana ligera: snatch con menos minutos y movilidad.",
    },
  },
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
export const isDeload = (week: number) => week % 4 === 0;
/** Días de Prueba OneBell: el día 1, cada 14 días y el último día del programa. */
export const testDays = (weeks: number) => Array.from({ length: Math.floor((weeks * 7) / 14) + 1 }, (_, n) => 1 + n * 14);

/** Genera el plan completo: las semanas del programa más el día de prueba final. */
export function buildPlan(program: Program, daysPerWeek: number): PlanDay[] {
  const days = TRAINING_DAYS[daysPerWeek] ?? TRAINING_DAYS[3];
  const rot = ROTATION[daysPerWeek] ?? ROTATION[3];
  const total = program.weeks * 7 + 1;
  const tests = testDays(program.weeks);
  const plan: PlanDay[] = [];
  for (let index = 1; index <= total; index++) {
    const week = Math.ceil(index / 7);
    const dow = ((index - 1) % 7) + 1;
    let type: DayType = "Descanso";
    const slot = days.indexOf(dow);
    if (tests.includes(index)) type = "Prueba";
    else if (slot >= 0) type = isDeload(week) ? (slot % 2 === 0 ? "Descarga" : "Movilidad") : rot[slot % rot.length];
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
  Acondicionamiento: { short: "Acond.", desc: "Swings en EMOM más un circuito para subir el pulso." },
  Movilidad: { short: "Movil.", desc: "Core, rotación y movilidad para recuperar sin dejar de moverte." },
  Descarga: { short: "Ligero", desc: "Semana ligera: técnica del swing con menos volumen y movilidad." },
  Prueba: { short: "Prueba", desc: "Prueba OneBell: los mismos cinco ejercicios para medir tu avance." },
  Descanso: { short: "Libre", desc: "Día libre. Caminar o estirar suave también cuenta." },
};

/** Prescripción del ejercicio clave: la del programa, o swings de acondicionamiento general. */
export const prescribe = (program: Program, week: number, type: DayType): Rx | null =>
  program.rx(week, type) ?? (type === "Acondicionamiento" ? conditioningRx(week) : null);

/** Descripción del tipo de día; cada programa puede explicarlo a su manera. */
export const typeDesc = (program: Program | null | undefined, type: DayType) => program?.desc?.[type] ?? TYPE_INFO[type].desc;

/** Dosis del día en una línea corta, por ejemplo "Swing a dos manos: 5 minutos × 10". */
export function doseLine(program: Program, week: number, type: DayType) {
  const rx = prescribe(program, week, type);
  if (!rx) return null;
  const name = byId(rx.ids[0])?.name ?? "Bloque clave";
  return `${name}: ${rx.sets} ${rx.emom ? "minutos" : "series"} × ${rx.reps}`;
}

const range = (from: number, to: number) => (from === to ? `Semana ${from}` : `Semanas ${from} a ${to}`);
/** Bloques del calendario: tramos de progresión, semanas de descarga y prueba final. */
export function weekBlocks(weeks: number) {
  const out: { title: string; from: number; to: number }[] = [];
  const days = (a: number, b: number) => ({ from: (a - 1) * 7 + 1, to: b * 7 });
  let start = 1;
  for (let w = 1; w <= weeks; w++) {
    if (!isDeload(w)) continue;
    if (w > start) out.push({ title: range(start, w - 1), ...days(start, w - 1) });
    out.push({ title: `Semana ${w} · Descarga`, ...days(w, w) });
    start = w + 1;
  }
  if (start <= weeks) out.push({ title: range(start, weeks), ...days(start, weeks) });
  out.push({ title: "Prueba final", from: weeks * 7 + 1, to: weeks * 7 + 1 });
  return out;
}
export const deloadWeeks = (weeks: number) => Array.from({ length: weeks }, (_, n) => n + 1).filter(isDeload);

/** Prescripción semanal que mide el avance hacia la meta: el bloque clave del programa en esa semana. */
export const keyRx = (program: Program, week: number) => program.rx(week, "Acondicionamiento") ?? program.rx(week, "Fuerza");

export function deloadText(weeks: number) {
  const w = deloadWeeks(weeks);
  const list = w.length > 1 ? `${w.slice(0, -1).join(", ")} y ${w[w.length - 1]}` : String(w[0]);
  return `${w.length > 1 ? "Las semanas" : "La semana"} ${list} ${w.length > 1 ? "son" : "es"} de descarga.`;
}

/** Si el perfil permite el bloque clave del programa (el ejercicio o, al menos, uno lento del mismo patrón). */
export function blockPossible(program: Program, profile: Profile) {
  const pool = allowed({ ...profile, level: "Avanzado" });
  const mine = allowed(profile);
  for (let week = 1; week <= program.weeks; week++) {
    const rx = keyRx(program, week);
    if (!rx) continue;
    const pattern = byId(rx.ids[0])?.pattern;
    if (!rx.ids.some((id) => pool.some((e) => e.id === id)) && !mine.some((e) => e.pattern === pattern && e.type !== "Balístico")) return false;
  }
  return true;
}
