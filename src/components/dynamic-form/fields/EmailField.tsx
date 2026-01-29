"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormField } from "@/types/form-schema";

interface EmailFieldProps {
  field: FormField;
}

export function EmailField({ field }: EmailFieldProps) {
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
        type="email"
        {...register(field.id)}
        placeholder={field.placeholder}
        aria-invalid={!!error}
      />
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
