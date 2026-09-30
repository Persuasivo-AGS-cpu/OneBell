import test from "node:test";
import assert from "node:assert/strict";
import { expandWorkoutSteps } from "../src/lib/workout.ts";
import type { SessionItem } from "../src/lib/types.ts";

const exercise = { id: "swing", name: "Swing" } as SessionItem["exercise"];

test("expande un bloque de varias series en pasos individuales", () => {
  const session: SessionItem[] = [{ section: "Programa", exercise, sets: 3, reps: 10 }];
  const steps = expandWorkoutSteps(session);

  assert.equal(steps.length, 3);
  assert.deepEqual(steps.map((step) => [step.set, step.totalSets]), [[1, 3], [2, 3], [3, 3]]);
});

test("mantiene en un solo paso los ejercicios sin series explícitas", () => {
  const session: SessionItem[] = [{ section: "Bloque principal", exercise }];
  assert.equal(expandWorkoutSteps(session).length, 1);
});
