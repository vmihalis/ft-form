# Phase 27: Form Generation & Preview - Research

**Researched:** 2026-02-03
**Domain:** AI form schema extraction from chat, validation against FormSchema, and preview using existing form renderer components
**Confidence:** HIGH

## Summary

Phase 27 completes the AI form generation pipeline by adding the critical bridge between conversational AI and the existing form system. Phase 25 established AI infrastructure (streaming, OpenRouter, system prompt), Phase 26 built the chat UI with wizard flow, and now Phase 27 must: (1) detect when AI outputs a form schema in its response, (2) extract and validate that schema against the exact FormSchema type, (3) display the validated schema using existing form renderer components, and (4) enable regeneration workflows for iteration.

The core challenge is **schema extraction from streamed text** - the AI produces natural language responses that may include JSON form schemas. This phase must detect schema presence, parse it correctly (handling markdown code blocks), validate structure AND semantics (duplicate IDs, required options), and render a live preview using the PreviewPanel pattern already established in the form builder.

**Primary recommendation:** Extract schemas from AI responses using markdown JSON code block detection (`\`\`\`json...`), validate with the existing `validateAIFormSchema()` utility from Phase 25, render preview using `DynamicField` components wrapped in `FormProvider`, and add a "Regenerate" action that sends a new message to the existing chat flow.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` (AI SDK) | ^6.0.69 | Already installed, provides `UIMessage` type | Existing infrastructure, message parts extraction |
| `@ai-sdk/react` | ^3.0.71 | Already installed, `useChat` hook | Existing chat integration |
| `react-hook-form` | ^7.x | Already installed, form state for preview | Used by existing DynamicField components |
| `zod` | ^4.3.6 | Already installed, schema validation | AIFormSchemaOutputSchema already defined in Phase 25 |
| `motion/react` | ^12.29.2 | Already installed, animations | Transition between chat/preview states |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Existing shadcn/ui | N/A | Card, Button, Toggle for preview UI | All UI components |
| Existing DynamicField | N/A | Form field rendering | Preview panel rendering |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JSON code block extraction | AI SDK tool calls/structured output | Tool calls require API route changes; code block extraction works with existing streaming |
| Custom preview component | Existing PreviewPanel | PreviewPanel is tightly coupled to form-builder-store; need lightweight variant |
| Full form validation on preview | Just Zod structural | Semantic validation (duplicate IDs, options) catches issues Zod can't |

**Installation:**
No new packages required - all dependencies already installed.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── ai-wizard/
│       ├── AIFormWizard.tsx              # Modified: add preview state handling
│       ├── steps/
│       │   ├── ChatStep.tsx              # Modified: detect schema, trigger preview
│       │   └── GeneratingStep.tsx        # REPLACED: becomes PreviewStep
│       ├── FormPreviewPanel.tsx          # NEW: AI-generated form preview
│       └── schema-extraction.ts          # NEW: Extract JSON from AI response
├── lib/
│   └── ai/
│       ├── schemas.ts                    # Existing: AIFormSchemaOutputSchema
│       └── validate-schema.ts            # Existing: validateAIFormSchema()
```

### Pattern 1: Schema Detection in Streamed Messages

**What:** Detect when AI response contains a complete form schema and transition to preview state.

**When to use:** In ChatStep or AIFormWizard when processing new AI messages.

**Example:**
```typescript
// src/components/ai-wizard/schema-extraction.ts

import { validateAIFormSchema } from '@/lib/ai/validate-schema';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';

/**
 * Extract form schema from AI message content
 * AI outputs schemas in markdown JSON code blocks
 */
export function extractFormSchema(content: string): {
  found: boolean;
  schema: AIFormSchemaOutput | null;
  errors: string[] | null;
  rawJson: string | null;
} {
  // Match JSON code block (```json ... ```)
  const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n\s*```/);

  if (!jsonMatch) {
    return { found: false, schema: null, errors: null, rawJson: null };
  }

  const rawJson = jsonMatch[1].trim();

  try {
    const parsed = JSON.parse(rawJson);

    // Validate against FormSchema structure AND semantics
    const validation = validateAIFormSchema(parsed);

    if (validation.success) {
      return {
        found: true,
        schema: validation.data!,
        errors: null,
        rawJson,
      };
    } else {
      return {
        found: true,
        schema: null,
        errors: validation.errors!,
        rawJson,
      };
    }
  } catch (e) {
    return {
      found: true,
      schema: null,
      errors: [`JSON parse error: ${e instanceof Error ? e.message : 'Unknown'}`],
      rawJson,
    };
  }
}

/**
 * Check if AI response likely contains a form schema
 * Use for early detection before full parsing
 */
