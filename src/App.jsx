import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import BottomNav from './components/BottomNav';
import routinesData from './data/routines.json';
import { buildCoachPlan } from './services/coachEngine';
import {
  completeWorkout,
  createInitialState,
  loadOneBellState,
  saveOneBellState,
  startSession,
  updateSession,
} from './services/appState';
import { requestNotificationPermission } from './services/nudges';
import Exercises from './views/Exercises';
import Home from './views/Home';
import Onboarding from './views/Onboarding';
import Program from './views/Program';
import Progress from './views/Progress';
import Profile from './views/Profile';
import Workout from './views/Workout';

function App() {
  const [appState, setAppState] = useState(() => loadOneBellState());
  const navigate = useNavigate();

  useEffect(() => {
    saveOneBellState(appState);
  }, [appState]);

  const coachPlan = useMemo(
    () =>
      buildCoachPlan({
        profile: appState.userProfile,
        history: appState.workoutHistory,
        exercises: routinesData.exercises,
      }),
    [appState.userProfile, appState.workoutHistory],
  );

  const completeOnboarding = useCallback(
    (profile) => {
      setAppState((current) => ({
        ...createInitialState(),
        ...current,
        hasCompletedOnboarding: true,
        userProfile: {
          ...current.userProfile,
          ...profile,
          programStartDate: current.userProfile?.programStartDate || new Date().toISOString(),
        },
      }));
      navigate('/', { replace: true });
    },
    [navigate],
  );

  const beginWorkout = useCallback(
    (workout = coachPlan.workout) => {
      setAppState((current) => startSession(current, workout));
      navigate('/workout');
    },
    [coachPlan.workout, navigate],
  );

  const setSessionPatch = useCallback((patch) => {
    setAppState((current) => updateSession(current, patch));
  }, []);

  const finishWorkout = useCallback(
    (feedback, notes) => {
      setAppState((current) => completeWorkout(current, { feedback, notes }));
      window.setTimeout(() => navigate('/progress'), 0);
    },
    [navigate],
  );

  const enableReminders = useCallback(async () => {
    const permission = await requestNotificationPermission();
    setAppState((current) => ({
      ...current,
      nudgePreferences: {
        ...(current.nudgePreferences || {}),
        enabled: permission === 'granted',
        permission,
      },
    }));
  }, []);

  const updateProfile = useCallback((patch) => {
    setAppState((current) => ({
      ...current,
      userProfile: {
        ...current.userProfile,
        ...patch,
      },
    }));
  }, []);

  if (!appState.hasCompletedOnboarding) {
    return (
      <div className="app-container">
        <Routes>
          <Route path="/onboarding" element={<Onboarding onComplete={completeOnboarding} routines={routinesData} />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                appState={appState}
                coachPlan={coachPlan}
                onStartWorkout={beginWorkout}
                onEnableReminders={enableReminders}
              />
            }
          />
          <Route
            path="/program"
            element={<Program appState={appState} coachPlan={coachPlan} onStartWorkout={beginWorkout} />}
          />
          <Route path="/exercises" element={<Exercises routines={routinesData} coachPlan={coachPlan} />} />
          <Route path="/progress" element={<Progress appState={appState} coachPlan={coachPlan} />} />
          <Route
            path="/profile"
            element={
              <Profile
                appState={appState}
                onUpdateProfile={updateProfile}
                onEnableReminders={enableReminders}
              />
            }
          />
          <Route
            path="/workout"
            element={
              appState.activeSession ? (
                <Workout
                  appState={appState}
                  routines={routinesData}
                  onSessionPatch={setSessionPatch}
                  onFinish={finishWorkout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <BottomNav hidden={Boolean(appState.activeSession)} />
    </div>
  );
}

export default App;
