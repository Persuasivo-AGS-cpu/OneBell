import { estimateKcal } from './coachEngine.js';

export const STORAGE_KEY = 'onebell_state';

export function createInitialState() {
  return {
    hasCompletedOnboarding: false,
    userProfile: {},
    workoutHistory: [],
    activeSession: null,
    nudgePreferences: {
      enabled: false,
      reminderTime: '07:00',
    },
  };
}

export function loadOneBellState(storage = globalThis.localStorage) {
  const fallback = createInitialState();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
      userProfile: parsed.userProfile || {},
      workoutHistory: Array.isArray(parsed.workoutHistory)
        ? parsed.workoutHistory
        : parsed.userProfile?.workoutHistory || [],
      activeSession: parsed.activeSession || null,
      nudgePreferences: {
        ...fallback.nudgePreferences,
        ...(parsed.nudgePreferences || {}),
      },
    };
  } catch {
    return fallback;
  }
}

export function saveOneBellState(state, storage = globalThis.localStorage) {
  if (!storage) return state;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function startSession(state, workout, now = new Date()) {
  return {
    ...state,
    activeSession: {
      workout,
      startedAt: now.toISOString(),
      blockIndex: 0,
      warmupIndex: 0,
      phase: 'warmup',
      completedBlocks: [],
    },
  };
}

export function updateSession(state, patch) {
  if (!state.activeSession) return state;
  return {
    ...state,
    activeSession: {
      ...state.activeSession,
      ...patch,
    },
  };
}

export function completeWorkout(state, { feedback = 'correct', notes = '', finishedAt = new Date() } = {}) {
  const session = state.activeSession;
  if (!session?.workout) return state;

  const startedAt = new Date(session.startedAt);
  const measuredDuration = Math.max(1, Math.round((finishedAt.getTime() - startedAt.getTime()) / 60000));
  const duration = session.workout.duration || measuredDuration;
  const kcal = estimateKcal({
    duration,
    bodyWeight: state.userProfile?.bodyWeight || 75,
    intensity: feedback === 'brutal' ? 'heavy' : feedback === 'easy' ? 'recovery' : 'normal',
  });

  const entry = {
    id: finishedAt.getTime(),
    workoutId: session.workout.id,
    variant: session.workout.variant,
    name: session.workout.title || 'OneBell Workout',
    focus: session.workout.focus || 'Strength',
    date: finishedAt.toISOString(),
    duration,
    kcal,
    feedback,
    notes,
    completedBlocks: session.completedBlocks || [],
  };

  return {
    ...state,
    activeSession: null,
    workoutHistory: [...(state.workoutHistory || []), entry],
  };
}
