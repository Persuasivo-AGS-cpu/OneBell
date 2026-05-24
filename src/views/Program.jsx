import React from 'react';
import { CalendarDays, Lock, Play } from 'lucide-react';

import { Button, Page, ProgressRing } from '../components/ui';

export default function Program({ appState, coachPlan, onStartWorkout }) {
  const target = Number(appState.userProfile.daysPerWeek) || 3;
  const total = target * 12;
  const completed = appState.workoutHistory.length;
  const pct = Math.min(100, (completed / total) * 100);
  const phases = [
    ['Weeks 1-4', 'Foundation', 'Technique, bracing, repeatable reps.'],
    ['Weeks 5-8', 'Build', 'More density, cleaner transitions, stronger sets.'],
    ['Weeks 9-12', 'Performance', 'Higher confidence under fatigue.'],
  ];

  return (
    <Page>
      <header className="ob-hero-header">
        <p className="caption">Dynamic method</p>
        <h1 className="title-lg">Your 12-week protocol</h1>
        <p className="body-text">Week {coachPlan.week}. The coach adapts the daily work without losing the long arc.</p>
      </header>

      <section className="ob-card ob-program-overview">
        <div>
          <p className="caption">{coachPlan.programName}</p>
          <h2>{completed}/{total} workouts</h2>
          <p>{target} sessions per week. Adjust the rhythm later without resetting progress.</p>
        </div>
        <ProgressRing value={pct} label="plan" />
      </section>

      <section className="ob-daily-card ob-daily-card--compact">
        <div className="ob-daily-card__content">
          <div className="ob-pill-row">
            <span>Today</span>
            <span>{coachPlan.workout.focus}</span>
            <span>{coachPlan.workout.duration} min</span>
          </div>
          <h2>{coachPlan.workout.title}</h2>
          <Button onClick={() => onStartWorkout(coachPlan.workout)}>
            <Play size={18} fill="currentColor" />
            Start today's session
          </Button>
        </div>
      </section>

      <section>
        <div className="ob-section-title">
          <h2 className="title-sm">Program phases</h2>
          <CalendarDays size={18} />
        </div>
        <div className="ob-phase-list">
          {phases.map(([range, title, detail], index) => {
            const active = coachPlan.week >= index * 4 + 1 && coachPlan.week <= index * 4 + 4;
            return (
              <div key={title} className={`ob-card ${active ? 'is-active' : ''}`}>
                <span>{range}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
                {!active && <Lock size={16} />}
              </div>
            );
          })}
        </div>
      </section>
    </Page>
  );
}
