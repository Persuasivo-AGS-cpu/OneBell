import assert from 'node:assert/strict';
import test from 'node:test';

import { getLanguage, t } from '../src/services/copy.js';

test('t uses English by default and falls back to English for missing languages', () => {
  assert.equal(t('profile.language', undefined), 'Language');
  assert.equal(t('profile.language', 'fr'), 'Language');
});

test('t supports Spanish for critical UI labels', () => {
  assert.equal(t('profile.language', 'es'), 'Idioma');
  assert.equal(t('workout.completeSet', 'es'), 'Terminar set');
  assert.equal(t('home.coachChangedTitle', 'es'), 'El coach cambió esto porque...');
});

test('getLanguage normalizes supported language preferences', () => {
  assert.equal(getLanguage({ language: 'es' }), 'es');
  assert.equal(getLanguage({ language: 'en' }), 'en');
  assert.equal(getLanguage({ language: 'de' }), 'en');
});
