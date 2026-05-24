import routinesData from '../data/routines.json';
import { buildCoachPlan } from './coachEngine';

export function getTodayWorkout(profile = {}, history = []) {
  const plan = buildCoachPlan({
    profile,
    history,
    exercises: routinesData.exercises,
  });

  return {
    program_name: plan.programName,
    workouts: [plan.workout],
  };
}

export { buildCoachPlan } from './coachEngine';
