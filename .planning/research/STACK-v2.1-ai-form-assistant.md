# Stack Research: AI Form Creation Assistant

**Project:** FrontierOS AI Form Assistant (Milestone 2.1)
**Researched:** 2026-02-03
**Overall Confidence:** HIGH (versions verified via npm registry 2026-02-03)

---

## Executive Summary

Adding AI-powered form creation to FrontierOS requires minimal stack additions. The existing Next.js 16 + Convex + shadcn/ui architecture is well-suited for AI features. The primary additions are:

1. **@openrouter/ai-sdk-provider** - Official OpenRouter provider for Vercel AI SDK
2. **ai** (Vercel AI SDK v6) - Handles streaming, structured output, React hooks
3. **@ai-sdk/react** - React hooks for conversational UI

The architecture favors **Next.js API routes for LLM calls** rather than Convex actions because:
- Native streaming support in Next.js
- AI SDK optimized for Next.js patterns
- Convex actions cannot stream responses back to client
- Keep LLM concerns separate from database layer

---

## Recommended Stack Additions

### Core AI Integration

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `ai` | ^6.0.69 | Vercel AI SDK core | Industry-standard toolkit for AI apps. Provides `generateText`, `streamText`, `Output.object()` for structured generation |
| `@ai-sdk/react` | ^3.0.71 | React hooks | `useChat` hook for conversational UI, handles streaming state management |
| `@openrouter/ai-sdk-provider` | ^2.1.1 | OpenRouter integration | Official provider for AI SDK v6. User-provided API keys, 300+ model access |

### Version Rationale

- **AI SDK v6** is the current major version (released 2026). v5 is legacy.
- **@openrouter/ai-sdk-provider@2.1.1** was released 2026-01-27, explicitly supports AI SDK v6
- The `ai-sdk-v5` tag exists on the OpenRouter provider for legacy apps but should NOT be used for new development

### Existing Stack (No Changes Needed)

| Technology | Current Version | Role in AI Feature |
|------------|-----------------|-------------------|
| `zod` | ^4.3.6 | Form schema validation - already used, will define AI output schemas |
| `next` | 16.1.5 | API routes for LLM calls, streaming response handling |
| `convex` | ^1.31.6 | Store generated forms, conversation history if needed |
| `react-hook-form` | ^7.71.1 | No change - AI generates schemas consumed by existing form builder |
| `motion` | ^12.29.2 | Animate chat messages, typing indicators |

---

## Installation

```bash
pnpm add ai @ai-sdk/react @openrouter/ai-sdk-provider
```

**Note:** No additional dev dependencies needed. TypeScript types are included in all packages.

---

## Architecture Patterns

### Pattern 1: Next.js API Route for LLM Calls (RECOMMENDED)

**Why:** Native streaming support, AI SDK optimized for this pattern, clean separation from Convex.

```typescript
// src/app/api/ai/chat/route.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToModelMessages, UIMessage } from 'ai';

export const maxDuration = 60; // Allow up to 60s for complex generations

export async function POST(req: Request) {
  const { messages, apiKey } = await req.json();

  // User-provided API key from request
  const openrouter = createOpenRouter({ apiKey });

  const result = streamText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    system: `You are a form builder assistant for Frontier Tower.
Generate form schemas based on user requirements.
Output valid JSON matching the FormSchema interface.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

### Pattern 2: Structured Form Schema Generation

**Why:** Type-safe output that matches existing `FormSchema` interface from `src/types/form-schema.ts`.

```typescript
// src/lib/ai/form-schema-output.ts
import { z } from 'zod';

// Matches existing FormSchema from src/types/form-schema.ts
export const aiFormSchemaOutput = z.object({
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum(['text', 'email', 'url', 'textarea', 'number', 'date', 'select', 'radio', 'checkbox', 'file']),
      label: z.string(),
      description: z.string().optional(),
      placeholder: z.string().optional(),
      required: z.boolean(),
      validation: z.object({
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        customMessage: z.string().optional(),
      }).optional(),
      options: z.array(z.object({
        value: z.string(),
        label: z.string(),
      })).optional(),
    })),
  })),
  settings: z.object({
    submitButtonText: z.string(),
    successMessage: z.string(),
    welcomeMessage: z.string().optional(),
  }),
});

export type AIFormSchemaOutput = z.infer<typeof aiFormSchemaOutput>;
```

