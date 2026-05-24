import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Info, Timer, X } from 'lucide-react';

import { Button, Modal } from '../components/ui';
import { getLanguage, t } from '../services/copy';
import { getExerciseText } from '../services/exerciseGuide';
import { buildFinishSummary, buildSessionFocus, calculateSessionProgress } from '../services/workoutExperience';
import { workoutFocus, workoutReps, workoutTheme, workoutTitle } from '../services/workoutCopy';

export default function Workout({ appState, routines, onSessionPatch, onFinish }) {
  const session = appState.activeSession;
  const workout = session.workout;
  const language = getLanguage(appState.userProfile);
  const block = workout.blocks[session.blockIndex];
  const exercise = routines.exercises[block?.exercise] || {};
  const exerciseInsight = getExerciseText(block?.exercise, exercise, language);
  const progress = calculateSessionProgress({ session, workout, warmupCount: 3 });
  const sessionFocus = buildSessionFocus({
    block,
    exercise: exerciseInsight,
    insight: exerciseInsight,
    blockIndex: session.blockIndex,
    totalBlocks: workout.blocks.length,
    language,
  });
  const [infoOpen, setInfoOpen] = useState(false);
  const [feedback, setFeedback] = useState('correct');
  const [notes, setNotes] = useState('');

  const warmup = useMemo(() => {
    const key = workout.focus === 'Metabolic' ? 'conditioning' : 'balanced';
    return (routines.warmup_routines[key] || routines.warmup_routines.balanced || []).slice(0, 3);
  }, [routines.warmup_routines, workout.focus]);

  const timerDuration = session.phase === 'warmup'
    ? warmup[session.warmupIndex || 0]?.duration || 30
    : session.restSeconds || 45;

  const countdown = useCountdown({
    seconds: timerDuration,
    active: session.phase === 'warmup' || session.phase === 'rest',
    onDone: () => {
      if (session.phase === 'warmup') {
        const next = (session.warmupIndex || 0) + 1;
        onSessionPatch(next >= warmup.length ? { phase: 'exercise' } : { warmupIndex: next });
      }
      if (session.phase === 'rest') {
        onSessionPatch({ phase: 'exercise' });
      }
    },
  });

  if (session.phase === 'finish') {
    const finishSummary = buildFinishSummary({
      workout,
      completedBlocks: session.completedBlocks || [],
      feedback,
      language,
    });

    return (
      <main className="ob-session">
        <SessionProgress value={100} />
        <section className="ob-finish">
          <CheckCircle2 size={56} />
          <p className="caption">{t('workout.complete', language)}</p>
          <h1>{workoutTitle(workout.title, language)}</h1>
          <div className="ob-finish-proof">
            <div>
              <span>{t('workout.workDone', language)}</span>
              <strong>{finishSummary.completedLabel}</strong>
            </div>
            <div>
              <span>{t('workout.duration', language)}</span>
              <strong>{finishSummary.durationLabel}</strong>
            </div>
            <div>
              <span>{t('workout.focus', language)}</span>
              <strong>{workoutFocus(finishSummary.focusLabel, language)}</strong>
            </div>
          </div>
          <p>{finishSummary.coachNote}</p>
          <div className="ob-feedback-grid">
            {[
              ['easy', t('workout.easy', language)],
              ['correct', t('workout.correct', language)],
              ['brutal', t('workout.brutal', language)],
              ['pain', t('workout.pain', language)],
            ].map(([id, label]) => (
              <button key={id} className={feedback === id ? 'is-active' : ''} onClick={() => setFeedback(id)} type="button">
                {label}
              </button>
            ))}
          </div>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t('workout.optionalNote', language)} />
          <Button onClick={() => onFinish(feedback, notes)}>{t('workout.saveSession', language)}</Button>
        </section>
      </main>
    );
  }

  if (session.phase === 'warmup') {
    const step = warmup[session.warmupIndex || 0];
    const warmupInfo = routines.warmup_library[step?.id] || {};
    return (
      <main className="ob-session">
        <SessionProgress value={progress} />
        <SessionHeader label={t('workout.warmup', language, { current: (session.warmupIndex || 0) + 1, total: warmup.length })} onQuit={() => onSessionPatch({ phase: 'exercise' })} language={language} />
        <section className="ob-session__center ob-session__center--exercise">
          <div className="ob-session__media">
            <Timer size={54} />
          </div>
          <h1>{localizeWarmupName(warmupInfo.name, language) || t('workout.warmupFallback', language)}</h1>
          <p>{localizeWarmupInstruction(warmupInfo.instruction, language) || t('workout.warmupInstructionFallback', language)}</p>
          <strong className="ob-session__target">{countdown}s</strong>
        </section>
        <div className="ob-session__controls">
          <Button
            variant="secondary"
            onClick={() =>
              onSessionPatch({
                warmupIndex: Math.max(0, (session.warmupIndex || 0) - 1),
              })
            }
          >
            <ChevronLeft size={20} />
            {t('common.back', language)}
          </Button>
          <Button
            onClick={() => {
              const next = (session.warmupIndex || 0) + 1;
              onSessionPatch(next >= warmup.length ? { phase: 'exercise' } : { warmupIndex: next });
            }}
          >
            {t('common.next', language)}
            <ChevronRight size={20} />
          </Button>
        </div>
      </main>
    );
  }

  if (session.phase === 'rest') {
    const completedBlock = workout.blocks[Math.max(0, session.blockIndex - 1)] || block;
    const completedExercise = routines.exercises[completedBlock?.exercise] || {};
    return (
      <main className="ob-session">
        <SessionProgress value={progress} />
        <SessionHeader label={t('workout.recoveryPhase', language)} onQuit={() => onSessionPatch({ phase: 'exercise' })} language={language} />
        <section className="ob-session__center">
          <div className="ob-set-locked">
            <CheckCircle2 size={18} />
            <span>{t('workout.lockedIn', language, { name: getExerciseText(completedBlock?.exercise, completedExercise, language).name || 'Set' })}</span>
          </div>
          <div className="ob-rest-ring">
            <strong>{countdown}</strong>
            <span>{t('workout.seconds', language)}</span>
          </div>
          <p className="caption">{t('workout.upNext', language)}</p>
          <h1>{exerciseInsight.name || block.exercise}</h1>
          <p>{t('workout.restCue', language)}</p>
        </section>
        <div className="ob-session__controls">
          <Button onClick={() => onSessionPatch({ phase: 'exercise' })}>{t('workout.startNextSet', language)}</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="ob-session">
      <SessionProgress value={progress} />
      <SessionHeader
        label={t('workout.exerciseCount', language, { current: session.blockIndex + 1, total: workout.blocks.length })}
        onQuit={() => onSessionPatch({ phase: 'finish' })}
        language={language}
      />
        <section className="ob-session__center">
          <button className="ob-info-link" type="button" onClick={() => setInfoOpen(true)}>
            <Info size={18} />
            {t('workout.formGuide', language)}
          </button>
          <p className="ob-session__theme">{workoutTheme(workout.theme, language)}</p>
          <div className="ob-set-focus">
            <span>{sessionFocus.label}</span>
            <strong>{sessionFocus.headline}</strong>
            <p>{sessionFocus.body}</p>
            <div className="ob-set-focus__badges">
              {sessionFocus.badges.map((badge) => (
                <em key={badge}>{badge}</em>
              ))}
            </div>
          </div>
          <div className="ob-session__media ob-session__media--exercise">
            <span>{exerciseInsight.patternLabel}</span>
          </div>
        <h1>{exerciseInsight.name || block.exercise}</h1>
        <p>{exerciseInsight.intent}</p>
        <div className="ob-session__cue">
          <strong>{t('workout.coachCue', language)}</strong>
          <span>{exerciseInsight.coachCue}</span>
        </div>
        <div className="ob-session__stats">
          <div>
            <span>{t('workout.target', language)}</span>
            <strong>{workoutReps(block.reps, language)}</strong>
          </div>
          <div>
            <span>{t('workout.rest', language)}</span>
            <strong>{block.restSeconds}s</strong>
          </div>
        </div>
      </section>
      <div className="ob-session__controls">
        <Button
          variant="secondary"
          onClick={() => onSessionPatch({ blockIndex: Math.max(0, session.blockIndex - 1) })}
          disabled={session.blockIndex === 0}
        >
          <ChevronLeft size={20} />
          {t('common.previous', language)}
        </Button>
        <Button
          onClick={() => {
            const completedBlocks = [...(session.completedBlocks || []), block.id];
            const nextIndex = session.blockIndex + 1;
            if (nextIndex >= workout.blocks.length) {
              onSessionPatch({ phase: 'finish', completedBlocks });
            } else {
              onSessionPatch({
                phase: 'rest',
                blockIndex: nextIndex,
                restSeconds: block.restSeconds,
                completedBlocks,
              });
            }
          }}
        >
          {t('workout.completeSet', language)}
          <CheckCircle2 size={20} />
        </Button>
      </div>

      {infoOpen && (
        <Modal title={exerciseInsight.name || block.exercise} onClose={() => setInfoOpen(false)} closeLabel={t('common.closeModal', language)}>
          <div className="ob-info-section">
            <div className="ob-coach-cue">
              <strong>{t('exercises.priorityCue', language)}</strong>
              <span>{exerciseInsight.coachCue}</span>
            </div>
            <h3>{t('exercises.instructions', language)}</h3>
            <ol>
              {(exerciseInsight.instructions || [t('workout.fallbackInstruction1', language), t('workout.fallbackInstruction2', language), t('workout.fallbackInstruction3', language)]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <h3>{t('exercises.commonMistakes', language)}</h3>
            <ul>
              {([exerciseInsight.priorityMistake, ...(exerciseInsight.mistakes || [t('workout.fallbackMistake1', language), t('workout.fallbackMistake2', language)]).filter((item) => item !== exerciseInsight.priorityMistake)]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </main>
  );
}

function SessionProgress({ value }) {
  return (
    <div className="ob-session-progress" aria-label={`Session progress ${value}%`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function SessionHeader({ label, onQuit, language = 'en' }) {
  return (
    <header className="ob-session__header">
      <button type="button" onClick={onQuit} aria-label={t('workout.closeSession', language)}>
        <X size={20} />
      </button>
      <span>{label}</span>
      <div />
    </header>
  );
}

function localizeWarmupName(name, language) {
  if (language !== 'es') return name;
  const copy = {
    'Neck & Shoulder Rolls': 'Círculos de cuello y hombros',
    'Arm Circles': 'Círculos de brazos',
    'Hip Circles': 'Círculos de cadera',
    'Good Mornings': 'Good mornings',
    'Prying Squat': 'Sentadilla prying',
    'Glute Bridges': 'Puentes de glúteo',
    'T-Spine Rotations': 'Rotaciones torácicas',
    'Walkouts / Inchworms': 'Walkouts / inchworms',
    'Spiderman Lunges': 'Zancadas spiderman',
    'High Knees': 'Rodillas altas',
    'Jumping Jacks': 'Jumping jacks',
    'Shoulder Taps': 'Toques de hombros',
    'Downward Dog': 'Downward dog',
    'Cossack Squat': 'Sentadilla cossack',
  };
  return copy[name] || name;
}

function localizeWarmupInstruction(instruction, language) {
  if (language !== 'es') return instruction;
  if (!instruction) return instruction;
  const copy = {
    'Release tension by gently rolling your neck and shoulders backwards.': 'Libera tensión rodando cuello y hombros suavemente hacia atrás.',
    'Wide arm circles to lubricate the shoulder joint.': 'Haz círculos amplios con los brazos para preparar hombros.',
    'Hands on your hips, make wide circles to loosen your lower back and pelvis.': 'Manos en la cadera, haz círculos amplios para soltar pelvis y espalda baja.',
    'Deep squat, use your elbows to gently push your knees outward.': 'En sentadilla profunda, usa los codos para abrir suavemente las rodillas.',
    'Walk your hands out to a plank position, stretching your hamstrings.': 'Camina con las manos hasta plancha y estira isquios.',
    'Lying on your back, push your hips up by squeezing your glutes tightly.': 'Acostado boca arriba, sube la cadera apretando glúteos.',
    'Deep lunge, dropping your hips to the floor to open up your groin.': 'Haz una zancada profunda y baja la cadera para abrir la ingle.',
    'Raise your heart rate with jumping jacks.': 'Eleva pulsaciones con jumping jacks.',
    'Run in place bringing your knees as high as possible.': 'Corre en tu lugar subiendo las rodillas lo más alto posible.',
    'On all fours, open your chest and reach one arm towards the ceiling.': 'En cuatro puntos, abre el pecho y lleva un brazo hacia el techo.',
    'Hips up, stretch your back and the posterior chain of your legs.': 'Cadera arriba, estira espalda y cadena posterior.',
    'In a high plank, touch your opposite shoulder without shifting your hips.': 'En plancha alta, toca el hombro contrario sin mover la cadera.',
    'Deep lateral lunge keeping one leg fully extended.': 'Haz una zancada lateral profunda manteniendo una pierna extendida.',
    'Hinge at the hips with a straight back to activate your hamstrings.': 'Haz bisagra de cadera con espalda recta para activar isquios.',
  };
  return copy[instruction] || instruction;
}

function useCountdown({ seconds, active, onDone }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!active) return undefined;
    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          window.setTimeout(onDone, 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [active, onDone, seconds]);

  return remaining;
}
