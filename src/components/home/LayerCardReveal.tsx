'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  index: number;
}

/**
 * ECQO Sound layer card reveal: slides in from below with subtle rotateX
 * on first scroll into view. Stagger by 200ms between cards 1, 2, 3.
 * Preserves the native <details> collapsible inside.
 */
export default function LayerCardReveal({ children, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ transformPerspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}
