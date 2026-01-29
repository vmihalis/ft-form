"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDynamicFormStore } from "@/lib/stores/dynamic-form-store";
import type { FormSchema } from "@/types/form-schema";

interface DynamicReviewProps {
  schema: FormSchema;
  slug: string;
}

interface ReviewItemProps {
  label: string;
  value: unknown;
  type: string;
}

/**
 * ReviewItem - Single data display row
 *
 * Handles special rendering for different field types:
 * - Empty: "Not provided" in muted italic
 * - Checkbox: "Yes" or "No"
 * - File: "File uploaded" in primary color
 * - Default: String conversion
 */
function ReviewItem({ label, value, type }: ReviewItemProps) {
  let displayValue: React.ReactNode;

  if (value === undefined || value === null || value === "") {
    displayValue = (
      <span className="italic text-muted-foreground">Not provided</span>
    );
  } else if (type === "checkbox") {
    displayValue = value ? "Yes" : "No";
  } else if (type === "file" && typeof value === "string") {
    displayValue = <span className="text-primary">File uploaded</span>;
  } else {
    displayValue = String(value);
  }

  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm whitespace-pre-wrap break-words">
        {displayValue}
      </dd>
    </div>
  );
}

interface ReviewSectionProps {
  title: string;
  stepIndex: number;
  slug: string;
  children: React.ReactNode;
}

/**
 * ReviewSection - Card wrapper with title and edit button
 *
 * Edit button navigates back to the corresponding step.
 */
function ReviewSection({
  title,
  stepIndex,
  slug,
  children,
}: ReviewSectionProps) {
  const setCurrentStep = useDynamicFormStore((state) => state.setCurrentStep);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep(slug, stepIndex)}
        >
          Edit
        </Button>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

/**
 * DynamicReview - Auto-generated review from schema
 *
 * Renders all form data grouped by step/section.
 * Uses getValues() for live data access.
 * Edit buttons jump to relevant step.
 */
export function DynamicReview({ schema, slug }: DynamicReviewProps) {
  const { getValues } = useFormContext();
  const data = getValues();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Review Your Submission
        </h2>
        <p className="text-muted-foreground mt-2">
          Please review your information before submitting
        </p>
      </div>

      {schema.steps.map((step, stepIndex) => (
        <ReviewSection
          key={step.id}
          title={step.title}
          stepIndex={stepIndex + 1} // +1 because step 0 is welcome
          slug={slug}
        >
          <dl className="divide-y divide-border">
            {step.fields.map((field) => (
              <ReviewItem
                key={field.id}
                label={field.label}
                value={data[field.id]}
                type={field.type}
              />
            ))}
          </dl>
        </ReviewSection>
      ))}

      <p className="text-sm text-muted-foreground text-center pt-4">
        Click &quot;Submit&quot; below to finalize your submission.
      </p>
    </div>
  );
}
