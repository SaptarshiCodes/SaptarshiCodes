import React from 'react';
import OptionWheel from './OptionWheel';

const TECH_STACK = [
  'TypeScript',
  'JavaScript',
  'React',
  'Node.js',
  'Express.js',
  'C++',
  'Python',
  'Java',
  'PostgreSQL',
  'MongoDB',
  'MySQL',
  'Tailwind CSS',
  'Git',
  'Linux'
];

export default function TechStackWheel({ isDark = true }) {
  return (
    <div style={{
      width: '320px',
      height: '280px',
      background: isDark ? '#0d1117' : '#FFFFFF',
      borderRadius: '8px',
      border: `1px solid ${isDark ? '#30363d' : '#D8DCE5'}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <OptionWheel
        items={TECH_STACK}
        defaultSelected={0}
        textColor={isDark ? '#8C959F' : '#57606A'}
        activeColor={isDark ? '#F08A5B' : '#E05C3A'}
        side="right"
        fontSize={1.75}
        spacing={1.4}
        curve={1.0}
        tilt={7.5}
        blur={1.5}
        fade={0.3}
        minOpacity={0.06}
        smoothing={180}
        inset={64}
        loop={true}
        autoPlay={true}
        autoPlayInterval={2200}
        autoPlayDirection={1}
        pauseOnHover={true}
      />
    </div>
  );
}
