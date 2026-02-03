/**
 * Zod schemas for AI output validation
 *
 * These schemas exactly mirror the TypeScript interfaces in src/types/form-schema.ts
 * Used to validate AI-generated form structures before display or storage
 */

import { z } from "zod";

/**
 * Field type enum - exactly 10 types matching FieldType in form-schema.ts
 */
export const FieldTypeSchema = z.enum([
  "text",
  "email",
  "url",
  "textarea",
  "number",
  "date",
  "select",
  "radio",
  "checkbox",
  "file",
]);

/**
 * Option for select, radio, checkbox fields
 */
export const FieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

/**
 * Validation rules for form fields
 */
export const FieldValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  customMessage: z.string().optional(),
});

/**
 * Individual form field schema
 */
export const FormFieldSchema = z.object({
  id: z.string(),
  type: FieldTypeSchema,
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  validation: FieldValidationSchema.optional(),
  options: z.array(FieldOptionSchema).optional(),
});

/**
 * Form step containing multiple fields
 */
export const FormStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
});

/**
 * Form settings
 */
export const FormSettingsSchema = z.object({
  submitButtonText: z.string(),
  successMessage: z.string(),
  welcomeMessage: z.string().optional(),
});

/**
 * Complete AI-generated form schema output
 */
export const AIFormSchemaOutputSchema = z.object({
  steps: z.array(FormStepSchema),
  settings: FormSettingsSchema,
});

/**
 * Inferred TypeScript type for AI form output
 */
export type AIFormSchemaOutput = z.infer<typeof AIFormSchemaOutputSchema>;

/**
 * Inferred types for sub-schemas
 */
export type FieldType = z.infer<typeof FieldTypeSchema>;
export type FieldOption = z.infer<typeof FieldOptionSchema>;
export type FieldValidation = z.infer<typeof FieldValidationSchema>;
export type FormField = z.infer<typeof FormFieldSchema>;
export type FormStep = z.infer<typeof FormStepSchema>;
export type FormSettings = z.infer<typeof FormSettingsSchema>;
