import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCoachExplanation } from '../src/services/coachExplanation.js';

test('buildCoachExplanation explains easy feedback as density progression', () => {
  const explanation = buildCoachExplanation({
    coachPlan: {
      adaptation: { mode: 'progress' },
      variety: { theme: 'Speed / skill' },
      workout: { blocks: [1, 2, 3, 4, 5] },
    },
    history: [{ feedback: 'easy' }],
  });

  assert.match(explanation.body, /easy/i);
  assert.match(explanation.effect, /less rest|more work/i);
});

test('buildCoachExplanation explains pain feedback as protection', () => {
  const explanation = buildCoachExplanation({
    coachPlan: {
      adaptation: { mode: 'protect' },
      variety: { theme: 'Control' },
      workout: { blocks: [1, 2] },
    },
    history: [{ feedback: 'pain' }],
  });

  assert.match(explanation.body, /pain/i);
  assert.match(explanation.effect, /protect|lower/i);
});

test('buildCoachExplanation handles missing feedback', () => {
  const explanation = buildCoachExplanation({
    coachPlan: {
      adaptation: { mode: 'hold' },
      variety: { theme: 'Density' },
      workout: { blocks: [1, 2, 3] },
    },
    history: [],
  });

  assert.match(explanation.body, /profile/i);
  assert.equal(explanation.effect.includes('Density'), true);
});
