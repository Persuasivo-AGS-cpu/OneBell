import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Dumbbell, BarChart2 } from 'lucide-react';

export default function BottomNav({ hidden = false }) {
  if (hidden) return null;

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // Subtle Apple-like tap
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/program', icon: Calendar, label: 'Program' },
    { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
    { to: '/progress', icon: BarChart2, label: 'Progress' },
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
