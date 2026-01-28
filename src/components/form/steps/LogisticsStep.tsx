"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard";
import type { ApplicationFormData } from "@/types/form";

/**
 * LogisticsStep - FORM-06
 *
 * Collects practical logistics information:
 * - existingCommunity (required)
 * - spaceNeeds (required)
 * - startDate (required)
 * - additionalNotes (optional)
 */
export function LogisticsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormData>();
  const { onFocus } = useMobileKeyboard();

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Logistics</h2>
        <p className="text-muted-foreground mt-2">
          Help us understand the practical details
        </p>
      </div>

      {/* Existing Community */}
      <Field data-invalid={!!errors.existingCommunity}>
        <FieldLabel htmlFor="existingCommunity">Existing Community</FieldLabel>
        <Textarea
          id="existingCommunity"
          {...register("existingCommunity")}
          aria-invalid={!!errors.existingCommunity}
          placeholder="Do you have an existing community? Describe your current network or communities you're part of."
          rows={4}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>
          Tell us about any existing community or network you can bring
        </FieldDescription>
        <FieldError>{errors.existingCommunity?.message}</FieldError>
      </Field>

      {/* Space Needs */}
      <Field data-invalid={!!errors.spaceNeeds}>
        <FieldLabel htmlFor="spaceNeeds">Space Requirements</FieldLabel>
        <Textarea
          id="spaceNeeds"
          {...register("spaceNeeds")}
          aria-invalid={!!errors.spaceNeeds}
          placeholder="What physical space do you need? Consider desks, meeting rooms, event space, specialized equipment, storage, etc."
          rows={4}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>
          Describe your ideal space setup and any special requirements
        </FieldDescription>
        <FieldError>{errors.spaceNeeds?.message}</FieldError>
      </Field>

      {/* Start Date */}
      <Field data-invalid={!!errors.startDate}>
        <FieldLabel htmlFor="startDate">Preferred Start Date</FieldLabel>
        <Input
          id="startDate"
          type="date"
          {...register("startDate")}
          aria-invalid={!!errors.startDate}
          className="block"
          onFocus={onFocus}
        />
        <FieldDescription>
          When would you like to launch your initiative? (approximate is fine)
        </FieldDescription>
        <FieldError>{errors.startDate?.message}</FieldError>
      </Field>

      {/* Additional Notes (optional) */}
      <Field data-invalid={!!errors.additionalNotes}>
        <FieldLabel htmlFor="additionalNotes">
          Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </FieldLabel>
        <Textarea
          id="additionalNotes"
          {...register("additionalNotes")}
          aria-invalid={!!errors.additionalNotes}
          placeholder="Anything else you'd like us to know? Questions, concerns, special circumstances, or additional context."
          rows={4}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldError>{errors.additionalNotes?.message}</FieldError>
      </Field>
    </div>
  );
}
