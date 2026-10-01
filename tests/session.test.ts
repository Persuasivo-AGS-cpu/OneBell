import test from "node:test";
import assert from "node:assert/strict";
import { allowed, sessionBell } from "../src/lib/catalog.ts";
import { buildSession } from "../src/lib/session.ts";
import type { Profile } from "../src/lib/types.ts";

const profile: Profile = { name: "Ada", weights: [8, 16, 24], level: "Principiante", space: [], concerns: ["Ninguna"], days: 3, voice: false, setupDone: true, testWeight: null };

test("una fuerza corta no se queda siempre en la bisagra", () => {
  const session = buildSession(profile, "Fuerza", 2, 10, "Normal");
  const main = session.filter((item) => item.section === "Bloque principal");
  assert.equal(main.length, 1);
  assert.equal(main[0].exercise.pattern, "Sentadilla y zancada");
  assert.equal(session.filter((item) => item.section === "Calentamiento").length, 1);
  assert.equal(session.filter((item) => item.section === "Cierre").length, 0);
});

test("el swing no entra si la espalda baja está marcada y el EMOM se acorta", () => {
  const back = { ...profile, concerns: ["Espalda baja"] };
  const session = buildSession(back, "Acondicionamiento", 7, 10, "Normal");
  const program = session.find((item) => item.section === "Programa");
  assert.ok(program);
  assert.notEqual(program.exercise.id, "swing-a-dos-manos");
  assert.equal(program.sets, 5);
  assert.equal(program.note?.includes("swings"), false);
  for (const item of session) assert.equal(allowed(back).some((exercise) => exercise.id === item.exercise.id), true);
});

test("la pesa de la sesión es la de la prueba y no inventa 10 kg", () => {
  assert.equal(sessionBell({ ...profile, testWeight: 16 }), 16);
  assert.equal(sessionBell({ ...profile, weights: [], testWeight: null }), null);
  assert.equal(sessionBell({ ...profile, testWeight: null }), 8);
});

test("no repite ejercicios de las últimas sesiones cuando hay opciones", () => {
  const ids = (s: ReturnType<typeof buildSession>) => s.filter((i) => i.section !== "Programa").map((i) => i.exercise.id);
  const recent: string[][] = [];
  for (let n = 0; n < 12; n++) {
    const session = buildSession(profile, "Fuerza", 2, 30, "Normal", recent);
    const prev = recent.slice(0, 1).flat();
    const repeated = ids(session).filter((id) => prev.includes(id));
    assert.deepEqual(repeated, [], `sesión ${n} repitió ${repeated}`);
    recent.unshift(ids(session));
    recent.length = Math.min(recent.length, 3);
  }
});

test("al regenerar evita los ejercicios del borrador actual", () => {
  const first = buildSession(profile, "Fuerza", 2, 30, "Normal");
  const draft = first.map((i) => i.exercise.id);
  for (let n = 0; n < 12; n++) {
    const again = buildSession(profile, "Fuerza", 2, 30, "Normal", [], draft);
    assert.deepEqual(again.filter((i) => draft.includes(i.exercise.id)), []);
  }
});
