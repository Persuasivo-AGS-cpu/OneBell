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

export function getRetentionNudge({ history = [], notificationPermission = 'default', now = new Date(), language = 'en' } = {}) {
  const missedDays = daysSinceLastWorkout(history, now);

  if (missedDays !== null && missedDays >= 4) {
    return {
      type: 'streak-rescue',
      title: language === 'es' ? 'Rescate de ritmo' : 'Rhythm rescue',
      message: language === 'es' ? 'Reinicia fácil hoy. Una sesión controlada recupera el ritmo.' : 'Restart easy today. One controlled session brings the rhythm back.',
      action: language === 'es' ? 'Empezar recuperación' : 'Start a recovery session',
    };
  }

  if (history.length === 1) {
    return {
      type: 'first-win',
      title: language === 'es' ? 'Primera sesión registrada' : 'First bell logged',
      message: language === 'es' ? 'Tu primer entrenamiento ya cuenta. El coach puede adaptar con esfuerzo real.' : 'Your first workout is in. The coach can now adapt from real effort.',
      action: notificationPermission === 'default'
        ? (language === 'es' ? 'Activar recordatorios inteligentes' : 'Enable smart reminders')
        : (language === 'es' ? 'Seguir entrenando' : 'Keep training'),
    };
  }

  if (history.length >= 3 && notificationPermission === 'default') {
    return {
      type: 'reminder-offer',
      title: language === 'es' ? 'Recordatorios inteligentes' : 'Smart reminders',
      message: language === 'es' ? 'Deja que OneBell te avise cuando el impulso necesite un empujón suave.' : 'Let OneBell remind you when momentum needs a gentle push.',
      action: language === 'es' ? 'Activar recordatorios' : 'Enable reminders',
    };
  }

  return {
    type: 'daily-coach',
    title: language === 'es' ? 'Hoy cuenta' : 'Today matters',
    message: language === 'es' ? 'Haz la siguiente sesión honesta. El plan se adapta después del trabajo.' : 'Do the next honest session. The plan adapts after the work.',
    action: language === 'es' ? 'Empezar entrenamiento' : 'Start workout',
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
