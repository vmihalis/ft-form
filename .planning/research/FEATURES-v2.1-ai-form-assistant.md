# Feature Landscape: AI Form Creation Assistant

**Domain:** AI-powered form generation for admin dashboard
**Researched:** 2026-02-03
**Confidence:** MEDIUM (based on industry patterns + official documentation)

## Table Stakes

Features users expect from AI form creation assistants. Missing these would make the feature feel incomplete or broken.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Natural language input** | Core value prop — users describe forms conversationally | Medium | None (new UI) | "Create a feedback form for floor events" should work |
| **Context-aware generation** | AI should understand FT-specific terms (floors, leads, etc.) | Medium | System prompt engineering | Must know floor names, building context, common form types |
| **Field type mapping** | AI correctly selects appropriate field types | Low | Existing 8 field types | Email questions → email field, dates → date picker, etc. |
| **Multi-step awareness** | Generate logical step groupings, not one giant list | Medium | Existing FormSchema steps | Common pattern: Personal info → Details → Logistics |
| **Preview before creation** | Show what will be generated before committing | Low | Existing WYSIWYG builder | Display generated schema in builder preview mode |
| **Edit after generation** | Generated forms are editable in existing builder | Low | Form builder store | AI output feeds into existing `useFormBuilderStore` |
| **Regeneration option** | "Try again" with same/modified prompt | Low | State management | Keep prompt history for retry |
| **Loading state feedback** | Show progress during generation (3-10s) | Low | UI state | Streaming text, skeleton, or progress indicator |
| **Error handling** | Graceful failures with actionable messages | Low | Error boundaries | "I couldn't understand that. Try describing the form's purpose more clearly." |
| **Validation questions count** | Sanity check: "This will create 15 fields. Continue?" | Low | Post-generation check | Prevents accidentally massive forms |

## Differentiators

Features that set the AI assistant apart. Not universally expected, but valued when present.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Hybrid clarifying questions** | Structured first (dropdowns), then open-ended | Medium | Chat UI component | Reduces ambiguity while feeling conversational |
| **Structured pre-questions** | "What type of form?" dropdown before free-form | Low | New UI flow | Form type → Application, Feedback, Registration, Survey, Other |
| **Frontier Tower context injection** | AI knows floor names, building purpose, past form patterns | Medium | System prompt + context | Can suggest "Add floor selection?" without being asked |
| **Smart defaults** | Pre-fill settings based on form type | Low | Form type detection | Feedback forms: shorter success message; Applications: longer review flow |
| **Confidence-based workflow** | Direct-to-draft vs. preview based on user preference | Low | UI toggle | "I'm confident" checkbox skips preview step |
| **Form purpose detection** | Infer whether internal (team) vs external (applicants) | Medium | NLP analysis | Affects validation strictness, required fields |
| **Suggested field additions** | "You might also want to ask about X" | Medium | Post-generation analysis | Based on form type patterns |
| **Answer piping preview** | Show how collected data flows through form | High | Conditional logic (future) | "If they select 'Other floor', show text field" |
| **Iterative refinement chat** | "Add an email field" → updates in place | High | Streaming + state sync | Conversation continues to modify generated form |
| **Voice input option** | Dictate form description | Medium | Browser Speech API | Accessibility benefit, faster for some users |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain that would hurt the product.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Fully autonomous creation** | Users lose control, may create unusable forms | Always preview before commit, require human confirmation |
| **AI editing existing forms** | Risk of data loss, unexpected changes to live forms | AI only creates NEW drafts; editing uses existing WYSIWYG builder |
| **Automatic publishing** | Publishing without review could expose broken forms | AI creates drafts only; publishing requires explicit action |
| **Over-complicated conversation** | 10-question interview feels like another form | Max 2-3 clarifying questions before generation |
| **Magic slug generation** | Auto-generated slugs often poor (timestamps, hashes) | Always require human to set/confirm URL slug |
| **Template library bloat** | "1000 templates" becomes paradox of choice | Recommend based on context, not browse library |
| **Persistent conversation history** | Chat logs become privacy/storage concern | Session-only; regenerate from scratch if needed |
| **Real-time streaming to builder** | Partial forms are confusing, harder to undo | Generate complete schema, then show final result |
| **AI-driven conditional logic** | Too complex for first iteration, error-prone | v2.1 generates flat forms; conditional logic is future v2.2 feature |
| **Natural language form filling** | Scope creep — this is form CREATION, not filling | Public form renderer stays as-is; AI only helps admins build |

