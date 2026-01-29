import { z } from "zod";
import type { FormField, FormSchema } from "@/types/form-schema";

/**
 * Build a Zod schema for a single form field
 *
 * Converts field configuration to appropriate Zod validation
 */
export function buildFieldSchema(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "email":
      schema = z
        .string()
        .email(field.validation?.customMessage || "Invalid email address");
      if (field.validation?.minLength) {
        schema = (schema as z.ZodString).min(
          field.validation.minLength,
          field.validation.customMessage ||
            `Must be at least ${field.validation.minLength} characters`
        );
      }
      if (field.validation?.maxLength) {
        schema = (schema as z.ZodString).max(
          field.validation.maxLength,
          field.validation.customMessage ||
            `Must be at most ${field.validation.maxLength} characters`
        );
      }
      break;

    case "text":
    case "url":
    case "textarea":
      schema = z.string();
      if (field.validation?.minLength) {
        schema = (schema as z.ZodString).min(
          field.validation.minLength,
          field.validation.customMessage ||
            `Must be at least ${field.validation.minLength} characters`
        );
      }
      if (field.validation?.maxLength) {
        schema = (schema as z.ZodString).max(
          field.validation.maxLength,
          field.validation.customMessage ||
            `Must be at most ${field.validation.maxLength} characters`
        );
      }
      if (field.validation?.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(field.validation.pattern),
          field.validation.customMessage || "Invalid format"
        );
      }
      break;

    case "number":
      schema = z.coerce.number({
        invalid_type_error:
          field.validation?.customMessage || "Must be a number",
      });
      if (field.validation?.min !== undefined) {
        schema = (schema as z.ZodNumber).min(
          field.validation.min,
          field.validation.customMessage ||
            `Must be at least ${field.validation.min}`
        );
      }
      if (field.validation?.max !== undefined) {
        schema = (schema as z.ZodNumber).max(
          field.validation.max,
          field.validation.customMessage ||
            `Must be at most ${field.validation.max}`
        );
      }
      break;

    case "date":
      schema = z.string().min(1, "Date is required");
      break;

    case "select":
    case "radio":
      // Handle empty options gracefully - default to string
      if (field.options && field.options.length > 0) {
        const values = field.options.map((opt) => opt.value) as [
          string,
          ...string[]
        ];
        schema = z.enum(values, {
          errorMap: () => ({
            message:
              field.validation?.customMessage || "Please select an option",
          }),
        });
      } else {
        schema = z.string();
      }
      break;

    case "checkbox":
      // Checkbox returns boolean
      schema = z.boolean();
      break;

    case "file":
      // File stores the storage ID as a string
      schema = z.string();
      break;

    default:
      // Fallback for unknown types
      schema = z.string();
  }

  // Make non-required fields optional
  if (!field.required) {
    // For string types, allow empty string or undefined
    if (
      field.type === "text" ||
      field.type === "email" ||
      field.type === "url" ||
      field.type === "textarea" ||
      field.type === "date" ||
      field.type === "file" ||
      field.type === "select" ||
      field.type === "radio"
    ) {
      schema = schema.optional().or(z.literal(""));
    } else {
      schema = schema.optional();
    }
  }

  return schema;
}

/**
 * Build a complete Zod schema from a FormSchema
 *
 * Iterates all steps and fields to create a single validation object
 */
export function buildFormSchema(
  schema: FormSchema
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const step of schema.steps) {
    for (const field of step.fields) {
      shape[field.id] = buildFieldSchema(field);
    }
  }

  return z.object(shape);
}

/**
 * Get field IDs for a specific step
 *
 * Useful for partial validation of multi-step forms
 */
export function getStepFieldIds(
  schema: FormSchema,
  stepIndex: number
): string[] {
  const step = schema.steps[stepIndex];
  if (!step) {
    return [];
  }
  return step.fields.map((field) => field.id);
}
