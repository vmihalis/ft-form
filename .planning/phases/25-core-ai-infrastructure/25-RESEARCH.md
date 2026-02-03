# Phase 25: Core AI Infrastructure - Research

**Researched:** 2026-02-03
**Domain:** AI streaming infrastructure with OpenRouter, structured output validation, system prompt design
**Confidence:** HIGH

## Summary

Phase 25 establishes the foundational AI infrastructure for the form creation assistant. This phase focuses on three critical areas: (1) OpenRouter integration with user-provided API keys, (2) streaming responses via Next.js API routes, and (3) robust schema validation to ensure AI outputs match the existing FormSchema structure.

The existing v2.1 milestone research (STACK, ARCHITECTURE, PITFALLS documents) provides comprehensive guidance. This phase-specific research narrows focus to the infrastructure layer - what must be built FIRST before any UI or conversation logic.

**Primary recommendation:** Use Next.js API routes with Vercel AI SDK v6 `streamText` for streaming responses, validate all AI outputs with Zod schemas that mirror the existing FormSchema types, and include the FT-CONTEXT.md content directly in the system prompt.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | ^6.0.69 | Vercel AI SDK core - `streamText`, `generateText`, `Output.object()` | Official solution, unified API for streaming and structured output, native Next.js support |
| `@ai-sdk/react` | ^3.0.71 | React hooks for chat UI (`useChat`) | Type-safe streaming state management, handles optimistic updates |
| `@openrouter/ai-sdk-provider` | ^2.1.1 | OpenRouter provider for AI SDK v6 | Official provider, supports 300+ models via single API |
| `zod` | ^4.3.6 | Schema validation for AI outputs | Already installed, required for AI SDK structured output |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `motion` | ^12.29.2 | Already installed | Typing indicator animations, message transitions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@openrouter/ai-sdk-provider` | `@ai-sdk/openai-compatible` | Generic provider works but official OpenRouter provider has better type support |
| AI SDK `streamText` | Convex HTTP actions | Convex cannot stream responses; Next.js API routes required |
| User-provided API keys | Server-side env key | Security/cost: user pays for their own usage, no stored secrets |

**Installation:**
```bash
pnpm add ai@^6.0.69 @ai-sdk/react@^3.0.71 @openrouter/ai-sdk-provider@^2.1.1
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── ai/
│           └── generate/
│               └── route.ts       # Streaming AI endpoint
├── lib/
│   └── ai/
│       ├── schemas.ts             # Zod schemas for AI output validation
│       ├── system-prompt.ts       # System prompt with FT context
│       └── error-handling.ts      # Error transformation utilities
```

### Pattern 1: User-Provided API Key Flow

**What:** User provides their OpenRouter API key, stored in client state, passed per-request to API route.

**When to use:** Always - this is the decided architecture per STATE.md.

**Example:**
```typescript
// src/app/api/ai/generate/route.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, apiKey } = await req.json();

  if (!apiKey || !apiKey.startsWith('sk-or-')) {
    return Response.json(
      { error: 'Valid OpenRouter API key required' },
      { status: 401 }
    );
  }

  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      'HTTP-Referer': 'https://frontiertower.com',
      'X-Title': 'FrontierOS Form Builder',
    },
  });

  const result = streamText({
    model: openrouter('anthropic/claude-sonnet-4'),
    system: FORM_CREATION_SYSTEM_PROMPT,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
```

### Pattern 2: Zod Schema Matching FormSchema

**What:** Define Zod schemas that exactly mirror the existing TypeScript FormSchema interface.

**When to use:** For all AI output validation before display or storage.

**Example:**
```typescript
// src/lib/ai/schemas.ts
import { z } from 'zod';

// Exact match of FieldType from src/types/form-schema.ts
export const FieldTypeSchema = z.enum([
  'text', 'email', 'url', 'textarea', 'number',
  'date', 'select', 'radio', 'checkbox', 'file'
]);

export const FieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const FieldValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  customMessage: z.string().optional(),
});

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

export const FormStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
});

export const FormSettingsSchema = z.object({
  submitButtonText: z.string(),
  successMessage: z.string(),
  welcomeMessage: z.string().optional(),
});

export const AIFormSchemaOutput = z.object({
  steps: z.array(FormStepSchema),
  settings: FormSettingsSchema,
});

