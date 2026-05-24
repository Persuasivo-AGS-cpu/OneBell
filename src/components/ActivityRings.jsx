import React from 'react';

export default function ActivityRings({ move = 80, exercise = 60, stand = 40, size = 100 }) {
  const strokeWidth = size * 0.12;
  const center = size / 2;
  
  // Apple Ring Colors
  const rings = [
    { name: 'Move', color: 'var(--accent-move)', pct: move, radius: center - strokeWidth },
    { name: 'Exercise', color: 'var(--accent-exercise)', pct: exercise, radius: center - strokeWidth * 2.2 },
    { name: 'Stand', color: 'var(--accent-stand)', pct: stand, radius: center - strokeWidth * 3.4 }
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {rings.map((ring, i) => {
        const circumference = 2 * Math.PI * ring.radius;
        const offset = circumference - (ring.pct / 100) * circumference;
        
        return (
          <g key={ring.name}>
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={ring.radius}
              stroke={ring.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              opacity="0.2"
            />
            {/* Progress Fill */}
            <circle
              cx={center}
              cy={center}
              r={ring.radius}
              stroke={ring.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, type: 'spring', bounce: 0.2, delay: i * 0.1 }}
              style={{ filter: `drop-shadow(0 0 4px ${ring.color})` }}
            />
          </g>
        );
      })}
    </svg>
  );
}
