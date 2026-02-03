# Architecture Patterns: AI Form Creation Assistant

**Domain:** AI-powered form generation for existing Next.js + Convex admin dashboard
**Researched:** 2026-02-03
**Confidence:** HIGH (based on existing codebase patterns + verified AI SDK documentation)

## Executive Summary

The AI form creation feature should integrate as a **parallel entry point** to the existing form builder, not a replacement. Users choose between:
1. **Manual creation** (existing flow: `/admin/forms/new` -> builder)
2. **AI-assisted creation** (new flow: AI chat -> preview -> builder or direct creation)

The architecture uses **Next.js API routes for streaming AI responses** (server-side API key security) while **Convex handles persistence** (conversations, generated schemas). This hybrid approach leverages each system's strengths.

## Recommended Architecture

```
+------------------+     +-------------------+     +------------------+
|   AI Chat UI     |---->| Next.js API Route |---->| OpenRouter API   |
| (useChat hook)   |<----| /api/ai/generate  |<----| (streaming SSE)  |
+------------------+     +-------------------+     +------------------+
        |                         |
        v                         v
+------------------+     +-------------------+
| Form Preview     |     | Schema Generation |
| (client-side)    |     | (structured JSON) |
+------------------+     +-------------------+
        |
        v
+------------------+     +-------------------+
| Convex Mutation  |---->| forms.create or   |
| (create form)    |     | builder init      |
+------------------+     +-------------------+
```

### Why This Split?

| Concern | Best Handled By | Reason |
|---------|-----------------|--------|
| AI API calls | Next.js API route | Server-side keeps API key secure, native streaming support |
| Conversation persistence | Convex | Real-time sync, existing auth patterns, consistent with app |
| Form schema storage | Convex | Already exists (forms table with draftSchema JSON) |
| Chat UI state | Vercel AI SDK useChat | Handles streaming, message management, optimistic updates |
| Form preview | Client-side React | Reuse existing DynamicFormRenderer components |

## Component Boundaries

### New Components Needed

| Component | Location | Responsibility | Communicates With |
|-----------|----------|----------------|-------------------|
| `AIFormWizard` | `src/components/ai-wizard/AIFormWizard.tsx` | Main wizard container, orchestrates flow | AIChat, FormPreview, Convex mutations |
| `AIChat` | `src/components/ai-wizard/AIChat.tsx` | Chat UI, message display, input | useChat hook, API route |
| `AIMessageBubble` | `src/components/ai-wizard/AIMessageBubble.tsx` | Individual message rendering | None (presentational) |
| `FormPreviewPanel` | `src/components/ai-wizard/FormPreviewPanel.tsx` | Live form preview from AI schema | DynamicFormRenderer, FormSchema |
| `SchemaConfirmation` | `src/components/ai-wizard/SchemaConfirmation.tsx` | Confirm/edit before creation | Convex forms.create mutation |

### Modified Components

| Component | Modification |
|-----------|-------------|
| `src/app/admin/forms/new/page.tsx` | Add "Create with AI" option alongside manual creation |
| `src/lib/stores/form-builder-store.ts` | Add `initFromAISchema(schema, metadata)` action for AI handoff |

### New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/generate` | POST | Stream AI responses, handle conversation turns |

### New Convex Tables (Optional)

| Table | Purpose | Needed If |
|-------|---------|-----------|
| `aiConversations` | Persist conversation history | Want to resume abandoned AI sessions |

**Recommendation:** Start without conversation persistence. Add later if users request "resume" functionality.

## Data Flow: AI Conversation to Form Creation

### Flow 1: Full Conversation Path

