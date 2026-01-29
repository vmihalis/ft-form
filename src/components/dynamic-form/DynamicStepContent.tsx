"use client";

import { motion, AnimatePresence } from "motion/react";
import type { FormSchema } from "@/types/form-schema";
import { DynamicField } from "./fields";
import { DynamicWelcome } from "./DynamicWelcome";
import { DynamicReview } from "./DynamicReview";
import { DynamicConfirmation } from "./DynamicConfirmation";
import { DynamicNavigation } from "./DynamicNavigation";

interface DynamicStepContentProps {
  slug: string;
  schema: FormSchema;
  formName: string;
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  stepFieldIds: string[];
}

/**
 * DynamicStepContent - Step routing with animations
 *
 * Routes to appropriate step component based on currentStep.
 * Uses AnimatePresence for smooth transitions between steps.
 */
export function DynamicStepContent({
  slug,
  schema,
  formName,
  currentStep,
  totalSteps,
  isSubmitting,
  stepFieldIds,
}: DynamicStepContentProps) {
  const isWelcome = currentStep === 0;
  const isConfirmation = currentStep === totalSteps - 1;
  const isReview = currentStep === totalSteps - 2;
  const contentStepIndex = currentStep - 1;
  const isHeroScreen = isWelcome || isConfirmation;

  const getStepContent = () => {
    if (isWelcome) {
      return <DynamicWelcome formName={formName} welcomeMessage={schema.settings.welcomeMessage} />;
    }

    if (isConfirmation) {
      return <DynamicConfirmation message={schema.settings.successMessage} />;
    }

    if (isReview) {
      return <DynamicReview schema={schema} slug={slug} />;
    }

    // Content step
    const step = schema.steps[contentStepIndex];
    if (!step) {
      return (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Invalid step</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Step header */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold">{step.title}</h2>
          {step.description && (
            <p className="text-muted-foreground mt-2">{step.description}</p>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-6">
          {step.fields.map((field) => (
            <DynamicField key={field.id} field={field} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={isHeroScreen ? "" : "min-h-[400px] sm:min-h-[500px]"}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {getStepContent()}
          <DynamicNavigation
            slug={slug}
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepFieldIds={stepFieldIds}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
