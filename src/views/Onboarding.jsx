import React, { useMemo, useState } from 'react';
import { Activity, Clock, Dumbbell, Flame, HeartPulse, Shield, Sparkles, Target, Zap } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';

import { buildCoachPlan } from '../services/coachEngine';
import { Button } from '../components/ui';

const steps = ['goal', 'level', 'equipment', 'schedule', 'readiness', 'preview'];

const choices = {
  goal: [
    { id: 'burn-fat', title: 'Burn fat', detail: 'Short metabolic sessions', icon: Flame },
    { id: 'build-strength', title: 'Build strength', detail: 'Progressive iron practice', icon: Dumbbell },
    { id: 'conditioning', title: 'Conditioning', detail: 'Capacity, grit, recovery', icon: HeartPulse },
  ],
  level: [
    { id: 'beginner', title: 'Beginner', detail: 'More coaching, cleaner reps', icon: Shield },
    { id: 'intermediate', title: 'Intermediate', detail: 'Balanced volume and load', icon: Target },
    { id: 'advanced', title: 'Advanced', detail: 'Higher density, less hand-holding', icon: Zap },
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
  });

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
              <p className="caption">OneBell Coach</p>
              <h1 className="title-xl">One kettlebell. Adaptive strength.</h1>
              <p className="body-text">Tell the coach what you want. It will scale the work to your level.</p>
              <ChoiceList items={choices.goal} onChoose={(goal) => setAndNext({ goal })} />
            </>
          )}

          {step === 'level' && (
            <>
              <p className="caption">Training level</p>
              <h1 className="title-lg">How should the coach load you?</h1>
              <ChoiceList items={choices.level} onChoose={(level) => setAndNext({ level })} />
            </>
          )}

          {step === 'equipment' && (
            <>
              <p className="caption">Equipment</p>
              <h1 className="title-lg">Current kettlebell weight</h1>
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
              <p className="caption">Weekly rhythm</p>
              <h1 className="title-lg">Make the plan realistic</h1>
              <div className="ob-control-stack">
                <label>
                  Days per week
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={profile.daysPerWeek}
                    onChange={(event) => setProfile((current) => ({ ...current, daysPerWeek: Number(event.target.value) }))}
                  />
                  <span>{profile.daysPerWeek} days</span>
                </label>
                <label>
                  Session length
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
              <Button onClick={() => setStepIndex((current) => current + 1)}>Continue</Button>
            </>
          )}

          {step === 'readiness' && (
            <>
              <p className="caption">Readiness baseline</p>
              <h1 className="title-lg">How are you arriving?</h1>
              <ChoiceList
                items={[
                  { id: 'low', title: 'Low energy', detail: 'Start conservative', icon: Activity },
                  { id: 'normal', title: 'Ready', detail: 'Balanced plan', icon: Sparkles },
                  { id: 'high', title: 'Hungry', detail: 'Coach can push', icon: Zap },
                ]}
                onChoose={(readiness) => setAndNext({ readiness })}
              />
            </>
          )}

          {step === 'preview' && (
            <>
              <p className="caption">Protocol preview</p>
              <h1 className="title-lg">{preview.programName}</h1>
              <div className="ob-card ob-preview-card">
                <div>
                  <Clock size={18} />
                  <span>{preview.workout.duration} min</span>
                </div>
                <div>
                  <Target size={18} />
                  <span>{preview.workout.focus}</span>
                </div>
                <div>
                  <Dumbbell size={18} />
                  <span>{profile.weight}kg</span>
                </div>
              </div>
              <div className="ob-block-list">
                {preview.workout.blocks.map((block) => (
                  <div key={block.id}>
                    <span>{block.detail?.name || block.exercise}</span>
                    <strong>{block.reps}</strong>
                  </div>
                ))}
              </div>
              <Button onClick={() => onComplete(profile)}>Start training</Button>
            </>
          )}
        </Motion.section>
      </AnimatePresence>
    </main>
  );
}

function ChoiceList({ items, onChoose }) {
  return (
    <div className="ob-choice-list">
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onChoose(item.id)}>
          <span>{item.icon && <item.icon size={22} />}</span>
          <strong>{item.title}</strong>
          <small>{item.detail}</small>
        </button>
      ))}
    </div>
  );
}
