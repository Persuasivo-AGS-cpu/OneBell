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

const EXERCISE_NAME_ES = {
  swing: 'Swing con kettlebell',
  goblet_squat: 'Sentadilla goblet',
  clean_and_press: 'Clean & Press',
  russian_twist: 'Russian twist',
  snatch: 'Snatch a una mano',
  double_swing: 'Swing doble con kettlebell',
  double_clean: 'Doble clean',
  double_front_squat: 'Doble sentadilla frontal',
  turkish_get_up: 'Get-up turco',
  halo: 'Halo con kettlebell',
  plank: 'Plancha hardstyle',
  high_pull: 'High pull',
  push_press: 'Push Press',
  jerk: 'Jerk a una mano',
  sumo_deadlift: 'Peso muerto sumo',
  suitcase_deadlift: 'Peso muerto suitcase',
  rdl: 'Peso muerto rumano',
  goblet_lunge: 'Zancada reversa goblet',
  rack_lunge: 'Zancada en rack',
  overhead_squat: 'Sentadilla overhead',
  bottom_up_press: 'Bottom-up press',
  half_get_up: 'Medio get-up',
  windmill: 'Windmill con kettlebell',
  bent_over_row: 'Remo inclinado',
  renegade_row: 'Renegade row',
  figure_8: 'Figura 8',
  farmers_carry: "Farmer's carry",
  rack_walk: 'Caminata en rack',
  overhead_walk: 'Caminata overhead',
};

const LEVEL_LABELS = {
  en: { Beginner: 'Beginner', Intermediate: 'Intermediate', Advanced: 'Advanced' },
  es: { Beginner: 'Principiante', Intermediate: 'Intermedio', Advanced: 'Avanzado' },
};

const FOCUS_LABELS = {
  en: {
    Power: 'Power',
    Strength: 'Strength',
    Core: 'Core',
    Mobility: 'Mobility',
    Conditioning: 'Conditioning',
  },
  es: {
    Power: 'Potencia',
    Strength: 'Fuerza',
    Core: 'Core',
    Mobility: 'Movilidad',
    Conditioning: 'Acondicionamiento',
  },
};

const PATTERN_LABELS = {
  en: {
    Hinge: 'Hinge',
    Squat: 'Squat',
    Lunge: 'Lunge',
    Press: 'Press',
    Power: 'Power',
    Pull: 'Pull',
    Carry: 'Carry',
    Core: 'Core',
    'Ground-to-stand': 'Ground-to-stand',
    Mobility: 'Mobility',
    'Full body': 'Full body',
  },
  es: {
    Hinge: 'Bisagra',
    Squat: 'Sentadilla',
    Lunge: 'Zancada',
    Press: 'Empuje',
    Power: 'Potencia',
    Pull: 'Jalón',
    Carry: 'Carga',
    Core: 'Core',
    'Ground-to-stand': 'Del suelo a de pie',
    Mobility: 'Movilidad',
    'Full body': 'Cuerpo completo',
  },
};

const INTENT_BY_FOCUS = {
  Power: 'Builds hip power and repeatable conditioning without turning every set into a grind.',
  Strength: 'Builds useful full-body strength with crisp reps and controlled positions.',
  Core: 'Trains bracing, rotation control, and the positions that keep heavier work safe.',
  Mobility: 'Opens the joints you need for better positions under load.',
  Conditioning: 'Raises heart rate while keeping the bell path simple and repeatable.',
};

const INTENT_BY_FOCUS_ES = {
  Power: 'Desarrolla potencia de cadera y acondicionamiento repetible sin convertir cada serie en una batalla.',
  Strength: 'Construye fuerza útil de cuerpo completo con reps limpias y posiciones controladas.',
  Core: 'Entrena braceo, control de rotación y posiciones que hacen más seguro el trabajo pesado.',
  Mobility: 'Abre las articulaciones que necesitas para mejores posiciones bajo carga.',
  Conditioning: 'Eleva la frecuencia cardiaca con una trayectoria simple y repetible de la kettlebell.',
};

const INTENT_BY_PATTERN = {
  Pull: 'Builds upper-back power and a clean pull path while keeping the shoulder packed.',
  Press: 'Builds pressing strength and overhead control without leaking tension through the ribs.',
};

