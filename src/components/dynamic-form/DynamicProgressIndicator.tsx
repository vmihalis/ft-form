"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicProgressIndicatorProps {
  currentStep: number; // 0 = welcome, 1-N = content, N+1 = review
  totalContentSteps: number; // Number of schema steps
  completedSteps: number[];
}

/**
 * DynamicProgressIndicator - Progress dots for dynamic forms
 *
 * Shows steps 1 through N+1 (content steps + review).
 * Current step has ring, completed steps have check, future steps outlined.
 * Follows existing ProgressIndicator.tsx pattern.
 */
export function DynamicProgressIndicator({
  currentStep,
  totalContentSteps,
  completedSteps,
}: DynamicProgressIndicatorProps) {
  // Show steps 1 through N+1 (content steps + review)
  const displaySteps = Array.from(
    { length: totalContentSteps + 1 },
    (_, i) => i + 1
  );

  return (
    <nav aria-label="Form progress" className="w-full">
      <span className="sr-only">
        Step {currentStep} of {totalContentSteps + 1}
      </span>

      <ol className="flex items-center justify-center">
        {displaySteps.map((stepNumber, index) => {
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = currentStep === stepNumber;
          const isFuture = currentStep < stepNumber;
          const isLast = index === displaySteps.length - 1;

          return (
            <li key={stepNumber} className="flex items-center">
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent &&
                    !isCompleted &&
                    "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-black/50",
                  isFuture &&
                    !isCompleted &&
                    "border-2 border-muted-foreground/30 text-muted-foreground bg-black/30"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 w-6 sm:w-12",
                    completedSteps.includes(stepNumber)
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
