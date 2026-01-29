"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useDynamicFormStore } from "@/lib/stores/dynamic-form-store";
import { buildFormSchema, getStepFieldIds } from "@/lib/schemas/dynamic-form";
import { DynamicProgressIndicator } from "./DynamicProgressIndicator";
import { DynamicStepContent } from "./DynamicStepContent";
import type { FormSchema } from "@/types/form-schema";

interface DynamicFormRendererProps {
  slug: string;
  schema: FormSchema;
  versionId: Id<"formVersions">;
  formName: string;
}

/**
 * DynamicFormRenderer - Main form container with react-hook-form
 *
 * Manages form state, validation, and submission.
 * Wraps all content in FormProvider for field access.
 */
export function DynamicFormRenderer({
  slug,
  schema,
  versionId,
  formName,
}: DynamicFormRendererProps) {
  // Store state - subscribe to draft data directly to trigger re-renders
  const draft = useDynamicFormStore((state) => state.drafts[slug]);

  const currentStep = draft?.currentStep ?? 0;
  const completedSteps = draft?.completedSteps ?? [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Convex mutation
  const submitForm = useMutation(api.submissions.submit);

  // Build Zod schema from form schema
  const zodSchema = useMemo(() => buildFormSchema(schema), [schema]);

  // Step calculations
  // Structure: Welcome (0) -> Content Steps (1 to N) -> Review (N+1) -> Confirmation (N+2)
  const totalContentSteps = schema.steps.length;
  const totalSteps = totalContentSteps + 3; // welcome + content + review + confirmation
  const isWelcome = currentStep === 0 && !isSubmitted;
  const isConfirmation = isSubmitted || currentStep === totalSteps - 1;
  const isReview = !isSubmitted && currentStep === totalSteps - 2;
  const contentStepIndex = currentStep - 1; // Maps to schema.steps index

  // Use confirmation step for display when submitted
  const displayStep = isSubmitted ? totalSteps - 1 : currentStep;

  // Initialize react-hook-form
  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: draft?.formData ?? {},
    mode: "onSubmit",
  });

  // Reset form when draft changes (e.g., version change)
  useEffect(() => {
    if (draft?.formData) {
      methods.reset(draft.formData);
    }
  }, [draft?.formData, methods]);

  // Get current step field IDs for validation
  const currentStepFieldIds = useMemo(() => {
    if (isWelcome || isReview || isConfirmation) return [];
    return getStepFieldIds(schema, contentStepIndex);
  }, [schema, contentStepIndex, isWelcome, isReview, isConfirmation]);

  // Handle form submission
  const onSubmit = async (data: Record<string, unknown>) => {
    if (currentStep !== totalSteps - 2) return; // Only submit from review

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitForm({
        formVersionId: versionId,
        data: JSON.stringify(data),
      });

      // Mark as submitted (triggers confirmation view)
      setIsSubmitted(true);

      // Clear draft from localStorage so refreshing starts fresh
      // Use localStorage directly to avoid re-render before confirmation shows
      localStorage.removeItem("ft-dynamic-form-drafts");
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress indicator - hidden on Welcome and Confirmation */}
        {!isWelcome && !isConfirmation && (
          <div className="pb-4">
            <DynamicProgressIndicator
              currentStep={currentStep}
              totalContentSteps={totalContentSteps}
              completedSteps={completedSteps}
            />
          </div>
        )}

        {/* Step content */}
        <DynamicStepContent
          slug={slug}
          schema={schema}
          formName={formName}
          currentStep={displayStep}
          totalSteps={totalSteps}
          isSubmitting={isSubmitting}
          stepFieldIds={currentStepFieldIds}
        />

        {/* Submission error */}
        {submitError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}
      </form>
    </FormProvider>
  );
}