```
1. User clicks "Create with AI" on /admin/forms/new
   └─> Opens AIFormWizard modal/page

2. User types initial prompt: "I need a feedback form for floor events"
   └─> AIChat sends to /api/ai/generate
   └─> API route calls OpenRouter with system prompt + user message
   └─> Streams response back via SSE

3. AI asks clarifying questions: "How many questions? Any required fields?"
   └─> User responds
   └─> Conversation continues (2-4 turns typical)

4. AI generates structured schema (JSON)
   └─> FormPreviewPanel renders live preview using existing components
   └─> User sees "This is what your form will look like"

5. User confirms or requests changes
   └─> "Looks good" -> Create form via Convex mutation
   └─> "Change X" -> Continue conversation, regenerate

6. Form created
   └─> Redirect to /admin/forms/[formId] (existing builder)
   └─> OR stay on form list if "direct to published"
```

### Flow 2: Direct Creation (Confident User)

```
1. User provides detailed prompt: "Create a 5-question NPS survey with..."
   └─> AI generates schema in single turn
   └─> Preview shown immediately

2. User clicks "Create Form"
   └─> Convex mutation creates form with AI-generated schema
   └─> Redirect to builder (or publish if selected)
```

## API Route Implementation

### `/app/api/ai/generate/route.ts`

```typescript
// Pseudocode - actual implementation in milestone plans
import { streamText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const openrouter = createOpenAICompatible({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = await streamText({
    model: openrouter('anthropic/claude-sonnet-4'),
    system: FORM_CREATION_SYSTEM_PROMPT,
    messages,
    // Structured output for form schema
    tools: {
      generateFormSchema: {
        description: 'Generate a complete form schema',
        parameters: FormSchemaZodType,
        execute: async (schema) => schema, // Pass through
      }
    }
  });

  return result.toUIMessageStreamResponse();
}
```

### System Prompt Strategy

The system prompt should include:
1. **Frontier Tower context** - Floor names, typical form types
2. **Form schema structure** - Exact JSON format expected
3. **Question-asking behavior** - When to ask clarifying questions vs. generate
4. **Field type guidance** - When to use each field type

```typescript
const FORM_CREATION_SYSTEM_PROMPT = `
You are an AI assistant helping create forms for Frontier Tower...

Available field types: text, email, textarea, number, date, select, radio, checkbox, file

When the user's intent is clear, generate a complete form schema.
When details are ambiguous, ask 1-2 specific clarifying questions.

Output format for form schema:
{
  "steps": [...],
  "settings": {...}
}
`;
```

## Integration Points with Existing Architecture

### 1. Form Schema Compatibility

AI-generated schemas MUST match existing `FormSchema` type:

```typescript
interface FormSchema {
  steps: FormStep[];
  settings: FormSettings;
}

interface FormStep {
  id: string;           // Generate with nanoid
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  id: string;           // Generate with nanoid
  type: FieldType;      // text, email, textarea, etc.
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: FieldOption[];  // For select, radio, checkbox
}
```

**Key:** AI output is validated with Zod against existing schema types before preview/creation.

### 2. Convex Form Creation

Use existing `forms.create` mutation, then patch with AI-generated schema:

```typescript
// Existing mutation - no changes needed
const formId = await createForm({ name, slug });

// New: Immediately update with AI schema
await updateForm({
  formId,
  draftSchema: JSON.stringify(aiGeneratedSchema)
});
```

Or create new mutation that combines both:

```typescript
// New Convex mutation
export const createWithSchema = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    schema: v.string(), // JSON stringified
  },
  handler: async (ctx, args) => {
    // Create with schema already populated
  }
});
```

### 3. Form Builder Handoff

When AI creates a form, user lands in existing builder with AI schema loaded:

```typescript
// In AIFormWizard after successful creation
router.push(`/admin/forms/${formId}`);

// FormBuilderWrapper already handles loading schema from Convex
// No changes needed - just works
```

### 4. Preview Reuse

FormPreviewPanel can reuse existing dynamic form components:

```typescript
// In FormPreviewPanel
import { DynamicStepContent } from '@/components/dynamic-form/DynamicStepContent';

// Render preview using same components as public forms
<DynamicStepContent
  step={previewSchema.steps[currentStep]}
  formData={mockFormData}
  onChange={() => {}} // Preview is read-only
  errors={{}}
/>
```

