import type { Exercise } from "./types";

const imgs = import.meta.glob("../assets/ex/*.webp", { eager: true, import: "default" }) as Record<string, string>;
export const imageFor = (e: Exercise | null | undefined) => (e?.img ? imgs[`../assets/ex/${e.img}.webp`] ?? null : null);
