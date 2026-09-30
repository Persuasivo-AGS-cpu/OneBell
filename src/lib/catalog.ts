import raw from "../data/catalog.json" with { type: "json" };
import type { Exercise, Level, Profile } from "./types";

export const catalog = raw as Exercise[];
export const byId = (id: string) => catalog.find((e) => e.id === id);

export const PATTERNS = ["Calentamiento", "Bisagra", "Sentadilla y zancada", "Empuje", "Jalón", "Carga", "Core y rotación", "Movilidad"];
export const levelNumber: Record<Level, number> = { Principiante: 1, Intermedio: 2, Avanzado: 3 };

/** Ejercicios permitidos para el perfil: nivel, espacio y zonas a cuidar. */
export function allowed(profile: Profile) {
  const max = levelNumber[profile.level];
  const lowCeiling = profile.space.includes("Techo bajo");
  const quiet = profile.space.includes("Vecinos abajo");
  const zones = profile.concerns.filter((c) => c !== "Ninguna").map((c) => c.toLowerCase());
  return catalog.filter((e) =>
    e.level <= max &&
    (!lowCeiling || e.lowCeiling) &&
    (!quiet || e.noise !== "Alto") &&
    !e.zones.some((z) => zones.some((c) => z.toLowerCase().includes(c.slice(0, 5)))),
  );
}

export const doseLabel = (e: Exercise) =>
  e.mode === "time" ? `${e.amount} segundos${e.perSide ? " por lado" : ""}` : `${e.amount} ${e.perSide ? "por lado" : "repeticiones"}`;

/** Pesa de la sesión y del resumen. La de la prueba manda; si no hay pesas, no se inventa una. */
export function sessionBell(profile: Profile): number | null {
  if (profile.testWeight && profile.testWeight > 0) return profile.testWeight;
  const weight = profile.weights.find((w) => w > 0);
  return weight ?? null;
}
