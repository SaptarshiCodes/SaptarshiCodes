import React from 'react';
import ShapeGrid from './ShapeGrid';
import OptionWheel from './OptionWheel';

const ALL_TECH_STACK = [
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

export default function HeroBannerWithShapeGrid({ isDark = true }) {
  const bg = isDark ? '#12151d' : '#FFFFFF';
  const border = isDark ? '#303543' : '#D8DCE5';
  const text0 = isDark ? '#F7F3EA' : '#1F2328';
  const text1 = isDark ? '#AAA8B4' : '#57606A';
  const text2 = isDark ? '#7D8590' : '#8C959F';
  const accent = isDark ? '#F08A5B' : '#E05C3A';
  const accentGold = isDark ? '#FFA116' : '#D97706';
  const gridLine = isDark ? '#1e2330' : '#EAEFF5';

  return (
    <div style={{
      position: 'relative',
      width: '1000px',
      height: '280px',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Background ShapeGrid */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <ShapeGrid
          shape="square"
          direction="diagonal"
          lineColor={gridLine}
          hoverColor={accentGold}
          hoverFillColor={accent}
          fillOpacity={0.15}
          cellSize={36}
          speed={0.4}
          twinkle={0.3}
          fade={0.8}
        />
      </div>

      {/* Foreground Left Column: Developer Profile */}
      <div style={{ position: 'relative', zIndex: 1, flex: '1 1 640px', padding: '24px 32px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: text1, letterSpacing: '0.6px', marginBottom: '14px' }}>
          ACTIVE STATUS · BE IT'28 @ JADAVPUR UNIVERSITY
        </div>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '38px', fontWeight: 800, color: text0, letterSpacing: '-0.03em' }}>
          Saptarshi Manna
        </h1>
        <div style={{ fontSize: '13.5px', color: text1, fontFamily: 'monospace', marginBottom: '16px' }}>
          &gt; Software Developer · <span style={{ color: accent, fontWeight: 700 }}>Full-Stack Engineering</span>
        </div>
        <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: text0 }}>
            Bachelor of Engineering in Information Technology
          </div>
          <div style={{ fontSize: '13px', color: text1, fontWeight: 500 }}>
            Jadavpur University, Kolkata · <span style={{ color: accent, fontWeight: 700 }}>BE IT'28</span>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: text1, lineHeight: 1.4 }}>
          Architecting scalable client-server systems and solving complex algorithmic challenges.
        </div>
      </div>

      {/* Vertical Divider */}
      <div style={{ width: '1px', height: '220px', background: border, zIndex: 1 }} />

      {/* Foreground Right Column: OptionWheel */}
      <div style={{ position: 'relative', zIndex: 1, width: '340px', height: '100%' }}>
        <OptionWheel
          items={ALL_TECH_STACK}
          defaultSelected={0}
          textColor={text1}
          activeColor={accentGold}
          side="right"
          fontSize={1.7}
          spacing={1.4}
          curve={1.0}
          tilt={7.5}
          loop={true}
          autoPlay={true}
          autoPlayInterval={2000}
        />
      </div>
    </div>
  );
}
