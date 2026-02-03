/**
 * Validation helper for AI-generated form schemas
 *
 * Performs both structural validation (via Zod) and semantic validation
 * (duplicate IDs, required options for select/radio fields)
 */

import {
  AIFormSchemaOutputSchema,
  type AIFormSchemaOutput,
} from "./schemas";

export interface ValidationResult {
  success: boolean;
  data?: AIFormSchemaOutput;
  errors?: string[];
}

/**
 * Validates an AI-generated form schema
 *
 * Performs two levels of validation:
 * 1. Structural - Zod schema validation for correct types and structure
 * 2. Semantic - Business logic validation (duplicate IDs, required options)
 *
 * @param raw - Unknown input to validate
 * @returns ValidationResult with success status and either data or errors
 */
export function validateAIFormSchema(raw: unknown): ValidationResult {
  // Step 1: Structural validation with Zod
  const parseResult = AIFormSchemaOutputSchema.safeParse(raw);

  if (!parseResult.success) {
    // Extract user-friendly error messages from Zod
    const errors = parseResult.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return `${path}: ${issue.message}`;
    });

    return {
      success: false,
      errors,
    };
  }

  const data = parseResult.data;

  // Step 2: Semantic validation
  const semanticErrors: string[] = [];

  // Check for duplicate field IDs across all steps
  const allFieldIds: string[] = [];
  const duplicateIds: Set<string> = new Set();

  for (const step of data.steps) {
    for (const field of step.fields) {
      if (allFieldIds.includes(field.id)) {
        duplicateIds.add(field.id);
      }
      allFieldIds.push(field.id);
    }
  }

  if (duplicateIds.size > 0) {
    semanticErrors.push(
      `Duplicate field IDs: ${Array.from(duplicateIds).join(", ")}`
    );
  }

  // Check that select/radio fields have non-empty options array
  for (const step of data.steps) {
    for (const field of step.fields) {
      if (field.type === "select" || field.type === "radio") {
        if (!field.options || field.options.length === 0) {
          semanticErrors.push(
            `${field.id}: select/radio fields require options`
          );
        }
      }
    }
  }

  if (semanticErrors.length > 0) {
    return {
      success: false,
      errors: semanticErrors,
    };
  }

  return {
    success: true,
    data,
  };
}
