'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PreviewStepContent } from './PreviewStepContent';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';

interface FormPreviewPanelProps {
  schema: AIFormSchemaOutput;
  onAccept: () => void;
  onRegenerate: () => void;
  onModifyPrompt: () => void;
}

/**
 * FormPreviewPanel renders an AI-generated form schema preview.
 *
 * Features:
 * - Mobile/Desktop device mode toggle
 * - Step navigation for multi-step forms
 * - Stats summary (steps and fields count)
 * - Action buttons: Accept, Regenerate, Modify Prompt
 */
export function FormPreviewPanel({
  schema,
  onAccept,
  onRegenerate,
  onModifyPrompt,
}: FormPreviewPanelProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');

  const totalSteps = schema.steps.length;
  const totalFields = schema.steps.reduce(
    (sum, step) => sum + step.fields.length,
    0
  );
  const currentStepData = schema.steps[currentStep];

  const canGoBack = currentStep > 0;
  const canGoForward = currentStep < totalSteps - 1;

  const goBack = () => {
    if (canGoBack) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goForward = () => {
    if (canGoForward) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with title and device mode toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Form Preview</h2>
        <div className="flex items-center gap-1">
          <Button
            variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setDeviceMode('mobile')}
            aria-label="Mobile preview"
          >
            <Smartphone className="size-4" />
          </Button>
          <Button
            variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setDeviceMode('desktop')}
            aria-label="Desktop preview"
          >
            <Monitor className="size-4" />
          </Button>
        </div>
      </div>

      {/* Preview frame Card */}
      <Card
        className={deviceMode === 'mobile' ? 'max-w-[360px] mx-auto' : ''}
      >
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
          {currentStepData.description && (
            <CardDescription>{currentStepData.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PreviewStepContent step={currentStepData} />

          {/* Step navigation */}
          {totalSteps > 1 && (
            <div className="flex items-center justify-between border-t mt-6 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={!canGoBack}
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={goForward}
                disabled={!canGoForward}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats summary */}
      <p className="text-center text-sm text-muted-foreground">
        {totalSteps} {totalSteps === 1 ? 'step' : 'steps'}, {totalFields}{' '}
        {totalFields === 1 ? 'field' : 'fields'}
      </p>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onModifyPrompt}>
          Modify Prompt
        </Button>
        <Button variant="outline" onClick={onRegenerate}>
          Regenerate
        </Button>
        <Button onClick={onAccept}>Use This Form</Button>
      </div>
    </div>
  );
}
