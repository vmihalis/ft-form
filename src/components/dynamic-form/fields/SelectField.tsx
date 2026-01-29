"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormField } from "@/types/form-schema";

interface SelectFieldProps {
  field: FormField;
}

export function SelectField({ field }: SelectFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message as string | undefined;
  const hasOptions = field.options && field.options.length > 0;

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={field.id}>
        {field.label}
        {!field.required && (
          <span className="text-muted-foreground font-normal"> (optional)</span>
        )}
      </FieldLabel>
      <Controller
        name={field.id}
        control={control}
        render={({ field: rhfField }) => (
          <Select
            onValueChange={rhfField.onChange}
            value={rhfField.value || ""}
            disabled={!hasOptions}
          >
            <SelectTrigger
              id={field.id}
              className="w-full"
              aria-invalid={!!error}
            >
              <SelectValue
                placeholder={field.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {hasOptions ? (
                field.options!.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      />
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