### Pattern 3: Non-Streaming Schema Extraction

For final form generation, use non-streaming to ensure valid JSON:

```typescript
// src/app/api/ai/generate-form/route.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, Output } from 'ai';
import { aiFormSchemaOutput } from '@/lib/ai/form-schema-output';

export async function POST(req: Request) {
  const { prompt, apiKey, model = 'anthropic/claude-3.5-sonnet' } = await req.json();

  const openrouter = createOpenRouter({ apiKey });

  const { output } = await generateText({
    model: openrouter(model),
    output: Output.object({
      schema: aiFormSchemaOutput,
    }),
    prompt: `Create a form schema for: ${prompt}`,
  });

  return Response.json({ schema: output });
}
```

### Pattern 4: React Chat UI with useChat Hook

```typescript
// src/components/ai/FormAssistantChat.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

interface FormAssistantChatProps {
  apiKey: string;
  onSchemaGenerated: (schema: FormSchema) => void;
}

export function FormAssistantChat({ apiKey, onSchemaGenerated }: FormAssistantChatProps) {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      body: { apiKey },
    }),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'user' ? 'text-right' : 'text-left'}
          >
            {message.parts.map((part, i) =>
              part.type === 'text' ? (
                <span key={i} className="inline-block p-3 rounded-lg bg-muted">
                  {part.text}
                </span>
              ) : null
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        className="p-4 border-t"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Describe your form..."
          className="w-full p-2 border rounded"
        />
      </form>
    </div>
  );
}
```

---

## OpenRouter-Specific Patterns

### User-Provided API Keys

OpenRouter requires an API key per request. Since FrontierOS uses user-provided keys:

```typescript
// Store API key in secure client state (NOT localStorage for production)
// Pass to API route in request body
// API route creates fresh provider instance per request

const openrouter = createOpenRouter({
  apiKey: userProvidedKey, // From request body
  // Optional: custom headers for OpenRouter attribution
  headers: {
    'HTTP-Referer': 'https://frontiertower.com',
    'X-Title': 'FrontierOS Form Builder',
  },
});
```

### API Key Validation

Validate API key format before making requests:

```typescript
export function isValidOpenRouterKey(key: string): boolean {
  return key.startsWith('sk-or-') && key.length > 20;
}
```

### Model Selection

OpenRouter provides access to many models. Recommended for form generation:

| Model | Best For | Cost Tier |
|-------|----------|-----------|
| `anthropic/claude-3.5-sonnet` | Balanced quality/speed, structured output | Medium |
| `anthropic/claude-3-opus` | Complex multi-step forms with nuanced requirements | High |
| `openai/gpt-4o` | Fast iterations, good at following instructions | Medium |
| `google/gemini-2.0-flash` | Quick drafts, cost-effective | Low |

**Recommendation:** Default to `anthropic/claude-3.5-sonnet` but allow users to select model.

### Streaming vs Non-Streaming Decision

| Approach | Use When | API |
|----------|----------|-----|
| Streaming (`streamText`) | Conversational chat, showing AI "thinking" | `useChat` hook, `toUIMessageStreamResponse()` |
| Non-streaming (`generateText`) | Final form schema generation | `Output.object()` with Zod schema |

**Recommendation:** Use streaming for chat interactions, non-streaming for final schema extraction to ensure valid JSON output.

---

## Integration with Existing Convex Backend

**Architecture: AI generates, Convex stores.**

```
[User prompt]
    |
    v
Next.js API route (LLM call via OpenRouter)
    |
    v
AI generates FormSchema JSON
    |
    v
Client receives schema
    |
    v
Client calls Convex mutation (forms.update)
    |
    v
Convex stores in draftSchema field
```

The generated schema is identical to manually-built schemas - no Convex changes needed.

### Why NOT Convex Actions for LLM Calls

| Concern | Convex Actions | Next.js API Routes |
|---------|----------------|-------------------|
| Streaming | Not supported | Native support |
| AI SDK integration | Manual HTTP | First-class support |
| Timeout | 10 min max | Configurable via maxDuration |
| Memory | 64MB default | Edge: 128MB, Node: 4GB |

**Verdict:** Use Next.js API routes. They're designed for this exact use case.

### Optional: Store Conversation History

If you want to persist AI conversations for context/debugging:

```typescript
// convex/schema.ts - OPTIONAL addition (not required for MVP)
aiConversations: defineTable({
  formId: v.optional(v.id("forms")),
  messages: v.string(), // JSON array of messages
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_form", ["formId"]),
```

