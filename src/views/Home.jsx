import React from 'react';
import { CalendarCheck, Clock, Flame, Play, Settings, Target, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import { calculateCoachStats, calculateStreak } from '../services/coachEngine';
import { buildCoachExplanation } from '../services/coachExplanation';
import { formatDate, getLanguage, t } from '../services/copy';
import { getExerciseText } from '../services/exerciseGuide';
import { Button, MetricCard, Page, ProgressRing } from '../components/ui';
import { getRetentionNudge, shouldOfferNotifications } from '../services/nudges';
import { workoutFocus, workoutLevel, workoutReps, workoutTheme, workoutTitle } from '../services/workoutCopy';

export default function Home({ appState, coachPlan, onStartWorkout, onEnableReminders }) {
  const stats = calculateCoachStats(appState.workoutHistory);
  const streak = calculateStreak(appState.workoutHistory);
  const language = getLanguage(appState.userProfile);
  const workout = coachPlan.workout;
  const coachExplanation = buildCoachExplanation({ coachPlan, history: appState.workoutHistory, language });
  const weeklyTarget = Number(appState.userProfile.daysPerWeek) || 3;
  const thisWeekCount = getThisWeekCount(appState.workoutHistory);
  const weekPct = Math.min(100, (thisWeekCount / weeklyTarget) * 100);
  const permission =
    appState.nudgePreferences?.permission ||
    (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const retentionNudge = getRetentionNudge({
    history: appState.workoutHistory,
    notificationPermission: permission,
    language,
  });
  const canOfferNotifications = shouldOfferNotifications({
    history: appState.workoutHistory,
    permission,
  });

  return (
    <Page>
      <header className="ob-hero-header">
        <div className="ob-header-row">
          <p className="caption">{formatDate(new Date(), language)}</p>
          <Link className="ob-round-link" to="/profile" aria-label={t('home.openProfileSettings', language)}>
            <Settings size={18} />
          </Link>
        </div>
        <h1 className="title-lg">{t('home.ready', language)}</h1>
        <p className="body-text">{localizeRecommendation(coachPlan.recommendation, language)}</p>
      </header>

      <section className="ob-metric-grid">
        <MetricCard icon={Flame} label={t('home.streak', language)} value={`${streak.current}d`} tone="red" />
        <MetricCard icon={Target} label={t('home.workouts', language)} value={stats.count} tone="green" />
        <MetricCard icon={Clock} label={t('home.time', language)} value={stats.timeLabel} tone="blue" />
      </section>

      <section className="ob-daily-card">
        <div className="ob-daily-card__content">
          <div className="ob-pill-row">
            <span>{workout.duration} min</span>
            <span>{workoutFocus(workout.focus, language)}</span>
            <span>{workoutLevel(workout.level, language)}</span>
            <span>{workoutTheme(workout.theme, language)}</span>
          </div>
          <div className="ob-kettlebell-mark" aria-hidden="true">
            <span />
          </div>
          <h2>{workoutTitle(workout.title, language)}</h2>
          <p>
            {t('home.targetLine', language, { weight: workout.kettlebellWeight })}
          </p>
          <div className="ob-variety-note">
            <strong>{t('home.todayStimulus', language)}</strong>
            <span>{localizeVarietyReason(coachPlan.variety, language)}</span>
          </div>
          <div className={`ob-adaptation ob-adaptation--${coachPlan.adaptation.mode}`}>
            <strong>{t('home.coachAdjustment', language)}</strong>
            <span>{localizeAdaptationReason(coachPlan.adaptation, language)}</span>
          </div>
          <div className="ob-coach-explanation">
            <strong>{t('home.coachChangedTitle', language)}</strong>
            <span>{coachExplanation.body}</span>
            <em>{coachExplanation.effect}</em>
          </div>
          <Button onClick={() => onStartWorkout(workout)}>
            <Play size={18} fill="currentColor" />
            {t('home.startWorkout', language)}
          </Button>
        </div>
      </section>

      <section className="ob-two-column">
        <div className="ob-card ob-week-card">
          <div>
            <p className="caption">{t('home.thisWeek', language)}</p>
            <h3>{t('home.sessionsCount', language, { count: thisWeekCount, target: weeklyTarget })}</h3>
            <p>{t('home.weekCopy', language)}</p>
          </div>
          <ProgressRing value={weekPct} label={t('common.week', language)} />
        </div>
        <div className="ob-card ob-challenge-card">
          <Trophy size={24} />
          <h3>{t('home.currentChallenge', language)}</h3>
          <p>{t('home.challengeCopy', language, { target: weeklyTarget })}</p>
        </div>
      </section>

      <section>
        <div className="ob-section-title">
          <h2 className="title-sm">{t('home.todaysBlocks', language)}</h2>
          <Zap size={18} />
        </div>
        <div className="ob-block-list">
          {workout.blocks.map((block) => (
            <div key={block.id}>
              <span>{getExerciseText(block.exercise, block.detail, language).name || block.exercise}</span>
              <strong>{workoutReps(block.reps, language)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="ob-card ob-nudge-card">
        <CalendarCheck size={22} />
        <div>
          <h3>{retentionNudge.title}</h3>
          <p>{retentionNudge.message}</p>
        </div>
        {canOfferNotifications ? (
          <button type="button" className="ob-text-action" onClick={onEnableReminders}>
            {t('home.enableReminders', language)}
          </button>
        ) : (
          <span className="ob-small-note">{t(`home.nudge.${coachPlan.recommendation.state}`, language)}</span>
        )}
      </section>
    </Page>
  );
}

function getThisWeekCount(history = []) {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return history.filter((entry) => new Date(entry.date) >= monday).length;
}

function localizeRecommendation(recommendation = {}, language) {
  if (language !== 'es') return recommendation.message;
  const copy = {
    push: 'Traes buen impulso. Empuja con reps limpias hoy.',
    deload: 'Descarga hoy. La fuerza crece cuando la recuperación alcanza al trabajo.',
    recovery: 'Vuelve suave y recupera ritmo con una sesión controlada.',
    resume: 'Retoma tu sesión donde la dejaste.',
    normal: 'Entrena hoy, registra honestamente y deja que el coach adapte.',
  };
  return copy[recommendation.state] || copy.normal;
}

function localizeVarietyReason(variety = {}, language) {
  if (language !== 'es') return variety.reason;
  if (variety.reason?.includes('away from')) return 'Rotó lejos del patrón anterior para evitar repetir el mismo estímulo.';
  return `Rotó hacia ${workoutTheme(variety.theme, language)} para que la semana tenga un estímulo fresco.`;
}

function localizeAdaptationReason(adaptation = {}, language) {
  if (language !== 'es') return adaptation.reason;
  const copy = {
    progress: 'La última sesión se sintió fácil, así que OneBell añade densidad con un poco menos de descanso.',
    deload: 'La última sesión fue brutal, así que hoy mantiene el trabajo productivo con más descanso.',
    protect: 'Reportaste dolor, así que OneBell protege la sesión con menos volumen y sin bloques pesados.',
    hold: 'Tu último feedback permite una progresión normal hoy.',
  };
  return copy[adaptation.mode] || copy.hold;
}
