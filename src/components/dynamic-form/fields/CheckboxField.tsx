"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import type { FormField } from "@/types/form-schema";

interface CheckboxFieldProps {
  field: FormField;
}

export function CheckboxField({ field }: CheckboxFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message as string | undefined;

  // If field has options, render as a checkbox group (multi-select)
  if (field.options && field.options.length > 0) {
    return (
      <Field data-invalid={!!error}>
        <FieldLabel>
          {field.label}
          {!field.required && (
            <span className="text-muted-foreground font-normal"> (optional)</span>
          )}
        </FieldLabel>
        {field.description && <FieldDescription>{field.description}</FieldDescription>}
        <Controller
          name={field.id}
          control={control}
          defaultValue={[]}
          render={({ field: rhfField }) => {
            const selectedValues: string[] = rhfField.value || [];

            const handleChange = (optionValue: string, checked: boolean) => {
              if (checked) {
                rhfField.onChange([...selectedValues, optionValue]);
              } else {
                rhfField.onChange(selectedValues.filter((v) => v !== optionValue));
              }
            };

            return (
              <div className="flex flex-col gap-2 mt-2">
                {field.options!.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`${field.id}-${option.value}`}
                    className="inline-flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id={`${field.id}-${option.value}`}
                      checked={selectedValues.includes(option.value)}
                      onChange={(e) => handleChange(option.value, e.target.checked)}
                      className="h-5 w-5 rounded border-input accent-primary cursor-pointer"
                      aria-invalid={!!error}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            );
          }}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  // Single checkbox (boolean toggle)
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
