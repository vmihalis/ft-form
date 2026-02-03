import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { FORM_CREATION_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { transformAIError } from "@/lib/ai/error-handling";
import { isValidOpenRouterKeyFormat } from "@/lib/ai/api-key";

// Allow up to 60s for complex form generation
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, apiKey } = await req.json();

    // Validate API key format early
    if (!apiKey || !isValidOpenRouterKeyFormat(apiKey)) {
      return Response.json(
        {
          error: "Valid OpenRouter API key required",
          actionable:
            "Please enter your OpenRouter API key (starts with sk-or-).",
        },
        { status: 401 }
      );
    }

    // Create OpenRouter provider with user's key
    const openrouter = createOpenRouter({
      apiKey,
      headers: {
        "HTTP-Referer": "https://frontiertower.com",
        "X-Title": "FrontierOS Form Builder",
      },
    });

    // Stream response from Claude
    const result = streamText({
      model: openrouter("anthropic/claude-sonnet-4"),
      system: FORM_CREATION_SYSTEM_PROMPT,
      messages,
    });

    // Return streaming response in AI SDK format
    return result.toUIMessageStreamResponse();
  } catch (error) {
    // Transform error to user-friendly message
    const transformed = transformAIError(error);
    return Response.json(
      { error: transformed.message, actionable: transformed.actionable },
      { status: transformed.status }
    );
  }
}
