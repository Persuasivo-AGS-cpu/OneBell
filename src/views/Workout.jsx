import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Info, Timer, X } from 'lucide-react';

import { Button, Modal } from '../components/ui';
import { getLanguage, t } from '../services/copy';
import { getExerciseInsight } from '../services/exerciseGuide';
import { buildFinishSummary, buildSessionFocus, calculateSessionProgress } from '../services/workoutExperience';

export default function Workout({ appState, routines, onSessionPatch, onFinish }) {
  const session = appState.activeSession;
  const workout = session.workout;
  const language = getLanguage(appState.userProfile);
  const block = workout.blocks[session.blockIndex];
  const exercise = routines.exercises[block?.exercise] || {};
  const exerciseInsight = getExerciseInsight(block?.exercise, exercise);
  const progress = calculateSessionProgress({ session, workout, warmupCount: 3 });
  const sessionFocus = buildSessionFocus({
    block,
    exercise,
    insight: exerciseInsight,
    blockIndex: session.blockIndex,
    totalBlocks: workout.blocks.length,
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
    });

    return (
      <main className="ob-session">
        <SessionProgress value={100} />
        <section className="ob-finish">
          <CheckCircle2 size={56} />
          <p className="caption">Workout complete</p>
          <h1>{workout.title}</h1>
          <div className="ob-finish-proof">
            <div>
              <span>Work done</span>
              <strong>{finishSummary.completedLabel}</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{finishSummary.durationLabel}</strong>
            </div>
            <div>
              <span>Focus</span>
              <strong>{finishSummary.focusLabel}</strong>
            </div>
          </div>
          <p>{finishSummary.coachNote}</p>
          <div className="ob-feedback-grid">
            {[
              ['easy', 'Easy'],
              ['correct', 'Correct'],
              ['brutal', 'Brutal'],
              ['pain', 'Pain'],
            ].map(([id, label]) => (
              <button key={id} className={feedback === id ? 'is-active' : ''} onClick={() => setFeedback(id)} type="button">
                {label}
              </button>
            ))}
          </div>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional note for the coach" />
          <Button onClick={() => onFinish(feedback, notes)}>Save session</Button>
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
        <SessionHeader label={`Warmup ${(session.warmupIndex || 0) + 1}/${warmup.length}`} onQuit={() => onSessionPatch({ phase: 'exercise' })} />
        <section className="ob-session__center ob-session__center--exercise">
          <div className="ob-session__media">
            <Timer size={54} />
          </div>
          <h1>{warmupInfo.name || 'Warmup'}</h1>
          <p>{warmupInfo.instruction || 'Move with control and prepare the joints you are about to load.'}</p>
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
            Back
          </Button>
          <Button
            onClick={() => {
              const next = (session.warmupIndex || 0) + 1;
              onSessionPatch(next >= warmup.length ? { phase: 'exercise' } : { warmupIndex: next });
            }}
          >
            Next
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
        <SessionHeader label="Recovery phase" onQuit={() => onSessionPatch({ phase: 'exercise' })} />
        <section className="ob-session__center">
          <div className="ob-set-locked">
            <CheckCircle2 size={18} />
            <span>{completedExercise.name || 'Set'} locked in</span>
          </div>
          <div className="ob-rest-ring">
            <strong>{countdown}</strong>
            <span>sec</span>
          </div>
          <p className="caption">Up next</p>
          <h1>{exercise.name || block.exercise}</h1>
          <p>Breathe through your nose, shake out tension, keep the next set crisp.</p>
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
        label={`Exercise ${session.blockIndex + 1}/${workout.blocks.length}`}
        onQuit={() => onSessionPatch({ phase: 'finish' })}
      />
        <section className="ob-session__center">
          <button className="ob-info-link" type="button" onClick={() => setInfoOpen(true)}>
            <Info size={18} />
            {t('workout.formGuide', language)}
          </button>
          <p className="ob-session__theme">{workout.theme}</p>
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
            <span>{exerciseInsight.pattern}</span>
          </div>
        <h1>{exercise.name || block.exercise}</h1>
        <p>{exerciseInsight.intent}</p>
        <div className="ob-session__cue">
          <strong>{t('workout.coachCue', language)}</strong>
          <span>{exerciseInsight.coachCue}</span>
        </div>
        <div className="ob-session__stats">
          <div>
            <span>Target</span>
            <strong>{block.reps}</strong>
          </div>
          <div>
            <span>Rest</span>
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
          Previous
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
        <Modal title={exercise.name || block.exercise} onClose={() => setInfoOpen(false)}>
          <div className="ob-info-section">
            <div className="ob-coach-cue">
              <strong>Priority cue</strong>
              <span>{exerciseInsight.coachCue}</span>
            </div>
            <h3>Instructions</h3>
            <ol>
              {(exercise.instructions || ['Keep your core braced.', 'Move with control.', 'Stop if pain appears.']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <h3>Common mistakes</h3>
            <ul>
              {([exerciseInsight.priorityMistake, ...(exercise.mistakes || ['Rushing reps.', 'Losing posture.']).filter((item) => item !== exerciseInsight.priorityMistake)]).map((item) => (
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

function SessionHeader({ label, onQuit }) {
  return (
    <header className="ob-session__header">
      <button type="button" onClick={onQuit} aria-label="Close session">
        <X size={20} />
      </button>
      <span>{label}</span>
      <div />
    </header>
  );
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
