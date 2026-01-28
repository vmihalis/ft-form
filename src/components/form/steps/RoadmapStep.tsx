"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard";
import type { ApplicationFormData } from "@/types/form";

/**
 * RoadmapStep - FORM-04
 *
 * Collects phased implementation plan:
 * - phase1Mvp (required, min 50 chars)
 * - phase2Expansion (required, min 50 chars)
 * - phase3LongTerm (required, min 50 chars)
 */
export function RoadmapStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormData>();
  const { onFocus } = useMobileKeyboard();

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Your Roadmap</h2>
        <p className="text-muted-foreground mt-2">
          Share your phased plan for building this community
        </p>
      </div>

      {/* Phase 1: MVP */}
      <Field data-invalid={!!errors.phase1Mvp}>
        <FieldLabel htmlFor="phase1Mvp">Phase 1: MVP (First 3 months)</FieldLabel>
        <Textarea
          id="phase1Mvp"
          {...register("phase1Mvp")}
          aria-invalid={!!errors.phase1Mvp}
          placeholder="What's the minimum viable version of your floor community? What will you launch with?"
          rows={5}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>
          Minimum 50 characters - describe your initial launch plan
        </FieldDescription>
        <FieldError>{errors.phase1Mvp?.message}</FieldError>
      </Field>

      {/* Phase 2: Expansion */}
      <Field data-invalid={!!errors.phase2Expansion}>
        <FieldLabel htmlFor="phase2Expansion">Phase 2: Expansion (3-6 months)</FieldLabel>
        <Textarea
          id="phase2Expansion"
          {...register("phase2Expansion")}
          aria-invalid={!!errors.phase2Expansion}
          placeholder="How will you grow and expand the community? What new initiatives or events will you add?"
          rows={5}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>
          Minimum 50 characters - describe your growth strategy
        </FieldDescription>
        <FieldError>{errors.phase2Expansion?.message}</FieldError>
      </Field>

      {/* Phase 3: Long-term */}
      <Field data-invalid={!!errors.phase3LongTerm}>
        <FieldLabel htmlFor="phase3LongTerm">Phase 3: Long-term Vision (6+ months)</FieldLabel>
        <Textarea
          id="phase3LongTerm"
          {...register("phase3LongTerm")}
          aria-invalid={!!errors.phase3LongTerm}
          placeholder="What's your long-term vision for this floor? How will it evolve and contribute to Frontier Tower?"
          rows={5}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>
          Minimum 50 characters - describe your long-term vision
        </FieldDescription>
        <FieldError>{errors.phase3LongTerm?.message}</FieldError>
      </Field>
    </div>
  );
}
