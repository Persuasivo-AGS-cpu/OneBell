import React from 'react';
import { Bell, Dumbbell, Ruler, RotateCcw, Save, Scale, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button, Page } from '../components/ui';
import { buildBodyMetricPatch, getBodyMetricsSummary } from '../services/bodyMetrics';
import { getLanguage, t } from '../services/copy';

const goals = [
  ['burn-fat', 'goal.burn-fat'],
  ['build-strength', 'goal.build-strength'],
  ['conditioning', 'goal.conditioning'],
];

const levels = [
  ['beginner', 'level.beginner'],
  ['intermediate', 'level.intermediate'],
  ['advanced', 'level.advanced'],
];

export default function Profile({ appState, onUpdateProfile, onEnableReminders }) {
  const profile = appState.userProfile || {};
  const language = getLanguage(profile);
  const bodyMetrics = getBodyMetricsSummary(profile);
  const permission = appState.nudgePreferences?.permission || (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');

  return (
    <Page>
      <header className="ob-hero-header">
        <p className="caption">{t('profile.coachSettings', language)}</p>
        <h1 className="title-lg">{t('profile.tuneCoach', language)}</h1>
        <p className="body-text">{t('profile.body', language)}</p>
      </header>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">{t('profile.trainingTarget', language)}</h2>
          <SlidersHorizontal size={18} />
        </div>
        <Segmented
          label={t('profile.goal', language)}
          value={profile.goal || 'build-strength'}
          options={goals.map(([id, key]) => [id, t(key, language)])}
          onChange={(goal) => onUpdateProfile({ goal })}
        />
        <Segmented
          label={t('profile.level', language)}
          value={profile.level || 'beginner'}
          options={levels.map(([id, key]) => [id, t(key, language)])}
          onChange={(level) => onUpdateProfile({ level })}
        />
        <Segmented
          label={t('profile.language', language)}
          value={language}
          options={[
            ['en', t('profile.english', language)],
            ['es', t('profile.spanish', language)],
          ]}
          onChange={(nextLanguage) => onUpdateProfile({ language: nextLanguage })}
        />
        <Segmented
          label={t('profile.theme', language)}
          value={profile.theme || 'system'}
          options={[
            ['dark', t('profile.themeDark', language)],
            ['light', t('profile.themeLight', language)],
            ['system', t('profile.themeSystem', language)],
          ]}
          onChange={(theme) => onUpdateProfile({ theme })}
        />
      </section>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">{t('profile.equipmentRhythm', language)}</h2>
          <Dumbbell size={18} />
        </div>
        <RangeRow label={t('profile.kettlebell', language)} value={Number(profile.weight) || 16} min={8} max={40} step={4} suffix="kg" onChange={(weight) => onUpdateProfile({ weight })} />
        <RangeRow label={t('profile.daysPerWeek', language)} value={Number(profile.daysPerWeek) || 3} min={2} max={6} suffix={language === 'es' ? 'días' : 'days'} onChange={(daysPerWeek) => onUpdateProfile({ daysPerWeek })} />
        <RangeRow label={t('profile.sessionLength', language)} value={Number(profile.duration) || 25} min={15} max={45} step={5} suffix="min" onChange={(duration) => onUpdateProfile({ duration })} />
      </section>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">{t('profile.bodyMetrics', language)}</h2>
          <Scale size={18} />
        </div>
        <p className="body-text">{t('profile.bodyMetricsBody', language)}</p>
        <Segmented
          label={t('profile.unitSystem', language)}
          value={bodyMetrics.unitSystem}
          options={[
            ['metric', t('profile.metric', language)],
            ['imperial', t('profile.imperial', language)],
          ]}
          onChange={(unitSystem) => onUpdateProfile({ unitSystem })}
        />
        <RangeRow
          icon={<Scale size={16} />}
          label={t('profile.bodyWeight', language)}
          value={bodyMetrics.weightDisplay}
          min={bodyMetrics.weightMin}
          max={bodyMetrics.weightMax}
          step={1}
          suffix={bodyMetrics.weightSuffix}
          onChange={(value) => onUpdateProfile(buildBodyMetricPatch({ field: 'bodyWeight', value, unitSystem: bodyMetrics.unitSystem }))}
        />
        <RangeRow
          icon={<Ruler size={16} />}
          label={t('profile.height', language)}
          value={bodyMetrics.heightDisplay}
          min={bodyMetrics.heightMin}
          max={bodyMetrics.heightMax}
          step={1}
          suffix={bodyMetrics.heightSuffix}
          onChange={(value) => onUpdateProfile(buildBodyMetricPatch({ field: 'height', value, unitSystem: bodyMetrics.unitSystem }))}
        />
        <div className="ob-bmi-card">
          <span>{t('profile.bmiReference', language)}</span>
          <strong>{bodyMetrics.bmiLabel}</strong>
          <p>{t('profile.bmiNote', language)}</p>
        </div>
      </section>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">{t('profile.retention', language)}</h2>
          <Bell size={18} />
        </div>
        <p className="body-text">{t('profile.reminderPermission', language, { permission })}</p>
        <Button variant="secondary" onClick={onEnableReminders}>
          <Bell size={18} />
          {t('profile.enableSmartReminders', language)}
        </Button>
      </section>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">{t('profile.programControl', language)}</h2>
          <RotateCcw size={18} />
        </div>
        <p className="body-text">{t('profile.restartBody', language)}</p>
        <Button variant="secondary" onClick={() => onUpdateProfile({ programStartDate: new Date().toISOString() })}>
          <RotateCcw size={18} />
          {t('profile.restartArc', language)}
        </Button>
      </section>

      <Link className="ob-save-link" to="/">
        <Save size={18} />
        {t('profile.backToCoach', language)}
      </Link>
    </Page>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <label className="ob-field-group">
      <span>{label}</span>
      <div className={`ob-segmented ob-segmented--${options.length}`}>
        {options.map(([id, title]) => (
          <button key={id} type="button" className={value === id ? 'is-active' : ''} onClick={() => onChange(id)}>
            {title}
          </button>
        ))}
      </div>
    </label>
  );
}

function RangeRow({ icon, label, value, min, max, step = 1, suffix, onChange }) {
  return (
    <label className="ob-range-row">
      <span>{icon}{label}</span>
      <strong>{value} {suffix}</strong>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
