import type { SessionItem } from "./types";

export type WorkoutStep = { item: SessionItem; set: number; totalSets: number };

export function expandWorkoutSteps(session: SessionItem[]): WorkoutStep[] {
  return session.flatMap((item) => {
    const totalSets = Math.max(1, item.sets ?? 1);
    return Array.from({ length: totalSets }, (_, index) => ({ item, set: index + 1, totalSets }));
  });
}

/** Segundos del cronómetro de un paso: un minuto en EMOM, la duración del ejercicio por tiempo, o un minuto de referencia. */
export const stepSeconds = (item: SessionItem) => (item.emom ? 60 : item.exercise.mode === "time" ? item.exercise.amount : 60);

/** Los pasos EMOM y por tiempo avanzan solos al llegar a cero. */
export const advancesAlone = (item: SessionItem) => !!item.emom || item.exercise.mode === "time";

/** Frase que se dice al empezar un paso. */
export function voiceLine({ item, set, totalSets }: WorkoutStep) {
  const name = item.exercise.name;
  if (item.emom) return `${set === totalSets ? "Última serie" : `Serie ${set} de ${totalSets}`}. ${name}, ${item.reps} repeticiones`;
  if (item.exercise.mode === "time") return `${name}, ${item.exercise.amount} segundos`;
  return totalSets > 1 ? `${name}, serie ${set} de ${totalSets}` : name;
}
