'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`rounded-xl backdrop-blur-xl border border-white/10 shadow-2xl ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
      }}
      whileHover={hover ? { scale: 1.02, borderColor: 'rgba(37, 99, 235, 0.5)' } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
