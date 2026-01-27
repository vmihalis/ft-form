"use client";

import { FORM_STEPS } from "@/types/form";

interface StepContentProps {
  step: number;
}

/**
 * StepContent component
 *
 * Renders placeholder content for each form step.
 * Phase 3 will replace this with actual step-specific form components.
 */
export function StepContent({ step }: StepContentProps) {
  const stepInfo = FORM_STEPS[step];

  if (!stepInfo) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Invalid step</p>
      </div>
    );
  }

  return (
    <div className="py-12 text-center">
      <h2 className="text-2xl font-semibold">{stepInfo.label}</h2>
      <p className="mt-4 text-muted-foreground">
        Step {step} of {FORM_STEPS.length - 1}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {stepInfo.hasValidation
          ? "This step requires form input (coming in Phase 3)"
          : "This step does not require validation"}
      </p>
    </div>
  );
}