---

## Error Handling

### OpenRouter API Errors

```typescript
import { NoObjectGeneratedError } from 'ai';

try {
  const { output } = await generateText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    output: Output.object({ schema: aiFormSchemaOutput }),
    prompt: userPrompt,
  });
  return Response.json({ schema: output });
} catch (error) {
  if (NoObjectGeneratedError.isInstance(error)) {
    // AI couldn't generate valid schema
    return Response.json(
      { error: 'Could not generate form schema', details: error.text },
      { status: 422 }
    );
  }
  if (error.message?.includes('401')) {
    return Response.json(
      { error: 'Invalid OpenRouter API key' },
      { status: 401 }
    );
  }
  if (error.message?.includes('429')) {
    return Response.json(
      { error: 'Rate limited. Please try again.' },
      { status: 429 }
    );
  }
  throw error; // Re-throw unknown errors
}
```

### Client-Side Error Display

```typescript
const { error, status } = useChat({...});

if (status === 'error') {
  return <div className="text-red-500">Error: {error?.message}</div>;
}
```

---

## What NOT to Add

| Technology | Why Avoid |
|------------|-----------|
| `@openrouter/sdk` | Lower-level SDK. AI SDK provider is higher-level with React hooks integration |
| `@ai-sdk/openai` | Direct OpenAI provider. Use OpenRouter to support multiple providers with one API key |
| `@ai-sdk/openai-compatible` | Generic provider. Official `@openrouter/ai-sdk-provider` is more feature-rich |
| `openai` package | Only needed if bypassing AI SDK entirely. Adds unnecessary dependency |
| Convex HTTP endpoints for streaming | No native streaming support |
| Convex actions for LLM | Cannot stream responses back to client |
| `langchain` | Overkill for this use case, adds significant bundle size |
| Custom fetch wrapper | AI SDK handles this properly, don't reinvent |

---

## Security Considerations

1. **Never store API keys in Convex** - Keep in client memory or secure session storage
2. **Validate API routes** - Ensure only authenticated admins can access `/api/ai/*`
3. **Rate limiting** - Consider adding rate limits on AI routes to prevent abuse
4. **Input sanitization** - Don't pass raw user input directly to system prompts without escaping
5. **API key transmission** - Use HTTPS (default in production), consider additional encryption

### Route Protection Example

```typescript
// src/app/api/ai/chat/route.ts
import { getAdminSession } from '@/lib/auth'; // Your auth implementation

export async function POST(req: Request) {
  // Verify admin session before processing
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... rest of handler
}
```

---

## Full Installation Command

```bash
pnpm add ai@^6.0.69 @ai-sdk/react@^3.0.71 @openrouter/ai-sdk-provider@^2.1.1
```

---

## Environment Variables

```env
# .env.local (for development testing only)
# In production, users provide their own keys via UI
OPENROUTER_API_KEY=sk-or-...  # Optional, for testing
```

**Note:** For production, API keys should come from user input, not environment variables.

---

## Sources

### Package Verification (npm registry, 2026-02-03)

| Package | Version | Published |
|---------|---------|-----------|
| `ai` | 6.0.69 | 2026-02-03 |
| `@ai-sdk/react` | 3.0.71 | 2026-02-03 |
| `@openrouter/ai-sdk-provider` | 2.1.1 | 2026-01-27 |
| `@ai-sdk/openai-compatible` | 2.0.26 | 2026-02-01 |

### Documentation Sources

- **AI SDK homepage:** ai-sdk.dev (WebFetch verified)
- **@openrouter/ai-sdk-provider README:** npm show command output
- **@ai-sdk/react README:** npm show command output
- **ai package README:** npm show command output
- **Convex Actions documentation:** docs.convex.dev/functions/actions (WebFetch verified)

### Confidence Assessment

| Topic | Confidence | Basis |
|-------|------------|-------|
| Package versions | HIGH | Verified via npm registry 2026-02-03 |
| AI SDK patterns | HIGH | Official README + WebFetch from ai-sdk.dev |
| OpenRouter integration | HIGH | Official provider README |
| Streaming architecture | HIGH | AI SDK documentation |
| Convex limitations | MEDIUM | Convex actions docs (no streaming mentioned) |
| Security patterns | MEDIUM | Best practices, not OpenRouter-specific docs |
