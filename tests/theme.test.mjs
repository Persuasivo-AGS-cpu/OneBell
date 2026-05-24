import assert from 'node:assert/strict';
import test from 'node:test';

import { getThemePreference, resolveTheme } from '../src/services/theme.js';

test('getThemePreference normalizes theme values', () => {
  assert.equal(getThemePreference({ theme: 'light' }), 'light');
  assert.equal(getThemePreference({ theme: 'dark' }), 'dark');
  assert.equal(getThemePreference({ theme: 'system' }), 'system');
  assert.equal(getThemePreference({ theme: 'unknown' }), 'system');
  assert.equal(getThemePreference({}), 'system');
});

test('resolveTheme preserves explicit dark and light preferences', () => {
  assert.equal(resolveTheme('light'), 'light');
  assert.equal(resolveTheme('dark'), 'dark');
});

test('resolveTheme uses system dark flag for system preference', () => {
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
});
