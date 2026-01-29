"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import type { FormField } from "@/types/form-schema";

interface CheckboxFieldProps {
  field: FormField;
}

export function CheckboxField({ field }: CheckboxFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message as string | undefined;

  return (
    <Field data-invalid={!!error}>
      <Controller
        name={field.id}
        control={control}
        render={({ field: rhfField }) => (
          <label
            htmlFor={field.id}
            className="inline-flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              id={field.id}
              checked={rhfField.value || false}
              onChange={(e) => rhfField.onChange(e.target.checked)}
              className="h-5 w-5 rounded border-input accent-primary cursor-pointer"
              aria-invalid={!!error}
            />
            <span className="text-sm font-medium">
              {field.label}
              {!field.required && (
                <span className="text-muted-foreground font-normal"> (optional)</span>
              )}
            </span>
          </label>
        )}
      />
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
