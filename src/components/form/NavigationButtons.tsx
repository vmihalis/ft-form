"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/lib/stores/form-store";
import { stepFields } from "@/lib/schemas/application";
import { FORM_STEPS } from "@/types/form";
import type { ApplicationFormData } from "@/types/form";

interface NavigationButtonsProps {
  isSubmitting?: boolean;
}

/**
 * NavigationButtons component
 *
 * Renders Back/Next buttons with step-appropriate logic:
 * - Step 0 (Welcome): Only "Begin" button
 * - Steps 1-5: Back and Next buttons
 * - Step 6 (Review): Back and "Submit Application" button
 * - Step 7 (Confirmation): No buttons
 *
 * Next validates current step before advancing.
 * Back saves current values without validation.
 */
export function NavigationButtons({ isSubmitting = false }: NavigationButtonsProps) {
  const currentStep = useFormStore((state) => state.currentStep);
  const setCurrentStep = useFormStore((state) => state.setCurrentStep);
  const markStepCompleted = useFormStore((state) => state.markStepCompleted);
  const updateFormData = useFormStore((state) => state.updateFormData);

  const { trigger, getValues } = useFormContext<ApplicationFormData>();

  const isWelcome = currentStep === 0;
  const isConfirmation = currentStep === 7;
  const isReview = currentStep === 6;
  const totalSteps = FORM_STEPS.length - 1; // Exclude confirmation from count

  /**
   * Handle Next/Begin button click
   * Validates current step before advancing
   */
  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep];

    // Only validate if this step has fields to validate
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as (keyof ApplicationFormData)[]);
      if (!isValid) {
        return; // Validation failed, don't advance
      }
    }

    // Sync form data to Zustand store
    updateFormData(getValues());

    // Mark current step as completed
    markStepCompleted(currentStep);

    // Advance to next step
    setCurrentStep(currentStep + 1);
  };

  /**
   * Handle Back button click
   * Saves current values without validation
   */
  const handleBack = () => {
    // Save current values (even if invalid) to Zustand store
    updateFormData(getValues());

    // Go back without validation
    setCurrentStep(currentStep - 1);
  };

  // No buttons on confirmation step
  if (isConfirmation) {
    return null;
  }

  return (
    <div className="flex justify-between gap-4 pt-6">
      {/* Back button - hidden on Welcome step */}
      {!isWelcome && (
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
      )}

      {/* Spacer when no back button */}
      {isWelcome && <div />}

      {/* Next/Begin/Submit button */}
      {isReview ? (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      ) : (
        <Button type="button" onClick={handleNext}>
          {isWelcome ? "Begin" : currentStep < totalSteps - 1 ? "Next" : "Review"}
        </Button>
      )}
    </div>
  );
}
