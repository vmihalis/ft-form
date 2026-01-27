"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
 * - Submits to Convex on completion
 * - Shows loading state during hydration
 */
export function MultiStepForm() {
  const currentStep = useFormStore((state) => state.currentStep);
  const formData = useFormStore((state) => state.formData);
  const isHydrated = useFormStore((state) => state.isHydrated);
  const setCurrentStep = useFormStore((state) => state.setCurrentStep);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Convex mutation
  const submitApplication = useMutation(api.applications.submit);

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
  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transform empty strings to undefined for optional fields
      // Convex v.optional() expects undefined, not empty string
      await submitApplication({
        ...data,
        linkedIn: data.linkedIn || undefined,
        floorOther: data.floorOther || undefined,
        additionalNotes: data.additionalNotes || undefined,
      });

      // Move to confirmation step
      setCurrentStep(7);

      // Clear localStorage so refreshing starts fresh (but keep in-memory state at step 7)
      localStorage.removeItem("ft-form-draft");
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Submission error display */}
        {submitError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {/* Navigation buttons */}
        <NavigationButtons isSubmitting={isSubmitting} />
      </form>
    </FormProvider>
  );
}