export type AIFormSchemaOutput = z.infer<typeof AIFormSchemaOutput>;
```

### Pattern 3: Error Transformation for User-Friendly Messages

**What:** Transform raw API/validation errors into actionable user messages.

**When to use:** For all error responses from the AI endpoint.

**Example:**
```typescript
// src/lib/ai/error-handling.ts
import { NoObjectGeneratedError } from 'ai';

export function transformAIError(error: unknown): {
  message: string;
  actionable: string;
  status: number;
} {
  if (error instanceof Error) {
    // OpenRouter auth errors
    if (error.message?.includes('401')) {
      return {
        message: 'Invalid API key',
        actionable: 'Please check your OpenRouter API key and try again.',
        status: 401,
      };
    }

    // Rate limiting
    if (error.message?.includes('429')) {
      return {
        message: 'Rate limited',
        actionable: 'Too many requests. Please wait a moment and try again.',
        status: 429,
      };
    }

    // Credit depletion
    if (error.message?.includes('402')) {
      return {
        message: 'Insufficient credits',
        actionable: 'Your OpenRouter account needs more credits to continue.',
        status: 402,
      };
    }
  }

  // Schema validation failure
  if (NoObjectGeneratedError.isInstance(error)) {
    return {
      message: 'Could not generate valid form',
      actionable: 'The AI could not create a valid form structure. Try rephrasing your request.',
      status: 422,
    };
  }

  // Fallback
  return {
    message: 'Generation failed',
    actionable: 'Something went wrong. Please try again.',
    status: 500,
  };
}
```

### Pattern 4: System Prompt with FT Context

**What:** System prompt that includes Frontier Tower context, available field types, and explicit constraints.

**When to use:** Every AI generation request.

**Structure:**
```typescript
// src/lib/ai/system-prompt.ts
export const FORM_CREATION_SYSTEM_PROMPT = `
You are a form creation assistant for Frontier Tower (FT), a premium innovation hub in San Francisco.

## Your Role
Help admins create forms by understanding their needs and generating valid form schemas.

## Available Field Types (ONLY these 10 types exist)
- text: Single-line text input
- email: Email address with validation
- url: Website URL
- textarea: Multi-line text
- number: Numeric input (supports min/max validation)
- date: Date picker
- select: Dropdown menu (requires options array)
- radio: Radio button group (requires options array)
- checkbox: Checkbox (single or multiple with options)
- file: File upload

## NOT AVAILABLE (do not generate)
- Conditional logic / show-if rules
- Multi-column layouts
- Rating scales or sliders
- Signature fields
- Rich text fields
- Field branching

## Frontier Tower Context
${FT_CONTEXT}

## Floor Selection Options (use exact values)
${FLOOR_OPTIONS}

## Output Format
When generating a form, output valid JSON matching this structure:
{
  "steps": [
    {
      "id": "step_1",
      "title": "Step Title",
      "description": "Optional description",
      "fields": [
        {
          "id": "unique_field_id",
          "type": "text",
          "label": "Field Label",
          "description": "Optional help text",
          "placeholder": "Optional placeholder",
          "required": true,
          "validation": { "minLength": 2, "maxLength": 500 },
          "options": [{ "value": "opt1", "label": "Option 1" }]
        }
      ]
    }
  ],
  "settings": {
    "submitButtonText": "Submit",
    "successMessage": "Thank you for your submission!",
    "welcomeMessage": "Optional intro message"
  }
}

## Rules
1. Field IDs must be unique, use snake_case format (e.g., "first_name", "floor_selection")
2. Select/radio fields MUST have options array with both value and label
3. Use 2-4 fields per step typically
4. Validation properties depend on field type:
   - text/email/url/textarea: minLength, maxLength, pattern
   - number: min, max
   - select/radio/checkbox/date/file: no validation properties
5. Always include email field for follow-up
6. For floor-related forms, include floor dropdown with provided options
`;
```

### Anti-Patterns to Avoid

- **Storing API keys server-side:** Never store user API keys in env or database. Pass per-request only.
- **Using Convex actions for LLM calls:** Convex cannot stream responses. Always use Next.js API routes.
- **Validating output AFTER storing:** Validate AI output BEFORE display or Convex storage.
- **Generic error messages:** Transform all errors to actionable user messages.
- **Trusting AI-generated IDs:** Either validate uniqueness or generate IDs server-side.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming SSE responses | Manual fetch + event parsing | AI SDK `streamText` + `toUIMessageStreamResponse()` | Edge cases in chunking, reconnection, abort handling |
| JSON schema validation | Custom validation logic | Zod with `safeParse` | Type inference, error messages, composability |
| OpenRouter authentication | Manual fetch with headers | `@openrouter/ai-sdk-provider` | Handles auth, retries, model routing |
| Error type detection | String matching on error.message | AI SDK error classes (`NoObjectGeneratedError`) | Reliable error categorization |
| Streaming state management | Manual useState for messages | `useChat` hook from `@ai-sdk/react` | Optimistic updates, abort, error states |

**Key insight:** The Vercel AI SDK v6 handles the entire streaming lifecycle - from server response formatting to client state management. Hand-rolling any part introduces subtle bugs around connection drops, partial JSON, and race conditions.

## Common Pitfalls

### Pitfall 1: Schema Incompatibility (CRIT-1)

**What goes wrong:** AI generates field types or property shapes that don't exist in the system.

**Why it happens:** LLMs are trained on many form builders with different schemas. They may output `type: "phone"` or `showIf` conditionals.

**How to avoid:**
1. Define exhaustive Zod schema matching FormSchema exactly
2. Use `strict()` mode to reject unknown properties
3. Include explicit "NOT AVAILABLE" list in system prompt
4. Validate EVERY AI response before display

**Warning signs:**
- Field types not in the 10 allowed types
- Properties like `conditionalLogic`, `layout`, `branching`
- Options without both `value` and `label`

### Pitfall 2: Field ID Collisions (CRIT-2)

**What goes wrong:** Duplicate field IDs cause submission data to overwrite.

**Why it happens:** AI uses semantic IDs like "name", "email" without tracking uniqueness.

**How to avoid:**
1. Post-process IDs: prepend `{step_index}_{semantic}_` prefix
2. Validate uniqueness across all fields before accepting schema
3. Or generate IDs server-side entirely (recommended)

**Warning signs:** Multiple fields with same or similar IDs.

### Pitfall 3: API Key Validation Bypass

**What goes wrong:** Invalid API keys cause cryptic errors downstream.

**Why it happens:** Key format checked but not validated against OpenRouter.

**How to avoid:**
1. Check key format: `sk-or-` prefix, minimum length
2. On first request failure, return clear "invalid key" error
3. Don't expose raw OpenRouter error messages to user

**Warning signs:** Errors with "401" or "authentication" from OpenRouter.

### Pitfall 4: Timeout on Complex Generation

**What goes wrong:** Long form generation (10+ fields) times out, user sees partial/no response.

**Why it happens:** Default Vercel function timeout is 10s, complex schemas take 15-30s.

**How to avoid:**
1. Set `maxDuration = 60` on the API route
2. Use streaming to show progress immediately
3. Consider breaking into smaller generation requests for very large forms

**Warning signs:** 504 errors, truncated responses, slow response times.

## Code Examples

Verified patterns from official sources:

### Complete API Route with Streaming
```typescript
// src/app/api/ai/generate/route.ts
// Source: AI SDK v6 docs + OpenRouter provider

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToModelMessages } from 'ai';
import { FORM_CREATION_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { transformAIError } from '@/lib/ai/error-handling';

export const maxDuration = 60; // Allow up to 60s for complex forms

export async function POST(req: Request) {
  try {
    const { messages, apiKey } = await req.json();

    // Validate API key format
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.startsWith('sk-or-')) {
      return Response.json(
        { error: 'Valid OpenRouter API key required', actionable: 'Please enter your OpenRouter API key (starts with sk-or-).' },
        { status: 401 }
      );
    }

    const openrouter = createOpenRouter({
      apiKey,
      headers: {
        'HTTP-Referer': 'https://frontiertower.com',
        'X-Title': 'FrontierOS Form Builder',
      },
    });

    const result = streamText({
      model: openrouter('anthropic/claude-sonnet-4'),
      system: FORM_CREATION_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      onError: (error) => {
        console.error('AI generation error:', error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const transformed = transformAIError(error);
    return Response.json(
      { error: transformed.message, actionable: transformed.actionable },
      { status: transformed.status }
    );
  }
}
```

### Schema Validation Helper
```typescript
// src/lib/ai/validate-schema.ts
import { AIFormSchemaOutput } from './schemas';

export function validateAIFormSchema(raw: unknown): {
  success: boolean;
  data?: AIFormSchemaOutput;
  errors?: string[];
} {
  const result = AIFormSchemaOutput.safeParse(raw);

  if (!result.success) {
    const errors = result.error.errors.map(e =>
      `${e.path.join('.')}: ${e.message}`
    );
    return { success: false, errors };
  }

  // Additional semantic validation
  const schema = result.data;
  const fieldIds = new Set<string>();
  const duplicates: string[] = [];

  for (const step of schema.steps) {
    for (const field of step.fields) {
      if (fieldIds.has(field.id)) {
        duplicates.push(field.id);
      }
      fieldIds.add(field.id);

      // Validate options for select/radio/checkbox
      if (['select', 'radio'].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          return {
            success: false,
            errors: [`${field.id}: select/radio fields require options`],
          };
        }
      }
    }
  }

  if (duplicates.length > 0) {
    return {
      success: false,
      errors: [`Duplicate field IDs: ${duplicates.join(', ')}`],
    };
  }

  return { success: true, data: schema };
}
```

### API Key Validation Utility
```typescript
// src/lib/ai/api-key.ts

export function isValidOpenRouterKeyFormat(key: string): boolean {
  // OpenRouter keys start with sk-or- and have significant length
  return (
    typeof key === 'string' &&
    key.startsWith('sk-or-') &&
    key.length > 20
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `generateObject`/`streamObject` | `generateText`/`streamText` with `output` | AI SDK v6 (2026) | Unified API, deprecated separate object generation |
| Manual SSE parsing | `toUIMessageStreamResponse()` | AI SDK v6 | Automatic streaming format for AI SDK React hooks |
| `@ai-sdk/openai-compatible` | `@openrouter/ai-sdk-provider` | 2025-2026 | Official provider with better type support |
| System message in messages array | Separate `system` parameter | AI SDK v5+ | Cleaner separation of concerns |

**Deprecated/outdated:**
- `generateObject`/`streamObject`: Replaced by `output` setting on `generateText`/`streamText`
- `onFinish` callback (renamed to `onComplete` in some contexts)
- Manual fetch for AI APIs when using Vercel/Next.js

## Open Questions

Things that couldn't be fully resolved:

1. **Model selection for optimal form generation**
   - What we know: Claude Sonnet 4 via OpenRouter is recommended starting point
   - What's unclear: Cost/quality tradeoff, whether GPT-4o or other models perform better for structured JSON
   - Recommendation: Start with Claude Sonnet 4, monitor quality and costs, consider adding model selection in future

2. **Rate limiting implementation**
   - What we know: OpenRouter has per-key limits; recommend 20 req/min/user
   - What's unclear: Whether to implement app-level rate limiting or rely on OpenRouter
   - Recommendation: Rely on OpenRouter limits for Phase 25, add app-level if abuse detected

3. **System prompt length and context window**
   - What we know: FT-CONTEXT.md is ~350 lines, system prompt ~100 lines
   - What's unclear: Whether full context fits well in every model's context window
   - Recommendation: Include full context initially, truncate if issues arise

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK v6 Blog](https://vercel.com/blog/ai-sdk-6) - v6 release and architecture
- [AI SDK streamText Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) - Core streaming API
- [AI SDK Migration Guide 6.0](https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0) - Breaking changes from v5
- [OpenRouter Quickstart](https://openrouter.ai/docs/quickstart) - Authentication and setup
- [@openrouter/ai-sdk-provider GitHub](https://github.com/OpenRouterTeam/ai-sdk-provider) - Provider implementation

### Secondary (MEDIUM confidence)
- [OpenRouter Streaming Docs](https://openrouter.ai/docs/api/reference/streaming) - SSE streaming reference
- Existing v2.1 research: `STACK-v2.1-ai-form-assistant.md`, `ARCHITECTURE-v2.1-ai-form-creation.md`

### Tertiary (LOW confidence)
- WebSearch results for version verification (npm registry shows 2.1.1 for OpenRouter provider)

### Codebase Analysis
- `src/types/form-schema.ts` - Exact FormSchema interface to mirror
- `src/lib/schemas/dynamic-form.ts` - Existing Zod patterns for field validation
- `convex/schema.ts` - Database schema, draftSchema field format
- `.planning/research/FT-CONTEXT.md` - Frontier Tower context for system prompt

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official AI SDK v6 docs and OpenRouter provider verified
- Architecture: HIGH - Patterns from existing v2.1 research + AI SDK documentation
- Pitfalls: HIGH - Drawn from verified PITFALLS-v2.1-ai-form-creation.md

**Research date:** 2026-02-03
**Valid until:** 30 days (AI SDK ecosystem moves fast, verify versions before implementation)
