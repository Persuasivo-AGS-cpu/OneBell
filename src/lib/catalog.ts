import raw from "@/data/catalog.json";
import type { Exercise, Level, Profile } from "./types";

export const catalog = raw as Exercise[];
const imgs = import.meta.glob("../assets/ex/*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const imageFor = (e: Exercise | null | undefined) => (e?.img ? imgs[`../assets/ex/${e.img}.webp`] ?? null : null);
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
