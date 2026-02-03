# Phase 26: Chat UI & Conversation Flow - Research

**Researched:** 2026-02-03
**Domain:** React chat UI with AI SDK streaming, wizard state management, hybrid structured/conversational interface
**Confidence:** HIGH

## Summary

Phase 26 builds the conversational interface layer on top of the Phase 25 AI infrastructure. The core challenge is implementing a wizard-like flow that combines structured inputs (form type, audience selection) with open-ended AI conversation, while maintaining clear visual state progression and robust error handling.

The Vercel AI SDK v6 `useChat` hook provides comprehensive streaming state management, including built-in `status` property for UI state (`submitted` | `streaming` | `ready` | `error`), a `stop()` function for cancellation, and error recovery via `regenerate()`. The existing shadcn/ui components (Sheet, Select, Button, Card) provide all necessary building blocks.

**Primary recommendation:** Use the AI SDK `useChat` hook with a custom wizard state layer (simple React state or zustand store for wizard steps), existing shadcn/ui components for the UI, and a hybrid approach where structured selections (form type, audience) are captured BEFORE entering the chat flow.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@ai-sdk/react` | ^3.0.71 | `useChat` hook for streaming chat | Already installed (Phase 25), handles streaming state, messages, cancel, errors |
| `motion` | ^12.29.2 | Typing indicator, message animations | Already installed, consistent with codebase patterns |
| `zustand` | ^5.0.10 | Wizard state persistence (optional) | Already installed, proven pattern from `dynamic-form-store.ts` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^0.563.0 | Icons for UI states | Already installed, used throughout codebase |
| Existing shadcn/ui | N/A | Sheet, Select, Button, Card, Skeleton | Already available, consistent with design system |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Simple React state for wizard | XState/state machines | Over-engineering for 4-state wizard; React state sufficient |
| Zustand for chat state | useChat only | useChat already manages chat state; zustand only needed if persisting across page reloads |
| Custom streaming UI | AI SDK Elements library | Elements adds dependency; useChat + custom components more flexible |

**Installation:**
No new packages required - all dependencies already installed from Phase 25.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── admin/
│       └── forms/
│           └── new/
│               └── ai/
│                   └── page.tsx          # AI form creation wizard page
├── components/
│   └── ai-wizard/
│       ├── AIFormWizard.tsx              # Main wizard container
│       ├── WizardStepIndicator.tsx       # Visual progress indicator
│       ├── steps/
│       │   ├── FormTypeStep.tsx          # Step 1: Form type selection
│       │   ├── AudienceStep.tsx          # Step 2: Audience selection
│       │   ├── ChatStep.tsx              # Step 3: Conversational AI
│       │   └── GeneratingStep.tsx        # Step 4: Generation in progress
│       ├── ChatMessage.tsx               # Individual message component
│       ├── ChatInput.tsx                 # Input with submit/stop buttons
│       └── TypingIndicator.tsx           # Animated typing dots
├── lib/
│   └── stores/
│       └── ai-wizard-store.ts            # Wizard state (optional, can use React state)
```

### Pattern 1: Wizard State with useChat Integration

**What:** A 4-stage wizard flow that captures structured inputs before AI conversation, with clear state transitions.

**When to use:** Always - this is the architecture mandated by requirements HYB-01, HYB-02, UX-02.

**Wizard States:**
1. `form-type` - User selects form type (Application, Feedback, Registration, Survey, Other)
2. `audience` - User selects audience (External/Internal)
3. `chat` - Conversational AI with clarifying questions
4. `generating` - Form generation in progress (streaming visible)

