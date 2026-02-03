import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, type UIMessage } from "ai";
import { FORM_CREATION_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { transformAIError } from "@/lib/ai/error-handling";
import { isValidOpenRouterKeyFormat } from "@/lib/ai/api-key";

/**
 * Convert UIMessage[] (from useChat) to messages array for streamText
 *
 * useChat sends UIMessage format with parts array, but streamText expects
 * simple role + content format.
 */
function convertToCoreMessages(messages: UIMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.map((msg) => {
    // Extract text content from parts
    const textContent = msg.parts
      ?.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('') || '';

    return {
      role: msg.role as 'user' | 'assistant',
      content: textContent,
    };
  });
}

// Allow up to 60s for complex form generation
export const maxDuration = 60;

type FormType = 'application' | 'feedback' | 'registration' | 'survey' | 'other';
type Audience = 'external' | 'internal';

/**
 * Build contextual system prompt incorporating form type and audience
 *
 * Appends context-specific guidance to the base system prompt to help
 * the AI ask relevant clarifying questions.
 */
function buildContextualPrompt(formType: FormType, audience: Audience): string {
  const audienceLabel = audience === 'external' ? 'External/Public' : 'Internal/Team';

  // Form type specific guidance
  const formTypeGuidance: Record<FormType, string> = {
    application: `Ask about:
- What position, opportunity, or program is this application for?
- What key information do you need from applicants (background, qualifications, motivation)?
- Is there a deadline or timeline to mention?`,
    feedback: `Ask about:
- What is the feedback about (event, service, experience, facility)?
- Should responses be anonymous or identified?
- What specific aspects need rating or evaluation?`,
    registration: `Ask about:
- What event or program is this registration for?
- What attendee details are needed (dietary, accessibility, team info)?
- Is there a capacity limit or waitlist needed?`,
    survey: `Ask about:
- What is the main purpose or research question of this survey?
- What types of questions are needed (rating scales vs open-ended)?
- How long should the survey take to complete?`,
    other: `Ask about:
- What is the main purpose of this form?
- What information needs to be collected?
- Who will be filling out this form and why?`,
  };

  return `${FORM_CREATION_SYSTEM_PROMPT}

## Current Form Request Context

**Form Type:** ${formType.charAt(0).toUpperCase() + formType.slice(1)}
**Target Audience:** ${audienceLabel}

## Clarifying Questions Guidance

${formTypeGuidance[formType]}

**Important:** Ask 2-3 clarifying questions maximum before generating the form. Focus on understanding the specific use case so you can create a relevant, well-structured form.`;
}

export async function POST(req: Request) {
  try {
    const { messages, apiKey, formType, audience } = await req.json();

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

    // Build system prompt with context if available
    const systemPrompt =
      formType && audience
        ? buildContextualPrompt(formType as FormType, audience as Audience)
        : FORM_CREATION_SYSTEM_PROMPT;

    // Convert UIMessages to CoreMessages for streamText
    const coreMessages = convertToCoreMessages(messages);

    // Stream response from Claude
    const result = streamText({
      model: openrouter("anthropic/claude-sonnet-4"),
      system: systemPrompt,
      messages: coreMessages,
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