## Security Considerations

### API Key Protection

| Location | Security |
|----------|----------|
| `OPENROUTER_API_KEY` | Server-side only in `.env.local`, never exposed to client |
| API route | Runs on server, key injected at runtime |
| Client code | Only sees streamed responses, never API key |

### Rate Limiting

Implement at API route level:

```typescript
// Recommended: Use Vercel's rate limiting or custom solution
// Start with simple approach, enhance if abuse detected
const RATE_LIMIT = {
  maxRequests: 20,        // Per user
  windowMs: 60 * 1000,    // Per minute
};
```

### Input Validation

```typescript
// Validate messages array before passing to AI
const MessageSchema = z.array(z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(10000), // Prevent giant inputs
}));
```

### Output Validation

```typescript
// Validate AI-generated schema before creation
import { FormSchemaType } from '@/types/form-schema';

const parsed = FormSchemaType.safeParse(aiOutput);
if (!parsed.success) {
  // Show error, don't create malformed form
}
```

## State Management Strategy

### Chat State: Vercel AI SDK useChat

```typescript
const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/ai/generate',
  onFinish: (message) => {
    // Check if AI generated a schema
    if (containsFormSchema(message)) {
      setPreviewSchema(extractSchema(message));
      setShowPreview(true);
    }
  },
});
```

### Wizard State: Local React State

```typescript
// Simple useState for wizard flow
const [step, setStep] = useState<'chat' | 'preview' | 'confirm'>('chat');
const [generatedSchema, setGeneratedSchema] = useState<FormSchema | null>(null);
const [formMetadata, setFormMetadata] = useState({ name: '', slug: '' });
```

### Why Not Zustand for AI State?

- Chat state is ephemeral (one session)
- No cross-component sharing needed beyond wizard
- useChat already manages message state optimally
- Zustand adds complexity without benefit here

The existing `form-builder-store` (Zustand) remains for the builder itself.

## Patterns to Follow

### Pattern 1: Streaming Response Rendering

```typescript
// Render streamed content with loading indicator
{messages.map(message => (
  <AIMessageBubble
    key={message.id}
    role={message.role}
    content={message.content}
    isStreaming={isLoading && message === messages.at(-1)}
  />
))}
```

### Pattern 2: Schema Extraction from AI Response

AI responses can embed JSON in markdown code blocks:

```typescript
function extractSchema(content: string): FormSchema | null {
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      return null;
    }
  }
  return null;
}
```

Or use structured tool calls (preferred):

```typescript
// AI SDK tool call provides typed schema directly
onToolCall: ({ toolName, result }) => {
  if (toolName === 'generateFormSchema') {
    setGeneratedSchema(result as FormSchema);
  }
}
```

### Pattern 3: Optimistic Preview Updates

Show preview immediately while validating:

