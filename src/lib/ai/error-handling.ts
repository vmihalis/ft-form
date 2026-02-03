/**
 * Error handling utilities for AI form generation
 *
 * Transforms raw API errors into user-friendly, actionable messages.
 * Never exposes technical error details to end users.
 */

/**
 * Transformed error with user-friendly message
 */
export interface TransformedError {
  /** Short error title */
  message: string;
  /** What the user can do about it */
  actionable: string;
  /** HTTP status code */
  status: number;
}

/**
 * Transform raw AI/API errors into user-friendly messages
 *
 * Handles:
 * - OpenRouter authentication errors (401)
 * - Rate limiting (429)
 * - Credit depletion (402)
 * - Schema validation failures (NoObjectGeneratedError)
 * - Network/timeout errors
 * - Unknown errors (safe fallback)
 *
 * @param error - The raw error from AI SDK or API
 * @returns TransformedError with user-friendly message and actionable guidance
 */
export function transformAIError(error: unknown): TransformedError {
  // Log original error for debugging (server-side only)
  console.error("[AI Error]", error);

  // Handle Error instances
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name || error.constructor?.name || "";

    // OpenRouter authentication error (401)
    if (message.includes("401") || message.includes("unauthorized") || message.includes("invalid api key")) {
      return {
        message: "Invalid API key",
        actionable: "Please check your OpenRouter API key and try again.",
        status: 401,
      };
    }

    // Rate limiting (429)
    if (message.includes("429") || message.includes("rate limit") || message.includes("too many requests")) {
      return {
        message: "Rate limited",
        actionable: "Too many requests. Please wait a moment and try again.",
        status: 429,
      };
    }

    // Credit depletion (402)
    if (message.includes("402") || message.includes("payment required") || message.includes("insufficient credits") || message.includes("insufficient balance")) {
      return {
        message: "Insufficient credits",
        actionable: "Your OpenRouter account needs more credits to continue.",
        status: 402,
      };
    }

    // Schema validation failure (AI SDK NoObjectGeneratedError or similar)
    if (
      name === "NoObjectGeneratedError" ||
      message.includes("no object generated") ||
      message.includes("failed to parse") ||
      message.includes("invalid json") ||
      message.includes("schema validation")
    ) {
      return {
        message: "Could not generate valid form",
        actionable: "The AI could not create a valid form structure. Try rephrasing your request.",
        status: 422,
      };
    }

    // Network/timeout errors
    if (
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("enotfound") ||
      message.includes("socket") ||
      message.includes("fetch failed") ||
      name === "AbortError" ||
      name === "TimeoutError"
    ) {
      return {
        message: "Connection error",
        actionable: "Could not reach the AI service. Please check your connection and try again.",
        status: 503,
      };
    }

    // Service unavailable (503)
    if (message.includes("503") || message.includes("service unavailable") || message.includes("overloaded")) {
      return {
        message: "Service temporarily unavailable",
        actionable: "The AI service is temporarily busy. Please try again in a few moments.",
        status: 503,
      };
    }

    // Model not found or invalid (404)
    if (message.includes("404") || message.includes("model not found") || message.includes("not found")) {
      return {
        message: "Model unavailable",
        actionable: "The requested AI model is not available. Please try again later.",
        status: 404,
      };
    }
  }

  // Check for NoObjectGeneratedError using duck typing (for cases where instanceof doesn't work)
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    (error as { name: string }).name === "NoObjectGeneratedError"
  ) {
    return {
      message: "Could not generate valid form",
      actionable: "The AI could not create a valid form structure. Try rephrasing your request.",
      status: 422,
    };
  }

  // Fallback for unknown errors - never expose raw message
  return {
    message: "Generation failed",
    actionable: "Something went wrong. Please try again.",
    status: 500,
  };
}

/**
 * Check if an error is a retryable error
 *
 * @param error - The transformed error
 * @returns true if the error might succeed on retry
 */
export function isRetryableError(error: TransformedError): boolean {
  // Rate limiting and service unavailable are retryable
  return error.status === 429 || error.status === 503;
}

/**
 * Get suggested retry delay based on error type
 *
 * @param error - The transformed error
 * @returns Suggested delay in milliseconds, or 0 if not retryable
 */
export function getRetryDelay(error: TransformedError): number {
  if (error.status === 429) {
    // Rate limited - wait longer
    return 5000;
  }
  if (error.status === 503) {
    // Service unavailable - shorter retry
    return 2000;
  }
  return 0;
}
