'use client';

import { useEffect, useState } from 'react';

/**
 * HowItWorksClient — Scroll progress bar for How It Works page.
 * Fixed 3px magenta bar at top of viewport tied to scroll percentage.
 */
export default function HowItWorksClient() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        background: 'rgba(255,255,255,0.05)',
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: '#C42D8E',
          transition: 'width 50ms linear',
        }}
      />
    </div>
  );
}
