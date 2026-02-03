'use client';

import { motion } from 'motion/react';

/**
 * Animated typing indicator showing 3 bouncing dots
 *
 * Displayed while AI is processing/generating a response.
 */
export function TypingIndicator() {
  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse' as const,
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg w-fit">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/60"
            initial={{ y: 0 }}
            animate={{ y: [-2, 2] }}
            transition={{
              ...dotTransition,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">AI is thinking...</span>
    </div>
  );
}
