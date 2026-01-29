"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Animated page wrapper for smooth entrance animations.
 *
 * Wraps content in a motion.div with fade + slide up animation.
 * Use this to add entrance animations to server components.
 *
 * @example
 * // In a server component:
 * <AnimatedPage>
 *   <YourContent />
 * </AnimatedPage>
 */
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
