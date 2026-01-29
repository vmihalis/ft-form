"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useDynamicFormStore } from "@/lib/stores/dynamic-form-store";

interface DynamicNavigationProps {
  slug: string;
  currentStep: number;
  totalSteps: number;
  stepFieldIds: string[];
  isSubmitting: boolean;
}

/**
 * DynamicNavigation - Navigation with per-step validation
 *
 * Handles Back/Next navigation with validation on Next.
 * Syncs form data to store on every navigation.
 * Button text adapts based on current step.
 */
export function DynamicNavigation({
  slug,
  currentStep,
  totalSteps,
  stepFieldIds,
  isSubmitting,
}: DynamicNavigationProps) {
  const { trigger, getValues } = useFormContext();
  const setCurrentStep = useDynamicFormStore((state) => state.setCurrentStep);
  const markStepCompleted = useDynamicFormStore(
    (state) => state.markStepCompleted
  );
  const updateFormData = useDynamicFormStore((state) => state.updateFormData);

  const isWelcome = currentStep === 0;
  const isConfirmation = currentStep === totalSteps - 1;
  const isReview = currentStep === totalSteps - 2;
  const totalContentSteps = totalSteps - 3;

  // No buttons on confirmation
  if (isConfirmation) return null;

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate current step fields
    if (stepFieldIds.length > 0) {
      const isValid = await trigger(stepFieldIds);
      if (!isValid) return;
    }

    // Sync form data to store
    updateFormData(slug, getValues());

    // Mark step completed
    markStepCompleted(slug, currentStep);

    // Advance
    setCurrentStep(slug, currentStep + 1);
  };

  const handleBack = () => {
    // Save current values without validation
    updateFormData(slug, getValues());
    setCurrentStep(slug, currentStep - 1);
  };

  // Determine button text
  const getNextButtonText = () => {
    if (isWelcome) return "Begin";
    // If we're on the last content step, show "Review"
    // currentStep 1 to totalContentSteps are content steps
    // Review is at totalSteps - 2
    if (currentStep < totalContentSteps) return "Next";
    return "Review";
  };

  return (
    <div
      className={`flex gap-4 pt-6 ${isWelcome ? "justify-center" : "justify-between"}`}
    >
      {!isWelcome && (
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
      )}

      {isReview ? (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      ) : (
        <Button type="button" onClick={handleNext}>
          {getNextButtonText()}
        </Button>
      )}
    </div>
  );
}
