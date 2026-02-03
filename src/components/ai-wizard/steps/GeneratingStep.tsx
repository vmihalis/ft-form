'use client';

import { motion } from 'motion/react';
import type { UIMessage } from '@ai-sdk/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, X } from 'lucide-react';

interface GeneratingStepProps {
  messages: UIMessage[];
  status: string;
  onCancel: () => void;
}

/**
 * Generating Step - Shown while AI produces the form schema
 *
 * Phase 27 will add actual form preview and editing.
 * For now, shows a loading state with animated skeleton.
 */
export function GeneratingStep({
  messages,
  status,
  onCancel,
}: GeneratingStepProps) {
  // Will be used in Phase 27 for form preview
  void messages;

  const isGenerating = status === 'streaming' || status === 'submitted';

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Generating Your Form...</h2>
        <p className="text-muted-foreground text-sm">
          AI is creating your form based on the conversation.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <CardTitle className="text-base">Building form structure</CardTitle>
            <p className="text-xs text-muted-foreground">
              This usually takes 10-30 seconds
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Animated skeleton preview */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={!isGenerating}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancel Generation
        </Button>
      </div>
    </div>
  );
}
