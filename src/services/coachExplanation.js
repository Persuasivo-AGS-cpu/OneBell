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

export function buildCoachExplanation({ coachPlan = {} } = {}) {
  const mode = coachPlan.adaptation?.mode || 'hold';
  const copy = MODE_COPY[mode] || MODE_COPY.hold;
  const theme = coachPlan.variety?.theme || coachPlan.workout?.theme || 'today';
  const blocks = coachPlan.workout?.blocks?.length || 0;

  return {
    title: 'Coach changed this because...',
    body: copy.body,
    effect: `${copy.effect} Today's stimulus is ${theme} across ${blocks} blocks.`,
  };
}
