import type { SessionItem } from "./types";

export type WorkoutStep = { item: SessionItem; set: number; totalSets: number };

export function expandWorkoutSteps(session: SessionItem[]): WorkoutStep[] {
  return session.flatMap((item) => {
    const totalSets = Math.max(1, item.sets ?? 1);
    return Array.from({ length: totalSets }, (_, index) => ({ item, set: index + 1, totalSets }));
  });
}
