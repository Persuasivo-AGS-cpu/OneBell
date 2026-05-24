const DAY_MS = 24 * 60 * 60 * 1000;

const LEVEL_CONFIG = {
  beginner: { blocks: 3, rest: 60, volume: 0.8, label: 'Foundation' },
  intermediate: { blocks: 4, rest: 45, volume: 1, label: 'Build' },
  advanced: { blocks: 5, rest: 35, volume: 1.2, label: 'Performance' },
};

const GOAL_PROGRAMS = {
  'burn-fat': {
    focus: 'Metabolic',
    variants: [
      {
        id: 'engine',
        title: 'Metabolic Engine',
        theme: 'Density',
        blocks: [
          ['halo', '3 x 10', 'primer'],
          ['goblet_squat', '3 x 12', 'moderate'],
          ['swing', '5 x 15', 'heavy'],
          ['farmers_carry', '3 x 40 steps', 'moderate'],
          ['russian_twist', '3 x 16', 'finisher'],
        ],
      },
      {
        id: 'carry-core',
        title: 'Carry & Core Furnace',
        theme: 'Grip / trunk',
        blocks: [
          ['figure_8', '3 x 40s', 'primer'],
          ['sumo_deadlift', '4 x 10', 'moderate'],
          ['farmers_carry', '5 x 30 steps', 'heavy'],
          ['rack_walk', '4 x 30 steps', 'moderate'],
          ['plank', '3 x 50s', 'finisher'],
        ],
      },
      {
        id: 'power-intervals',
        title: 'Power Intervals',
        theme: 'Explosive intervals',
        blocks: [
          ['halo', '2 x 12', 'primer'],
          ['high_pull', '5 x 8', 'heavy'],
          ['goblet_lunge', '3 x 10/side', 'moderate'],
          ['swing', '8 x 10 EMOM', 'heavy'],
          ['russian_twist', '3 x 20', 'finisher'],
        ],
      },
    ],
  },
  'build-strength': {
    focus: 'Strength',
    variants: [
      {
        id: 'armor',
        title: 'Foundation of Iron',
        theme: 'Press / squat',
        blocks: [
          ['halo', '2 x 10', 'primer'],
          ['clean_and_press', '4 x 5', 'heavy'],
          ['goblet_squat', '4 x 8', 'heavy'],
          ['bent_over_row', '3 x 8', 'moderate'],
          ['turkish_get_up', '3 x 1/side', 'heavy'],
        ],
      },
      {
        id: 'hinge-row',
        title: 'Posterior Chain Armor',
        theme: 'Hinge / pull',
        blocks: [
          ['halo', '2 x 10', 'primer'],
          ['rdl', '4 x 8', 'heavy'],
          ['bent_over_row', '4 x 8', 'heavy'],
          ['suitcase_deadlift', '3 x 8/side', 'moderate'],
          ['farmers_carry', '4 x 30 steps', 'finisher'],
        ],
      },
      {
        id: 'stability',
        title: 'Stability Strength',
        theme: 'Control / unilateral',
        blocks: [
          ['half_get_up', '3 x 2/side', 'primer'],
          ['rack_lunge', '4 x 6/side', 'heavy'],
          ['push_press', '4 x 5/side', 'heavy'],
          ['rack_walk', '4 x 30 steps', 'moderate'],
          ['windmill', '3 x 3/side', 'finisher'],
        ],
      },
    ],
  },
  conditioning: {
    focus: 'Conditioning',
    variants: [
      {
        id: 'tactical',
        title: 'Tactical Conditioning',
        theme: 'Full-body capacity',
        blocks: [
          ['halo', '2 x 12', 'primer'],
          ['swing', '6 x 12', 'heavy'],
          ['goblet_lunge', '3 x 8/side', 'moderate'],
          ['push_press', '4 x 6/side', 'moderate'],
          ['plank', '3 x 45s', 'finisher'],
        ],
      },
      {
        id: 'locomotion',
        title: 'Locomotion Circuit',
        theme: 'Carry / movement',
        blocks: [
          ['figure_8', '3 x 45s', 'primer'],
          ['farmers_carry', '5 x 40 steps', 'heavy'],
          ['goblet_lunge', '4 x 8/side', 'moderate'],
          ['overhead_walk', '3 x 24 steps', 'moderate'],
          ['plank', '3 x 60s', 'finisher'],
        ],
      },
      {
        id: 'power-skill',
        title: 'Power Skill Circuit',
        theme: 'Speed / skill',
        blocks: [
          ['halo', '2 x 12', 'primer'],
          ['clean_and_press', '5 x 4/side', 'heavy'],
          ['high_pull', '5 x 8', 'heavy'],
          ['rack_lunge', '3 x 8/side', 'moderate'],
          ['russian_twist', '3 x 18', 'finisher'],
        ],
      },
    ],
  },
};

