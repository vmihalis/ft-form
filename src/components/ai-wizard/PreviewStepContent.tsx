'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { DynamicField } from '@/components/dynamic-form/fields';
import type { FormStep } from '@/types/form-schema';

interface PreviewStepContentProps {
  step: FormStep;
}

/**
 * Renders a single form step in preview mode using DynamicField components.
 *
 * This component wraps DynamicField components in a FormProvider context
 * to enable all field functionality (validation, state management).
 * The preview is demonstration-only - no actual form submission occurs.
 */
export function PreviewStepContent({ step }: PreviewStepContentProps) {
  // Create mock form methods - preview is read-only demonstration
  // Default values empty, mode onChange for immediate feedback
  const methods = useForm({
    defaultValues: {},
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {step.fields.map((field) => (
          <DynamicField key={field.id} field={field} />
        ))}
      </form>
    </FormProvider>
  );
}
