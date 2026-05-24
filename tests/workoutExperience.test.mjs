import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFinishSummary,
  buildSessionFocus,
  calculateSessionProgress,
} from '../src/services/workoutExperience.js';

const workout = {
  title: 'Power Skill Circuit',
  duration: 25,
  blocks: [
    { id: 'a', exercise: 'halo', reps: '8 each side', restSeconds: 35 },
    { id: 'b', exercise: 'clean_and_press', reps: '6 each side', restSeconds: 50 },
    { id: 'c', exercise: 'swing', reps: '15 reps', restSeconds: 40 },
  ],
};

test('calculateSessionProgress includes warmup and workout blocks', () => {
  assert.equal(calculateSessionProgress({ session: { phase: 'warmup', warmupIndex: 1, blockIndex: 0 }, workout, warmupCount: 3 }), 33);
  assert.equal(calculateSessionProgress({ session: { phase: 'exercise', blockIndex: 1 }, workout, warmupCount: 3 }), 67);
  assert.equal(calculateSessionProgress({ session: { phase: 'finish', blockIndex: 2 }, workout, warmupCount: 3 }), 100);
});

test('calculateSessionProgress never moves backward after a rest transition', () => {
  const restProgress = calculateSessionProgress({
    session: { phase: 'rest', blockIndex: 1, completedBlocks: ['a'] },
    workout,
    warmupCount: 3,
  });
  const nextExerciseProgress = calculateSessionProgress({
    session: { phase: 'exercise', blockIndex: 1, completedBlocks: ['a'] },
    workout,
    warmupCount: 3,
  });

  assert.equal(nextExerciseProgress >= restProgress, true);
});

test('buildSessionFocus gives block-specific coaching copy', () => {
  const focus = buildSessionFocus({
    block: workout.blocks[1],
    exercise: { name: 'Clean & Press', focus: 'Strength' },
    insight: { pattern: 'Press', coachCue: 'Brace first, press clean.' },
    blockIndex: 1,
    totalBlocks: 3,
  });

  assert.equal(focus.label, 'Set focus 2/3');
  assert.match(focus.headline, /Clean & Press/);
  assert.match(focus.body, /Brace first/);
  assert.equal(focus.badges.includes('Press'), true);
});

test('buildSessionFocus deduplicates repeated badges to avoid duplicate React keys', () => {
  const focus = buildSessionFocus({
    block: { id: 'core', exercise: 'russian_twist', reps: '3 x 18' },
    exercise: { name: 'Russian Twist', focus: 'Core' },
    insight: { pattern: 'Core', coachCue: 'Move slowly.' },
    blockIndex: 0,
    totalBlocks: 1,
  });

  assert.deepEqual(focus.badges, ['Core', '3 x 18']);
});

test('buildFinishSummary turns a session into memorable proof', () => {
  const summary = buildFinishSummary({
    workout,
    completedBlocks: ['a', 'b', 'c'],
    feedback: 'easy',
  });

  assert.equal(summary.completedLabel, '3/3 blocks');
  assert.equal(summary.durationLabel, '25 min');
  assert.match(summary.coachNote, /density/i);
});
