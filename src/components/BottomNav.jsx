import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Dumbbell, BarChart2 } from 'lucide-react';
import { t } from '../services/copy';

export default function BottomNav({ hidden = false, language = 'en' }) {
  if (hidden) return null;

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // Subtle Apple-like tap
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home', language) },
    { to: '/program', icon: Calendar, label: t('nav.program', language) },
    { to: '/exercises', icon: Dumbbell, label: t('nav.exercises', language) },
    { to: '/progress', icon: BarChart2, label: t('nav.progress', language) },
  ];

  return (
    <nav className="ob-bottom-nav glass">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={triggerHaptic}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          {({ isActive }) => (
            <>
              <div className={isActive ? 'ob-nav-icon is-active' : 'ob-nav-icon'}>
                <item.icon strokeWidth={isActive ? 2.5 : 2} size={24} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2px' }}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
