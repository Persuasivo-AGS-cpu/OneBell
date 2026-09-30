import test from "node:test";
import assert from "node:assert/strict";
import { buildPlan, dateForIndex, programById } from "../src/lib/program.ts";
import { afterSession, currentStreak, dateKey, defaultStats, doneIncludingTests, type StreakCtx } from "../src/lib/storage.ts";

const program = programById("cero-a-100-swings")!;
const start = "2026-09-07";
const plan = buildPlan(program, 3);
const ctx: StreakCtx = { start, plan };
const onDay = (index: number) => dateForIndex(start, index);

test("un día de descanso del programa no rompe la racha", () => {
  let stats = afterSession(defaultStats, ctx, onDay(1));
  stats = afterSession(stats, ctx, onDay(3));
  assert.equal(stats.streak, 2);
  assert.equal(currentStreak(stats, ctx, onDay(4)), 2);
  stats = afterSession(stats, ctx, onDay(5));
  assert.equal(stats.streak, 3);
  assert.equal(stats.bestStreak, 3);
});

test("saltarse un día de entrenamiento sí rompe la racha y el récord se queda", () => {
  let stats = afterSession(defaultStats, ctx, onDay(1));
  stats = afterSession(stats, ctx, onDay(3));
  stats = afterSession(stats, ctx, onDay(5));
  assert.equal(stats.bestStreak, 3);
  const later = buildPlan(program, 3);
  const missed = afterSession(stats, { start, plan: later }, onDay(10));
  assert.equal(missed.streak, 1);
  assert.equal(missed.bestStreak, 3);
});

test("sin programa la racha sigue siendo de días de calendario", () => {
  const monday = new Date(2026, 8, 7, 15);
  const tuesday = new Date(2026, 8, 8, 15);
  const thursday = new Date(2026, 8, 10, 15);
  let stats = afterSession(defaultStats, null, monday);
  stats = afterSession(stats, null, tuesday);
  assert.equal(stats.streak, 2);
  stats = afterSession(stats, null, thursday);
  assert.equal(stats.streak, 1);
  assert.equal(stats.bestStreak, 2);
});

test("la prueba de hoy cuenta como el día 1 si el programa empieza hoy", () => {
  const done = doneIncludingTests({ id: program.id, start: "2026-09-30", days: 3, done: [] }, [{ date: "2026-09-30" }]);
  assert.equal(done.includes(1), true);
  assert.equal(dateKey(onDay(1)), start);
});