**Example:**
```typescript
// Wizard state types
type WizardStep = 'form-type' | 'audience' | 'chat' | 'generating';

interface WizardState {
  step: WizardStep;
  formType: FormType | null;
  audience: Audience | null;
  canCancel: boolean;
}

// Simple React state implementation
function AIFormWizard() {
  const [wizardState, setWizardState] = useState<WizardState>({
    step: 'form-type',
    formType: null,
    audience: null,
    canCancel: false,
  });

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    api: '/api/ai/generate',
    body: {
      // Pass structured context with every message
      formType: wizardState.formType,
      audience: wizardState.audience,
    },
  });

  // Transition to generating when AI starts streaming form output
  useEffect(() => {
    if (status === 'streaming' && isGeneratingForm(messages)) {
      setWizardState(prev => ({ ...prev, step: 'generating', canCancel: true }));
    }
  }, [status, messages]);

  // ...
}
```

### Pattern 2: useChat Hook Configuration

**What:** Proper configuration of useChat for the wizard flow with streaming, cancellation, and error handling.

**When to use:** For the chat step of the wizard.

**Example:**
```typescript
// Source: AI SDK v6 documentation
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

function ChatStep({ formType, audience, apiKey }: ChatStepProps) {
  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/generate',
      headers: {
        'X-API-Key': apiKey, // Pass user's OpenRouter key
      },
      body: {
        // Structured context included with every request
        formType,
        audience,
      },
    }),
    onError: (error) => {
      console.error('Chat error:', error);
      // Error UI handled via error state
    },
    onFinish: ({ message, isAborted }) => {
      if (!isAborted) {
        // Check if AI generated a form schema
        const formSchema = extractFormSchema(message);
        if (formSchema) {
          onFormGenerated(formSchema);
        }
      }
    },
  });

  // Status-based UI rendering
  const isStreaming = status === 'streaming';
  const isSubmitted = status === 'submitted';
  const isReady = status === 'ready';
  const hasError = status === 'error';

  return (
    <div>
      <MessageList messages={messages} isStreaming={isStreaming} />

      {(isSubmitted || isStreaming) && (
        <div className="flex items-center gap-2">
          <TypingIndicator />
          <Button variant="outline" size="sm" onClick={stop}>
            Stop
          </Button>
        </div>
      )}

      {hasError && (
        <div className="text-destructive">
          <p>Something went wrong.</p>
          <Button variant="outline" onClick={regenerate}>
            Retry
          </Button>
        </div>
      )}

      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={() => {
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        disabled={!isReady}
      />
    </div>
  );
}
```

### Pattern 3: Structured Context in System Prompt

**What:** Include form type and audience selection in the AI context for better generation.

**When to use:** Every AI request from the chat step.

**Example:**
```typescript
// Server-side: Update API route to include structured context
// src/app/api/ai/generate/route.ts

export async function POST(req: Request) {
  const { messages, apiKey, formType, audience } = await req.json();

  // Build context-aware system prompt
  const contextualPrompt = buildContextualPrompt(formType, audience);

  const result = streamText({
    model: openrouter('anthropic/claude-sonnet-4'),
    system: contextualPrompt,
    messages,
  });

  return result.toUIMessageStreamResponse();
}

function buildContextualPrompt(formType: string, audience: string): string {
  return `${FORM_CREATION_SYSTEM_PROMPT}

## Current Form Request Context
- **Form Type:** ${formType}
- **Target Audience:** ${audience === 'external' ? 'External/Public' : 'Internal/Team members'}

Based on this context, ask 2-3 clarifying questions to understand:
${getQuestionsForFormType(formType)}

After gathering enough information, generate the form schema.`;
}

function getQuestionsForFormType(formType: string): string {
  const questions: Record<string, string> = {
    application: `
- What position/opportunity is this application for?
- What information do you need from applicants?
- Is there a deadline or timeline?`,
    feedback: `
- What specifically do you want feedback on?
- Should responses be anonymous?
- Are there specific aspects to rate/evaluate?`,
    registration: `
- What event/program is this registration for?
- What details do you need from registrants?
- Is there a capacity limit?`,
    survey: `
- What is the purpose of this survey?
- What types of questions do you need?
- How long should the survey be?`,
    other: `
- What is the main purpose of this form?
- What information do you need to collect?
- Who will be filling this out?`,
  };
  return questions[formType] || questions.other;
}
```

### Pattern 4: Streaming Progress Indicator

