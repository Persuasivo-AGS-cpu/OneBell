import React, { useMemo, useState } from 'react';
import { Activity, Clock, Dumbbell, Flame, HeartPulse, Shield, Sparkles, Target, Zap } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';

import { buildCoachPlan } from '../services/coachEngine';
import { Button } from '../components/ui';
import { getLanguage, t } from '../services/copy';
import { getExerciseText } from '../services/exerciseGuide';
import { programName, workoutFocus, workoutReps } from '../services/workoutCopy';

const steps = ['goal', 'level', 'equipment', 'schedule', 'readiness', 'preview'];

const choices = {
  goal: [
    { id: 'burn-fat', titleKey: 'goal.burn-fat', detailKey: 'goal.burn-fat.detail', icon: Flame },
    { id: 'build-strength', titleKey: 'goal.build-strength', detailKey: 'goal.build-strength.detail', icon: Dumbbell },
    { id: 'conditioning', titleKey: 'goal.conditioning', detailKey: 'goal.conditioning.detail', icon: HeartPulse },
  ],
  level: [
    { id: 'beginner', titleKey: 'level.beginner', detailKey: 'level.beginner.detail', icon: Shield },
    { id: 'intermediate', titleKey: 'level.intermediate', detailKey: 'level.intermediate.detail', icon: Target },
    { id: 'advanced', titleKey: 'level.advanced', detailKey: 'level.advanced.detail', icon: Zap },
  ],
};

export default function Onboarding({ onComplete, routines }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] = useState({
    goal: 'build-strength',
    level: 'beginner',
    weight: 16,
    daysPerWeek: 3,
    duration: 25,
    bodyWeight: 75,
    readiness: 'normal',
    limitation: 'none',
    language: 'en',
  });

  const language = getLanguage(profile);
  const step = steps[stepIndex];
  const preview = useMemo(
    () => buildCoachPlan({ profile, exercises: routines.exercises }),
    [profile, routines.exercises],
  );

  const setAndNext = (patch) => {
    if (navigator.vibrate) navigator.vibrate(12);
    setProfile((current) => ({ ...current, ...patch }));
    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  };

  return (
    <main className="ob-onboarding">
      <div className="ob-progress-dots" aria-label={`Onboarding step ${stepIndex + 1} of ${steps.length}`}>
        {steps.map((item) => (
          <span key={item} className={item === step ? 'is-active' : ''} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <Motion.section
          key={step}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.24 }}
          className="ob-onboarding__panel"
        >
          {step === 'goal' && (
            <>
              <p className="caption">{t('onboarding.brand', language)}</p>
              <h1 className="title-xl">{t('onboarding.hero', language)}</h1>
              <p className="body-text">{t('onboarding.heroBody', language)}</p>
              <ChoiceList items={choices.goal} language={language} onChoose={(goal) => setAndNext({ goal })} />
            </>
          )}

          {step === 'level' && (
            <>
              <p className="caption">{t('onboarding.trainingLevel', language)}</p>
              <h1 className="title-lg">{t('onboarding.loadQuestion', language)}</h1>
              <ChoiceList items={choices.level} language={language} onChoose={(level) => setAndNext({ level })} />
            </>
          )}

          {step === 'equipment' && (
            <>
              <p className="caption">{t('onboarding.equipment', language)}</p>
              <h1 className="title-lg">{t('onboarding.kettlebellWeight', language)}</h1>
              <div className="ob-weight-grid">
                {[12, 16, 20, 24, 28, 32].map((weight) => (
                  <button key={weight} type="button" onClick={() => setAndNext({ weight })}>
                    <strong>{weight}</strong>
                    <span>kg</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'schedule' && (
            <>
              <p className="caption">{t('onboarding.weeklyRhythm', language)}</p>
              <h1 className="title-lg">{t('onboarding.realisticPlan', language)}</h1>
              <div className="ob-control-stack">
                <label>
                  {t('onboarding.daysPerWeek', language)}
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={profile.daysPerWeek}
                    onChange={(event) => setProfile((current) => ({ ...current, daysPerWeek: Number(event.target.value) }))}
                  />
                  <span>{t('onboarding.days', language, { count: profile.daysPerWeek })}</span>
                </label>
                <label>
                  {t('onboarding.sessionLength', language)}
                  <input
                    type="range"
                    min="15"
                    max="45"
                    step="5"
                    value={profile.duration}
                    onChange={(event) => setProfile((current) => ({ ...current, duration: Number(event.target.value) }))}
                  />
                  <span>{profile.duration} min</span>
                </label>
              </div>
              <Button onClick={() => setStepIndex((current) => current + 1)}>{t('common.continue', language)}</Button>
            </>
          )}

          {step === 'readiness' && (
            <>
              <p className="caption">{t('onboarding.readinessBaseline', language)}</p>
              <h1 className="title-lg">{t('onboarding.arrivingQuestion', language)}</h1>
              <ChoiceList
                items={[
                  { id: 'low', titleKey: 'readiness.low', detailKey: 'readiness.low.detail', icon: Activity },
                  { id: 'normal', titleKey: 'readiness.normal', detailKey: 'readiness.normal.detail', icon: Sparkles },
                  { id: 'high', titleKey: 'readiness.high', detailKey: 'readiness.high.detail', icon: Zap },
                ]}
                language={language}
                onChoose={(readiness) => setAndNext({ readiness })}
              />
            </>
          )}

          {step === 'preview' && (
            <>
              <p className="caption">{t('onboarding.protocolPreview', language)}</p>
              <h1 className="title-lg">{programName(preview.programName, language)}</h1>
              <div className="ob-card ob-preview-card">
                <div>
                  <Clock size={18} />
                  <span>{preview.workout.duration} min</span>
                </div>
                <div>
                  <Target size={18} />
                  <span>{workoutFocus(preview.workout.focus, language)}</span>
                </div>
                <div>
                  <Dumbbell size={18} />
                  <span>{profile.weight}kg</span>
                </div>
              </div>
              <div className="ob-block-list">
                {preview.workout.blocks.map((block) => (
                  <div key={block.id}>
                    <span>{getExerciseText(block.exercise, block.detail, language).name || block.exercise}</span>
                    <strong>{workoutReps(block.reps, language)}</strong>
                  </div>
                ))}
              </div>
              <Button onClick={() => onComplete(profile)}>{t('onboarding.startTraining', language)}</Button>
            </>
          )}
        </Motion.section>
      </AnimatePresence>
    </main>
  );
}

function ChoiceList({ items, language, onChoose }) {
  return (
    <div className="ob-choice-list">
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onChoose(item.id)}>
          <span>{item.icon && <item.icon size={22} />}</span>
          <strong>{t(item.titleKey, language)}</strong>
          <small>{t(item.detailKey, language)}</small>
        </button>
      ))}
    </div>
  );
}
