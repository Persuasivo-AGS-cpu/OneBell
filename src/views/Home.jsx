import React from 'react';
import { CalendarCheck, Clock, Flame, Play, Settings, Target, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import { calculateCoachStats, calculateStreak } from '../services/coachEngine';
import { buildCoachExplanation } from '../services/coachExplanation';
import { getLanguage, t } from '../services/copy';
import { Button, MetricCard, Page, ProgressRing } from '../components/ui';
import { getRetentionNudge, shouldOfferNotifications } from '../services/nudges';

export default function Home({ appState, coachPlan, onStartWorkout, onEnableReminders }) {
  const stats = calculateCoachStats(appState.workoutHistory);
  const streak = calculateStreak(appState.workoutHistory);
  const language = getLanguage(appState.userProfile);
  const workout = coachPlan.workout;
  const coachExplanation = buildCoachExplanation({ coachPlan, history: appState.workoutHistory });
  const weeklyTarget = Number(appState.userProfile.daysPerWeek) || 3;
  const thisWeekCount = getThisWeekCount(appState.workoutHistory);
  const weekPct = Math.min(100, (thisWeekCount / weeklyTarget) * 100);
  const permission =
    appState.nudgePreferences?.permission ||
    (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const retentionNudge = getRetentionNudge({
    history: appState.workoutHistory,
    notificationPermission: permission,
  });
  const canOfferNotifications = shouldOfferNotifications({
    history: appState.workoutHistory,
    permission,
  });

  return (
    <Page>
      <header className="ob-hero-header">
        <div className="ob-header-row">
          <p className="caption">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</p>
          <Link className="ob-round-link" to="/profile" aria-label="Open profile settings">
            <Settings size={18} />
          </Link>
        </div>
        <h1 className="title-lg">Ready to train?</h1>
        <p className="body-text">{coachPlan.recommendation.message}</p>
      </header>

      <section className="ob-metric-grid">
        <MetricCard icon={Flame} label="Streak" value={`${streak.current}d`} tone="red" />
        <MetricCard icon={Target} label="Workouts" value={stats.count} tone="green" />
        <MetricCard icon={Clock} label="Time" value={stats.timeLabel} tone="blue" />
      </section>

      <section className="ob-daily-card">
        <div className="ob-daily-card__content">
          <div className="ob-pill-row">
            <span>{workout.duration} min</span>
            <span>{workout.focus}</span>
            <span>{workout.level}</span>
            <span>{workout.theme}</span>
          </div>
          <div className="ob-kettlebell-mark" aria-hidden="true">
            <span />
          </div>
          <h2>{workout.title}</h2>
          <p>
            Target: {workout.kettlebellWeight}kg. The coach is using your level, history and weekly rhythm to set today's load.
          </p>
          <div className="ob-variety-note">
            <strong>Today&apos;s stimulus</strong>
            <span>{coachPlan.variety.reason}</span>
          </div>
          <div className={`ob-adaptation ob-adaptation--${coachPlan.adaptation.mode}`}>
            <strong>Coach adjustment</strong>
            <span>{coachPlan.adaptation.reason}</span>
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
            <p className="caption">This week</p>
            <h3>{thisWeekCount}/{weeklyTarget} sessions</h3>
            <p>Stay consistent without chasing punishment.</p>
          </div>
          <ProgressRing value={weekPct} label="week" />
        </div>
        <div className="ob-card ob-challenge-card">
          <Trophy size={24} />
          <h3>Current challenge</h3>
          <p>Complete {weeklyTarget} clean sessions this week.</p>
        </div>
      </section>

      <section>
        <div className="ob-section-title">
          <h2 className="title-sm">Today's blocks</h2>
          <Zap size={18} />
        </div>
        <div className="ob-block-list">
          {workout.blocks.map((block) => (
            <div key={block.id}>
              <span>{block.detail?.name || block.exercise}</span>
              <strong>{block.reps}</strong>
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
            Enable reminders
          </button>
        ) : (
          <span className="ob-small-note">{getNudgeCopy(coachPlan.recommendation.state)}</span>
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

function getNudgeCopy(state) {
  const copy = {
    push: 'You have momentum. Keep it clean and let the last reps stay honest.',
    deload: 'Today is about leaving fresher than you arrived. Recovery keeps the plan moving.',
    recovery: 'Restart with control. One completed session brings the rhythm back online.',
    resume: 'Your unfinished session is waiting. Pick it back up without restarting.',
    normal: 'Do the next right session. The coach will adapt after your feedback.',
  };
  return copy[state] || copy.normal;
}
