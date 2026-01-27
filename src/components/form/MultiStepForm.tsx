"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { combinedApplicationSchema } from "@/lib/schemas/application";
import { useFormStore } from "@/lib/stores/form-store";
import { ProgressIndicator } from "./ProgressIndicator";
import { StepContent } from "./StepContent";
import { NavigationButtons } from "./NavigationButtons";
import type { ApplicationFormData } from "@/types/form";

/**
 * MultiStepForm component
 *
 * Main form container that:
 * - Wraps children in FormProvider for react-hook-form context
 * - Manages form state with zodResolver for validation
 * - Syncs with Zustand store for persistence
 * - Shows loading state during hydration
 */
export function MultiStepForm() {
  const currentStep = useFormStore((state) => state.currentStep);
  const formData = useFormStore((state) => state.formData);
  const isHydrated = useFormStore((state) => state.isHydrated);
  const setCurrentStep = useFormStore((state) => state.setCurrentStep);
  const resetForm = useFormStore((state) => state.resetForm);

  // Initialize react-hook-form with Zod validation
  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(combinedApplicationSchema),
    defaultValues: formData as ApplicationFormData,
    mode: "onSubmit",
  });

  // Restore form data after hydration from localStorage
  useEffect(() => {
    if (isHydrated && Object.keys(formData).length > 0) {
      methods.reset(formData as ApplicationFormData);
    }
  }, [isHydrated, formData, methods]);

  /**
   * Handle form submission
   * Called when user clicks Submit on Review step
   */
  const onSubmit = (data: ApplicationFormData) => {
    // Phase 3 will wire this to Convex mutation
    console.log("Form submitted:", data);

    // Move to confirmation step
    setCurrentStep(7);

    // Clear localStorage (form is submitted)
    resetForm();
  };

  // Show loading state during SSR/hydration
  if (!isHydrated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const isWelcome = currentStep === 0;
  const isConfirmation = currentStep === 7;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress indicator - hidden on Welcome and Confirmation */}
        {!isWelcome && !isConfirmation && (
          <div className="pb-4">
            <ProgressIndicator />
          </div>
        )}

        {/* Step content */}
        <StepContent step={currentStep} />

        {/* Navigation buttons */}
        <NavigationButtons />
      </form>
    </FormProvider>
  );
}
