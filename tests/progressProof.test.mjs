import assert from 'node:assert/strict';
import test from 'node:test';

import { buildProgressProof, formatDayCount } from '../src/services/progressProof.js';

test('formatDayCount pluralizes day labels correctly', () => {
  assert.equal(formatDayCount(1), '1 day');
  assert.equal(formatDayCount(2), '2 days');
});

test('buildProgressProof gives useful empty state labels when time and kcal are zero', () => {
  const proof = buildProgressProof({
    history: [{ date: '2026-05-22T12:00:00', name: 'Power Skill Circuit', duration: 0, kcal: 0 }],
    profile: { daysPerWeek: 3 },
    coachPlan: { week: 1 },
    now: new Date('2026-05-23T12:00:00'),
  });

  assert.equal(proof.timeValue, 'First minutes soon');
  assert.equal(proof.kcalValue, 'After next log');
  assert.equal(proof.protocolLine, 'You are 1 session into week 1 of your 12-week protocol.');
  assert.equal(proof.cards.some((card) => card.title === 'Last session' && card.value === 'Power Skill Circuit'), true);
});

test('buildProgressProof calculates next milestone with minimal history', () => {
  const proof = buildProgressProof({
    history: [{ date: '2026-05-22T12:00:00', duration: 25, kcal: 180 }],
    profile: { daysPerWeek: 3 },
    coachPlan: { week: 1 },
    now: new Date('2026-05-23T12:00:00'),
  });

  assert.equal(proof.nextMilestone.value, '2 sessions to go');
  assert.match(proof.nextMilestone.detail, /weekly target/i);
});

test('buildProgressProof labels a nameless logged workout without saying no session yet', () => {
  const proof = buildProgressProof({
    history: [{ date: '2026-05-22T12:00:00', duration: 25, kcal: 180 }],
    profile: { daysPerWeek: 3 },
    coachPlan: { week: 1 },
    now: new Date('2026-05-23T12:00:00'),
  });

  assert.equal(proof.cards[0].value, 'Workout logged');
});
