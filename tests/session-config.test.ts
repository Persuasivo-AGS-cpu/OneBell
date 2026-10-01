import test from "node:test";
import assert from "node:assert/strict";
import { emomMinutes, selectMain, sessionMainLimit } from "../src/lib/session-config.ts";

test("reduce la sesión cuando hay poco tiempo", () => {
  assert.equal(sessionMainLimit(10, "Normal"), 1);
  assert.equal(sessionMainLimit(45, "Normal"), 4);
});

test("reduce un bloque adicional cuando la energía es baja", () => {
  assert.equal(sessionMainLimit(30, "Cansado"), 2);
});

test("el EMOM largo cabe en una sesión corta", () => {
  assert.equal(emomMinutes(10, 10), 5);
  assert.equal(emomMinutes(5, 45), 5);
});

test("reparte los bloques y conserva el ejercicio clave", () => {
  assert.deepEqual(selectMain(["bisagra", "sentadilla", "empuje", "jalon"], 1, 2, false), ["sentadilla"]);
  assert.deepEqual(selectMain(["bisagra", "sentadilla", "empuje", "jalon"], 2, 1, false), ["bisagra", "jalon"]);
  assert.deepEqual(selectMain(["swing", "sentadilla", "carga"], 2, 2, true), ["swing", "carga"]);
});

import { avoidTiers, rememberSession } from "../src/lib/session-config.ts";

test("recuerda solo las últimas 3 sesiones", () => {
  let recent: string[][] = [];
  for (const id of ["a", "b", "c", "d"]) recent = rememberSession(recent, [id, id]);
  assert.deepEqual(recent, [["d"], ["c"], ["b"]]);
  assert.deepEqual(rememberSession(recent, []), recent);
});

test("los niveles a evitar van de más a menos estrictos", () => {
  const tiers = avoidTiers([["a"], ["b"], ["c"]], ["x"]);
  assert.deepEqual(tiers.map((t) => [...t].sort()), [["a", "b", "c", "x"], ["a", "b", "x"], ["a", "x"], ["x"]]);
});
