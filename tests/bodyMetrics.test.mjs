import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBodyMetricPatch, getBodyMetricsSummary, getUnitSystem } from '../src/services/bodyMetrics.js';

test('getUnitSystem defaults to metric and supports imperial', () => {
  assert.equal(getUnitSystem({}), 'metric');
  assert.equal(getUnitSystem({ unitSystem: 'imperial' }), 'imperial');
  assert.equal(getUnitSystem({ unitSystem: 'stones' }), 'metric');
});

test('getBodyMetricsSummary calculates BMI from stored kg and cm', () => {
  const summary = getBodyMetricsSummary({ bodyWeight: 75, height: 180, unitSystem: 'metric' });

  assert.equal(summary.bmiLabel, '23.1');
  assert.equal(summary.weightDisplay, 75);
  assert.equal(summary.heightDisplay, 180);
  assert.equal(summary.weightSuffix, 'kg');
  assert.equal(summary.heightSuffix, 'cm');
});

test('getBodyMetricsSummary displays imperial units while storing metric values', () => {
  const summary = getBodyMetricsSummary({ bodyWeight: 75, height: 180, unitSystem: 'imperial' });

  assert.equal(summary.weightDisplay, 165);
  assert.equal(summary.heightDisplay, 71);
  assert.equal(summary.weightSuffix, 'lb');
  assert.equal(summary.heightSuffix, 'in');
});

test('buildBodyMetricPatch converts display values back to stored metric values', () => {
  assert.deepEqual(buildBodyMetricPatch({ field: 'bodyWeight', value: 180, unitSystem: 'imperial' }), {
    bodyWeight: 82,
  });
  assert.deepEqual(buildBodyMetricPatch({ field: 'height', value: 70, unitSystem: 'imperial' }), {
    height: 178,
  });
  assert.deepEqual(buildBodyMetricPatch({ field: 'height', value: 172, unitSystem: 'metric' }), {
    height: 172,
  });
});
