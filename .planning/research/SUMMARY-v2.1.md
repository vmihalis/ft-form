# Project Research Summary

**Project:** FrontierOS v2.1 - AI Form Creation Assistant
**Domain:** AI-powered natural language form generation
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

v2.1 adds an AI-powered form creation assistant to FrontierOS, enabling admins to describe forms in natural language and have them generated automatically. The research confirms this is achievable with minimal stack additions (3 packages) and clean integration with the existing form builder.

**Key insight:** The hybrid approach (structured pre-questions + open-ended description) is the recommended UX pattern. It reduces ambiguity while feeling conversational, and caps clarifying questions at 2-3 to avoid user fatigue. The AI generates a complete schema for preview, then admins can edit in the existing WYSIWYG builder.

**Architecture decision:** Use Next.js API routes for AI streaming (not Convex actions) because Convex cannot stream responses. AI generates FormSchema JSON that feeds directly into existing form creation mutations.

**Critical risk:** Schema incompatibility. The LLM must output schemas matching the exact FormSchema structure (10 field types, specific validation properties, exact option formats). Every response must be validated with Zod before display or creation.

## Key Findings

### Recommended Stack

**Only 3 new dependencies required:**

| Package | Version | Purpose |
|---------|---------|---------|
| `ai` | ^6.0.69 | Vercel AI SDK - streaming, structured output |
| `@ai-sdk/react` | ^3.0.71 | React hooks (`useChat`) for chat UI |
| `@openrouter/ai-sdk-provider` | ^2.1.1 | Official OpenRouter provider |

```bash
pnpm add ai @ai-sdk/react @openrouter/ai-sdk-provider
```

**Existing stack suffices for everything else:**
- Zod (already installed) for schema validation
- Convex for form persistence (existing mutations)
- shadcn/ui for chat UI components
- motion for typing indicators and transitions

### Expected Features

**Table stakes (must have):**
- Natural language input with context-aware generation
- Preview before creation with regeneration option
- Edit after generation in existing WYSIWYG builder
- Streaming responses with typing indicator
- Error handling with actionable messages

**Key differentiators:**
- Hybrid clarifying questions (structured type/audience first, then open-ended)
- Deep Frontier Tower context (floors, member types, form patterns)
- Direct-to-draft toggle for confident users
- FT-specific field suggestions (floor dropdown, dietary restrictions for events)

**Anti-features to avoid:**
- AI editing existing forms (risk of data loss)
- Automatic publishing (always require human review)
- More than 2-3 clarifying questions before generating
- Persistent conversation history (session-only)

### Architecture Approach

```
User Prompt
    ↓
Next.js API Route (/api/ai/generate)
    ↓ (OpenRouter streaming)
AI generates FormSchema JSON
    ↓
Client preview (reuse existing components)
    ↓
Convex mutation (forms.create)
    ↓
Redirect to builder or form list
```

**Key integration points:**
- AI output validated against existing FormSchema Zod type
- Generated schemas feed into existing `useFormBuilderStore`
- Preview uses existing `DynamicStepContent` components
- Form creation uses existing Convex mutations

### Critical Pitfalls

1. **Schema Incompatibility (CRIT-1)** — LLM generates field types that don't exist or wrong property shapes. Must validate every response with Zod schemas matching exact FormSchema interface.

2. **Multi-Turn Context Degradation (CRIT-2)** — Performance drops 40% in long conversations. Maintain structured state summary, cap conversation at 5-7 turns.

3. **Feature Hallucination (CRIT-3)** — LLM assumes conditional logic, multi-column layouts exist. Include explicit NOT AVAILABLE list in system prompt.

4. **Immutable Version Integrity (CRIT-4)** — AI must never modify published forms. Always create new drafts only.

5. **Clarifying Question Fatigue (MOD-1)** — Too many questions defeats the purpose. Generate draft first, refine after. Max 2-3 questions.

## Implications for Roadmap

Based on research, recommended 4-phase structure:

### Phase 25: Core AI Infrastructure
**Goal:** Working AI endpoint that returns valid form schemas