const INTENT_BY_PATTERN_ES = {
  Pull: 'Construye potencia de espalda alta y una trayectoria de jalón limpia manteniendo el hombro estable.',
  Press: 'Construye fuerza de empuje y control overhead sin perder tensión por las costillas.',
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

const CUES_BY_PATTERN_ES = {
  Hinge: 'Explota la cadera, costillas abajo y deja flotar la kettlebell.',
  Squat: 'Mantente alto, rodillas siguen los dedos y empuja con todo el pie.',
  Lunge: 'Costillas sobre cadera, paso controlado y posición firme abajo.',
  Press: 'Brace primero, empuja en línea limpia y termina con el bíceps cerca de la oreja.',
  Power: 'Mantente suelto hasta el impulso y termina fuerte y alto.',
  Pull: 'Jala con la espalda, hombros estables y evita encogerlos antes de tiempo.',
  Carry: 'Camina alto, respira detrás del brace y no te inclines lejos de la kettlebell.',
  Core: 'Muévete lo suficientemente lento para que el torso no haga trampa.',
  'Ground-to-stand': 'Domina cada punto de control antes de pasar al siguiente.',
  Mobility: 'Muévete suave, sin dolor, y respira en los rangos cerrados.',
};

const INSTRUCTIONS_EN_BY_PATTERN = {
  Hinge: ['Set your feet, hinge from the hips, and keep the bell close.', 'Drive through the hips and let the bell float.', 'Finish tall without leaning back.'],
  Squat: ['Hold the kettlebell close to the chest.', 'Sit between the knees with a tall torso.', 'Drive through the whole foot to stand.'],
  Lunge: ['Start tall with ribs stacked over hips.', 'Step with control and keep the front foot planted.', 'Stand up without twisting the torso.'],
  Press: ['Start from a strong rack position.', 'Brace before the dip or press.', 'Finish overhead with the arm locked and ribs down.'],
  Power: ['Start with a crisp hip drive.', 'Guide the bell close to the body.', 'Finish sharp, tall, and under control.'],
  Pull: ['Set a strong hinge and packed shoulders.', 'Pull with the back without shrugging early.', 'Lower with control and keep the torso stable.'],
  Carry: ['Stand tall with the bell secured.', 'Walk with short, controlled steps.', 'Keep breathing without leaning into or away from the load.'],
  Core: ['Brace before the movement starts.', 'Move slowly enough to control rotation.', 'Stop the set when posture breaks.'],
  'Ground-to-stand': ['Start from a stable floor position.', 'Move through each checkpoint with control.', 'Keep the loaded arm stable before standing tall.'],
  Mobility: ['Move through a pain-free range.', 'Breathe through tight positions.', 'Keep the motion smooth instead of forcing depth.'],
  'Full body': ['Set a stable stance.', 'Move with control through the full rep.', 'Stop if pain appears.'],
};

const MISTAKES_EN_BY_PATTERN = {
  Hinge: ['Turning the hinge into a squat.', 'Losing the brace at the top.'],
  Squat: ['Letting knees collapse inward.', 'Dropping the chest.'],
  Lunge: ['Twisting the hips under load.', 'Rushing the bottom position.'],
  Press: ['Pressing without a brace.', 'Overextending the ribs overhead.'],
  Power: ['Pulling too early with the arm.', 'Letting the bell crash into position.'],
  Pull: ['Shrugging before the back does the work.', 'Losing torso angle.'],
  Carry: ['Leaning away from the kettlebell.', 'Losing posture as fatigue builds.'],
  Core: ['Moving too fast to control rotation.', 'Letting the low back collapse.'],
  'Ground-to-stand': ['Skipping checkpoints.', 'Letting the loaded arm drift.'],
  Mobility: ['Forcing range through pain.', 'Moving the neck instead of the shoulders.'],
  'Full body': ['Rushing reps.', 'Losing posture.'],
};

export function buildExerciseGuide({ exercises = {}, currentBlocks = [], language = 'en' } = {}) {
  const usage = new Map(currentBlocks.map((block, index) => [block.exercise, formatUsageLabel(index + 1, language)]));

  return Object.entries(exercises).map(([id, exercise]) => ({
    id,
    ...exercise,
    ...getExerciseText(id, exercise, language),
    usageLabel: usage.get(id) || '',
  }));
}

export function getExerciseInsight(id, exercise = {}, language = 'en') {
  return getExerciseText(id, exercise, language);
}

export function getExerciseText(id, exercise = {}, language = 'en') {
  const lang = language === 'es' ? 'es' : 'en';
  const pattern = inferPattern(id);
  const focus = exercise.focus || 'Strength';
  const localizedPattern = PATTERN_LABELS[lang][pattern] || pattern;
  const localizedFocus = FOCUS_LABELS[lang][focus] || focus;
  const localizedLevel = LEVEL_LABELS[lang][exercise.level] || exercise.level || '';

  return {
    pattern,
    patternLabel: localizedPattern,
    focusLabel: localizedFocus,
    levelLabel: localizedLevel,
    name: lang === 'es' ? EXERCISE_NAME_ES[id] || exercise.name : exercise.name,
    intent: getIntent({ pattern, focus, language: lang }),
    coachCue: getCue({ pattern, language: lang }),
    instructions: getInstructions({ exercise, pattern, language: lang }),
    mistakes: getMistakes({ exercise, pattern, language: lang }),
    priorityMistake: getPriorityMistake({ exercise, pattern, language: lang }),
  };
}

function inferPattern(id = '') {
  const normalized = id.toLowerCase();
  return PATTERN_RULES.find(([token]) => normalized.includes(token))?.[1] || 'Full body';
}

function getIntent({ pattern, focus, language }) {
  if (language === 'es') {
    return INTENT_BY_PATTERN_ES[pattern] || INTENT_BY_FOCUS_ES[focus] || 'Apoya el objetivo de la sesión con un patrón de kettlebell simple y fácil de guiar.';
  }
  return INTENT_BY_PATTERN[pattern] || INTENT_BY_FOCUS[focus] || 'Supports the session goal with a simple, coachable kettlebell pattern.';
}

function getCue({ pattern, language }) {
  if (language === 'es') return CUES_BY_PATTERN_ES[pattern] || 'Muévete con control y detente si aparece dolor.';
  return CUES_BY_PATTERN[pattern] || 'Move with control and stop if pain appears.';
}

function formatUsageLabel(index, language) {
  return language === 'es' ? `Hoy: bloque ${index}` : `Today: block ${index}`;
}

function getInstructions({ exercise, pattern, language }) {
  if (language === 'es') return exercise.instructions || INSTRUCTIONS_EN_BY_PATTERN[pattern] || INSTRUCTIONS_EN_BY_PATTERN['Full body'];
  return isSpanishText(exercise.instructions?.join(' '))
    ? INSTRUCTIONS_EN_BY_PATTERN[pattern] || INSTRUCTIONS_EN_BY_PATTERN['Full body']
    : exercise.instructions || INSTRUCTIONS_EN_BY_PATTERN[pattern] || INSTRUCTIONS_EN_BY_PATTERN['Full body'];
}

function getMistakes({ exercise, pattern, language }) {
  if (language === 'es') return exercise.mistakes || MISTAKES_EN_BY_PATTERN[pattern] || MISTAKES_EN_BY_PATTERN['Full body'];
  return isSpanishText(exercise.mistakes?.join(' '))
    ? MISTAKES_EN_BY_PATTERN[pattern] || MISTAKES_EN_BY_PATTERN['Full body']
    : exercise.mistakes || MISTAKES_EN_BY_PATTERN[pattern] || MISTAKES_EN_BY_PATTERN['Full body'];
}

function getPriorityMistake({ exercise, pattern, language }) {
  if (language === 'es') return exercise.mistakes?.[0] || 'Apurar reps antes de estabilizar la posición.';
  return isSpanishText(exercise.mistakes?.[0])
    ? (MISTAKES_EN_BY_PATTERN[pattern] || MISTAKES_EN_BY_PATTERN['Full body'])[0]
    : exercise.mistakes?.[0] || (MISTAKES_EN_BY_PATTERN[pattern] || MISTAKES_EN_BY_PATTERN['Full body'])[0];
}

function isSpanishText(text = '') {
  return /[áéíóúñ¿¡]|\b(con|las|los|una|hacia|rodillas|peso|pesa|cadera|espalda)\b/i.test(text);
}