## Feature Dependencies

Dependency mapping showing how AI features relate to existing capabilities.

```
NEW: AI Form Assistant
    ├── USES: FormSchema type (form-schema.ts)
    │   └── Must output valid { steps, settings } structure
    ├── USES: useFormBuilderStore (form-builder-store.ts)
    │   └── Generated schema initializes builder state
    ├── USES: forms.create mutation (convex/forms.ts)
    │   └── Creates draft form from AI output
    ├── USES: Existing field types (8 types)
    │   └── AI maps descriptions to: text, email, textarea, number, date, select, checkbox, file
    └── NEW: Chat/conversation UI
        ├── NEW: Clarifying questions flow
        ├── NEW: Generation loading state
        └── NEW: Preview/confirm step
```

## MVP Recommendation

For the AI Form Creation Assistant MVP, prioritize:

### Must Have (Table Stakes)

1. **Natural language input** — Single text area where admin describes desired form
2. **Context-aware generation** — System prompt includes FT-specific context
3. **Preview before creation** — Show generated schema in read-only view before committing
4. **Edit after generation** — "Edit in Builder" button opens existing WYSIWYG editor
5. **Regenerate option** — "Try again" regenerates with same prompt

### Should Have (Key Differentiators)

6. **Hybrid clarifying questions** — 2-3 structured questions before open prompt
   - Form type: Application / Feedback / Registration / Survey / Other
   - Audience: Internal (team) / External (applicants/members)
7. **Frontier Tower context** — AI knows floors, building purpose
8. **Direct-to-draft toggle** — Skip preview for confident users

### Defer to v2.2+

- Iterative refinement chat (continue conversation to modify)
- Voice input
- Answer piping / conditional logic suggestions
- AI-powered form analytics

## User Flow Recommendation

Based on research, the optimal flow for FrontierOS:

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Entry Point                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Forms List → "+ New Form" dropdown:                    ││
│  │    • Create Manually (existing flow)                    ││
│  │    • Create with AI Assistant (new)                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Structured Pre-Questions (hybrid approach)         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  "What kind of form do you need?"                       ││
│  │  [ ] Application (collecting detailed proposals)        ││
│  │  [ ] Feedback (gathering opinions/ratings)              ││
│  │  [ ] Registration (event signups, RSVPs)                ││
│  │  [ ] Survey (research, polling)                         ││
│  │  [ ] Other (describe below)                             ││
│  │                                                         ││
│  │  "Who will fill out this form?"                         ││
│  │  [ ] External (public applicants, members)              ││
│  │  [ ] Internal (FT team, floor leads)                    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Open-Ended Description                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  "Describe your form in detail"                         ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ I need a form for floor leads to submit monthly     │││
│  │  │ reports. It should ask about events held, member    │││
│  │  │ engagement, challenges faced, and plans for next    │││
│  │  │ month. Include their floor and contact info.        │││
│  │  └─────────────────────────────────────────────────────┘││
│  │                                                         ││
│  │  [ ] I'm confident — skip preview and create draft      ││
│  │                                                         ││
│  │              [Generate Form]                            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4a: Preview (if not skipped)                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  "Here's what I'll create:"                             ││
│  │                                                         ││
│  │  Step 1: Contact Information                            ││
│  │    • Floor (dropdown) — required                        ││
│  │    • Name (text) — required                             ││
│  │    • Email (email) — required                           ││
│  │                                                         ││
│  │  Step 2: Monthly Report                                 ││
│  │    • Events held this month (textarea)                  ││
│  │    • Member engagement highlights (textarea)            ││
│  │    • Challenges faced (textarea)                        ││
│  │                                                         ││
│  │  Step 3: Planning                                       ││
│  │    • Plans for next month (textarea)                    ││
│  │    • Support needed from FT team (textarea)             ││
│  │                                                         ││
│  │  [Regenerate]  [Edit in Builder]  [Create as Draft]     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┴──────────────────┐
           ▼                                     ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  Step 4b: Edit in Builder│      │  Step 5: Draft Created   │
