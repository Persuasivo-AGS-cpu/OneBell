import { workoutTheme } from './workoutCopy.js';

const MODE_COPY = {
  progress: {
    body: 'Your last session felt easy, so the coach is nudging the plan forward.',
    effect: 'Expect a little more work, a little less rest, or both.',
  },
  deload: {
    body: 'Your recent feedback says recovery needs priority today.',
    effect: 'The coach is lowering pressure so quality stays high.',
  },
  protect: {
    body: 'You reported pain, so the coach is protecting the session.',
    effect: 'Volume and heavy work are lower until the signal improves.',
  },
  hold: {
    body: 'Your profile and recent history support normal progression today.',
    effect: 'The coach is keeping the stimulus steady and readable.',
  },
};

const MODE_COPY_ES = {
  progress: {
    body: 'Tu última sesión se sintió fácil, así que el coach está empujando el plan hacia adelante.',
    effect: 'Espera un poco más de trabajo, un poco menos de descanso o ambos.',
  },
  deload: {
    body: 'Tu feedback reciente dice que la recuperación necesita prioridad hoy.',
    effect: 'El coach baja la presión para mantener alta la calidad.',
  },
  protect: {
    body: 'Reportaste dolor, así que el coach está protegiendo la sesión.',
    effect: 'El volumen y el trabajo pesado bajan hasta que la señal mejore.',
  },
  hold: {
    body: 'Tu perfil e historial reciente sostienen una progresión normal hoy.',
    effect: 'El coach mantiene el estímulo estable y fácil de leer.',
  },
};

export function buildCoachExplanation({ coachPlan = {}, language = 'en' } = {}) {
  const mode = coachPlan.adaptation?.mode || 'hold';
  const copySet = language === 'es' ? MODE_COPY_ES : MODE_COPY;
  const copy = copySet[mode] || copySet.hold;
  const theme = workoutTheme(coachPlan.variety?.theme || coachPlan.workout?.theme || (language === 'es' ? 'hoy' : 'today'), language);
  const blocks = coachPlan.workout?.blocks?.length || 0;

  return {
    title: language === 'es' ? 'El coach cambió esto porque...' : 'Coach changed this because...',
    body: copy.body,
    effect: language === 'es'
      ? `${copy.effect} El estímulo de hoy es ${theme} en ${blocks} bloques.`
      : `${copy.effect} Today's stimulus is ${theme} across ${blocks} blocks.`,
  };
}
