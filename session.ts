import { allowed, byId } from "./catalog";
import { programDose, type DayType } from "./program";
import type { Exercise, Profile, Section, SessionItem } from "./types";

// Arma la sesión según el tipo de día del calendario y los filtros del perfil.
// El generador fino (anti-repetición entre sesiones, minutos y energía) llega en la etapa 3.
const pick = <T,>(list: T[], avoid: T[] = []) => {
  const pool = list.filter((x) => !avoid.includes(x));
  const src = pool.length ? pool : list;
  return src[Math.floor(Math.random() * src.length)];
};
export function buildSession(profile: Profile, type: DayType = "Acondicionamiento", week = 1): SessionItem[] {
  const ok = allowed(profile);
  const of = (...ps: string[]) => ok.filter((e) => ps.includes(e.pattern));
  const slow = (...ps: string[]) => of(...ps).filter((e) => e.type !== "Balístico");
  const used: Exercise[] = [];
  const add = (section: Section, list: Exercise[]) => { const e = pick(list, used); if (e) used.push(e); return e ? { section, exercise: e } : null; };
  const swing = byId("swing-a-dos-manos")!;
  const [sets, reps] = programDose(week);
  const programBlock = (s: number, r: number, note: string): SessionItem => { used.push(swing); return { section: "Programa", exercise: swing, sets: s, reps: r, note }; };
  const items: (SessionItem | null)[] = [add("Calentamiento", of("Calentamiento")), add("Calentamiento", of("Calentamiento"))];
  if (type === "Fuerza") items.push(add("Bloque principal", slow("Bisagra")), add("Bloque principal", slow("Sentadilla y zancada")), add("Bloque principal", of("Empuje")), add("Bloque principal", of("Jalón")));
  if (type === "Acondicionamiento") items.push(programBlock(sets, reps, `EMOM: ${reps} swings al inicio de cada minuto, ${sets} minutos`), add("Bloque principal", of("Sentadilla y zancada")), add("Bloque principal", of("Carga", "Core y rotación")));
  if (type === "Movilidad") items.push(add("Bloque principal", of("Core y rotación")), add("Bloque principal", of("Core y rotación")), add("Bloque principal", of("Movilidad")));
  if (type === "Descarga") items.push(programBlock(3, 10, "Técnica: 3 series de 10 swings sin prisa, descansa lo que necesites"), add("Bloque principal", of("Movilidad")), add("Bloque principal", of("Core y rotación")));
  items.push(add("Cierre", of("Movilidad")));
  return items.filter(Boolean) as SessionItem[];
}
export function alternativesFor(profile: Profile, current: Exercise, exclude: Exercise[]) {
  const pool = allowed(profile).filter((e) => e.pattern === current.pattern && e.id !== current.id && !exclude.some((x) => x.id === e.id));
  return pool.sort(() => Math.random() - 0.5).slice(0, 3);
}
export const sessionGroups = (s: SessionItem[]) => {
  const count = new Map<string, number>();
  s.filter((i) => i.section !== "Calentamiento" && i.section !== "Cierre").forEach((i) => i.exercise.groups.forEach((g) => count.set(g, (count.get(g) ?? 0) + 1)));
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g).filter((g) => g !== "Movilidad").slice(0, 3);
};
