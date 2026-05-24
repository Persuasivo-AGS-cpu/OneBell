import assert from 'node:assert/strict';
import test from 'node:test';

import { programName, workoutFocus, workoutReps, workoutTheme, workoutTitle } from '../src/services/workoutCopy.js';

test('workoutCopy localizes program and workout labels to Spanish', () => {
  assert.equal(workoutTitle('Power Skill Circuit', 'es'), 'Circuito de potencia técnica');
  assert.equal(workoutFocus('Conditioning', 'es'), 'Acondicionamiento');
  assert.equal(workoutTheme('Speed / skill', 'es'), 'Velocidad / técnica');
  assert.equal(programName('Build Power Skill Circuit', 'es'), 'Construcción Circuito de potencia técnica');
  assert.equal(workoutReps('5 x 4/side', 'es'), '5 x 4/lado');
});

test('workoutCopy preserves English by default', () => {
  assert.equal(workoutTitle('Power Skill Circuit', 'en'), 'Power Skill Circuit');
  assert.equal(workoutFocus('Strength', 'en'), 'Strength');
});
