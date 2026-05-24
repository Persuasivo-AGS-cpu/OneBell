import React from 'react';
import { Award, CalendarCheck, Clock, Flame, Target, TrendingUp } from 'lucide-react';

import { getLanguage, t } from '../services/copy';
import { buildProgressProof } from '../services/progressProof';
import { MetricCard, Page, ProgressRing } from '../components/ui';

export default function Progress({ appState, coachPlan }) {
  const language = getLanguage(appState.userProfile);
  const proof = buildProgressProof({
    history: appState.workoutHistory,
    profile: appState.userProfile,
    coachPlan,
  });
  const { stats, streak } = proof;
  const total = (Number(appState.userProfile.daysPerWeek) || 3) * 12;
  const achievements = getAchievements(stats, streak, language);

  return (
    <Page>
      <header className="ob-hero-header">
        <p className="caption">{t('progress.progressProof', language)}</p>
        <h1 className="title-lg">{t('progress.yourWorkVisible', language)}</h1>
        <p className="body-text">{proof.protocolLine}</p>
      </header>

      <section className="ob-card ob-streak-card">
        <div>
          <p className="caption">{t('progress.currentStreak', language)}</p>
          <h2>{proof.currentStreakLabel}</h2>
          <p>{t('progress.longest', language, { value: proof.longestStreakLabel })}</p>
        </div>
        <Flame size={48} fill="currentColor" />
      </section>

      <section className="ob-metric-grid">
        <MetricCard icon={Target} label={t('home.workouts', language)} value={stats.count} tone="green" />
        <MetricCard icon={Clock} label={t('home.time', language)} value={proof.timeValue} tone="blue" />
        <MetricCard icon={Flame} label={t('progress.kcal', language)} value={proof.kcalValue} tone="red" />
      </section>

      <section className="ob-proof-grid">
        {proof.cards.map((card) => (
          <div className="ob-card ob-proof-card" key={card.title}>
            <CalendarCheck size={19} />
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
          </div>
        ))}
      </section>

      <section className="ob-card ob-program-overview">
        <div>
          <p className="caption">{t('progress.protocolTitle', language)}</p>
          <h2>{t('progress.week', language, { week: coachPlan.week })}</h2>
          <p>{t('progress.plannedSessions', language, { count: stats.count, total, milestone: proof.nextMilestone.value })}</p>
        </div>
        <ProgressRing value={proof.planPercent} label={t('common.plan', language)} />
      </section>

      <section>
        <div className="ob-section-title">
          <h2 className="title-sm">{t('progress.monthlyActivity', language)}</h2>
          <TrendingUp size={18} />
        </div>
        <CalendarGrid history={appState.workoutHistory} language={language} />
      </section>

      <section>
        <div className="ob-section-title">
          <h2 className="title-sm">{t('progress.achievements', language)}</h2>
          <Award size={18} />
        </div>
        <div className="ob-achievement-list">
          {achievements.map((achievement) => (
            <div className="ob-card" key={achievement.title}>
              <achievement.icon size={22} />
              <div>
                <h3>{achievement.title}</h3>
                <p>{achievement.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}

function CalendarGrid({ history, language }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const completed = new Set(history.map((entry) => new Date(entry.date).toDateString()));
  const cells = Array.from({ length: offset + days }, (_, index) => {
    if (index < offset) return null;
    return new Date(year, month, index - offset + 1);
  });

  return (
    <div className="ob-card ob-calendar">
      {[
        t('progress.days.mon', language),
        t('progress.days.tue', language),
        t('progress.days.wed', language),
        t('progress.days.thu', language),
        t('progress.days.fri', language),
        t('progress.days.sat', language),
        t('progress.days.sun', language),
      ].map((day, index) => (
        <strong key={`${day}-${index}`}>{day}</strong>
      ))}
      {cells.map((date, index) => (
        <span key={date?.toISOString() || `blank-${index}`} className={date && completed.has(date.toDateString()) ? 'is-complete' : ''}>
          {date?.getDate() || ''}
        </span>
      ))}
    </div>
  );
}

function getAchievements(stats, streak, language = 'en') {
  const items = [];
  if (stats.count >= 1) items.push({ icon: Target, title: language === 'es' ? 'Primera sesión' : 'First bell', detail: language === 'es' ? 'Completaste tu primera sesión OneBell.' : 'You completed the first OneBell session.' });
  if (stats.count >= 5) items.push({ icon: Award, title: language === 'es' ? 'Cinco sesiones' : 'Five sessions', detail: language === 'es' ? 'La consistencia ya está entrando.' : 'Consistency has entered the chat.' });
  if (streak.longest >= 3) items.push({ icon: Flame, title: language === 'es' ? 'Racha de tres días' : 'Three-day streak', detail: language === 'es' ? 'Impulso sin drama.' : 'Momentum without drama.' });
  if (items.length === 0) items.push({ icon: Award, title: language === 'es' ? 'Bloqueado' : 'Locked', detail: language === 'es' ? 'Completa una sesión para desbloquear tu primer logro.' : 'Complete one session to unlock your first badge.' });
  return items;
}
