const DAY_MS = 24 * 60 * 60 * 1000;

function daysSinceLastWorkout(history = [], now = new Date()) {
  if (!history.length) return null;
  const latest = history
    .map((entry) => new Date(entry.date || 0).getTime())
    .filter(Boolean)
    .sort((a, b) => b - a)[0];
  return Math.floor((startOfDay(now) - startOfDay(latest)) / DAY_MS);
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function shouldOfferNotifications({ history = [], permission = 'default' } = {}) {
  return history.length > 0 && permission === 'default';
}

export function getRetentionNudge({ history = [], notificationPermission = 'default', now = new Date() } = {}) {
  const missedDays = daysSinceLastWorkout(history, now);

  if (missedDays !== null && missedDays >= 4) {
    return {
      type: 'streak-rescue',
      title: 'Rhythm rescue',
      message: 'Restart easy today. One controlled session brings the rhythm back.',
      action: 'Start a recovery session',
    };
  }

  if (history.length === 1) {
    return {
      type: 'first-win',
      title: 'First bell logged',
      message: 'Your first workout is in. The coach can now adapt from real effort.',
      action: notificationPermission === 'default' ? 'Enable smart reminders' : 'Keep training',
    };
  }

  if (history.length >= 3 && notificationPermission === 'default') {
    return {
      type: 'reminder-offer',
      title: 'Smart reminders',
      message: 'Let OneBell remind you when momentum needs a gentle push.',
      action: 'Enable reminders',
    };
  }

  return {
    type: 'daily-coach',
    title: 'Today matters',
    message: 'Do the next honest session. The plan adapts after the work.',
    action: 'Start workout',
  };
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (window.Notification.permission !== 'default') {
    return window.Notification.permission;
  }
  return window.Notification.requestPermission();
}
