'use client';

import { useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Card } from '@/components/ui/card';
import { WizardStepIndicator } from './WizardStepIndicator';
import { FormTypeStep } from './steps/FormTypeStep';
import { AudienceStep } from './steps/AudienceStep';
import { ChatStep } from './steps/ChatStep';
import { GeneratingStep } from './steps/GeneratingStep';

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

  // Create transport with current wizard context
  // Memoized to prevent re-creation on every render
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/generate',
        body: {
          formType: wizard.formType,
          audience: wizard.audience,
          apiKey,
        },
      }),
    [wizard.formType, wizard.audience, apiKey]
  );

  // useChat for AI conversation
  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
  } = useChat({ transport });

  const handleBack = () => {
    // Stop any in-progress generation when navigating back
    if (status === 'submitted' || status === 'streaming') {
      stop();
    }

    if (wizard.step === 'audience') {
      setWizard((prev) => ({ ...prev, step: 'form-type' }));
    } else if (wizard.step === 'chat') {
      setWizard((prev) => ({ ...prev, step: 'audience' }));
    } else if (wizard.step === 'generating') {
      setWizard((prev) => ({ ...prev, step: 'chat' }));
    }
  };

  // Will be used in generating step (Plan 03)
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

      {wizard.step === 'chat' && wizard.formType && wizard.audience && (
        <ChatStep
          messages={messages}
          status={status}
          error={error}
          onSendMessage={sendMessage}
          onStop={stop}
          onRegenerate={regenerate}
          onBack={handleBack}
          formType={wizard.formType}
          audience={wizard.audience}
        />
      )}

      {wizard.step === 'generating' && (
        <GeneratingStep
          messages={messages}
          status={status}
          onCancel={handleBack}
        />
      )}
    </Card>
  );
}
