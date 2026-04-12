'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollFadeInProps {
  children: ReactNode;
  delay?: number;        // stagger delay in ms
  className?: string;
}

/**
 * ScrollFadeIn — Wraps children with an IntersectionObserver-based fade-up animation.
 * Animates once when the element scrolls into view.
 */
export default function ScrollFadeIn({ children, delay = 0, className = '' }: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 400ms ease ${delay}ms, transform 400ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
