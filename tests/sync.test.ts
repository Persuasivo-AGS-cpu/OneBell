import test from "node:test";
import assert from "node:assert/strict";
import { defaultProfile, defaultStats, type Saved } from "../src/lib/storage.ts";
import {
  canPublishProfile,
  fitSyncPayload,
  formatPairCode,
  mirrorChanged,
  parsePairCode,
  shouldApply,
  syncCodeFromLocation,
  type RemoteSyncMessage,
  type WorkoutMirror,
} from "../src/lib/sync.ts";

const saved = (patch: Partial<Saved> = {}): Saved => ({
  profile: defaultProfile,
  stats: defaultStats,
  tests: [],
  program: null,
  notes: [],
  recent: [],
  updatedAt: 1,
  ...patch,
});

const mirror = (patch: Partial<WorkoutMirror> = {}): WorkoutMirror => ({
  active: true,
  exerciseId: "swing",
  exerciseName: "Swing",
  cue: "Cadera atrás",
  left: 10,
  paused: false,
  set: 1,
  totalSets: 3,
  amount: "10",
  mode: "reps",
  section: "Programa",
  label: "Haz tus repeticiones",
  ...patch,
});

const msg = (patch: Partial<RemoteSyncMessage> = {}): RemoteSyncMessage => ({
  type: "STATE_PUSH",
  room: "849102",
  senderId: "celular",
  sender: "mobile",
  saved: saved(),
  timestamp: 1,
  ...patch,
});

test("el código acepta seis dígitos con o sin guion", () => {
  assert.equal(parsePairCode("849-102"), "849102");
  assert.equal(parsePairCode("849102"), "849102");
  assert.equal(parsePairCode("12345"), null);
  assert.equal(parsePairCode("12a456"), null);
  assert.equal(formatPairCode("849102"), "849-102");
});

test("la URL solo trae un código de seis dígitos", () => {
  assert.equal(syncCodeFromLocation("?sync=849102"), "849102");
  assert.equal(syncCodeFromLocation("?sync=12"), null);
  assert.equal(syncCodeFromLocation(""), null);
});

test("cada lado ignora su propio mensaje, otra sala y el tipo que no le toca", () => {
  assert.equal(shouldApply(msg({ senderId: "tv" }), "tv", "tv", "849102"), "ignore");
  assert.equal(shouldApply(msg(), "tv", "tv", "otra"), "ignore");
  assert.equal(shouldApply(msg({ type: "STATE_ACK" }), "tv", "tv", "849102"), "ignore");
  assert.equal(shouldApply(msg(), "cel", "mobile", "849102"), "ignore");
});

test("la TV aplica el perfil y el espejo; el celular solo el acuse", () => {
  assert.equal(shouldApply(msg(), "tv", "tv", "849102"), "state");
  assert.equal(shouldApply(msg({ saved: undefined }), "tv", "tv", "849102"), "ignore");
  assert.equal(shouldApply(msg({ type: "STATE_ACK", sender: "tv" }), "cel", "mobile", "849102"), "ack");
  assert.equal(shouldApply(msg({ type: "WORKOUT_MIRROR", saved: undefined, workoutState: mirror() }), "tv", "tv", "849102"), "mirror");
  assert.equal(shouldApply(msg({ type: "WORKOUT_MIRROR", saved: undefined }), "tv", "tv", "849102"), "ignore");
});

test("un perfil pequeño sale igual", () => {
  const small = saved();
  assert.deepEqual(fitSyncPayload(small), small);
});

test("un perfil enorme recorta notas viejas y cabe en 3800 bytes", () => {
  const long = "x".repeat(400);
  const notes = Array.from({ length: 20 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    seconds: 600,
    ratings: [{ id: "swing", name: "Swing", rating: long }],
  }));
  const tests = [
    { date: "2026-01-01", weight: 16, values: { swing: 1 } },
    { date: "2026-02-01", weight: 16, values: { swing: 2 } },
  ];
  const bulky = saved({ notes, tests, recent: [["a"], ["b"]] });
  assert.ok(Buffer.byteLength(JSON.stringify(bulky)) > 3800);
  const fitted = fitSyncPayload(bulky);
  assert.ok(Buffer.byteLength(JSON.stringify(fitted)) <= 3800);
  assert.deepEqual(fitted.profile, bulky.profile);
  assert.equal(fitted.program, null);
  assert.deepEqual(fitted.stats, bulky.stats);
  assert.equal(fitted.tests.at(-1)?.date, "2026-02-01");
  assert.ok(fitted.notes.length < bulky.notes.length);
  assert.deepEqual(bulky.notes.length, 20);
});

test("sin perfil listo no se publica, y el reloj del espejo no cuenta como cambio", () => {
  assert.equal(canPublishProfile(false), false);
  assert.equal(canPublishProfile(true), true);
  const current = mirror();
  assert.equal(mirrorChanged(current, mirror({ left: 9 })), false);
  assert.equal(mirrorChanged(current, mirror({ paused: true })), true);
  assert.equal(mirrorChanged(current, mirror({ active: false })), true);
  assert.equal(mirrorChanged(null, current), true);
});
