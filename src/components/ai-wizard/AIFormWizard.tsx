'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { WizardStepIndicator } from './WizardStepIndicator';
import { FormTypeStep } from './steps/FormTypeStep';
import { AudienceStep } from './steps/AudienceStep';

export type FormType = 'application' | 'feedback' | 'registration' | 'survey' | 'other';
export type Audience = 'external' | 'internal';
export type WizardStep = 'form-type' | 'audience' | 'chat' | 'generating';

export interface WizardState {
  step: WizardStep;
  formType: FormType | null;
  audience: Audience | null;
}

interface AIFormWizardProps {
  apiKey: string;
  onComplete: (schema: unknown) => void;
  onCancel: () => void;
}

export function AIFormWizard({ apiKey, onComplete, onCancel }: AIFormWizardProps) {
  const [wizard, setWizard] = useState<WizardState>({
    step: 'form-type',
    formType: null,
    audience: null,
  });

  const handleFormTypeSelect = (formType: FormType) => {
    setWizard((prev) => ({ ...prev, formType, step: 'audience' }));
  };

  const handleAudienceSelect = (audience: Audience) => {
    setWizard((prev) => ({ ...prev, audience, step: 'chat' }));
  };

  const handleBack = () => {
    if (wizard.step === 'audience') {
      setWizard((prev) => ({ ...prev, step: 'form-type' }));
    } else if (wizard.step === 'chat') {
      setWizard((prev) => ({ ...prev, step: 'audience' }));
    } else if (wizard.step === 'generating') {
      setWizard((prev) => ({ ...prev, step: 'chat' }));
    }
  };

  // Placeholder to use apiKey and onComplete (will be used in chat/generating steps)
  void apiKey;
  void onComplete;

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <WizardStepIndicator currentStep={wizard.step} />

      {wizard.step === 'form-type' && (
        <FormTypeStep
          value={wizard.formType}
          onSelect={handleFormTypeSelect}
          onCancel={onCancel}
        />
      )}

      {wizard.step === 'audience' && (
        <AudienceStep
          value={wizard.audience}
          onSelect={handleAudienceSelect}
          onBack={handleBack}
        />
      )}

      {wizard.step === 'chat' && (
        <div className="text-center py-8 text-muted-foreground">
          Chat step coming in Plan 02...
        </div>
      )}

      {wizard.step === 'generating' && (
        <div className="text-center py-8 text-muted-foreground">
          Generating step coming in Plan 03...
        </div>
      )}
    </Card>
  );
}
