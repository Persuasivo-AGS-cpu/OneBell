import test from "node:test";
import assert from "node:assert/strict";
import { byId } from "../src/lib/catalog.ts";
import { PROGRAMS, blockPossible, buildPlan, deloadText, doseLine, keyRx, prescribe, testDays, weekBlocks, type DayType } from "../src/lib/program.ts";
import { buildSession } from "../src/lib/session.ts";
import type { Profile } from "../src/lib/types.ts";

const profile: Profile = { name: "Ada", weights: [16], level: "Avanzado", space: [], concerns: ["Ninguna"], days: 3, voice: false, setupDone: true, testWeight: null };
const program = (id: string) => PROGRAMS.find((p) => p.id === id)!;

test("los 5 programas están listos y sus ejercicios existen en el catálogo", () => {
  assert.equal(PROGRAMS.length, 5);
  for (const p of PROGRAMS) {
    assert.equal(p.ready, true, p.id);
    for (let week = 1; week <= p.weeks; week++) {
      for (const type of ["Fuerza", "Acondicionamiento", "Descarga"] as DayType[]) {
        const rx = prescribe(p, week, type);
        if (rx) for (const id of rx.ids) assert.ok(byId(id), `${p.id} semana ${week}: falta ${id}`);
      }
      assert.ok(keyRx(p, week), `${p.id} semana ${week} sin prescripción clave`);
    }
  }
});

test("el plan de cada programa tiene las semanas, las descargas y las pruebas correctas", () => {
  for (const p of PROGRAMS) {
    const plan = buildPlan(p, 3);
    assert.equal(plan.length, p.weeks * 7 + 1, p.id);
    assert.deepEqual(plan.filter((d) => d.type === "Prueba").map((d) => d.index), testDays(p.weeks), p.id);
    assert.equal(plan[plan.length - 1].type, "Prueba");
    for (const d of plan) if (d.week % 4 === 0) assert.notEqual(d.type, "Fuerza", `${p.id} día ${d.index}`);
  }
  assert.deepEqual(testDays(8), [1, 15, 29, 43, 57]);
  assert.deepEqual(testDays(6), [1, 15, 29, 43]);
});

test("los bloques del calendario cubren todos los días del programa", () => {
  for (const p of PROGRAMS) {
    const blocks = weekBlocks(p.weeks);
    assert.equal(blocks[0].from, 1);
    for (let i = 1; i < blocks.length; i++) assert.equal(blocks[i].from, blocks[i - 1].to + 1, `${p.id}: hueco antes de ${blocks[i].title}`);
    assert.equal(blocks[blocks.length - 1].to, p.weeks * 7 + 1);
  }
  assert.deepEqual(weekBlocks(8).map((b) => b.title), ["Semanas 1 a 3", "Semana 4 · Descarga", "Semanas 5 a 7", "Semana 8 · Descarga", "Prueba final"]);
  assert.equal(deloadText(8), "Las semanas 4 y 8 son de descarga.");
  assert.equal(deloadText(12), "Las semanas 4, 8 y 12 son de descarga.");
  assert.equal(deloadText(6), "La semana 4 es de descarga.");
});

test("cada programa llega a su meta en la semana prevista", () => {
  const reach = (id: string, week: number) => { const p = program(id); return p.metric.of(keyRx(p, week)!) ; };
  assert.equal(reach("cero-a-100-swings", 7), 100);
  assert.equal(reach("motor-acondicionamiento", 7), 20);
  assert.equal(reach("sube-de-pesa", 10), 50);
  assert.equal(reach("prueba-snatch", 11), 20);
  assert.equal(reach("primer-get-up", 6), 8);
  assert.equal(doseLine(program("cero-a-100-swings"), 2, "Acondicionamiento"), "Swing a dos manos: 6 minutos × 10");
});

test("el get-up avanza por etapas hasta el turkish get-up completo", () => {
  const p = program("primer-get-up");
  const first = buildSession({ ...profile, level: "Principiante" }, "Fuerza", 1, 30, "Normal", [], [], p).find((i) => i.section === "Programa");
  assert.equal(first?.exercise.id, "get-up-sin-peso");
  const last = buildSession({ ...profile, level: "Principiante" }, "Fuerza", 6, 30, "Normal", [], [], p).find((i) => i.section === "Programa");
  assert.equal(last?.exercise.id, "turkish-get-up");
  assert.equal(last?.emom, undefined);
});

test("el motor es EMOM de swings y el snatch es EMOM de snatch", () => {
  const motor = buildSession({ ...profile, level: "Intermedio" }, "Acondicionamiento", 7, 45, "Normal", [], [], program("motor-acondicionamiento")).find((i) => i.section === "Programa");
  assert.equal(motor?.exercise.id, "swing-a-dos-manos");
  assert.equal(motor?.emom, true);
  assert.equal(motor?.sets, 20);
  const snatch = buildSession(profile, "Acondicionamiento", 11, 30, "Normal", [], [], program("prueba-snatch")).find((i) => i.section === "Programa");
  assert.equal(snatch?.exercise.id, "snatch");
  assert.equal(snatch?.reps, 20);
  assert.equal(snatch?.sets, 5);
  assert.equal(snatch?.note?.includes("Cambia de mano"), true);
});

test("sube de pesa pone el press primero y no repite el empuje", () => {
  for (let n = 0; n < 10; n++) {
    const session = buildSession({ ...profile, level: "Intermedio" }, "Fuerza", 3, 45, "Con energía", [], [], program("sube-de-pesa"));
    const main = session.filter((i) => i.section === "Programa" || i.section === "Bloque principal");
    assert.equal(main[0].exercise.id, "press-militar");
    assert.equal(main[0].sets, 5);
    assert.equal(main.filter((i) => i.exercise.pattern === "Empuje").length, 1);
  }
});

test("con techo bajo el press cambia a arrodillado y con hombro marcado no entra", () => {
  const low = buildSession({ ...profile, level: "Intermedio", space: ["Techo bajo"] }, "Fuerza", 3, 45, "Normal", [], [], program("sube-de-pesa")).find((i) => i.section === "Programa");
  assert.equal(low?.exercise.id, "press-arrodillado-a-una-mano");
  const hurt = { ...profile, level: "Intermedio" as const, concerns: ["Hombro"] };
  assert.equal(blockPossible(program("sube-de-pesa"), hurt), false);
  assert.equal(blockPossible(program("sube-de-pesa"), profile), true);
  assert.equal(blockPossible(program("cero-a-100-swings"), { ...profile, concerns: ["Espalda baja"] }), true);
  const session = buildSession(hurt, "Fuerza", 3, 45, "Normal", [], [], program("sube-de-pesa"));
  assert.ok(session.length > 0);
  assert.equal(session.some((i) => i.exercise.pattern === "Empuje"), false);
});
