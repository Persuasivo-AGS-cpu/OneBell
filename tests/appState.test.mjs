import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialState,
  completeWorkout,
  loadOneBellState,
  saveOneBellState,
  startSession,
} from '../src/services/appState.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test('loadOneBellState recovers from corrupt storage', () => {
  const storage = memoryStorage({ onebell_state: '{broken json' });
  const state = loadOneBellState(storage);

  assert.equal(state.hasCompletedOnboarding, false);
  assert.deepEqual(state.workoutHistory, []);
});

test('saveOneBellState preserves onboarding and profile data', () => {
  const storage = memoryStorage();
  const state = createInitialState();
  state.hasCompletedOnboarding = true;
  state.userProfile = { goal: 'conditioning', level: 'intermediate', weight: 20 };

  saveOneBellState(state, storage);

  assert.equal(loadOneBellState(storage).userProfile.weight, 20);
  assert.equal(loadOneBellState(storage).hasCompletedOnboarding, true);
});

test('startSession stores recoverable in-progress workout state', () => {
  const state = createInitialState();
  const next = startSession(state, { id: 'w1', blocks: [{ exercise: 'swing' }] }, new Date('2026-05-18T12:00:00'));

  assert.equal(next.activeSession.workout.id, 'w1');
  assert.equal(next.activeSession.blockIndex, 0);
  assert.equal(next.activeSession.warmupIndex, 0);
  assert.equal(next.activeSession.phase, 'warmup');
});

test('completeWorkout logs history and clears active session', () => {
  const state = createInitialState();
  state.userProfile = { bodyWeight: 80 };
  state.activeSession = {
    workout: { id: 'w1', title: 'Metabolic Engine', duration: 22, focus: 'Metabolic' },
    startedAt: '2026-05-18T12:00:00.000Z',
  };

  const next = completeWorkout(state, {
    feedback: 'correct',
    finishedAt: new Date('2026-05-18T12:22:00.000Z'),
  });

  assert.equal(next.activeSession, null);
  assert.equal(next.workoutHistory.length, 1);
  assert.equal(next.workoutHistory[0].duration, 22);
  assert.equal(next.workoutHistory[0].feedback, 'correct');
  assert.equal(next.workoutHistory[0].kcal > 0, true);
});
