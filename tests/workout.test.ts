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

import { advancesAlone, stepSeconds, voiceLine } from "../src/lib/workout.ts";

const timed = { id: "plancha", name: "Plancha", mode: "time", amount: 30 } as SessionItem["exercise"];
const reps = { id: "puente", name: "Puente", mode: "reps", amount: 10 } as SessionItem["exercise"];

test("el EMOM dura un minuto por serie y avanza solo", () => {
  const emom: SessionItem = { section: "Programa", exercise, sets: 5, reps: 10, emom: true };
  assert.equal(stepSeconds(emom), 60);
  assert.equal(advancesAlone(emom), true);
});

test("el ejercicio por tiempo usa su duración y avanza solo; el de repeticiones espera", () => {
  assert.equal(stepSeconds({ section: "Cierre", exercise: timed }), 30);
  assert.equal(advancesAlone({ section: "Cierre", exercise: timed }), true);
  assert.equal(advancesAlone({ section: "Bloque principal", exercise: reps }), false);
  assert.equal(advancesAlone({ section: "Programa", exercise: reps, sets: 3, reps: 10 }), false);
});

test("la voz anuncia serie, última serie y duración", () => {
  const item: SessionItem = { section: "Programa", exercise, sets: 3, reps: 10, emom: true };
  assert.equal(voiceLine({ item, set: 1, totalSets: 3 }), "Serie 1 de 3. Swing, 10 repeticiones");
  assert.equal(voiceLine({ item, set: 3, totalSets: 3 }), "Última serie. Swing, 10 repeticiones");
  assert.equal(voiceLine({ item: { section: "Cierre", exercise: timed }, set: 1, totalSets: 1 }), "Plancha, 30 segundos");
});