function normalizeLevel(level) {
  return LEVEL_CONFIG[level] ? level : 'beginner';
}

function normalizeGoal(goal) {
  return GOAL_PROGRAMS[goal] ? goal : 'burn-fat';
}

function startOfDayMs(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function uniqueWorkoutDays(history) {
  return [...new Set((history || []).map((entry) => startOfDayMs(entry.date)))].sort((a, b) => b - a);
}

function getLastFeedback(history = []) {
  return history.filter((entry) => entry.feedback).at(-1)?.feedback || null;
}

function getVariantIndex(now, variantCount) {
  const day = new Date(now).getDay();
  const trainingSlot = day === 0 ? 2 : Math.floor((day - 1) / 2);
  return Math.max(0, trainingSlot) % variantCount;
}

function chooseVariant(program, history = [], now = new Date()) {
  const variants = program.variants;
  let index = getVariantIndex(now, variants.length);
  const lastVariant = history.filter((entry) => entry.variant).at(-1)?.variant;
  let reason = `Rotated to ${variants[index].theme} so the week has a fresh stimulus.`;

  if (lastVariant === variants[index].id && variants.length > 1) {
    index = (index + 1) % variants.length;
    reason = `Rotated away from yesterday's pattern to avoid repeating the same stimulus.`;
  }

  return { variant: variants[index], reason };
}

export function getFeedbackAdaptation(history = []) {
  const feedback = getLastFeedback(history);
  if (feedback === 'easy') {
    return {
      mode: 'progress',
      reason: 'Last session felt easy, so OneBell is adding density with a little less rest.',
      blockDelta: 1,
      restDelta: -10,
      forceModerate: false,
    };
  }
  if (feedback === 'brutal') {
    return {
      mode: 'deload',
      reason: 'Last session was brutal, so today keeps the work productive with more rest.',
      blockDelta: -1,
      restDelta: 15,
      forceModerate: true,
    };
  }
  if (feedback === 'pain') {
    return {
      mode: 'protect',
      reason: 'You reported pain, so OneBell is protecting you with lower volume and no heavy blocks.',
      blockDelta: -2,
      restDelta: 25,
      forceModerate: true,
    };
  }
  return {
    mode: 'hold',
    reason: 'Last feedback supports normal progression today.',
    blockDelta: 0,
    restDelta: 0,
    forceModerate: false,
  };
}

export function calculateStreak(history = [], now = new Date()) {
  const days = uniqueWorkoutDays(history);
  if (days.length === 0) return { current: 0, longest: 0 };

  const today = startOfDayMs(now);
  const yesterday = today - DAY_MS;
  let current = 0;

  if (days[0] === today || days[0] === yesterday) {
    current = 1;
    for (let index = 0; index < days.length - 1; index += 1) {
      if (days[index] - days[index + 1] === DAY_MS) current += 1;
      else break;
    }
  }

  let longest = 1;
  let run = 1;
  for (let index = 0; index < days.length - 1; index += 1) {
    if (days[index] - days[index + 1] === DAY_MS) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  return { current, longest };
}

export function calculateCoachStats(history = []) {
  const minutes = history.reduce((sum, entry) => sum + (Number(entry.duration) || 0), 0);
  const kcal = history.reduce((sum, entry) => sum + (Number(entry.kcal) || 0), 0);
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  const timeLabel = hours > 0 ? `${hours}h ${remaining}m` : `${remaining}m`;

  return { count: history.length, minutes, timeLabel, kcal };
}

export function getWorkoutRecommendation({ history = [], now = new Date(), activeSession = null } = {}) {
  if (activeSession) {
    return { state: 'resume', message: 'Resume your session where you left off.' };
  }

  const recent = history.slice(-2);
  if (recent.length === 2 && recent.every((entry) => entry.feedback === 'brutal' || entry.feedback === 'pain')) {
    return { state: 'deload', message: 'Deload today. Strength grows when recovery catches up.' };
  }

  const days = uniqueWorkoutDays(history);
  if (days.length > 0) {
    const daysSinceLast = Math.floor((startOfDayMs(now) - days[0]) / DAY_MS);
    if (daysSinceLast >= 4) {
      return { state: 'recovery', message: 'Ease back in and rebuild rhythm with a controlled session.' };
    }
  }

  const streak = calculateStreak(history, now);
  if (streak.current >= 3) {
    return { state: 'push', message: 'Momentum is warm. Push with clean reps today.' };
  }

  return { state: 'normal', message: 'Train today, log honestly, and let the coach adapt.' };
}

export function buildCoachPlan({ profile = {}, history = [], now = new Date(), exercises = {} } = {}) {
  const level = normalizeLevel(profile.level);
  const goal = normalizeGoal(profile.goal);
  const config = LEVEL_CONFIG[level];
  const program = GOAL_PROGRAMS[goal];
  const { variant, reason: varietyReason } = chooseVariant(program, history, now);
  const recommendation = getWorkoutRecommendation({ history, now });
  const adaptation = getFeedbackAdaptation(history);
  const deload = recommendation.state === 'deload' || recommendation.state === 'recovery';
  const blockCount = Math.max(2, Math.min(variant.blocks.length, config.blocks - (deload ? 1 : 0) + adaptation.blockDelta));
  const duration = Number(profile.duration) || (level === 'beginner' ? 20 : 30);

  const blocks = variant.blocks.slice(0, blockCount).map(([exercise, reps, intensity], index) => ({
    id: `${exercise}-${index}`,
    exercise,
    detail: exercises[exercise],
    reps: (deload || adaptation.forceModerate) && intensity === 'heavy'
      ? reps.replace(/^(\d+)/, (match) => String(Math.max(2, Number(match) - 1)))
      : reps,
    restSeconds: Math.max(25, config.rest + (deload ? 15 : 0) + adaptation.restDelta),
    intensity: (deload || adaptation.forceModerate) && intensity === 'heavy' ? 'moderate' : intensity,
  }));

  return {
    programName: `${config.label} ${variant.title}`,
    week: getProgramWeek(profile.programStartDate, now),
    recommendation,
    adaptation,
    variety: {
      variant: variant.id,
      theme: variant.theme,
      reason: varietyReason,
    },
    workout: {
      id: `${goal}-${level}-${startOfDayMs(now)}`,
      title: variant.title,
      focus: program.focus,
      variant: variant.id,
      theme: variant.theme,
      duration,
      level,
      kettlebellWeight: Number(profile.weight) || 16,
      blocks,
    },
  };
}

export function getProgramWeek(programStartDate, now = new Date()) {
  if (!programStartDate) return 1;
  const diff = startOfDayMs(now) - startOfDayMs(programStartDate);
  return Math.min(12, Math.max(1, Math.floor(diff / (7 * DAY_MS)) + 1));
}

export function estimateKcal({ duration = 20, bodyWeight = 75, intensity = 'normal' } = {}) {
  const met = intensity === 'heavy' ? 8.5 : intensity === 'recovery' ? 5.5 : 7.5;
  return Math.round((met * 3.5 * (Number(bodyWeight) || 75) * duration) / 200);
}
