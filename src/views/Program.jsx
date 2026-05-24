import React from 'react';
import { CalendarDays, Lock, Play } from 'lucide-react';

import { Button, Page, ProgressRing } from '../components/ui';
import { getLanguage, t } from '../services/copy';
import { programName, workoutFocus, workoutTitle } from '../services/workoutCopy';

export default function Program({ appState, coachPlan, onStartWorkout }) {
  const language = getLanguage(appState.userProfile);
  const target = Number(appState.userProfile.daysPerWeek) || 3;
  const total = target * 12;
  const completed = appState.workoutHistory.length;
  const pct = Math.min(100, (completed / total) * 100);
  const phases = [
    [t('program.phase.weeks', language, { start: 1, end: 4 }), t('program.phase.foundation', language), t('program.phase.foundation.detail', language)],
    [t('program.phase.weeks', language, { start: 5, end: 8 }), t('program.phase.build', language), t('program.phase.build.detail', language)],
    [t('program.phase.weeks', language, { start: 9, end: 12 }), t('program.phase.performance', language), t('program.phase.performance.detail', language)],
  ];

  return (
    <Page>
      <header className="ob-hero-header">
        <p className="caption">{t('program.method', language)}</p>
        <h1 className="title-lg">{t('program.title', language)}</h1>
        <p className="body-text">{t('program.weekLine', language, { week: coachPlan.week })}</p>
      </header>

      <section className="ob-card ob-program-overview">
        <div>
          <p className="caption">{programName(coachPlan.programName, language)}</p>
          <h2>{t('program.workoutsCount', language, { completed, total })}</h2>
          <p>{t('program.rhythmLine', language, { target })}</p>
        </div>
        <ProgressRing value={pct} label={t('common.plan', language)} />
      </section>

      <section className="ob-daily-card ob-daily-card--compact">
        <div className="ob-daily-card__content">
          <div className="ob-pill-row">
            <span>{t('common.today', language)}</span>
            <span>{workoutFocus(coachPlan.workout.focus, language)}</span>
            <span>{coachPlan.workout.duration} min</span>
          </div>
          <h2>{workoutTitle(coachPlan.workout.title, language)}</h2>
          <Button onClick={() => onStartWorkout(coachPlan.workout)}>
            <Play size={18} fill="currentColor" />
            {t('program.startToday', language)}
          </Button>
        </div>
      </section>

      <section>
        <div className="ob-section-title">
          <h2 className="title-sm">{t('program.phases', language)}</h2>
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
