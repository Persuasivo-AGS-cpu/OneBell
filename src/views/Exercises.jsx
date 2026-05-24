import React, { useMemo, useState } from 'react';
import { Dumbbell, Search, Sparkles } from 'lucide-react';

import { Modal, Page } from '../components/ui';
import { buildExerciseGuide } from '../services/exerciseGuide';
import { getLanguage, t } from '../services/copy';

export default function Exercises({ routines, coachPlan, appState }) {
  const language = getLanguage(appState?.userProfile);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const exercises = useMemo(
    () => buildExerciseGuide({ exercises: routines.exercises, currentBlocks: coachPlan.workout.blocks, language }),
    [coachPlan.workout.blocks, language, routines.exercises],
  );
  const filters = [
    ['all', 'filter.all'],
    ['today', 'filter.today'],
    ['Hinge', 'filter.hinge'],
    ['Squat', 'filter.squat'],
    ['Press', 'filter.press'],
    ['Power', 'filter.power'],
    ['Core', 'filter.core'],
    ['Carry', 'filter.carry'],
  ];
  const visible = exercises.filter(
    (exercise) =>
      filter === 'all' ||
      (filter === 'today' && exercise.usageLabel) ||
      exercise.level === filter ||
      exercise.focus === filter ||
      exercise.pattern === filter,
  );

  return (
    <Page>
      <header className="ob-hero-header">
        <p className="caption">{t('exercises.library', language)}</p>
        <h1 className="title-lg">{t('exercises.title', language)}</h1>
        <p className="body-text">{t('exercises.body', language)}</p>
      </header>

      <div className="ob-filter-row">
        <Search size={18} />
        {filters.map(([id, label]) => (
          <button key={id} className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)} type="button">
            {t(label, language)}
          </button>
        ))}
      </div>

      <section className="ob-exercise-list">
        {visible.map((exercise) => (
          <button key={exercise.id} className="ob-card ob-exercise-card" type="button" onClick={() => setSelected(exercise)}>
            <div className={`ob-exercise-card__mark ob-exercise-card__mark--${exercise.pattern.toLowerCase().replaceAll(' ', '-')}`}>
              <Dumbbell size={24} />
            </div>
            <div>
              <span className="ob-exercise-card__eyebrow">{exercise.patternLabel} / {exercise.focusLabel}</span>
              <h3>{exercise.name}</h3>
              <p>{exercise.intent}</p>
            </div>
            {exercise.usageLabel && <strong>{exercise.usageLabel}</strong>}
          </button>
        ))}
      </section>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)} closeLabel={t('common.closeModal', language)}>
          <div className="ob-info-section">
            <div className="ob-exercise-detail-hero">
              <div className="ob-exercise-detail-hero__mark">
                <Sparkles size={24} />
              </div>
              <div>
                <span>{selected.patternLabel} / {selected.levelLabel}</span>
                <p>{selected.intent}</p>
              </div>
            </div>
            <div className="ob-coach-cue">
              <strong>{t('workout.coachCue', language)}</strong>
              <span>{selected.coachCue}</span>
            </div>
            <h3>{t('exercises.instructions', language)}</h3>
            <ol>
              {(selected.instructions || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <h3>{t('exercises.commonMistakes', language)}</h3>
            <ul>
              {([selected.priorityMistake, ...(selected.mistakes || []).filter((item) => item !== selected.priorityMistake)]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </Page>
  );
}
