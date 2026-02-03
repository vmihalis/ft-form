'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardStep } from './AIFormWizard';

const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'form-type', label: 'Form Type' },
  { id: 'audience', label: 'Audience' },
  { id: 'chat', label: 'Describe' },
  { id: 'generating', label: 'Generate' },
];

interface WizardStepIndicatorProps {
  currentStep: WizardStep;
}

export function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-between mb-8">
      {WIZARD_STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              {/* Step circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors',
                  isComplete && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary bg-background',
                  isFuture && 'border-muted text-muted-foreground bg-background'
                )}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {/* Step label */}
              <span
                className={cn(
                  'mt-2 text-xs whitespace-nowrap',
                  isCurrent && 'text-foreground font-medium',
                  !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-1rem]',
                  isComplete ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
