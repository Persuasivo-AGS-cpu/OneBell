const FEEDBACK_NOTES = {
  easy: 'Next session can earn a little more density if recovery still feels good.',
  correct: 'Good signal. The coach can keep building without rushing the arc.',
  brutal: 'Recovery matters now. The next session should protect quality before volume.',
  pain: 'Pain is data. The coach should reduce intensity and keep the next session conservative.',
};

export function calculateSessionProgress({ session = {}, workout = {}, warmupCount = 0 } = {}) {
  if (session.phase === 'finish') return 100;

  const blockCount = workout.blocks?.length || 0;
  const totalSteps = Math.max(1, warmupCount + blockCount);
  const warmupIndex = Math.max(0, session.warmupIndex || 0);
  const blockIndex = Math.max(0, session.blockIndex || 0);
  const completedCount = Array.isArray(session.completedBlocks) ? session.completedBlocks.length : 0;

  if (session.phase === 'warmup') {
    return Math.min(99, Math.round(((warmupIndex + 1) / totalSteps) * 100));
  }

  const completedBlocks = Math.max(completedCount, session.phase === 'rest' ? blockIndex : blockIndex);
  return Math.min(99, Math.round(((warmupCount + completedBlocks) / totalSteps) * 100));
}

export function buildSessionFocus({ block = {}, exercise = {}, insight = {}, blockIndex = 0, totalBlocks = 1 } = {}) {
  const name = exercise.name || block.exercise || 'Current movement';
  const pattern = insight.pattern || 'Full body';

  return {
    label: `Set focus ${blockIndex + 1}/${totalBlocks}`,
    headline: `Make ${name} count`,
    body: insight.coachCue || 'Move with control and keep the reps crisp.',
    badges: [...new Set([pattern, exercise.focus, block.reps].filter(Boolean))],
  };
}

export function buildFinishSummary({ workout = {}, completedBlocks = [], feedback = 'correct' } = {}) {
  const total = workout.blocks?.length || 0;
  const completed = completedBlocks.length || total;

  return {
    completedLabel: `${completed}/${total} blocks`,
    durationLabel: `${workout.duration || 0} min`,
    focusLabel: workout.focus || 'Strength',
    coachNote: FEEDBACK_NOTES[feedback] || FEEDBACK_NOTES.correct,
  };
}
