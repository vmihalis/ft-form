"use client";

import { motion, AnimatePresence } from "motion/react";
import { FORM_STEPS } from "@/types/form";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ApplicantInfoStep } from "./steps/ApplicantInfoStep";
import { ProposalStep } from "./steps/ProposalStep";
import { RoadmapStep } from "./steps/RoadmapStep";
import { ImpactStep } from "./steps/ImpactStep";
import { LogisticsStep } from "./steps/LogisticsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { NavigationButtons } from "./NavigationButtons";

interface StepContentProps {
  step: number;
  isSubmitting?: boolean;
}

/**
 * StepContent component
 *
 * Routes to the appropriate step component based on current step.
 * All step components use FormProvider context from parent.
 * Animates transitions with a clean fade effect.
 */
export function StepContent({ step, isSubmitting = false }: StepContentProps) {
  const stepInfo = FORM_STEPS[step];

  if (!stepInfo) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Invalid step</p>
      </div>
    );
  }

  // Get the step content based on current step
  const getStepComponent = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <ApplicantInfoStep />;
      case 2:
        return <ProposalStep />;
      case 3:
        return <RoadmapStep />;
      case 4:
        return <ImpactStep />;
      case 5:
        return <LogisticsStep />;
      case 6:
        return <ReviewStep />;
      case 7:
        return <ConfirmationStep />;
      default:
        return (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Unknown step</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[400px] sm:min-h-[500px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.15,
            ease: "easeOut"
          }}
        >
          {getStepComponent()}
          <NavigationButtons isSubmitting={isSubmitting} step={step} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