**What:** Visual feedback during AI generation showing streaming content.

**When to use:** During the `generating` step when AI is outputting the form schema.

**Example:**
```typescript
// Typing indicator with animated dots
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <span className="text-sm">AI is thinking</span>
      <motion.span
        className="flex gap-0.5"
        initial="hidden"
        animate="visible"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-current"
            variants={{
              hidden: { opacity: 0.3, y: 0 },
              visible: { opacity: 1, y: -3 },
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.span>
    </div>
  );
}

// Streaming message display
function StreamingMessage({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="prose prose-sm dark:prose-invert"
    >
      {content}
      <motion.span
        className="inline-block w-0.5 h-4 bg-primary ml-0.5"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </motion.div>
  );
}
```

### Pattern 5: Cancel Without Losing Context

**What:** Allow cancellation during generation while preserving conversation history.

**When to use:** Required by UX-04, UX-05.

**Example:**
```typescript
function GeneratingStep({
  onCancel,
  messages,
  status,
  stop,
}: GeneratingStepProps) {
  const handleCancel = () => {
    // Stop the stream
    stop();
    // Return to chat step, preserving messages
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generating Form...</CardTitle>
        <CardDescription>
          AI is creating your form based on the conversation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StreamingProgress messages={messages} />
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Pattern 6: Wizard Step Indicator

**What:** Visual progress showing current step in the wizard flow.

**When to use:** Always visible at the top of the wizard.

**Example:**
```typescript
const WIZARD_STEPS = [
  { id: 'form-type', label: 'Form Type' },
  { id: 'audience', label: 'Audience' },
  { id: 'chat', label: 'Describe' },
  { id: 'generating', label: 'Generate' },
] as const;

