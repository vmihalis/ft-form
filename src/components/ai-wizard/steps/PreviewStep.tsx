'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { FormPreviewPanel } from '../FormPreviewPanel';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';

interface PreviewStepProps {
  schema: AIFormSchemaOutput;
  onAccept: () => void;
  onRegenerate: () => void;
  onModifyPrompt: () => void;
  onBack: () => void;
}

/**
 * PreviewStep wraps FormPreviewPanel with header and back navigation.
 *
 * This component provides the preview step UI including:
 * - Header with AI badge and description
 * - Back to Chat button
 * - FormPreviewPanel with all action handlers
 */
export function PreviewStep({
  schema,
  onAccept,
  onRegenerate,
  onModifyPrompt,
  onBack,
}: PreviewStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold">AI Generated Form</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review the generated form. You can regenerate or modify before using.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack} className="h-10 self-start">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="sm:inline">Back</span>
        </Button>
      </div>

      {/* Preview Panel */}
      <FormPreviewPanel
        schema={schema}
        onAccept={onAccept}
        onRegenerate={onRegenerate}
        onModifyPrompt={onModifyPrompt}
      />
    </div>
  );
}
