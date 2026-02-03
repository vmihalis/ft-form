/**
 * Schema extraction utility for AI responses
 *
 * Extracts and validates form schemas from AI-generated markdown responses
 * containing JSON code blocks.
 */

import { validateAIFormSchema } from "@/lib/ai/validate-schema";
import type { AIFormSchemaOutput } from "@/lib/ai/schemas";

/**
 * Result of attempting to extract a form schema from AI response content
 */
export interface SchemaExtractionResult {
  /** Whether a JSON code block was detected in the content */
  found: boolean;
  /** Whether the extracted JSON passed validation (only meaningful if found is true) */
  valid: boolean;
  /** The validated schema if extraction and validation succeeded, null otherwise */
  schema: AIFormSchemaOutput | null;
  /** Parse or validation errors if found but invalid, null otherwise */
  errors: string[] | null;
}

/**
 * Quick pre-check to determine if content might contain a form schema
 *
 * This is a fast heuristic check that avoids expensive regex/parsing
 * when content clearly doesn't contain a schema.
 *
 * @param content - The AI response content to check
 * @returns true if content contains both JSON code block marker and "steps" key
 */
export function mightContainSchema(content: string): boolean {
  // Must have both a JSON code block marker AND the "steps" key (schema indicator)
  return content.includes("```json") && content.includes('"steps"');
}

/**
 * Extract and validate a form schema from AI response content
 *
 * Looks for the first JSON code block in the content, parses it,
 * and validates it against the AIFormSchemaOutput schema.
 *
 * @param content - The AI response content containing markdown with JSON blocks
 * @returns SchemaExtractionResult with extraction status, schema, and any errors
 */
export function extractFormSchema(content: string): SchemaExtractionResult {
  // Pattern 1: Standard markdown JSON code block with language specifier
  const jsonBlockPattern = /```json\s*\n([\s\S]*?)\n\s*```/;
  // Pattern 2: Code block without language, starting with { (object)
  const genericBlockPattern = /```\s*\n(\{[\s\S]*?\})\n\s*```/;

  // Try patterns in order
  let match = content.match(jsonBlockPattern);
  if (!match) {
    match = content.match(genericBlockPattern);
  }

  // No JSON code block found
  if (!match) {
    return {
      found: false,
      valid: false,
      schema: null,
      errors: null,
    };
  }

  const jsonContent = match[1].trim();

  // Attempt to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "Unknown parse error";
    return {
      found: true,
      valid: false,
      schema: null,
      errors: [`Invalid JSON: ${errorMessage}`],
    };
  }

  // Validate against schema
  const validation = validateAIFormSchema(parsed);

  if (validation.success && validation.data) {
    return {
      found: true,
      valid: true,
      schema: validation.data,
      errors: null,
    };
  }

  return {
    found: true,
    valid: false,
    schema: null,
    errors: validation.errors ?? ["Unknown validation error"],
  };
}
