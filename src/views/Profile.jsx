import React from 'react';
import { Bell, Dumbbell, RotateCcw, Save, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button, Page } from '../components/ui';
import { getLanguage, t } from '../services/copy';

const goals = [
  ['burn-fat', 'Burn fat'],
  ['build-strength', 'Build strength'],
  ['conditioning', 'Conditioning'],
];

const levels = [
  ['beginner', 'Beginner'],
  ['intermediate', 'Intermediate'],
  ['advanced', 'Advanced'],
];

export default function Profile({ appState, onUpdateProfile, onEnableReminders }) {
  const profile = appState.userProfile || {};
  const language = getLanguage(profile);
  const permission = appState.nudgePreferences?.permission || (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');

  return (
    <Page>
      <header className="ob-hero-header">
        <p className="caption">Coach settings</p>
        <h1 className="title-lg">Tune the coach</h1>
        <p className="body-text">Change the inputs without losing your workout history.</p>
      </header>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">Training target</h2>
          <SlidersHorizontal size={18} />
        </div>
        <Segmented
          label="Goal"
          value={profile.goal || 'build-strength'}
          options={goals}
          onChange={(goal) => onUpdateProfile({ goal })}
        />
        <Segmented
          label="Level"
          value={profile.level || 'beginner'}
          options={levels}
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
      </section>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">Equipment and rhythm</h2>
          <Dumbbell size={18} />
        </div>
        <RangeRow label="Kettlebell" value={Number(profile.weight) || 16} min={8} max={40} step={4} suffix="kg" onChange={(weight) => onUpdateProfile({ weight })} />
        <RangeRow label="Days per week" value={Number(profile.daysPerWeek) || 3} min={2} max={6} suffix="days" onChange={(daysPerWeek) => onUpdateProfile({ daysPerWeek })} />
        <RangeRow label="Session length" value={Number(profile.duration) || 25} min={15} max={45} step={5} suffix="min" onChange={(duration) => onUpdateProfile({ duration })} />
        <RangeRow label="Body weight" value={Number(profile.bodyWeight) || 75} min={45} max={140} step={1} suffix="kg" onChange={(bodyWeight) => onUpdateProfile({ bodyWeight })} />
      </section>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">Retention</h2>
          <Bell size={18} />
        </div>
        <p className="body-text">Reminder permission: {permission}</p>
        <Button variant="secondary" onClick={onEnableReminders}>
          <Bell size={18} />
          Enable smart reminders
        </Button>
      </section>

      <section className="ob-card ob-profile-card">
        <div className="ob-section-title">
          <h2 className="title-sm">Program control</h2>
          <RotateCcw size={18} />
        </div>
        <p className="body-text">Resetting the program start date keeps history, but restarts the 12-week arc from today.</p>
        <Button variant="secondary" onClick={() => onUpdateProfile({ programStartDate: new Date().toISOString() })}>
          <RotateCcw size={18} />
          Restart 12-week arc
        </Button>
      </section>

      <Link className="ob-save-link" to="/">
        <Save size={18} />
        Back to coach
      </Link>
    </Page>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <label className="ob-field-group">
      <span>{label}</span>
      <div className="ob-segmented">
        {options.map(([id, title]) => (
          <button key={id} type="button" className={value === id ? 'is-active' : ''} onClick={() => onChange(id)}>
            {title}
          </button>
        ))}
      </div>
    </label>
  );
}

function RangeRow({ label, value, min, max, step = 1, suffix, onChange }) {
  return (
    <label className="ob-range-row">
      <span>{label}</span>
      <strong>{value} {suffix}</strong>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