function WizardStepIndicator({ currentStep }: { currentStep: WizardStep }) {
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-between mb-6">
      {WIZARD_STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                isComplete && "bg-primary border-primary text-primary-foreground",
                isCurrent && "border-primary text-primary",
                !isComplete && !isCurrent && "border-muted text-muted-foreground"
              )}
            >
              {isComplete ? <CheckIcon className="w-4 h-4" /> : index + 1}
            </div>
            <span
              className={cn(
                "ml-2 text-sm",
                isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-4",
                  isComplete ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Managing chat state manually instead of using useChat:** The hook handles streaming, optimistic updates, and error states correctly. Don't rebuild this.
- **Putting structured selections after open conversation:** Users should select form type/audience FIRST to provide AI context. Don't ask these as chat questions.
- **Losing context on error/cancel:** Always preserve `messages` array. Use `setMessages` for local modifications, never clear entirely.
- **Polling for status instead of using status property:** useChat provides `status` - use it directly for UI state.
- **Mixing wizard state with chat state:** Keep wizard state (step, formType, audience) separate from useChat state (messages, status). Don't try to store wizard state in messages.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming message state | Custom SSE parsing + useState | `useChat` hook | Handles chunking, reconnection, message assembly |
| Cancel during stream | AbortController + manual fetch | `useChat.stop()` | Properly cleans up server-side resources |
| Error recovery | Try-catch + manual retry | `useChat.regenerate()` | Preserves context, handles edge cases |
| Typing indicator timing | setTimeout-based animation | Status-based conditional + motion | `status === 'submitted'` is authoritative |
| Message ID generation | uuid/nanoid | AI SDK auto-generates | Consistent with message structure |

**Key insight:** The AI SDK `useChat` hook manages the entire chat lifecycle. The only custom state needed is wizard-level state (current step, structured selections). Don't duplicate what useChat already provides.

## Common Pitfalls

### Pitfall 1: Incorrect Status Handling

**What goes wrong:** UI shows wrong state (e.g., still loading after response complete).

**Why it happens:** Using `isLoading` boolean pattern instead of the 4-value `status` enum.

**How to avoid:**
1. Use `status === 'streaming'` not a custom loading state
2. Handle all 4 statuses: `submitted`, `streaming`, `ready`, `error`
3. Show typing indicator on `submitted` (waiting for first chunk) AND `streaming`

**Warning signs:**
- Input disabled when it shouldn't be
- Stop button visible after stream ends
- Error state not clearing on retry

### Pitfall 2: Context Lost on Cancel

**What goes wrong:** User cancels generation, loses entire conversation.

**Why it happens:** Resetting state instead of just stopping stream.

**How to avoid:**
1. Call `stop()` to cancel stream, don't reset messages
2. Return to `chat` step with `messages` preserved
3. Let user continue conversation or regenerate

**Warning signs:**
- Empty chat after cancel
- "Start over" required after any cancel

### Pitfall 3: Structured Context Not Reaching AI

**What goes wrong:** AI doesn't know form type/audience, asks redundant questions.

**Why it happens:** Context passed in initial message only, or not passed at all.

**How to avoid:**
1. Pass `formType` and `audience` in `body` option of useChat
2. Server-side route includes them in system prompt
3. Verify context appears in first AI response

**Warning signs:**
- AI asking "What type of form?" after user selected it
- Generated forms don't match selected type/audience

### Pitfall 4: Wizard Navigation Broken

**What goes wrong:** Back button takes user to wrong step, or loses data.

**Why it happens:** Step transitions not preserving previous selections.

**How to avoid:**
1. Store all selections in wizard state: `{ formType, audience }`
2. Going back preserves values (pre-fill selections)
3. Going forward validates current step before advancing

**Warning signs:**
- Selections cleared when going back
- Can skip steps without completing them

### Pitfall 5: Stop() Not Working (Known AI SDK Issue)

**What goes wrong:** Clicking stop doesn't actually stop the stream.

**Why it happens:** Known issue with `useChat.stop()` and `DefaultChatTransport` in some scenarios.

**How to avoid:**
1. Don't use `resume: true` option (incompatible with stop)
2. Test stop functionality thoroughly
3. Have fallback UX if stream continues (show spinner, disable further input)
4. Server-side: Pass `abortSignal: req.signal` to `streamText`

**Warning signs:**
- Stream continues after stop() called
- Server-side logs show continued generation

## Code Examples

Verified patterns from official sources:

### Complete Wizard Container

```typescript
// src/components/ai-wizard/AIFormWizard.tsx
'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { FormTypeStep } from './steps/FormTypeStep';
import { AudienceStep } from './steps/AudienceStep';
import { ChatStep } from './steps/ChatStep';
import { GeneratingStep } from './steps/GeneratingStep';
import { WizardStepIndicator } from './WizardStepIndicator';
import { Card } from '@/components/ui/card';

type FormType = 'application' | 'feedback' | 'registration' | 'survey' | 'other';
type Audience = 'external' | 'internal';
type WizardStep = 'form-type' | 'audience' | 'chat' | 'generating';

interface WizardState {
  step: WizardStep;
  formType: FormType | null;
  audience: Audience | null;
}

interface AIFormWizardProps {
  apiKey: string;
  onComplete: (schema: unknown) => void;
  onCancel: () => void;
}

export function AIFormWizard({ apiKey, onComplete, onCancel }: AIFormWizardProps) {
  const [wizard, setWizard] = useState<WizardState>({
    step: 'form-type',
    formType: null,
    audience: null,
  });

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/generate',
      headers: { 'X-API-Key': apiKey },
      body: {
        formType: wizard.formType,
        audience: wizard.audience,
      },
    }),
  });

  const handleFormTypeSelect = (formType: FormType) => {
    setWizard(prev => ({ ...prev, formType, step: 'audience' }));
  };

  const handleAudienceSelect = (audience: Audience) => {
    setWizard(prev => ({ ...prev, audience, step: 'chat' }));
  };

  const handleBack = () => {
    if (wizard.step === 'audience') {
      setWizard(prev => ({ ...prev, step: 'form-type' }));
    } else if (wizard.step === 'chat') {
      setWizard(prev => ({ ...prev, step: 'audience' }));
    } else if (wizard.step === 'generating') {
      stop();
      setWizard(prev => ({ ...prev, step: 'chat' }));
    }
  };

  const handleCancelGeneration = () => {
    stop();
    setWizard(prev => ({ ...prev, step: 'chat' }));
    // Messages preserved - user can continue or modify
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <WizardStepIndicator currentStep={wizard.step} />

      {wizard.step === 'form-type' && (
        <FormTypeStep
          value={wizard.formType}
          onSelect={handleFormTypeSelect}
          onCancel={onCancel}
        />
      )}

      {wizard.step === 'audience' && (
        <AudienceStep
          value={wizard.audience}
          onSelect={handleAudienceSelect}
          onBack={handleBack}
        />
      )}

      {wizard.step === 'chat' && (
        <ChatStep
          messages={messages}
          status={status}
          error={error}
          onSendMessage={sendMessage}
          onStop={stop}
          onRegenerate={regenerate}
          onBack={handleBack}
          formType={wizard.formType!}
          audience={wizard.audience!}
        />
      )}

      {wizard.step === 'generating' && (
        <GeneratingStep
          messages={messages}
          status={status}
          onCancel={handleCancelGeneration}
          onComplete={onComplete}
        />
      )}
    </Card>
  );
}
```

### Form Type Selection Step

```typescript
// src/components/ai-wizard/steps/FormTypeStep.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileTextIcon,
  MessageSquareIcon,
  CalendarIcon,
  ClipboardListIcon,
  PlusCircleIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FORM_TYPES = [
  { id: 'application', label: 'Application', icon: FileTextIcon, description: 'Collect applications for opportunities' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareIcon, description: 'Gather feedback and opinions' },
  { id: 'registration', label: 'Registration', icon: CalendarIcon, description: 'Event or program sign-ups' },
  { id: 'survey', label: 'Survey', icon: ClipboardListIcon, description: 'Research and data collection' },
  { id: 'other', label: 'Other', icon: PlusCircleIcon, description: 'Something different' },
] as const;

type FormType = typeof FORM_TYPES[number]['id'];

interface FormTypeStepProps {
  value: FormType | null;
  onSelect: (type: FormType) => void;
  onCancel: () => void;
}

export function FormTypeStep({ value, onSelect, onCancel }: FormTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">What type of form do you need?</h2>
        <p className="text-muted-foreground mt-1">
          Select the category that best matches your form
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORM_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.id;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border text-left transition-colors",
                "hover:border-primary hover:bg-accent",
                isSelected && "border-primary bg-accent"
              )}
            >
              <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-muted-foreground">{type.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => value && onSelect(value)} disabled={!value}>
          Continue
        </Button>
      </div>
    </div>
  );
}
```

### Chat Step with Status Handling

```typescript
// src/components/ai-wizard/steps/ChatStep.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '../ChatMessage';
import { TypingIndicator } from '../TypingIndicator';
import { ArrowLeftIcon, SendIcon, StopCircleIcon, RefreshCwIcon } from 'lucide-react';
import type { UIMessage } from 'ai';

interface ChatStepProps {
  messages: UIMessage[];
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  error: Error | undefined;
  onSendMessage: (options: { text: string }) => void;
  onStop: () => void;
  onRegenerate: () => void;
  onBack: () => void;
  formType: string;
  audience: string;
}

export function ChatStep({
  messages,
  status,
  error,
  onSendMessage,
  onStop,
  onRegenerate,
  onBack,
  formType,
  audience,
}: ChatStepProps) {
  const [input, setInput] = useState('');

  const isProcessing = status === 'submitted' || status === 'streaming';
  const isReady = status === 'ready';
  const hasError = status === 'error';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isReady) {
      onSendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Context banner */}
      <div className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 mb-4">
        Creating a <span className="font-medium">{formType}</span> form for{' '}
        <span className="font-medium">{audience === 'external' ? 'external users' : 'internal team'}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Describe what you want in your form and the AI will help you build it.
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isStreaming={status === 'streaming' && message === messages[messages.length - 1]}
          />
        ))}

        {isProcessing && messages[messages.length - 1]?.role !== 'assistant' && (
          <TypingIndicator />
        )}
      </div>

      {/* Error state */}
      {hasError && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 my-2 flex items-center justify-between">
          <span className="text-sm">Something went wrong. Please try again.</span>
          <Button variant="ghost" size="sm" onClick={onRegenerate}>
            <RefreshCwIcon className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your form or answer the AI's questions..."
          disabled={isProcessing}
          className="min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack} type="button">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="flex gap-2">
            {isProcessing && (
              <Button variant="outline" onClick={onStop} type="button">
                <StopCircleIcon className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}
            <Button type="submit" disabled={!input.trim() || isProcessing}>
              <SendIcon className="w-4 h-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
```

### Typing Indicator with Animation

```typescript
// src/components/ai-wizard/TypingIndicator.tsx
import { motion } from 'motion/react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground"
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-sm">AI is thinking...</span>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `isLoading` boolean | `status` enum ('submitted' \| 'streaming' \| 'ready' \| 'error') | AI SDK v5+ | More granular UI state control |
| Input managed by useChat | External input state + `sendMessage` | AI SDK v5+ | More flexibility in form handling |
| Manual message format | `UIMessage` with `parts` array | AI SDK v5+ | Supports text, files, tool calls in single message |
| `handleSubmit` function | `sendMessage` function | AI SDK v5+ | Clearer naming, same functionality |

**Deprecated/outdated:**
- `handleInputChange`, `input` from useChat: Now use external state
- Single `content` string on messages: Now use `parts` array
- `isLoading` boolean: Use `status` enum instead

## Open Questions

Things that couldn't be fully resolved:

1. **Known issue with useChat.stop()**
   - What we know: There's a documented issue where stop() may not cancel streams in all scenarios
   - What's unclear: Whether this affects the current AI SDK version with DefaultChatTransport
   - Recommendation: Test thoroughly, have fallback UX if stream continues, ensure server passes abortSignal

2. **Optimal number of clarifying questions**
   - What we know: Requirements say "at most 2-3 questions"
   - What's unclear: Whether AI will reliably follow this instruction
   - Recommendation: Include explicit instruction in system prompt, test with various inputs

3. **Detecting form schema in stream**
   - What we know: AI will output JSON form schema in response
   - What's unclear: Best way to detect when AI is generating schema vs asking questions
   - Recommendation: Use specific markers in prompt ("START_FORM_SCHEMA" prefix), or parse partial JSON

## Sources

### Primary (HIGH confidence)
- [AI SDK UI: useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) - Complete hook API
- [AI SDK UI: Chatbot Guide](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot) - Implementation patterns
- [AI SDK: Stopping Streams](https://ai-sdk.dev/docs/advanced/stopping-streams) - Cancel functionality
- [Vercel Academy: Basic Chatbot](https://vercel.com/academy/ai-sdk/basic-chatbot) - End-to-end tutorial

### Secondary (MEDIUM confidence)
- [The Shape of AI](https://www.shapeof.ai/) - AI UX patterns for clarifying questions, progress
- [Chat UX Best Practices](https://getstream.io/blog/chat-ux/) - General chat UX patterns
- [Wizard UI Design Best Practices](https://lollypop.design/blog/2026/january/wizard-ui-design/) - Wizard progress indicators

### Codebase Analysis (HIGH confidence)
- Phase 25 research and implementation - AI infrastructure patterns
- Existing shadcn/ui components - UI building blocks
- `dynamic-form-store.ts` - Zustand patterns for wizard state
- `motion` usage in `animated-page.tsx` - Animation patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed, patterns verified with official docs
- Architecture: HIGH - useChat hook fully documented, wizard pattern straightforward
- Pitfalls: MEDIUM - Known stop() issues require testing, clarifying question count needs validation

**Research date:** 2026-02-03
**Valid until:** 30 days (AI SDK evolving rapidly, verify useChat API before implementation)
