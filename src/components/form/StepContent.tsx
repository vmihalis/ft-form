"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePrevious } from "@/lib/hooks/use-previous";
import { FORM_STEPS } from "@/types/form";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ApplicantInfoStep } from "./steps/ApplicantInfoStep";
import { ProposalStep } from "./steps/ProposalStep";
import { RoadmapStep } from "./steps/RoadmapStep";
import { ImpactStep } from "./steps/ImpactStep";
import { LogisticsStep } from "./steps/LogisticsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";

interface StepContentProps {
  step: number;
}

type Direction = "forward" | "back";

const stepVariants = {
  initial: (direction: Direction) => ({
    x: direction === "forward" ? 50 : -50,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: Direction) => ({
    x: direction === "forward" ? -50 : 50,
    opacity: 0,
  }),
};

/**
 * StepContent component
 *
 * Routes to the appropriate step component based on current step.
 * All step components use FormProvider context from parent.
 * Animates transitions with direction-aware slide and fade effects.
 */
export function StepContent({ step }: StepContentProps) {
  // Track direction for animations
  const previousStep = usePrevious(step);
  const direction: Direction = (previousStep ?? 0) < step ? "forward" : "back";

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
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={step}
        custom={direction}
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      >
        {getStepComponent()}
      </motion.div>
    </AnimatePresence>
  );
}