- Install AI dependencies
- Create `/api/ai/generate` route with OpenRouter
- Define Zod schemas for AI output matching FormSchema
- System prompt with FT context and field type constraints
- Schema validation and error handling
- Test with curl/Postman before UI

**Addresses:** Schema compatibility (CRIT-1), feature hallucination (CRIT-3)

### Phase 26: Chat UI & Conversation Flow
**Goal:** Conversational interface for form creation

- Build AIChat component with useChat hook
- Streaming response rendering with typing indicator
- Structured pre-questions (form type, audience)
- Open-ended description textarea
- Conversation state management with state summary
- Direct-to-draft toggle

**Addresses:** Context degradation (CRIT-2), question fatigue (MOD-1), loading UX

### Phase 27: Form Generation & Preview
**Goal:** Generate and preview forms before creation

- Schema extraction from AI responses (tool calls)
- FormPreviewPanel using existing components
- Regeneration with prompt modification
- Validation feedback display
- FT context injection (floor dropdown, patterns)
- Step structure guidelines (2-4 fields per step)

**Addresses:** FT context integration, preview workflow

### Phase 28: Integration & Polish
**Goal:** Complete workflow integrated into admin dashboard

- Entry point: "Create with AI" option on /admin/forms/new
- AIFormWizard wrapper with step navigation
- Form metadata input (name, slug) with collision detection
- Convex integration for form creation
- Redirect to builder after creation
- Error boundaries and edge case handling
- Mobile responsiveness

**Addresses:** Immutable versioning (CRIT-4), production readiness

### Phase Ordering Rationale

- **Infrastructure before UI:** API route must work before building chat interface
- **Chat before generation:** Conversation flow needed before schema extraction
- **Generation before integration:** Preview must work before wiring to form creation
- **Integration last:** Connects everything into production workflow

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official OpenRouter provider for AI SDK, versions verified via npm 2026-02-03 |
| Features | HIGH | Patterns consistent across Jotform, WPForms, involve.me, Weavely research |
| Architecture | HIGH | Hybrid approach (Next.js API + Convex) leverages each system's strengths |
| Pitfalls | HIGH | Multi-turn degradation backed by 2025-2026 research papers, schema risks verified against codebase |

### Gaps to Address During Planning

1. **System prompt refinement** — Initial prompt provided, will need iteration based on output quality
2. **Model selection** — Start with Claude Sonnet 4 via OpenRouter, tune based on cost/quality
3. **Rate limiting strategy** — Recommend 20 req/min/user, but exact policy TBD
4. **Conversation persistence** — Research says skip for v2.1, but may need if users request "resume"

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)
- [@openrouter/ai-sdk-provider npm](https://www.npmjs.com/package/@openrouter/ai-sdk-provider)
- [OpenRouter API Documentation](https://openrouter.ai/docs/api/reference/overview)
- [LLMs Get Lost In Multi-Turn Conversation](https://arxiv.org/html/2505.06120v1)
- [Structured Output AI Reliability Guide](https://www.cognitivetoday.com/2025/10/structured-output-ai-reliability/)

### Secondary (MEDIUM confidence)
- [Jotform AI Form Builder](https://www.jotform.com/ai/form-builder/)
- [WPForms AI Features](https://wpforms.com/features/wpforms-ai/)
- [involve.me AI Form Generator](https://www.involve.me/ai-form-generator)
- [Sendbird: AI Conversational Forms](https://sendbird.com/developer/tutorials/ai-conversational-forms)
- [PromptHub: Multi-Turn Conversation Failures](https://www.prompthub.us/blog/why-llms-fail-in-multi-turn-conversations-and-how-to-fix-it)

### Codebase Analysis
- `src/types/form-schema.ts` — Exact FormSchema type definition
- `convex/schema.ts` — Database schema with immutable formVersions
- `src/lib/stores/form-builder-store.ts` — Zustand store for builder state
- `convex/forms.ts` — Existing form CRUD mutations
- `.planning/research/FT-CONTEXT.md` — Comprehensive Frontier Tower context

---
*Research completed: 2026-02-03*
*Ready for roadmap: yes*
