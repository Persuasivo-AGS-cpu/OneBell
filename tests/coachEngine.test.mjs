import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCoachPlan,
  calculateCoachStats,
  calculateStreak,
  getWorkoutRecommendation,
} from '../src/services/coachEngine.js';

const monday = new Date('2026-05-18T12:00:00');

test('buildCoachPlan scales volume and rest by experience level', () => {
  const beginner = buildCoachPlan({
    profile: { goal: 'build-strength', level: 'beginner', weight: 16, daysPerWeek: 3, duration: 25 },
    history: [],
    now: monday,
  });
  const advanced = buildCoachPlan({
    profile: { goal: 'build-strength', level: 'advanced', weight: 16, daysPerWeek: 3, duration: 25 },
    history: [],
    now: monday,
  });

  assert.equal(beginner.workout.blocks.length < advanced.workout.blocks.length, true);
  assert.equal(beginner.workout.blocks.every((block) => block.restSeconds >= 45), true);
  assert.equal(advanced.workout.blocks.some((block) => block.intensity === 'heavy'), true);
});

test('buildCoachPlan changes focus when the user goal changes', () => {
  const fatLoss = buildCoachPlan({
    profile: { goal: 'burn-fat', level: 'intermediate', weight: 16, daysPerWeek: 3, duration: 20 },
    history: [],
    now: monday,
  });
  const strength = buildCoachPlan({
    profile: { goal: 'build-strength', level: 'intermediate', weight: 16, daysPerWeek: 3, duration: 20 },
    history: [],
    now: monday,
  });

  assert.equal(fatLoss.workout.focus, 'Metabolic');
  assert.equal(strength.workout.focus, 'Strength');
  assert.notEqual(fatLoss.workout.title, strength.workout.title);
});

test('buildCoachPlan rotates different daily variants for the same goal and level', () => {
  const profile = { goal: 'build-strength', level: 'intermediate', weight: 16, daysPerWeek: 3, duration: 30 };
  const mondayPlan = buildCoachPlan({ profile, history: [], now: new Date('2026-05-18T12:00:00') });
  const wednesdayPlan = buildCoachPlan({ profile, history: [], now: new Date('2026-05-20T12:00:00') });
  const fridayPlan = buildCoachPlan({ profile, history: [], now: new Date('2026-05-22T12:00:00') });

  assert.notEqual(mondayPlan.workout.variant, wednesdayPlan.workout.variant);
  assert.notEqual(wednesdayPlan.workout.variant, fridayPlan.workout.variant);
  assert.notDeepEqual(
    mondayPlan.workout.blocks.map((block) => block.exercise),
    wednesdayPlan.workout.blocks.map((block) => block.exercise),
  );
});

test('buildCoachPlan avoids repeating the previous workout variant when possible', () => {
  const profile = { goal: 'conditioning', level: 'intermediate', weight: 16, daysPerWeek: 3, duration: 25 };
  const today = new Date('2026-05-18T12:00:00');
  const original = buildCoachPlan({ profile, history: [], now: today });
  const rotated = buildCoachPlan({
    profile,
    now: today,
    history: [{ date: '2026-05-17T12:00:00', feedback: 'correct', variant: original.workout.variant }],
  });

  assert.notEqual(rotated.workout.variant, original.workout.variant);
  assert.match(rotated.variety.reason, /rotated|fresh|avoid/i);
});

test('getWorkoutRecommendation recommends deload after repeated brutal feedback', () => {
  const history = [
    { date: '2026-05-14T12:00:00', feedback: 'brutal' },
    { date: '2026-05-16T12:00:00', feedback: 'brutal' },
  ];

  assert.equal(getWorkoutRecommendation({ history, now: monday }).state, 'deload');
});

test('buildCoachPlan pushes density after easy feedback', () => {
  const normal = buildCoachPlan({
    profile: { goal: 'build-strength', level: 'beginner', weight: 16, duration: 20 },
    history: [],
    now: monday,
  });
  const adapted = buildCoachPlan({
    profile: { goal: 'build-strength', level: 'beginner', weight: 16, duration: 20 },
    history: [{ date: '2026-05-17T12:00:00', feedback: 'easy' }],
    now: monday,
  });

  assert.equal(adapted.adaptation.reason.includes('easy'), true);
  assert.equal(adapted.workout.blocks.length > normal.workout.blocks.length, true);
  assert.equal(adapted.workout.blocks[1].restSeconds < normal.workout.blocks[1].restSeconds, true);
});

test('buildCoachPlan lowers load after pain feedback', () => {
  const normal = buildCoachPlan({
    profile: { goal: 'build-strength', level: 'intermediate', weight: 20, duration: 30 },
    history: [],
    now: monday,
  });
  const adapted = buildCoachPlan({
    profile: { goal: 'build-strength', level: 'intermediate', weight: 20, duration: 30 },
    history: [{ date: '2026-05-17T12:00:00', feedback: 'pain' }],
    now: monday,
  });

  assert.equal(adapted.adaptation.mode, 'protect');
  assert.equal(adapted.workout.blocks.length < normal.workout.blocks.length, true);
  assert.equal(adapted.workout.blocks[1].restSeconds > normal.workout.blocks[1].restSeconds, true);
  assert.equal(adapted.workout.blocks.some((block) => block.intensity === 'heavy'), false);
});

test('getWorkoutRecommendation rescues missed sessions without guilt copy', () => {
  const history = [{ date: '2026-05-12T12:00:00', feedback: 'correct' }];
  const recommendation = getWorkoutRecommendation({ history, now: monday });

  assert.equal(recommendation.state, 'recovery');
  assert.match(recommendation.message, /restart|rebuild|ease/i);
  assert.doesNotMatch(recommendation.message, /failed|lazy|lost/i);
});

test('calculateCoachStats and calculateStreak use real workout history', () => {
  const history = [
    { date: '2026-05-16T12:00:00', duration: 20, kcal: 180 },
    { date: '2026-05-17T12:00:00', duration: 25, kcal: 220 },
    { date: '2026-05-18T12:00:00', duration: 30, kcal: 260 },
  ];

  assert.deepEqual(calculateCoachStats(history), {
    count: 3,
    minutes: 75,
    timeLabel: '1h 15m',
    kcal: 660,
  });
  assert.deepEqual(calculateStreak(history, monday), { current: 3, longest: 3 });
});
