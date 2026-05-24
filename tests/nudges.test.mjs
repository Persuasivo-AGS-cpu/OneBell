import assert from 'node:assert/strict';
import test from 'node:test';

import { getRetentionNudge, shouldOfferNotifications } from '../src/services/nudges.js';

test('getRetentionNudge celebrates first workout before asking for notifications', () => {
  const nudge = getRetentionNudge({
    history: [{ date: '2026-05-18T12:00:00', feedback: 'correct' }],
    notificationPermission: 'default',
    now: new Date('2026-05-18T14:00:00'),
  });

  assert.equal(nudge.type, 'first-win');
  assert.match(nudge.message, /first/i);
});

test('getRetentionNudge offers streak rescue after missed days without shame copy', () => {
  const nudge = getRetentionNudge({
    history: [{ date: '2026-05-12T12:00:00', feedback: 'correct' }],
    notificationPermission: 'default',
    now: new Date('2026-05-18T12:00:00'),
  });

  assert.equal(nudge.type, 'streak-rescue');
  assert.match(nudge.message, /restart|rhythm|easy/i);
  assert.doesNotMatch(nudge.message, /failed|lazy|guilt/i);
});

test('shouldOfferNotifications waits until the user completes a workout', () => {
  assert.equal(shouldOfferNotifications({ history: [], permission: 'default' }), false);
  assert.equal(shouldOfferNotifications({ history: [{ id: 1 }], permission: 'default' }), true);
  assert.equal(shouldOfferNotifications({ history: [{ id: 1 }], permission: 'denied' }), false);
});
