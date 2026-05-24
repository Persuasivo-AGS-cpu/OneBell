import React from 'react';
import { motion as Motion } from 'framer-motion';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`ob-button ob-button--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function MetricCard({ icon: Icon, label, value, tone = 'orange' }) {
  return (
    <div className="ob-card ob-metric">
      {Icon && <Icon className={`ob-metric__icon ob-tone-${tone}`} size={22} />}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function Page({ children, className = '' }) {
  return (
    <Motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={`view-container ob-page ${className}`}
    >
      {children}
    </Motion.main>
  );
}

export function ProgressRing({ value = 0, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="ob-ring" style={{ '--pct': `${pct}%` }}>
      <div>
        <strong>{pct}%</strong>
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}

export function Modal({ title, children, onClose, closeLabel = 'Close modal' }) {
  return (
    <div className="ob-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="ob-modal__panel">
        <button className="ob-icon-button" type="button" onClick={onClose} aria-label={closeLabel}>
          x
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
