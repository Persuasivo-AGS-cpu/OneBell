const COPY = {
  en: {
    'home.coachChangedTitle': 'Coach changed this because...',
    'home.startWorkout': 'Start workout',
    'profile.language': 'Language',
    'profile.english': 'English',
    'profile.spanish': 'Español',
    'progress.currentStreak': 'Current streak',
    'progress.progressProof': 'Progress proof',
    'progress.yourWorkVisible': 'Your work is visible',
    'workout.completeSet': 'Complete set',
    'workout.formGuide': 'Form guide',
    'workout.coachCue': 'Coach cue',
    'workout.startNextSet': 'Start next set',
  },
  es: {
    'home.coachChangedTitle': 'El coach cambió esto porque...',
    'home.startWorkout': 'Empezar entrenamiento',
    'profile.language': 'Idioma',
    'profile.english': 'English',
    'profile.spanish': 'Español',
    'progress.currentStreak': 'Racha actual',
    'progress.progressProof': 'Prueba de progreso',
    'progress.yourWorkVisible': 'Tu trabajo ya se ve',
    'workout.completeSet': 'Terminar set',
    'workout.formGuide': 'Guía de técnica',
    'workout.coachCue': 'Cue del coach',
    'workout.startNextSet': 'Empezar siguiente set',
  },
};

export function getLanguage(profile = {}) {
  return profile.language === 'es' ? 'es' : 'en';
}

export function t(key, language = 'en') {
  const normalized = language === 'es' ? 'es' : 'en';
  return COPY[normalized][key] || COPY.en[key] || key;
}
