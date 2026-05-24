const WORKOUT_TITLES = {
  es: {
    'Metabolic Engine': 'Motor metabólico',
    'Carry & Core Furnace': 'Carga y core',
    'Power Intervals': 'Intervalos de potencia',
    'Foundation of Iron': 'Base de hierro',
    'Posterior Chain Armor': 'Armadura de cadena posterior',
    'Stability Strength': 'Fuerza estable',
    'Tactical Conditioning': 'Acondicionamiento táctico',
    'Locomotion Circuit': 'Circuito de locomoción',
    'Power Skill Circuit': 'Circuito de potencia técnica',
  },
};

const THEME_LABELS = {
  es: {
    Density: 'Densidad',
    'Grip / trunk': 'Agarre / tronco',
    'Explosive intervals': 'Intervalos explosivos',
    'Press / squat': 'Empuje / sentadilla',
    'Hinge / pull': 'Bisagra / jalón',
    'Control / unilateral': 'Control / unilateral',
    'Full-body capacity': 'Capacidad total',
    'Carry / movement': 'Carga / movimiento',
    'Speed / skill': 'Velocidad / técnica',
    Control: 'Control',
  },
};

const FOCUS_LABELS = {
  es: {
    Metabolic: 'Metabólico',
    Strength: 'Fuerza',
    Conditioning: 'Acondicionamiento',
    Power: 'Potencia',
    Core: 'Core',
  },
};

const LEVEL_LABELS = {
  es: {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  },
};

export function workoutTitle(title = '', language = 'en') {
  return language === 'es' ? WORKOUT_TITLES.es[title] || title : title;
}

export function workoutTheme(theme = '', language = 'en') {
  return language === 'es' ? THEME_LABELS.es[theme] || theme : theme;
}

export function workoutFocus(focus = '', language = 'en') {
  return language === 'es' ? FOCUS_LABELS.es[focus] || focus : focus;
}

export function workoutLevel(level = '', language = 'en') {
  return language === 'es' ? LEVEL_LABELS.es[level] || level : level;
}

export function programName(name = '', language = 'en') {
  if (language !== 'es') return name;
  return name
    .replace('Foundation ', 'Base ')
    .replace('Build ', 'Construcción ')
    .replace('Performance ', 'Rendimiento ')
    .replace(/Metabolic Engine|Carry & Core Furnace|Power Intervals|Foundation of Iron|Posterior Chain Armor|Stability Strength|Tactical Conditioning|Locomotion Circuit|Power Skill Circuit/g, (match) => workoutTitle(match, language));
}

export function workoutReps(reps = '', language = 'en') {
  if (language !== 'es') return reps;
  return String(reps)
    .replaceAll('/side', '/lado')
    .replaceAll(' steps', ' pasos')
    .replaceAll(' step', ' paso')
    .replaceAll(' each side', ' por lado')
    .replaceAll(' reps', ' reps');
}
