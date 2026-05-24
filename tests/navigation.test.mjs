import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldHideBottomNav } from '../src/services/navigation.js';

test('shouldHideBottomNav only hides the nav during the workout route', () => {
  assert.equal(shouldHideBottomNav({ pathname: '/workout', activeSession: { id: 'session-1' } }), true);
  assert.equal(shouldHideBottomNav({ pathname: '/program', activeSession: { id: 'session-1' } }), false);
  assert.equal(shouldHideBottomNav({ pathname: '/progress', activeSession: { id: 'session-1' } }), false);
});
