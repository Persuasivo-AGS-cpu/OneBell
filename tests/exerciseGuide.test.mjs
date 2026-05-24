import assert from 'node:assert/strict';
import test from 'node:test';

import { buildExerciseGuide, getExerciseInsight } from '../src/services/exerciseGuide.js';

const exercises = {
  swing: {
    name: 'Kettlebell Swing',
    target: 'Posterior Chain, Hips',
    level: 'Intermediate',
    focus: 'Power',
    instructions: ['Hinge from the hips.', 'Drive the bell with your glutes.'],
    mistakes: ['Squatting the swing.'],
  },
  goblet_squat: {
    name: 'Goblet Squat',
    target: 'Quads, Core',
    level: 'Beginner',
    focus: 'Strength',
    instructions: ['Hold the bell close.', 'Sit between your knees.'],
    mistakes: ['Collapsing the chest.'],
  },
};

test('getExerciseInsight explains the movement pattern and training intent', () => {
  const insight = getExerciseInsight('swing', exercises.swing);

  assert.equal(insight.pattern, 'Hinge');
  assert.equal(insight.intent, 'Builds hip power and repeatable conditioning without turning every set into a grind.');
  assert.match(insight.coachCue, /snap/i);
  assert.equal(insight.priorityMistake, 'Squatting the swing.');
});

test('buildExerciseGuide marks current workout movements with block order', () => {
  const guide = buildExerciseGuide({
    exercises,
    currentBlocks: [
      { id: 'block-1', exercise: 'goblet_squat' },
      { id: 'block-2', exercise: 'swing' },
    ],
  });

  assert.deepEqual(
    guide.map((exercise) => [exercise.id, exercise.pattern, exercise.usageLabel]),
    [
      ['swing', 'Hinge', 'Today: block 2'],
      ['goblet_squat', 'Squat', 'Today: block 1'],
    ],
  );
});

test('getExerciseInsight gives pressing movements a pressing intent even when focus is power', () => {
  const insight = getExerciseInsight('clean_and_press', {
    name: 'Clean & Press',
    focus: 'Power',
    mistakes: ['Pressing without a brace.'],
  });

  assert.equal(insight.pattern, 'Press');
  assert.match(insight.intent, /pressing strength|overhead/i);
});

test('getExerciseInsight gives pulling movements a pulling intent', () => {
  const insight = getExerciseInsight('high_pull', {
    name: 'High Pull',
    focus: 'Power',
    mistakes: ['Shrugging too early.'],
  });

  assert.equal(insight.pattern, 'Pull');
  assert.match(insight.intent, /upper-back|pull/i);
});
