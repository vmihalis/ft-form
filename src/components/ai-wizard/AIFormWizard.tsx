'use client';

import { useState, useMemo, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Card } from '@/components/ui/card';
import { WizardStepIndicator } from './WizardStepIndicator';
import { FormTypeStep } from './steps/FormTypeStep';
import { AudienceStep } from './steps/AudienceStep';
import { ChatStep } from './steps/ChatStep';
import { PreviewStep } from './steps/PreviewStep';
import { extractFormSchema, mightContainSchema } from './schema-extraction';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';

export type FormType = 'application' | 'feedback' | 'registration' | 'survey' | 'other';
export type Audience = 'external' | 'internal';
export type WizardStep = 'form-type' | 'audience' | 'chat' | 'preview';

export interface WizardState {
  step: WizardStep;
  formType: FormType | null;
  audience: Audience | null;
  directToDraft: boolean;
}

interface AIFormWizardProps {
  apiKey: string;
  onComplete: (schema: AIFormSchemaOutput) => void;
  onCancel: () => void;
}

export function AIFormWizard({ apiKey, onComplete, onCancel }: AIFormWizardProps) {
  const [wizard, setWizard] = useState<WizardState>({
    step: 'form-type',
    formType: null,
    audience: null,
    directToDraft: false,
  });

  // Generated schema and validation errors
  const [generatedSchema, setGeneratedSchema] = useState<AIFormSchemaOutput | null>(null);
  const [schemaErrors, setSchemaErrors] = useState<string[] | null>(null);

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

  // Detect schema in AI responses and transition to preview step
  // This is intentional - we're synchronizing UI state with external data (AI response)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // Only check when ready (stream complete)
    if (status !== 'ready' || messages.length === 0) return;

    const lastAssistantMessage = messages
      .filter((m) => m.role === 'assistant')
      .at(-1);

    if (!lastAssistantMessage) return;

    // Extract text content from parts (AI SDK v6 pattern)
    const content =
      lastAssistantMessage.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('') || '';

    // Quick pre-check to avoid expensive parsing
    if (!mightContainSchema(content)) return;

    const result = extractFormSchema(content);

    if (result.found) {
      if (result.valid && result.schema) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setGeneratedSchema(result.schema);
        setSchemaErrors(null);
        /* eslint-enable react-hooks/set-state-in-effect */

        // Check direct-to-draft preference
        if (wizard.directToDraft) {
          // Skip preview, call onComplete directly
          onComplete(result.schema);
        } else {
          // Show preview
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setWizard((prev) => ({ ...prev, step: 'preview' }));
        }
      } else if (result.errors) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSchemaErrors(result.errors);
        // Stay on chat, errors will be shown
        console.warn('Schema validation errors:', result.errors);
      }
    }
  }, [messages, status, wizard.directToDraft, onComplete]);

  const handleBack = () => {
    // Stop any in-progress generation when navigating back
    if (status === 'submitted' || status === 'streaming') {
      stop();
    }

    if (wizard.step === 'audience') {
      setWizard((prev) => ({ ...prev, step: 'form-type' }));
    } else if (wizard.step === 'chat') {
      setWizard((prev) => ({ ...prev, step: 'audience' }));
    } else if (wizard.step === 'preview') {
      setWizard((prev) => ({ ...prev, step: 'chat' }));
    }
  };

  // Regenerate: send message requesting alternative structure
  const handleRegenerate = () => {
    sendMessage({
      text: 'Please generate an alternative form structure for the same requirements, with different step groupings or field arrangements.',
    });
    // Clear schema state and return to chat
    setGeneratedSchema(null);
    setSchemaErrors(null);
    setWizard((prev) => ({ ...prev, step: 'chat' }));
  };

  // Modify prompt: return to chat without clearing messages - user can type new instructions
  const handleModifyPrompt = () => {
    setGeneratedSchema(null);
    setSchemaErrors(null);
    setWizard((prev) => ({ ...prev, step: 'chat' }));
  };

  // Accept: call onComplete with generated schema
  const handleAcceptSchema = () => {
    if (generatedSchema) {
      onComplete(generatedSchema);
    }
  };

  // Log schema errors (for debugging)
  if (schemaErrors) {
    console.warn('Schema errors:', schemaErrors);
  }

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
          directToDraft={wizard.directToDraft}
          onDirectToDraftChange={(value) =>
            setWizard((prev) => ({ ...prev, directToDraft: value }))
          }
        />
      )}

      {wizard.step === 'preview' && generatedSchema && (
        <PreviewStep
          schema={generatedSchema}
          onAccept={handleAcceptSchema}
          onRegenerate={handleRegenerate}
          onModifyPrompt={handleModifyPrompt}
          onBack={handleBack}
        />
      )}
    </Card>
  );
}
