"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormField } from "@/types/form-schema";

interface NumberFieldProps {
  field: FormField;
}

export function NumberField({ field }: NumberFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message as string | undefined;

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={field.id}>
        {field.label}
        {!field.required && (
          <span className="text-muted-foreground font-normal"> (optional)</span>
        )}
      </FieldLabel>
      <Input
        id={field.id}
        type="number"
        step="any"
        min={field.validation?.min}
        max={field.validation?.max}
        {...register(field.id, { valueAsNumber: true })}
        placeholder={field.placeholder}
        aria-invalid={!!error}
      />
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
