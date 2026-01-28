"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard";
import type { ApplicationFormData } from "@/types/form";

/**
 * ImpactStep - FORM-05
 *
 * Collects impact information:
 * - benefitToFT (required, min 50 chars)
 */
export function ImpactStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormData>();
  const { onFocus } = useMobileKeyboard();

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Impact</h2>
        <p className="text-muted-foreground mt-2">
          How will your floor benefit the Frontier Tower community?
        </p>
      </div>

      {/* Benefit to FT */}
      <Field data-invalid={!!errors.benefitToFT}>
        <FieldLabel htmlFor="benefitToFT">Benefit to Frontier Tower Members</FieldLabel>
        <Textarea
          id="benefitToFT"
          {...register("benefitToFT")}
          aria-invalid={!!errors.benefitToFT}
          placeholder="Describe how your floor will add value to the broader Frontier Tower community. Consider:

- What unique resources, events, or opportunities will you provide?
- How will members from other floors benefit?
- What cross-floor collaborations do you envision?
- How does your floor align with FT's mission of frontier technology and human flourishing?"
          rows={8}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>
          Be specific about the value you&apos;ll create
        </FieldDescription>
        <FieldError>{errors.benefitToFT?.message}</FieldError>
      </Field>

      {/* Contextual guidance */}
      <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Tips for a strong response:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Be specific about events, resources, or programs you&apos;ll offer</li>
          <li>Explain how other floor members can participate</li>
          <li>Show how your floor connects to FT&apos;s broader mission</li>
        </ul>
      </div>
    </div>
  );
}