export function mightContainSchema(content: string): boolean {
  // Look for JSON code block with steps array (key indicator)
  return content.includes('```json') && content.includes('"steps"');
}
```

### Pattern 2: Preview Panel Using Existing Components

**What:** Render AI-generated schema using the same DynamicField components used in public forms.

**When to use:** When displaying the form preview in the wizard.

**Example:**
```typescript
// src/components/ai-wizard/FormPreviewPanel.tsx
'use client';

import { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { DynamicField } from '@/components/dynamic-form/fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Smartphone, Monitor } from 'lucide-react';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';

interface FormPreviewPanelProps {
  schema: AIFormSchemaOutput;
  onAccept: () => void;
  onRegenerate: () => void;
  onModifyPrompt: () => void;
}

export function FormPreviewPanel({
  schema,
  onAccept,
  onRegenerate,
  onModifyPrompt,
}: FormPreviewPanelProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');

  // Mock form methods for preview (read-only)
  const methods = useForm({
    defaultValues: {},
    mode: 'onChange',
  });

  const totalSteps = schema.steps.length;
  const currentStepData = schema.steps[currentStep];

  return (
    <div className="space-y-4">
      {/* Device mode toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Form Preview</h3>
        <div className="flex items-center gap-1">
          <Button
            variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDeviceMode('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDeviceMode('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview frame */}
      <Card className={deviceMode === 'mobile' ? 'max-w-[360px] mx-auto' : ''}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          {currentStepData.description && (
            <p className="text-sm text-muted-foreground">
              {currentStepData.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {currentStepData.fields.map((field) => (
                <DynamicField key={field.id} field={field} />
              ))}
            </form>
          </FormProvider>

          {/* Step navigation */}
          {totalSteps > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <Button
                size="sm"
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={currentStep === totalSteps - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center pt-4">
        <Button variant="outline" onClick={onModifyPrompt}>
          Modify Prompt
        </Button>
        <Button variant="outline" onClick={onRegenerate}>
          Regenerate
        </Button>
        <Button onClick={onAccept}>
          Use This Form
        </Button>
      </div>
    </div>
  );
}
```

### Pattern 3: Wizard State Transition on Schema Detection

**What:** Automatically transition from chat to preview when AI generates a valid schema.

**When to use:** In AIFormWizard's message handling logic.

**Example:**
```typescript
// In AIFormWizard.tsx - enhanced message handling
import { extractFormSchema, mightContainSchema } from './schema-extraction';

// Inside AIFormWizard component:
const [generatedSchema, setGeneratedSchema] = useState<AIFormSchemaOutput | null>(null);
const [schemaErrors, setSchemaErrors] = useState<string[] | null>(null);

// Watch for schema in messages
useEffect(() => {
  if (messages.length === 0) return;

  const lastAssistantMessage = messages
    .filter((m) => m.role === 'assistant')
    .at(-1);

  if (!lastAssistantMessage) return;

  // Extract text content from parts
  const content = lastAssistantMessage.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('') || '';

  // Only parse if likely contains schema (avoid unnecessary parsing)
  if (!mightContainSchema(content)) return;

  const result = extractFormSchema(content);

  if (result.found) {
    if (result.schema) {
      setGeneratedSchema(result.schema);
      setSchemaErrors(null);
      setWizard((prev) => ({ ...prev, step: 'preview' }));
    } else if (result.errors) {
      setSchemaErrors(result.errors);
      // Stay on chat, show errors
    }
  }
}, [messages, status]);
```

### Pattern 4: Regeneration via Chat Continuation

**What:** Regenerate form by sending a message asking for alternative structure.

**When to use:** When user clicks "Regenerate" in preview.

**Example:**
```typescript
// Regeneration handlers in AIFormWizard

const handleRegenerate = () => {
  // Send message requesting alternative
  sendMessage({
    text: 'Please generate an alternative form structure for the same requirements.'
  });
  // Reset preview state, stay on chat to see generation
  setGeneratedSchema(null);
  setSchemaErrors(null);
  setWizard((prev) => ({ ...prev, step: 'chat' }));
};

const handleModifyPrompt = () => {
  // Return to chat without clearing context
  setGeneratedSchema(null);
  setSchemaErrors(null);
  setWizard((prev) => ({ ...prev, step: 'chat' }));
  // User can type new instructions
};
```

### Pattern 5: Direct-to-Draft Toggle

**What:** Allow confident users to skip preview and create form immediately.

**When to use:** Optional user preference before or during generation.

**Example:**
```typescript
// Direct-to-draft toggle in wizard state
interface WizardState {
  step: WizardStep;
  formType: FormType | null;
  audience: Audience | null;
  directToDraft: boolean; // NEW
}

// In schema detection effect:
if (result.schema) {
  if (wizard.directToDraft) {
    // Skip preview, go straight to creation flow
    handleAcceptSchema(result.schema);
  } else {
    setGeneratedSchema(result.schema);
    setWizard((prev) => ({ ...prev, step: 'preview' }));
  }
}
```

### Anti-Patterns to Avoid

- **Parsing every message for JSON:** Use `mightContainSchema()` pre-check to avoid expensive parsing on every streamed chunk.
- **Creating form before user confirmation:** Always show preview first (unless direct-to-draft enabled).
- **Ignoring semantic validation:** Zod catches structural issues, but duplicate field IDs and missing options need semantic checks.
- **Tight coupling to form-builder-store:** Preview panel should NOT use form-builder-store; use local FormProvider.
- **Blocking UI during schema parsing:** Parse asynchronously, show loading state.
- **Losing chat context on preview:** Keep messages array intact for modify/regenerate.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form field rendering | Custom preview fields | `DynamicField` from dynamic-form/fields | Already handles all 10 field types, validation styling |
| Schema validation | Custom validation logic | `validateAIFormSchema()` from Phase 25 | Structural + semantic validation already built |
| Form state in preview | Custom useState per field | `react-hook-form` FormProvider | DynamicField components require FormProvider context |
| JSON extraction from markdown | Custom regex | Proven pattern with fallbacks | Edge cases in markdown formatting |
| Step navigation | Custom indexing | Existing PreviewPanel pattern | Handles edge cases, consistent UX |

**Key insight:** The existing form builder has a `PreviewPanel` component that does exactly what we need - renders form steps using DynamicField components. The AI wizard preview should follow the same pattern but without the form-builder-store dependency.

## Common Pitfalls

### Pitfall 1: Schema Extraction from Partial Streams

**What goes wrong:** Attempting to extract JSON while AI is still streaming, causing parse errors or incomplete schemas.

**Why it happens:** AI SDK streams content incrementally; JSON code block may be incomplete mid-stream.

**How to avoid:**
1. Only attempt extraction when `status === 'ready'` (stream complete)
2. Or use `mightContainSchema()` to wait for closing \`\`\` before parsing
3. Show "AI is generating form structure..." during streaming with schema indicators

**Warning signs:**
- JSON parse errors mentioning unexpected end of input
- Partial schema displayed then replaced
- Schema validation errors that resolve when response completes

### Pitfall 2: Field ID Duplication from AI

**What goes wrong:** AI generates duplicate field IDs across steps, causing form data collisions.

**Why it happens:** LLM doesn't track uniqueness across multi-step forms; may use semantic IDs like "email" multiple times.

**How to avoid:**
1. `validateAIFormSchema()` already checks for duplicate IDs - use it
2. Post-process IDs if needed: `${step.id}_${field.id}` prefix
3. Show validation errors prominently, don't silently accept

**Warning signs:**
- Validation errors mentioning "Duplicate field IDs"
- Form submissions missing expected data

### Pitfall 3: Missing Options for Select/Radio Fields

**What goes wrong:** AI generates select or radio fields without options array, causing render errors.

**Why it happens:** LLM may output placeholder like "options will be added" or forget options entirely.

**How to avoid:**
1. `validateAIFormSchema()` already checks select/radio have options
2. Show clear error: "Field 'X' needs options - please regenerate"
3. System prompt (Phase 25) explicitly requires options

**Warning signs:**
- Validation errors mentioning "select/radio fields require options"
- Empty dropdown in preview
- Render crashes from undefined.map()

### Pitfall 4: Preview Not Matching Public Form

**What goes wrong:** Preview looks different from actual public form, confusing users.

**Why it happens:** Using different components or styles for preview vs production form.

**How to avoid:**
1. Use exact same `DynamicField` components from dynamic-form/fields
2. Use same FormProvider pattern
3. Match styling (card borders, spacing)
4. Consider mobile preview mode toggle (existing PreviewPanel has this)

**Warning signs:**
- User feedback "form doesn't look like preview"
- Different field rendering in preview vs /apply/[slug]

### Pitfall 5: Lost Context on Regenerate

**What goes wrong:** User clicks regenerate, loses entire conversation history.

**Why it happens:** Resetting messages array instead of appending regeneration request.

**How to avoid:**
1. Regenerate by sending new message, not clearing history
2. Keep messages array intact across preview/chat transitions
3. AI has context of what was generated before

**Warning signs:**
- AI asks clarifying questions again after regenerate
- Generated form ignores previous conversation decisions

## Code Examples

Verified patterns from official sources:

### Message Parts Extraction (AI SDK v6)

```typescript
// Source: AI SDK v6 documentation - message structure
// AI SDK v6 uses parts array, not content string

function getMessageContent(message: UIMessage): string {
  // UIMessage.parts contains the actual content
  return message.parts
    ?.filter((part): part is { type: 'text'; text: string } =>
      part.type === 'text'
    )
    .map((part) => part.text)
    .join('') || '';
}
```

### Complete Schema Extraction with Error Handling

```typescript
// Source: Existing codebase patterns + Phase 25 research

import { validateAIFormSchema, type ValidationResult } from '@/lib/ai/validate-schema';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';

export interface SchemaExtractionResult {
  found: boolean;
  valid: boolean;
  schema: AIFormSchemaOutput | null;
  errors: string[] | null;
}

export function extractAndValidateSchema(content: string): SchemaExtractionResult {
  // Pattern matches JSON code block
  const patterns = [
    /```json\s*\n([\s\S]*?)\n\s*```/,  // Standard markdown
    /```\s*\n(\{[\s\S]*?\})\n\s*```/,   // Code block without language
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const jsonStr = match[1].trim();

      try {
        const parsed = JSON.parse(jsonStr);
        const validation = validateAIFormSchema(parsed);

        return {
          found: true,
          valid: validation.success,
          schema: validation.data || null,
          errors: validation.errors || null,
        };
      } catch (parseError) {
        return {
          found: true,
          valid: false,
          schema: null,
          errors: [`Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`],
        };
      }
    }
  }

  return { found: false, valid: false, schema: null, errors: null };
}
```

### FormProvider Wrapper for Preview

```typescript
// Source: Existing PreviewPanel.tsx pattern

import { useForm, FormProvider } from 'react-hook-form';
import { DynamicField } from '@/components/dynamic-form/fields';

function PreviewStepContent({ step }: { step: FormStep }) {
  // Create mock form methods - fields need FormProvider context
  const methods = useForm({
    defaultValues: {},
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          {step.fields.map((field) => (
            <DynamicField key={field.id} field={field} />
          ))}
        </div>
      </form>
    </FormProvider>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tool calls for structured output | JSON in markdown code blocks | Project decision | Simpler, works with existing streaming setup |
| GeneratingStep placeholder | Preview step with real schema | Phase 27 | Users see actual form before creating |
| Single-shot generation | Regeneration via chat continuation | Phase 27 | Better iteration UX |
| Separate validation | Integrated structural + semantic | Phase 25 | Catches more issues |

**Deprecated/outdated:**
- `generateObject`/`streamObject` from older AI SDK versions
- Separate content string on messages (now use parts array)

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal regeneration prompt wording**
   - What we know: User clicks "Regenerate" to get alternative structure
   - What's unclear: Best prompt to send - "regenerate" vs "alternative structure" vs specific instructions
   - Recommendation: Send "Please generate an alternative form structure for the same requirements, with different step groupings or field arrangements." Test with users.

2. **Schema validation timing during stream**
   - What we know: Can extract schema mid-stream but may be incomplete
   - What's unclear: Whether to show partial preview or wait for completion
   - Recommendation: Wait for status === 'ready' before attempting extraction. Show "Generating form structure..." with animated skeleton during streaming.

3. **8 vs 10 field types discrepancy**
   - What we know: Requirements say "8 existing field types", codebase has 10 (includes url, radio)
   - What's unclear: Whether url and radio should be excluded from AI generation
   - Recommendation: Use all 10 types from existing schema. The "8" in requirements may be outdated.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/ai/validate-schema.ts` - Validation patterns
- Existing codebase: `src/lib/ai/schemas.ts` - Zod schemas
- Existing codebase: `src/components/form-builder/PreviewPanel.tsx` - Preview rendering pattern
- Existing codebase: `src/components/dynamic-form/fields/index.tsx` - DynamicField component
- Phase 25 RESEARCH.md - AI SDK patterns, schema definitions
- Phase 26 RESEARCH.md - useChat integration, message handling

### Secondary (MEDIUM confidence)
- AI SDK v6 documentation - UIMessage structure with parts array
- Phase 25/26 VERIFICATION.md - Confirmed working implementations

### Tertiary (LOW confidence)
- v2.1 PITFALLS document - Comprehensive pitfall analysis

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used in Phases 25-26
- Architecture: HIGH - Follows existing PreviewPanel pattern, proven approach
- Pitfalls: HIGH - Derived from existing v2.1 PITFALLS document + Phase 25-26 learnings

**Research date:** 2026-02-03
**Valid until:** 30 days (stable patterns, existing infrastructure)
