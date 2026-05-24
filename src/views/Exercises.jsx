import React, { useMemo, useState } from 'react';
import { Dumbbell, Search, Sparkles } from 'lucide-react';

import { Modal, Page } from '../components/ui';
import { buildExerciseGuide } from '../services/exerciseGuide';

export default function Exercises({ routines, coachPlan }) {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const exercises = useMemo(
    () => buildExerciseGuide({ exercises: routines.exercises, currentBlocks: coachPlan.workout.blocks }),
    [coachPlan.workout.blocks, routines.exercises],
  );
  const filters = ['All', 'Today', 'Hinge', 'Squat', 'Press', 'Power', 'Core', 'Carry'];
  const visible = exercises.filter(
    (exercise) =>
      filter === 'All' ||
      (filter === 'Today' && exercise.usageLabel) ||
      exercise.level === filter ||
      exercise.focus === filter ||
      exercise.pattern === filter,
  );

  return (
    <Page>
      <header className="ob-hero-header">
        <p className="caption">Exercise library</p>
        <h1 className="title-lg">Every move has a job</h1>
        <p className="body-text">Browse by pattern, see what appears today, and open the form card before loading up.</p>
      </header>

      <div className="ob-filter-row">
        <Search size={18} />
        {filters.map((item) => (
          <button key={item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)} type="button">
            {item}
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
              <span className="ob-exercise-card__eyebrow">{exercise.pattern} / {exercise.focus}</span>
              <h3>{exercise.name}</h3>
              <p>{exercise.intent}</p>
            </div>
            {exercise.usageLabel && <strong>{exercise.usageLabel}</strong>}
          </button>
        ))}
      </section>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="ob-info-section">
            <div className="ob-exercise-detail-hero">
              <div className="ob-exercise-detail-hero__mark">
                <Sparkles size={24} />
              </div>
              <div>
                <span>{selected.pattern} / {selected.level}</span>
                <p>{selected.intent}</p>
              </div>
            </div>
            <div className="ob-coach-cue">
              <strong>Coach cue</strong>
              <span>{selected.coachCue}</span>
            </div>
            <h3>Instructions</h3>
            <ol>
              {(selected.instructions || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <h3>Common mistakes</h3>
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