│  (existing WYSIWYG)      │      │  ┌──────────────────────┐│
│                          │      │  │ "Monthly Report" saved││
│  User makes manual tweaks│      │  │ as draft. Ready to   ││
│  → Save → Publish        │      │  │ publish when ready.  ││
└──────────────────────────┘      │  │                      ││
                                  │  │ [Edit] [Publish]     ││
                                  │  └──────────────────────┘│
                                  └──────────────────────────┘
```

## Complexity Assessment

| Feature | Frontend Effort | Backend/AI Effort | Total | Notes |
|---------|-----------------|-------------------|-------|-------|
| Chat UI component | Medium | N/A | Medium | New component, but straightforward |
| Structured questions | Low | N/A | Low | Dropdowns, radio buttons |
| Open-ended prompt input | Low | N/A | Low | Textarea with character counter |
| LLM integration | Low | High | High | API calls, prompt engineering, error handling |
| FT context injection | N/A | Medium | Medium | System prompt with building/floor context |
| Preview component | Medium | N/A | Medium | Read-only schema visualization |
| Schema generation | N/A | High | High | Mapping natural language to FormSchema |
| Regeneration | Low | Low | Low | Re-call LLM with same inputs |
| Edit transition | Low | N/A | Low | Pass schema to existing builder |
| Direct-to-draft | Low | N/A | Low | UI toggle, skip preview step |

**Overall MVP Complexity: MEDIUM-HIGH**
- Frontend: New chat UI, but leverages existing builder
- Backend: LLM integration is main complexity — prompt engineering, schema validation, error handling
- Risk: Schema generation quality — may need iteration on prompts

## Real-World Examples

### Jotform AI Form Builder
- Conversational chatbot interface
- Post-generation refinement via chat ("change colors", "add field")
- Integrated with 7,000+ templates
- Source: [Jotform AI Form Builder](https://www.jotform.com/ai/form-builder/)

### WPForms AI
- "Generate With AI" alternative to template selection
- Natural language description → instant form
- "Refine through natural conversation to add fields"
- AI Choices feature for generating dropdown options
- Source: [WPForms AI](https://wpforms.com/features/wpforms-ai/)

### Weavely
- Conversational interface with voice input option
- Auto-generates conditional logic from descriptions
- PDF/document upload converts to form
- Source: [Weavely Blog](https://www.weavely.ai/blog/top-ai-form-builders)

### involve.me
- 4-step process: Prompt → Template selection → Customize → Publish
- Brand extraction from website URL
- AI Insights for response analysis
- Source: [involve.me AI Form Generator](https://www.involve.me/ai-form-generator)

### Fillout
- Brand-aware generation (upload logo → match colors)
- Preview without signup
- Source: [Weavely comparison](https://www.weavely.ai/blog/top-ai-form-builders)

### Key UX Patterns from Research

1. **Progressive disclosure** — Start with structured choices, then open-ended
2. **Confidence hints** — "I can help with X, Y, or Z" sets expectations
3. **Graceful error recovery** — Clarifying questions instead of "invalid input"
4. **Iterative refinement** — Treat AI output as starting point, not final product
5. **Human-in-the-loop** — Always preview/confirm before committing changes

Sources:
- [Shape of AI - UX Patterns](https://www.shapeof.ai/)
- [Botpress - Conversational AI Design](https://botpress.com/blog/conversation-design)
- [Sendbird - AI Conversational Forms](https://sendbird.com/developer/tutorials/ai-conversational-forms)
- [Parallel HQ - UX for AI Chatbots](https://www.parallelhq.com/blog/ux-ai-chatbots)

## Open Questions

1. **LLM Provider** — OpenAI, Anthropic, or other? (Affects API design, costs)
2. **Rate Limiting** — How many generations per day/user?
3. **Prompt Persistence** — Save successful prompts as "recipes" for similar forms?
4. **Multi-language** — AI can generate forms in other languages (future consideration)
5. **Generation Quality Metrics** — How to measure if AI is producing good forms?
