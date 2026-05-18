'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const MAGENTA_WORD = 'HERR';
const CREAM_TAIL = ['is', 'the', 'missing', 'link.'];

/**
 * Kinetic typography reveal for "HERR is the missing link." closing line.
 * Words animate in word-by-word on scroll. Subtle parallax depth via translateY
 * driven by scroll progress. Mobile + reduced-motion fall back to simple fade.
 */
export default function KineticMissingLink() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 90%', 'end 10%'],
  });

  // Subtle parallax depth — the whole headline drifts up slightly as you scroll past
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.85, 1], [0.2, 1, 1, 0.6]);

  return (
    <div ref={ref} className="missing-link" aria-label="HERR is the missing link.">
      <motion.p className="missing-link__inner" style={{ y, opacity }}>
        <motion.span
          className="missing-link__word missing-link__word--magenta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {MAGENTA_WORD}
        </motion.span>
        {CREAM_TAIL.map((word, i) => (
          <motion.span
            key={word}
            className="missing-link__word missing-link__word--cream"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </motion.p>
    </div>
  );
}
