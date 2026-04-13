'use client';

import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import {
  variants,
  staggerContainer,
  fadeInUp,
  type VariantName,
} from '@/lib/animations';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: VariantName;
  stagger?: boolean;
  delay?: number;
}

export default function AnimatedSection({
  children,
  className,
  style,
  variant = 'fadeInUp',
  stagger = false,
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const selectedVariant = variants[variant];
  const appliedVariants = stagger
    ? staggerContainer
    : {
        hidden: selectedVariant.hidden,
        visible: {
          ...selectedVariant.visible,
          transition: {
            ...(selectedVariant.visible as Record<string, unknown>).transition,
            delay,
          },
        },
      };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={appliedVariants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** Child item for use inside a stagger container */
export function AnimatedItem({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div variants={fadeInUp} className={className} style={style}>
      {children}
    </motion.div>
  );
}
