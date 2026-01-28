"use client";

import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMobileKeyboard } from "@/hooks/useMobileKeyboard";
import { FRONTIER_TOWER_FLOORS } from "@/lib/constants/floors";
import type { ApplicationFormData } from "@/types/form";

/**
 * ProposalStep - FORM-03
 *
 * Collects proposal information:
 * - floor (required, dropdown with "Other" option) - UX-07
 * - floorOther (conditional, shown when floor="other") - UX-08
 * - initiativeName (required)
 * - tagline (required, max 100 chars)
 * - values (required, min 20 chars)
 * - targetCommunity (required, min 20 chars)
 * - estimatedSize (required)
 */
export function ProposalStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ApplicationFormData>();
  const { onFocus } = useMobileKeyboard();

  // useWatch isolates re-renders to this component only
  const selectedFloor = useWatch({
    control,
    name: "floor",
    defaultValue: "",
  });

  const showOtherFloorInput = selectedFloor === "other";

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Your Proposal</h2>
        <p className="text-muted-foreground mt-2">
          Tell us about your vision for leading a floor
        </p>
      </div>

      {/* Floor Selection - UX-07 */}
      <Field data-invalid={!!errors.floor}>
        <FieldLabel htmlFor="floor">Which floor?</FieldLabel>
        <Controller
          name="floor"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger id="floor" aria-invalid={!!errors.floor}>
                <SelectValue placeholder="Select a floor" />
              </SelectTrigger>
              <SelectContent>
                {FRONTIER_TOWER_FLOORS.map((floor) => (
                  <SelectItem key={floor.value} value={floor.value}>
                    {floor.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldDescription>Choose an existing floor or propose a new one</FieldDescription>
        <FieldError>{errors.floor?.message}</FieldError>
      </Field>

      {/* Conditional "Other" floor input - UX-08 */}
      {showOtherFloorInput && (
        <Field data-invalid={!!errors.floorOther}>
          <FieldLabel htmlFor="floorOther">Describe your proposed floor</FieldLabel>
          <Input
            id="floorOther"
            {...register("floorOther")}
            aria-invalid={!!errors.floorOther}
            placeholder="e.g., Quantum Computing Lab, Climate Tech Hub"
            onFocus={onFocus}
          />
          <FieldDescription>What theme or focus would your floor have?</FieldDescription>
          <FieldError>{errors.floorOther?.message}</FieldError>
        </Field>
      )}

      {/* Initiative Name */}
      <Field data-invalid={!!errors.initiativeName}>
        <FieldLabel htmlFor="initiativeName">Initiative Name</FieldLabel>
        <Input
          id="initiativeName"
          {...register("initiativeName")}
          aria-invalid={!!errors.initiativeName}
          placeholder="e.g., The Longevity Collective"
          onFocus={onFocus}
        />
        <FieldDescription>A memorable name for your floor community</FieldDescription>
        <FieldError>{errors.initiativeName?.message}</FieldError>
      </Field>

      {/* Tagline */}
      <Field data-invalid={!!errors.tagline}>
        <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
        <Input
          id="tagline"
          {...register("tagline")}
          aria-invalid={!!errors.tagline}
          placeholder="A short, catchy description of your vision"
          maxLength={100}
          onFocus={onFocus}
        />
        <FieldDescription>Maximum 100 characters</FieldDescription>
        <FieldError>{errors.tagline?.message}</FieldError>
      </Field>

      {/* Values */}
      <Field data-invalid={!!errors.values}>
        <FieldLabel htmlFor="values">Core Values</FieldLabel>
        <Textarea
          id="values"
          {...register("values")}
          aria-invalid={!!errors.values}
          placeholder="What principles will guide your floor community?"
          rows={3}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>Minimum 20 characters</FieldDescription>
        <FieldError>{errors.values?.message}</FieldError>
      </Field>

      {/* Target Community */}
      <Field data-invalid={!!errors.targetCommunity}>
        <FieldLabel htmlFor="targetCommunity">Target Community</FieldLabel>
        <Textarea
          id="targetCommunity"
          {...register("targetCommunity")}
          aria-invalid={!!errors.targetCommunity}
          placeholder="Who would be ideal members of your floor community?"
          rows={3}
          className="resize-none"
          onFocus={onFocus}
        />
        <FieldDescription>Minimum 20 characters - describe your ideal community members</FieldDescription>
        <FieldError>{errors.targetCommunity?.message}</FieldError>
      </Field>

      {/* Estimated Size */}
      <Field data-invalid={!!errors.estimatedSize}>
        <FieldLabel htmlFor="estimatedSize">Estimated Community Size</FieldLabel>
        <Controller
          name="estimatedSize"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger id="estimatedSize" aria-invalid={!!errors.estimatedSize}>
                <SelectValue placeholder="Select estimated size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 members</SelectItem>
                <SelectItem value="11-25">11-25 members</SelectItem>
                <SelectItem value="26-50">26-50 members</SelectItem>
                <SelectItem value="51-100">51-100 members</SelectItem>
                <SelectItem value="100+">100+ members</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldDescription>How many people do you expect to join your community?</FieldDescription>
        <FieldError>{errors.estimatedSize?.message}</FieldError>
      </Field>
    </div>
  );
}
