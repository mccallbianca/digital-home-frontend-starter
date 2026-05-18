'use client';

import { motion } from 'motion/react';

const NODES = [
  'Guardrails',
  'Protocols',
  'Response Logic',
  'Clinical Domains',
  'Safety',
  'Privacy',
  'Audit Trail',
  'Compliance',
];

/**
 * Animated 8-node beam representing the ECQO Clinical AI Architecture.
 * Dots stagger in along a horizontal line, then the connecting beam draws
 * across. Magenta-on-ink, subtle, on-brand.
 */
export default function EcqoArchitectureBeam() {
  return (
    <div className="ecqo-beam" aria-hidden>
      <motion.div
        className="ecqo-beam__line"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <ol className="ecqo-beam__nodes">
        {NODES.map((label, i) => (
          <motion.li
            key={label}
            className="ecqo-beam__node"
            initial={{ opacity: 0, y: 18, scale: 0.85 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.55,
              delay: 0.15 + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className="ecqo-beam__dot" aria-hidden />
            <span className="ecqo-beam__label">{label}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
