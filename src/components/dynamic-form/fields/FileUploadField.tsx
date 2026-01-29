"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError } from "@/components/ui/field";
import { FileField } from "@/components/form/fields/FileField";
import type { FormField } from "@/types/form-schema";
import type { Id } from "../../../../convex/_generated/dataModel";

interface FileUploadFieldProps {
  field: FormField;
}

export function FileUploadField({ field }: FileUploadFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message as string | undefined;

  return (
    <Field data-invalid={!!error}>
      <Controller
        name={field.id}
        control={control}
        render={({ field: rhfField }) => (
          <FileField
            value={rhfField.value as Id<"_storage"> | null}
            onChange={rhfField.onChange}
            label={field.label + (!field.required ? " (optional)" : "")}
            description={field.description}
          />
        )}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
