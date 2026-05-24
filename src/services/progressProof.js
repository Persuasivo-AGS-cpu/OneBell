import { calculateCoachStats, calculateStreak } from './coachEngine.js';

export function formatDayCount(count = 0) {
  const days = Number(count) || 0;
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

export function buildProgressProof({ history = [], profile = {}, coachPlan = {}, now = new Date() } = {}) {
  const stats = calculateCoachStats(history);
  const streak = calculateStreak(history, now);
  const weeklyTarget = Number(profile.daysPerWeek) || 3;
  const thisWeekCount = getThisWeekCount(history, now);
  const total = weeklyTarget * 12;
  const week = coachPlan.week || 1;
  const lastSession = history.at(-1);
  const sessionsLeftThisWeek = Math.max(0, weeklyTarget - thisWeekCount);

  return {
    stats,
    streak,
    currentStreakLabel: formatDayCount(streak.current),
    longestStreakLabel: formatDayCount(streak.longest),
    timeValue: stats.minutes > 0 ? stats.timeLabel : 'First minutes soon',
    kcalValue: stats.kcal > 0 ? stats.kcal : 'After next log',
    protocolLine: `You are ${stats.count} ${stats.count === 1 ? 'session' : 'sessions'} into week ${week} of your 12-week protocol.`,
    planPercent: Math.min(100, (stats.count / total) * 100),
    thisWeekCount,
    weeklyTarget,
    cards: [
      {
        title: 'Last session',
        value: lastSession ? lastSession.name || 'Workout logged' : 'No session yet',
        detail: lastSession ? formatDate(lastSession.date) : 'Complete one workout to create proof.',
      },
      {
        title: 'Best streak',
        value: formatDayCount(streak.longest),
        detail: streak.longest > 0 ? 'Your best run so far.' : 'Your first streak starts after one session.',
      },
      {
        title: 'This week',
        value: `${thisWeekCount}/${weeklyTarget} sessions`,
        detail: sessionsLeftThisWeek === 0 ? 'Weekly target reached.' : `${sessionsLeftThisWeek} to hit your weekly target.`,
      },
      {
        title: 'Next milestone',
        value: getNextMilestone(stats.count),
        detail: 'Keep stacking clean sessions.',
      },
    ],
    nextMilestone: {
      value: sessionsLeftThisWeek === 0 ? 'Weekly target reached' : `${sessionsLeftThisWeek} ${sessionsLeftThisWeek === 1 ? 'session' : 'sessions'} to go`,
      detail: 'Next weekly target checkpoint.',
    },
  };
}

function getThisWeekCount(history = [], now = new Date()) {
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return history.filter((entry) => new Date(entry.date) >= monday).length;
}

function getNextMilestone(count) {
  if (count < 1) return 'First bell';
  if (count < 5) return `${5 - count} to 5 sessions`;
  if (count < 12) return `${12 - count} to 12 sessions`;
  return '12-week rhythm';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}
