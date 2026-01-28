"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/lib/stores/form-store";
import { FORM_STEPS } from "@/types/form";

/**
 * ProgressIndicator component
 *
 * Displays horizontal step indicators showing form progress.
 * - Current step: filled primary color with number
 * - Completed steps: checkmark icon with primary background
 * - Future steps: gray outline with number
 *
 * Includes accessibility attributes for screen readers.
 */
export function ProgressIndicator() {
  const currentStep = useFormStore((state) => state.currentStep);
  const completedSteps = useFormStore((state) => state.completedSteps);

  // Only show steps 1-6 (exclude Welcome and Confirmation)
  const displaySteps = FORM_STEPS.slice(1, 7);

  return (
    <nav aria-label="Form progress" className="w-full">
      {/* Screen reader text */}
      <span className="sr-only">
        Step {currentStep} of {FORM_STEPS.length - 1}: {FORM_STEPS[currentStep]?.label}
      </span>

      <ol className="flex items-center justify-center">
        {displaySteps.map((step, index) => {
          const stepNumber = index + 1; // Steps 1-6
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = currentStep === stepNumber;
          const isFuture = currentStep < stepNumber;
          const isLast = index === displaySteps.length - 1;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && !isCompleted && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-black/50",
                  isFuture && !isCompleted && "border-2 border-muted-foreground/30 text-muted-foreground bg-black/30"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                ) : (
                  <span>{stepNumber}</span>
                )}
                <span className="sr-only">
                  {step.label}
                  {isCompleted && " (completed)"}
                  {isCurrent && " (current)"}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 w-6 sm:w-12",
                    completedSteps.includes(stepNumber) ? "bg-primary" : "bg-muted-foreground/30"
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
