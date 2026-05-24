const PATTERN_RULES = [
  ['swing', 'Hinge'],
  ['deadlift', 'Hinge'],
  ['rdl', 'Hinge'],
  ['squat', 'Squat'],
  ['lunge', 'Lunge'],
  ['press', 'Press'],
  ['jerk', 'Press'],
  ['snatch', 'Power'],
  ['clean', 'Power'],
  ['pull', 'Pull'],
  ['row', 'Pull'],
  ['carry', 'Carry'],
  ['walk', 'Carry'],
  ['twist', 'Core'],
  ['plank', 'Core'],
  ['get_up', 'Ground-to-stand'],
  ['windmill', 'Mobility'],
  ['halo', 'Mobility'],
];

const INTENT_BY_FOCUS = {
  Power: 'Builds hip power and repeatable conditioning without turning every set into a grind.',
  Strength: 'Builds useful full-body strength with crisp reps and controlled positions.',
  Core: 'Trains bracing, rotation control, and the positions that keep heavier work safe.',
  Mobility: 'Opens the joints you need for better positions under load.',
  Conditioning: 'Raises heart rate while keeping the bell path simple and repeatable.',
};

const INTENT_BY_PATTERN = {
  Pull: 'Builds upper-back power and a clean pull path while keeping the shoulder packed.',
  Press: 'Builds pressing strength and overhead control without leaking tension through the ribs.',
};

const CUES_BY_PATTERN = {
  Hinge: 'Snap the hips, keep the ribs down, let the bell float.',
  Squat: 'Stay tall, knees track over toes, drive through the whole foot.',
  Lunge: 'Stack ribs over hips, step with control, own the bottom.',
  Press: 'Brace first, press in a clean line, finish with biceps near the ear.',
  Power: 'Stay loose until the drive, then finish sharp and tall.',
  Pull: 'Pull with the back, keep shoulders packed, avoid shrugging early.',
  Carry: 'Walk tall, breathe behind the brace, do not lean away from the bell.',
  Core: 'Move slowly enough that your torso stays honest.',
  'Ground-to-stand': 'Own every checkpoint before moving to the next one.',
  Mobility: 'Move smoothly, keep the range pain-free, breathe through the tight spots.',
};

export function buildExerciseGuide({ exercises = {}, currentBlocks = [] } = {}) {
  const usage = new Map(currentBlocks.map((block, index) => [block.exercise, `Today: block ${index + 1}`]));

  return Object.entries(exercises).map(([id, exercise]) => ({
    id,
    ...exercise,
    ...getExerciseInsight(id, exercise),
    usageLabel: usage.get(id) || '',
  }));
}

export function getExerciseInsight(id, exercise = {}) {
  const pattern = inferPattern(id);

  return {
    pattern,
    intent: INTENT_BY_PATTERN[pattern] || INTENT_BY_FOCUS[exercise.focus] || 'Supports the session goal with a simple, coachable kettlebell pattern.',
    coachCue: CUES_BY_PATTERN[pattern] || 'Move with control and stop if pain appears.',
    priorityMistake: exercise.mistakes?.[0] || 'Rushing reps before the position is stable.',
  };
}

function inferPattern(id = '') {
  const normalized = id.toLowerCase();
  return PATTERN_RULES.find(([token]) => normalized.includes(token))?.[1] || 'Full body';
}
