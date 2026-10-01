import { allowed, byId } from "./catalog";
import { programDose, type DayType } from "./program";
import { avoidTiers, emomMinutes, selectMain, sessionMainLimit } from "./session-config";
import type { Exercise, Profile, Section, SessionItem } from "./types";

// Arma la sesión según el tipo de día, los filtros del perfil y el tiempo elegido.
const choose = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
/** Evita lo ya usado en la sesión y, si hay opciones, también lo reciente (de más a menos estricto). */
const pick = (list: Exercise[], used: Exercise[], tiers: Set<string>[]) => {
  const fresh = list.filter((x) => !used.includes(x));
  for (const tier of tiers) { const pool = fresh.filter((x) => !tier.has(x.id)); if (pool.length) return choose(pool); }
  return choose(fresh.length ? fresh : list);
};
export function buildSession(profile: Profile, type: DayType = "Acondicionamiento", week = 1, minutes = 20, energy = "Normal", recent: string[][] = [], avoid: string[] = []): SessionItem[] {
  const tiers = avoidTiers(recent, avoid);
  const ok = allowed(profile);
  const of = (...ps: string[]) => ok.filter((e) => ps.includes(e.pattern));
  const slow = (...ps: string[]) => of(...ps).filter((e) => e.type !== "Balístico");
  const used: Exercise[] = [];
  const add = (section: Section, list: Exercise[]) => { const e = pick(list, used, tiers); if (e) used.push(e); return e ? { section, exercise: e } : null; };
  const swing = byId("swing-a-dos-manos");
  const swingOk = swing && ok.some((e) => e.id === swing.id) ? swing : undefined;
  const [prescribed, reps] = programDose(week);
  const sets = emomMinutes(prescribed, minutes);
  const hinge = swingOk ?? pick(slow("Bisagra"), used, tiers);
  const programBlock = (move: Exercise | undefined, count: number, rep: number, note: string): SessionItem | null => {
    if (!move) return null;
    if (!used.includes(move)) used.push(move);
    return { section: "Programa", exercise: move, sets: count, reps: rep, note };
  };
  const main: (SessionItem | null)[] = [];
  let pin = false;
  if (type === "Fuerza") main.push(add("Bloque principal", slow("Bisagra")), add("Bloque principal", slow("Sentadilla y zancada")), add("Bloque principal", of("Empuje")), add("Bloque principal", of("Jalón")));
  if (type === "Acondicionamiento" || type === "Descarga") {
    const block = type === "Descarga"
      ? programBlock(hinge, 3, 10, swingOk ? "Técnica: 3 series de 10 swings sin prisa, descansa lo que necesites" : "Técnica: 3 series de 10, sin prisa. Descansa lo que necesites")
      : programBlock(hinge, sets, reps, swingOk ? `EMOM: ${reps} swings al inicio de cada minuto, ${sets} minutos` : `${sets} series de ${reps}. Descansa lo que necesites`);
    pin = !!block;
    main.push(block, ...(type === "Descarga"
      ? [add("Bloque principal", of("Movilidad")), add("Bloque principal", of("Core y rotación"))]
      : [add("Bloque principal", of("Sentadilla y zancada")), add("Bloque principal", of("Carga", "Core y rotación"))]));
  }
  if (type === "Movilidad") main.push(add("Bloque principal", of("Core y rotación")), add("Bloque principal", of("Core y rotación")), add("Bloque principal", of("Movilidad")));
  const chosen = selectMain(main.filter((item): item is SessionItem => !!item), sessionMainLimit(minutes, energy), week, pin);
  const warmCount = minutes <= 10 ? 1 : 2;
  const warm = Array.from({ length: warmCount }, () => add("Calentamiento", of("Calentamiento")));
  const cool = minutes <= 10 ? [] : [add("Cierre", of("Movilidad"))];
  return [...warm, ...chosen, ...cool].filter((item): item is SessionItem => !!item);
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
