"use client";

import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { DynamicField } from "@/components/dynamic-form/fields";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import type { FormSchema, FormStep, FormField } from "@/types/form-schema";

/**
 * Filter schema to only include complete fields and non-empty steps
 */
function createPreviewSchema(schema: FormSchema): FormSchema {
  const filteredSteps = schema.steps
    .map((step) => ({
      ...step,
      fields: step.fields.filter((field) => {
        // Field must have a label
        if (!field.label || field.label.trim() === "") return false;
        // Select/radio fields must have at least one option
        if (
          (field.type === "select" || field.type === "radio") &&
          (!field.options || field.options.length === 0)
        ) {
          return false;
        }
        return true;
      }),
    }))
    // Only keep steps that have fields
    .filter((step) => step.fields.length > 0);

  return {
    ...schema,
    steps: filteredSteps,
  };
}

/**
 * Preview field component that renders form fields in read-only preview mode
 */
function PreviewFieldItem({ field }: { field: FormField }) {
  return (
    <div className="space-y-1">
      <DynamicField field={field} />
    </div>
  );
}

/**
 * Preview step content
 */
function PreviewStep({ step }: { step: FormStep }) {
  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{step.title}</h3>
        {step.description && (
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {step.fields.map((field) => (
          <PreviewFieldItem key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
}

/**
 * Empty state when no valid fields exist
 */
function EmptyPreviewState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Monitor className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-2">No preview available</h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">
        Add fields to your form to see a live preview here
      </p>
    </div>
  );
}

/**
 * PreviewPanel - Live form preview using Phase 13 field components
 *
 * Shows the form as users will see it, with step navigation.
 * Wrapped in FormProvider to satisfy field component requirements.
 */
export function PreviewPanel() {
  const schema = useFormBuilderStore((s) => s.schema);
  const [currentStep, setCurrentStep] = useState(0);
  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");

  // Create filtered schema for preview
  const previewSchema = useMemo(() => createPreviewSchema(schema), [schema]);

  // Create mock form methods - fields need FormProvider context
  const methods = useForm({
    defaultValues: {},
    mode: "onChange",
  });

  const totalSteps = previewSchema.steps.length;
  const hasSteps = totalSteps > 0;
  const currentStepData = hasSteps ? previewSchema.steps[currentStep] : null;

  // Reset to first step when schema changes significantly
  useMemo(() => {
    if (currentStep >= totalSteps && totalSteps > 0) {
      setCurrentStep(totalSteps - 1);
    } else if (totalSteps === 0) {
      setCurrentStep(0);
    }
  }, [totalSteps, currentStep]);

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm">Preview</h2>
        <div className="flex items-center gap-1">
          <Button
            variant={deviceMode === "mobile" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setDeviceMode("mobile")}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={deviceMode === "desktop" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setDeviceMode("desktop")}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Device frame */}
      <div className="flex-1 overflow-hidden">
        <div
          className={`
            mx-auto bg-white rounded-lg border shadow-lg overflow-hidden
            transition-all duration-200
            ${deviceMode === "mobile" ? "max-w-[320px]" : "max-w-full"}
          `}
        >
          {/* Device header bar */}
          <div className="h-6 bg-muted border-b flex items-center justify-center">
            <div className="w-16 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Preview content */}
          <div className="p-4 max-h-[500px] overflow-y-auto">
            {!hasSteps ? (
              <EmptyPreviewState />
            ) : (
              <FormProvider {...methods}>
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Progress indicator */}
                  {totalSteps > 1 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>
                          Step {currentStep + 1} of {totalSteps}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{
                            width: `${((currentStep + 1) / totalSteps) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step content */}
                  {currentStepData && <PreviewStep step={currentStepData} />}

                  {/* Navigation buttons */}
                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePrevStep}
                      disabled={currentStep === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    {currentStep < totalSteps - 1 ? (
                      <Button type="button" size="sm" onClick={handleNextStep}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button type="button" size="sm" disabled>
                        {previewSchema.settings.submitButtonText}
                      </Button>
                    )}
                  </div>
                </form>
              </FormProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
