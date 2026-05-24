import assert from 'node:assert/strict';
import test from 'node:test';

import { formatDate, formatDayCount, getLanguage, t } from '../src/services/copy.js';

test('t uses English by default and falls back to English for missing languages', () => {
  assert.equal(t('profile.language', undefined), 'Language');
  assert.equal(t('profile.language', 'fr'), 'Language');
});

test('t supports Spanish for critical UI labels', () => {
  assert.equal(t('profile.language', 'es'), 'Idioma');
  assert.equal(t('profile.themeLight', 'es'), 'Claro');
  assert.equal(t('profile.bodyMetrics', 'es'), 'Métricas corporales');
  assert.equal(t('profile.height', 'es'), 'Altura');
  assert.equal(t('workout.completeSet', 'es'), 'Terminar set');
  assert.equal(t('home.coachChangedTitle', 'es'), 'El coach cambió esto porque...');
});

test('t interpolates values and date helpers localize Spanish output', () => {
  assert.equal(t('program.workoutsCount', 'es', { completed: 2, total: 36 }), '2/36 sesiones');
  assert.equal(formatDayCount(1, 'es'), '1 día');
  assert.equal(formatDayCount(2, 'es'), '2 días');
  assert.match(formatDate('2026-05-24T12:00:00', 'es', { weekday: 'long' }), /domingo/i);
});

test('getLanguage normalizes supported language preferences', () => {
  assert.equal(getLanguage({ language: 'es' }), 'es');
  assert.equal(getLanguage({ language: 'en' }), 'en');
  assert.equal(getLanguage({ language: 'de' }), 'en');
});
