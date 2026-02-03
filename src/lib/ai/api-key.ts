/**
 * API key format validation utilities
 *
 * Validates API key formats before making API calls to provide early errors
 */

/**
 * Validates OpenRouter API key format
 *
 * OpenRouter API keys start with "sk-or-" and have sufficient length.
 * This is a format check only - it does not verify the key is valid with OpenRouter.
 *
 * @param key - The API key string to validate
 * @returns true if the key format is valid, false otherwise
 */
export function isValidOpenRouterKeyFormat(key: string): boolean {
  return (
    typeof key === "string" && key.startsWith("sk-or-") && key.length > 20
  );
}
