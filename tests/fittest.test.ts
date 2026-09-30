import test from "node:test";
import assert from "node:assert/strict";
import { allowed } from "../src/lib/catalog.ts";
import { TEST_MOVES, isTestDue, nextTestDate, resolveTestExercise } from "../src/lib/fittest.ts";
import type { Profile } from "../src/lib/types.ts";

const profile: Profile = { name: "Ada", weights: [16], level: "Principiante", space: [], concerns: ["Ninguna"], days: 3, voice: false, setupDone: true, testWeight: 16 };

test("la prueba toca desde la mañana del día 14", () => {
  const tests = [{ date: "2026-09-01", weight: 16, values: { swing: 20 } }];
  const next = nextTestDate(tests)!;
  assert.equal(next.getFullYear(), 2026);
  assert.equal(next.getMonth(), 8);
  assert.equal(next.getDate(), 15);
  assert.equal(isTestDue(tests, new Date(2026, 8, 15, 8, 30)), true);
  assert.equal(isTestDue(tests, new Date(2026, 8, 14, 23, 30)), false);
});

test("la prueba no usa un ejercicio de una zona marcada", () => {
  const back = { ...profile, concerns: ["Espalda baja"] };
  const swing = TEST_MOVES[0];
  const exercise = resolveTestExercise(swing, back);
  assert.ok(exercise);
  assert.notEqual(exercise.id, "swing-a-dos-manos");
  assert.equal(allowed(back).some((item) => item.id === exercise.id), true);
  assert.equal(resolveTestExercise(swing, back, { swing: "swing-a-dos-manos" })?.id, "swing-a-dos-manos");
});
