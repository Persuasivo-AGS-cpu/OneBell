import { calculateCoachStats, calculateStreak } from './coachEngine.js';
import { formatDate as localizeDate, formatDayCount as localizeDayCount, formatSessionCount } from './copy.js';
import { workoutTitle } from './workoutCopy.js';

export function formatDayCount(count = 0, language = 'en') {
  return localizeDayCount(count, language);
}

export function buildProgressProof({ history = [], profile = {}, coachPlan = {}, now = new Date() } = {}) {
  const language = profile.language === 'es' ? 'es' : 'en';
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
    currentStreakLabel: formatDayCount(streak.current, language),
    longestStreakLabel: formatDayCount(streak.longest, language),
    timeValue: stats.minutes > 0 ? stats.timeLabel : language === 'es' ? 'Primeros minutos pronto' : 'First minutes soon',
    kcalValue: stats.kcal > 0 ? stats.kcal : language === 'es' ? 'Después del próximo registro' : 'After next log',
    protocolLine: language === 'es'
      ? `Llevas ${formatSessionCount(stats.count, language)} en la semana ${week} de tu protocolo de 12 semanas.`
      : `You are ${formatSessionCount(stats.count, language)} into week ${week} of your 12-week protocol.`,
    planPercent: Math.min(100, (stats.count / total) * 100),
    thisWeekCount,
    weeklyTarget,
    cards: [
      {
        title: language === 'es' ? 'Última sesión' : 'Last session',
        value: lastSession ? workoutTitle(lastSession.name || '', language) || (language === 'es' ? 'Sesión registrada' : 'Workout logged') : (language === 'es' ? 'Sin sesión todavía' : 'No session yet'),
        detail: lastSession ? formatDate(lastSession.date, language) : language === 'es' ? 'Completa un entrenamiento para crear evidencia.' : 'Complete one workout to create proof.',
      },
      {
        title: language === 'es' ? 'Mejor racha' : 'Best streak',
        value: formatDayCount(streak.longest, language),
        detail: streak.longest > 0 ? (language === 'es' ? 'Tu mejor avance hasta ahora.' : 'Your best run so far.') : (language === 'es' ? 'Tu primera racha empieza después de una sesión.' : 'Your first streak starts after one session.'),
      },
      {
        title: language === 'es' ? 'Esta semana' : 'This week',
        value: language === 'es' ? `${thisWeekCount}/${weeklyTarget} sesiones` : `${thisWeekCount}/${weeklyTarget} sessions`,
        detail: sessionsLeftThisWeek === 0 ? (language === 'es' ? 'Meta semanal alcanzada.' : 'Weekly target reached.') : (language === 'es' ? `${sessionsLeftThisWeek} para llegar a tu meta semanal.` : `${sessionsLeftThisWeek} to hit your weekly target.`),
      },
      {
        title: language === 'es' ? 'Siguiente hito' : 'Next milestone',
        value: getNextMilestone(stats.count, language),
        detail: language === 'es' ? 'Sigue acumulando sesiones limpias.' : 'Keep stacking clean sessions.',
      },
    ],
    nextMilestone: {
      value: sessionsLeftThisWeek === 0 ? (language === 'es' ? 'Meta semanal alcanzada' : 'Weekly target reached') : (language === 'es' ? `faltan ${formatSessionCount(sessionsLeftThisWeek, language)}` : `${formatSessionCount(sessionsLeftThisWeek, language)} to go`),
      detail: language === 'es' ? 'Siguiente punto de control semanal.' : 'Next weekly target checkpoint.',
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

function getNextMilestone(count, language = 'en') {
  if (language === 'es') {
    if (count < 1) return 'Primera sesión';
    if (count < 5) return `${5 - count} para 5 sesiones`;
    if (count < 12) return `${12 - count} para 12 sesiones`;
    return 'Ritmo de 12 semanas';
  }
  if (count < 1) return 'First bell';
  if (count < 5) return `${5 - count} to 5 sessions`;
  if (count < 12) return `${12 - count} to 12 sessions`;
  return '12-week rhythm';
}

function formatDate(value, language) {
  return localizeDate(value, language, { month: 'short', day: 'numeric' });
}