```typescript
// Show preview optimistically
setPreviewSchema(aiSchema);
setShowPreview(true);

// Validate in background
const validation = await validateSchema(aiSchema);
if (!validation.success) {
  setValidationErrors(validation.errors);
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing API Key Client-Side

**What:** Exposing OPENROUTER_API_KEY to browser
**Why bad:** Anyone can steal and abuse your API key
**Instead:** Always call AI APIs from server (API routes)

### Anti-Pattern 2: Creating Form Before User Confirmation

**What:** Auto-creating form as soon as AI generates schema
**Why bad:** Users may want to iterate; creates orphan forms
**Instead:** Show preview, require explicit "Create" action

### Anti-Pattern 3: Blocking UI During AI Generation

**What:** Showing full-screen loader while waiting for AI
**Why bad:** Feels slow, loses user attention
**Instead:** Stream responses word-by-word, show partial content immediately

### Anti-Pattern 4: Tightly Coupling AI to Form Builder

**What:** Making form builder depend on AI components
**Why bad:** Breaks manual creation flow, harder to maintain
**Instead:** AI is an entry point that outputs schema, builder consumes schema

## Suggested Build Order

Based on dependencies and risk:

### Phase 1: API Route Foundation
1. Create `/api/ai/generate` route
2. Test OpenRouter connectivity
3. Implement basic system prompt
4. Verify streaming works

**Why first:** Validates AI integration before building UI.

### Phase 2: Chat UI Core
1. Build AIChat component with useChat
2. Implement AIMessageBubble
3. Add streaming content rendering
4. Test conversation flow

**Why second:** Core interaction pattern, can test with curl/Postman first.

### Phase 3: Schema Generation
1. Define structured output schema (Zod)
2. Add tool call for form generation
3. Implement schema extraction
4. Test with various prompts

**Why third:** Builds on working chat, adds structured output.

### Phase 4: Preview Integration
1. Build FormPreviewPanel
2. Integrate existing DynamicStepContent
3. Add schema validation display
4. Enable preview toggle

**Why fourth:** Uses stable schema output from Phase 3.

### Phase 5: Creation Flow
1. Build SchemaConfirmation component
2. Add form metadata input (name, slug)
3. Integrate Convex forms.create
4. Implement redirect to builder

**Why fifth:** Final integration, requires all previous phases.

### Phase 6: Entry Point Integration
1. Add "Create with AI" to /admin/forms/new
2. Build AIFormWizard wrapper
3. Add navigation between chat/preview/confirm
4. Polish transitions and loading states

**Why last:** Integrates everything into existing UI.

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── generate/
│   │           └── route.ts          # Streaming AI endpoint
│   └── admin/
│       └── forms/
│           └── new/
│               └── page.tsx          # Modified: add AI option
├── components/
│   └── ai-wizard/
│       ├── AIFormWizard.tsx          # Main wizard container
│       ├── AIChat.tsx                # Chat interface
│       ├── AIMessageBubble.tsx       # Message rendering
│       ├── FormPreviewPanel.tsx      # Live form preview
│       └── SchemaConfirmation.tsx    # Final confirmation
├── lib/
│   └── ai/
│       ├── prompts.ts                # System prompts
│       ├── schema-validation.ts      # Zod schemas for AI output
│       └── schema-extraction.ts      # Helpers for parsing AI responses
└── types/
    └── ai.ts                         # AI-specific types (optional)

convex/
└── forms.ts                          # Possibly add createWithSchema mutation
```

## Technology Choices

| Technology | Purpose | Confidence |
|------------|---------|------------|
| Vercel AI SDK | Chat UI, streaming, useChat hook | HIGH - official solution, well-documented |
| OpenRouter | AI provider abstraction, model flexibility | HIGH - allows switching models easily |
| Claude Sonnet 4 | Primary model for generation | MEDIUM - start here, may tune |
| Zod | Schema validation for AI output | HIGH - already in codebase |
| Existing FormSchema types | AI output target | HIGH - proven, complete |

## Scalability Considerations

| Concern | At 10 users | At 100 users | At 1000 users |
|---------|-------------|--------------|---------------|
| API costs | ~$5/mo | ~$50/mo | Rate limit, cache |
| Rate limiting | None needed | Per-user limits | Token bucket algorithm |
| Conversation storage | None | Optional in Convex | Index by user, TTL cleanup |
| Response time | <5s typical | Same | Consider queue if load spikes |

## Sources

- [AI SDK + Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) - Official Vercel AI SDK docs
- [OpenRouter Streaming](https://openrouter.ai/docs/api/reference/streaming) - SSE streaming reference
- [Convex AI Agents](https://docs.convex.dev/agents) - Thread-based conversation patterns
- [AI SDK useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) - Hook API documentation
- [Structured Outputs Guide](https://blog.promptlayer.com/how-json-schema-works-for-structured-outputs-and-tool-integration/) - JSON schema for LLMs
- Existing codebase: `src/types/form-schema.ts`, `convex/forms.ts`, `src/lib/stores/form-builder-store.ts`
