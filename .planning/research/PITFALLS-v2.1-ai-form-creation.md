# Domain Pitfalls: AI Form Creation Assistant (v2.1)

**Domain:** Adding AI-powered natural language form creation to an existing form builder system
**Researched:** 2026-02-03
**Project:** FrontierOS v2.1 AI Form Creation Assistant
**Confidence:** HIGH (verified through codebase analysis + authoritative research)

---

## Context: Existing System

The v2.1 AI Form Creation Assistant builds on an established, working form system:

**Current form builder (v2.0):**
- 10 field types: text, email, url, textarea, number, date, select, radio, checkbox, file
- Immutable versioning (submissions reference exact schema at submit time)
- WYSIWYG drag-and-drop builder with floating toolbar
- Typeform-style public form renderer at `/apply/[slug]`
- Validation rules: minLength, maxLength, min, max, pattern, customMessage
- Step-based multi-section forms
- Convex real-time backend with JSON schema storage

**What v2.1 adds:**
- Natural language prompts to generate forms
- Hybrid clarifying questions (structured + open-ended)
- Frontier Tower context awareness
- Preview before creation with regeneration option
- Direct-to-draft for confident users

---

## Critical Pitfalls

High-impact mistakes that cause rewrites, data corruption, or major integration failures.

---

### Pitfall 1: Schema Incompatibility with Existing Field Types

**What goes wrong:** The LLM generates field types, validation rules, or option formats that don't match the existing form schema structure, causing forms to fail at runtime or break the form renderer.

**Why it happens:**
- LLMs are trained on generic form structures, not your specific schema
- The existing system has 10 specific field types with exact property shapes
- LLM may generate `"type": "phone"` when only `"type": "text"` with pattern validation exists
- LLM may output different property names (e.g., `"choices"` instead of `"options"`)

**Consequences:**
- Generated forms fail validation when saved to Convex
- Form renderer crashes on unknown field types
- Silent data corruption if fields parse but render incorrectly
- User confusion when "generated" form doesn't work

**Warning signs:**
- Any field type not in: `text`, `email`, `url`, `textarea`, `number`, `date`, `select`, `radio`, `checkbox`, `file`
- Missing required properties like `id`, `label`, `required`
- Options without both `value` and `label` properties
- Validation properties not matching `FieldValidation` interface

**Prevention strategy:**
1. **Define Zod schema for LLM output** that exactly mirrors `FormSchema` type
2. **Use structured output mode** (OpenRouter supports `response_format` for JSON)
3. **Validate every LLM response** before storing or displaying
4. **Provide exact TypeScript types** in the system prompt
5. **Include exhaustive examples** of every field type in the prompt

**Which phase should address:** Phase 1 (Core AI Infrastructure) - This must be built into the foundation.

**Code reference:** See `/Users/memehalis/ft-form/src/types/form-schema.ts`:
```typescript
export type FieldType =
  | "text" | "email" | "url" | "textarea" | "number"
  | "date" | "select" | "radio" | "checkbox" | "file";

export interface FieldOption {
  value: string;  // Must have both
  label: string;  // Must have both
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;  // For number fields only
  max?: number;  // For number fields only
  pattern?: string;
  customMessage?: string;
}
```

---

### Pitfall 2: Field ID Collision and Non-Uniqueness

**What goes wrong:** LLM generates duplicate field IDs or IDs that conflict with reserved system identifiers, causing form submission data to overwrite or disappear.

**Why it happens:**
- LLMs may use semantic IDs like `"name"`, `"email"` that seem natural but may collide
- Multiple fields asking about similar concepts get similar IDs
- LLM doesn't track what IDs it has already used in the conversation

**Consequences:**
- Submission data silently overwrites (only last field value saved)
- Form builder crashes on duplicate IDs
- Data integrity violations in immutable version snapshots
- Impossible to correlate submissions with correct fields

**Warning signs:**
- IDs without unique prefixes or suffixes
- Multiple fields with IDs like `name_1`, `name_2` (indicates LLM is trying to deduplicate)
- IDs matching existing field IDs from other forms

**Prevention strategy:**
1. **Generate UUIDs server-side** instead of letting LLM create IDs
2. **Post-process LLM output** to add unique prefixes (`field_${nanoid()}`)
3. **Validate uniqueness** before accepting the schema
4. **If LLM generates IDs**, use format like `{step}_{semantic_name}_{index}`

**Which phase should address:** Phase 1 - Must be in schema post-processing logic.

---

### Pitfall 3: Immutable Version Integrity Violation

**What goes wrong:** AI-generated forms bypass the immutable versioning system, allowing schemas to change after submissions exist against them.

**Why it happens:**
- The existing system creates immutable `formVersions` on publish
- AI might directly update `draftSchema` in ways that don't trigger versioning
- Confusion between "generate new form" vs "update existing form"
- Regeneration requests might overwrite rather than create new version

**Consequences:**
- Submissions become orphaned (reference non-existent schema)
- Historical data becomes uninterpretable
- Compliance/audit issues for form data
- Impossible to reconstruct what users actually submitted against

**Warning signs:**
- Any code path that modifies `draftSchema` without user confirmation
- "Regenerate" flows that don't create new forms
- Direct updates to published forms

**Prevention strategy:**
1. **AI always creates NEW drafts** - never modifies existing published forms
2. **Clear UI distinction** between "Create new form" and "Edit existing"
3. **Regeneration creates sibling form** with incremented name, not in-place update
4. **Block AI modifications** if form has any submissions

**Which phase should address:** Phase 2 (Chat UI) - Must be enforced in the action handlers.

**Code reference:** See `/Users/memehalis/ft-form/convex/schema.ts`:
```typescript
// formVersions are IMMUTABLE - AI must never modify these
formVersions: defineTable({
  formId: v.id("forms"),
  version: v.number(),
  schema: v.string(),  // IMMUTABLE once created
  publishedAt: v.number(),
})
```

---

### Pitfall 4: Multi-Turn Context Degradation

**What goes wrong:** As the conversation continues, the LLM "forgets" earlier decisions, contradicts itself, or generates schemas that ignore previous clarifications.

**Why it happens:**
- LLMs are stateless - performance degrades as context grows ([research shows 40% performance drops](https://arxiv.org/html/2505.06120v1))
- Each turn adds tokens, pushing earlier context out of effective attention
- LLMs tend to "stick to earlier answers" even when new info contradicts them
- Verbose intermediate responses muddy the context

**Consequences:**
- Final form doesn't match what user requested
- LLM ignores corrections ("No, I said 5 fields, not 10")
- Repeated clarifying questions about already-answered topics
- Regeneration produces wildly different results than expected

**Warning signs:**
- User says "That's not what I asked for"
- LLM asks same clarifying question twice
- Field count or structure changes unexpectedly between turns
- Longer conversations produce worse results

**Prevention strategy:**
1. **Maintain structured state summary** injected at each turn
2. **Limit conversation depth** - suggest "start fresh" after 5-7 turns
3. **Use explicit confirmation checkpoints** - lock in decisions
4. **Keep a separate "decisions log"** that persists across turns:
   ```json
   {
     "formName": "Event Registration",
     "confirmedFields": ["name", "email", "event_selection"],
     "pendingDecisions": ["dietary restrictions format"]
   }
   ```
5. **Consider single-turn generation** with all context upfront after clarification

**Which phase should address:** Phase 2 (Chat UI) - Critical for conversation management.

**Sources:** [PromptHub: Why LLMs Fail in Multi-Turn Conversations](https://www.prompthub.us/blog/why-llms-fail-in-multi-turn-conversations-and-how-to-fix-it), [LLMs Get Lost In Multi-Turn Conversation](https://arxiv.org/html/2505.06120v1)

---

### Pitfall 5: LLM Hallucinating Non-Existent Features

**What goes wrong:** LLM generates form schemas using features that don't exist in the system (conditional logic, multi-column layouts, rich text, etc.).

**Why it happens:**
- LLMs are trained on many form builder systems
- Typeform, Google Forms, Jotform all have features FrontierOS doesn't
- LLM assumes common features exist without verification
- PROJECT.md explicitly lists conditional logic as "Future" not "Current"

**Consequences:**
- Generated schemas have properties that are silently ignored
- Users expect features that don't work
- Forms look correct in preview but behave unexpectedly
- Support burden from "why doesn't my conditional logic work?"

**Specific features LLM might hallucinate:**
- `conditionalLogic` or `showIf` properties
- `layout: "multi-column"` or `columns: 2`
- `fieldType: "rating"` or `"slider"` or `"signature"`
- `branching` or `skipTo` logic
- `richText: true` for textarea fields
- `fileTypes` restrictions beyond pattern validation

**Warning signs:**
- Any property not in the defined interfaces
- User requests mentioning "show if", "conditional", "branching"
- Schema validation passing but form behaving unexpectedly

**Prevention strategy:**
1. **Explicit feature list in system prompt:**
   ```
   AVAILABLE FEATURES:
   - 10 field types: text, email, url, textarea, number, date, select, radio, checkbox, file
   - Required/optional per field
   - Validation: minLength, maxLength, min, max, pattern, customMessage
   - Multi-step forms with steps and fields

   NOT AVAILABLE (do not generate):
   - Conditional logic
   - Field branching
   - Multi-column layouts
   - Rating/slider fields
   - Rich text
   ```
2. **Strict schema validation** that rejects unknown properties
3. **When user requests unavailable feature**, LLM should explain limitation
4. **Suggest workarounds** ("Use separate forms for different paths")

**Which phase should address:** Phase 1 (System Prompt Design) and Phase 3 (Validation).

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or poor user experience.

---

### Pitfall 6: Inadequate Streaming/Loading UX

**What goes wrong:** User stares at a loading spinner for 10-30 seconds while LLM generates, with no feedback, then either times out or user abandons.

**Why it happens:**
- LLM generation takes 5-30 seconds for complex schemas
- Non-streaming requests block until complete
- No progress indication makes users think it's broken
- OpenRouter/upstream timeouts may not be handled gracefully

**Consequences:**
- Users refresh page mid-generation, losing work
- Duplicate form creation from retry attempts
- Poor perception of AI feature ("it's slow and buggy")
- Wasted API credits on abandoned requests

**Warning signs:**
- Any loading state > 3 seconds without progress indication
- Users reporting "it just spins forever"
- High rate of incomplete/abandoned AI generations

**Prevention strategy:**
1. **Use streaming responses** via Vercel AI SDK's `useChat` hook
2. **Show typing indicator** while awaiting first token
3. **Stream intermediate steps** ("Analyzing request...", "Generating fields...")
4. **Set explicit timeouts** with user-friendly error messages
5. **Allow cancellation** and preserve conversation state

**Which phase should address:** Phase 2 (Chat UI Implementation).

**Sources:** [Vercel AI SDK Streaming Guide](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/)

---

### Pitfall 7: Clarifying Questions That Never End

**What goes wrong:** The AI asks too many clarifying questions before generating, frustrating users who just want a quick form.

**Why it happens:**
- System prompt over-emphasizes "ask before assuming"
- LLM is trained to be helpful by gathering more context
- No limit on clarification rounds
- Some questions are unnecessary for simple forms

**Consequences:**
- Users abandon before seeing any form generated
- Feature feels slower than manual form creation
- Users learn to give very long initial prompts to avoid questions
- Defeats the purpose of "quick AI generation"

**Warning signs:**
- > 3 clarifying questions before first generation
- Questions about obvious things ("Should email be required?")
- Users typing "just generate it" or "I don't care"
- Low completion rate for AI form creation flow

**Prevention strategy:**
1. **Cap clarifying questions at 2-3** before generating initial draft
2. **Use sensible defaults** for common patterns (email always required)
3. **Generate draft first, then refine** - show something quickly
4. **Distinguish critical vs optional clarifications:**
   - Critical: "What's the form for?" "What information do you need?"
   - Optional: "Should fields be required?" "Any validation rules?"
5. **Direct-to-draft mode** for confident users

**Which phase should address:** Phase 2 (Conversation Design) and Phase 3 (Prompt Tuning).

**Sources:** [Sendbird: AI Conversational Forms](https://sendbird.com/developer/tutorials/ai-conversational-forms)

---

### Pitfall 8: Generated Form Doesn't Match Frontier Tower Context

**What goes wrong:** AI generates generic forms that miss FT-specific context (floor options, member types, community values) despite having access to FT context document.

**Why it happens:**
- Context document is long and may exceed attention
- LLM prioritizes recent conversation over system context
- Generic training data dominates domain-specific knowledge
- FT-specific options (floor dropdown values) have exact required format

**Consequences:**
- Forms feel generic, not "Frontier Tower"
- Wrong floor options or missing floor dropdown entirely
- Tone doesn't match FT brand voice
- Admin has to manually fix every generated form

**Warning signs:**
- Floor dropdown missing from relevant forms
- Generic placeholder text like "Your Name" vs "Full Name"
- Missing standard FT fields (member type, floor affiliation)
- Corporate tone instead of FT's "ambitious but approachable" voice

**Prevention strategy:**
1. **Include FT context in every generation request**, not just system prompt
2. **Create FT-specific examples** showing ideal form patterns
3. **Inject floor options as structured data**, not prose
4. **Post-generation check** for FT-specific requirements:
   - Floor-related forms must have floor dropdown
   - Events must ask about dietary restrictions
   - Applications should have LinkedIn field
5. **Use the exact floor option values** from FT-CONTEXT.md

**Which phase should address:** Phase 3 (Form Generation Logic) - Requires FT-CONTEXT.md integration.

**Code reference:** `/Users/memehalis/ft-form/.planning/research/FT-CONTEXT.md` - comprehensive context document.

---

### Pitfall 9: Validation Rule Mismatches

**What goes wrong:** LLM generates validation rules that are syntactically correct but semantically wrong for the field type.

**Why it happens:**
- Different field types have different valid validation properties
- LLM may apply text validation (minLength) to number fields
- Pattern validation overloaded for different purposes (regex vs file types)
- No type-aware validation in LLM output

**Specific mismatches:**
| Field Type | Valid Validation | Common Mistakes |
|------------|-----------------|-----------------|
| text/textarea | minLength, maxLength, pattern | Using min/max instead |
| number | min, max | Using minLength/maxLength |
| email | (automatic) | Adding pattern that conflicts |
| file | pattern (for accept types) | Using minLength/maxLength |
| select/radio | (none needed) | Adding any validation |
| checkbox | (none needed) | Adding any validation |

**Consequences:**
- Validation silently ignored (users think it's working)
- Unexpected validation errors for users
- Forms that accept invalid data
- Confusion when editing generated forms

**Warning signs:**
- Number fields with `minLength` property
- Text fields with `min` property
- Select fields with pattern validation

**Prevention strategy:**
1. **Type-specific validation schemas:**
   ```typescript
   const TEXT_VALIDATION = z.object({
     minLength: z.number().optional(),
     maxLength: z.number().optional(),
     pattern: z.string().optional(),
     customMessage: z.string().optional()
   });

   const NUMBER_VALIDATION = z.object({
     min: z.number().optional(),
     max: z.number().optional(),
     customMessage: z.string().optional()
   });
   ```
2. **Post-process to strip invalid properties** for each field type
3. **Explicit examples per field type** in system prompt
4. **Validation layer that warns** when rules don't match field type

**Which phase should address:** Phase 1 (Schema Definition) and Phase 3 (Validation).

---

### Pitfall 10: Option Value/Label Confusion

**What goes wrong:** LLM generates select/radio options with inconsistent or problematic value/label pairs.

**Why it happens:**
- Options need both programmatic `value` and display `label`
- LLM may use label as value (spaces, special chars cause issues)
- Different forms use different conventions (slug vs display name)
- Floor options have specific required format per FT-CONTEXT.md

**Examples of problematic output:**
```json
// BAD: Value has spaces and special characters
{ "value": "AI & Autonomous Systems", "label": "AI & Autonomous Systems" }

// GOOD: Clean value, readable label
{ "value": "ai-autonomous-systems", "label": "AI & Autonomous Systems" }

// BAD: Missing label
{ "value": "option1" }

// GOOD: Both present
{ "value": "option1", "label": "Option 1" }
```

**Consequences:**
- Data inconsistency across submissions
- Filtering and reporting issues
- CSV exports with ugly encoded values
- Integration problems with downstream systems

**Warning signs:**
- Values containing spaces, ampersands, special characters
- Value and label being identical
- Missing label property (value used for display)

**Prevention strategy:**
1. **Validate options have both value and label**
2. **Normalize values** to slug format (lowercase, hyphens, no special chars)
3. **For floor options**, use exact values from FT-CONTEXT.md
4. **Include option format examples** in system prompt:
   ```json
   "options": [
     { "value": "floor-9", "label": "Floor 9 - AI & Autonomous Systems" },
     { "value": "floor-10", "label": "Floor 10 - Frontier @ Accelerate" }
   ]
   ```

**Which phase should address:** Phase 3 (Form Generation Logic).

---

### Pitfall 11: Step Structure Mismatch

**What goes wrong:** LLM generates forms with incorrect step structure - either too many steps (one field per step) or too few (all fields in one step).

**Why it happens:**
- Typeform-style UX expects 2-4 fields per step typically
- LLM may interpret "multi-step form" as "every field is a step"
- Or LLM may ignore step structure entirely, dumping all fields in step 1
- No clear guidance on optimal step grouping

**Consequences:**
- One-field-per-step makes forms tediously long
- All-in-one-step defeats Typeform-style UX
- Progress indicator becomes meaningless
- User experience doesn't match the rest of FrontierOS

**Warning signs:**
- Forms with 15+ steps
- Single step with 10+ fields
- Steps with only one field each
- Step titles that don't describe grouped content

**Prevention strategy:**
1. **Explicit step guidelines in prompt:**
   ```
   STEP STRUCTURE GUIDELINES:
   - Group 2-4 related fields per step
   - Use logical groupings: Contact Info, Details, Preferences
   - Never single-field steps unless it's a textarea for a key question
   - Maximum 8 steps for any form
   ```
2. **Post-process to merge single-field steps**
3. **Show step count in preview** for user to adjust
4. **Provide step templates** for common patterns:
   - Welcome/intro step (no fields, just description)
   - Contact info step (name, email, phone)
   - Open-ended question step (single textarea)

**Which phase should address:** Phase 3 (Form Generation Logic).

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

---

### Pitfall 12: Inconsistent ID Formatting

**What goes wrong:** Generated field IDs use inconsistent conventions across fields or across different generation sessions.

**Why it happens:**
- No enforced ID format in system prompt
- LLM generates semantic IDs with varying styles (camelCase, snake_case, kebab-case)
- Different sessions produce different patterns

**Examples:**
```json
// Inconsistent - hard to work with programmatically
{ "id": "firstName" }
{ "id": "last_name" }
{ "id": "email-address" }

// Consistent - predictable
{ "id": "first_name" }
{ "id": "last_name" }
{ "id": "email_address" }
```

**Consequences:**
- Code that processes form data gets complicated
- Harder to build generic field processors
- Aesthetically jarring in admin views
- Minor but adds to "unpolished" feeling

**Prevention strategy:**
1. **Specify ID format in prompt**: "All field IDs must be snake_case"
2. **Post-process to normalize** IDs to consistent format
3. **Or, generate IDs server-side** entirely (avoid this issue)

**Which phase should address:** Phase 3 - Quick post-processing fix.

---

### Pitfall 13: Missing or Redundant Placeholder Text

**What goes wrong:** LLM either omits helpful placeholder text or adds redundant placeholders that repeat the label.

**Why it happens:**
- LLM unsure when placeholders add value vs clutter
- Sometimes placeholder = label restated ("Enter your email")
- Sometimes critical guidance is missing

**Examples:**
```json
// Redundant - adds no value
{ "label": "Email", "placeholder": "Enter your email" }

// Better - adds guidance
{ "label": "Email", "placeholder": "you@company.com" }

// Missing - should have example
{ "label": "LinkedIn Profile", "placeholder": "" }

// Good - helpful example
{ "label": "LinkedIn Profile", "placeholder": "https://linkedin.com/in/yourname" }
```

**Prevention strategy:**
1. **Provide placeholder guidelines:**
   - Email fields: use example format
   - URL fields: show expected format
   - Text fields: only if format guidance helps
   - Dropdowns: "Select..." if helpful
2. **Post-generation check** for redundant placeholders

**Which phase should address:** Phase 3 - Prompt tuning.

---

### Pitfall 14: Description/Help Text Overuse

**What goes wrong:** Every field gets a description, making the form feel cluttered and verbose.

**Why it happens:**
- LLM trying to be helpful by explaining everything
- No guidance on when descriptions add value
- May describe obvious fields ("Enter your first name here")

**Consequences:**
- Forms feel bureaucratic and long
- Doesn't match FT's "premium but not pretentious" brand
- Users skip reading descriptions, defeating the purpose
- Clutter harms completion rates

**Prevention strategy:**
1. **Guideline: descriptions only when genuinely helpful:**
   - Explain non-obvious format expectations
   - Provide context for subjective questions
   - Never explain obvious fields (name, email)
2. **Review generated forms for description necessity**

**Which phase should address:** Phase 3 - Prompt tuning.

---

### Pitfall 15: Slug/Name Generation Collisions

**What goes wrong:** AI generates form names or slugs that conflict with existing forms or reserved routes.

**Why it happens:**
- LLM doesn't know existing form names in the system
- May generate common slugs like "registration" or "application"
- Reserved slugs list not provided to LLM

**Consequences:**
- Form creation fails silently or with confusing error
- Overwrites existing forms (in worst case)
- URL routing breaks if slug matches app route

**Warning signs:**
- Generic slugs: "form", "application", "registration"
- Slugs matching existing forms in database
- Slugs in reserved list: "admin", "api", "apply"

**Prevention strategy:**
1. **Pass existing form slugs** to generation context
2. **Validate slug uniqueness** before accepting
3. **Include reserved slugs list** in system prompt
4. **Auto-increment on collision** (e.g., "event-registration-2")
5. **Let user review/edit slug** before creation

**Which phase should address:** Phase 3 (Form Creation Logic).

**Code reference:** Reserved slugs check likely exists in form creation mutation.

---

## Phase-Specific Warnings Summary

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| Phase 1 | Schema definition | #1, #2, #5 - Schema incompatibility | Define Zod schemas matching exactly to FormSchema, validate every response |
| Phase 1 | OpenRouter setup | Rate limiting, timeouts | Implement retries with exponential backoff, handle 429/402 errors |
| Phase 2 | Chat UI | #4, #6, #7 - Context loss, loading UX, too many questions | Maintain state summary, stream responses, cap clarifications |
| Phase 2 | Conversation design | #7 - Question fatigue | Generate draft first, refine after |
| Phase 3 | Form generation | #8, #9, #10, #11 - FT context, validation, options, steps | Inject FT context, type-aware validation, step grouping rules |
| Phase 3 | Output validation | #1, #5 - Invalid schemas, hallucinated features | Strict Zod validation, reject unknown properties |
| Phase 4 | Preview/edit | Version integrity (#3) | Create new drafts, never modify published |
| Phase 4 | User testing | All minor pitfalls | User feedback reveals friction points |

---

## API/Integration Pitfalls

### OpenRouter-Specific

| Issue | Symptom | Prevention |
|-------|---------|------------|
| Free tier rate limits | 429 errors, 50 req/day | Monitor credits, upgrade for production |
| Credit depletion | 402 errors mid-conversation | Alert on low balance, graceful degradation |
| Provider failover | Inconsistent outputs | Specify model explicitly, test alternatives |
| Dynamic rate limiting | Slower as balance depletes | Maintain healthy credit balance |

**Sources:** [OpenRouter Rate Limits](https://openrouter.ai/docs/api/reference/limits), [OpenRouter Error Handling](https://openrouter.ai/docs/api/reference/errors-and-debugging)

### Streaming Considerations

| Issue | Symptom | Prevention |
|-------|---------|------------|
| Partial JSON in stream | Parse errors mid-stream | Use streaming JSON parser, buffer complete objects |
| Connection drops | Incomplete generation | Implement reconnection, save partial state |
| Edge function limits | Truncated responses | Stream to avoid 4MB limit |
| Timeout on long generation | 504 errors | Increase timeout, show progress |

---

## Security Pitfalls

### Prompt Injection Risks

**Risk:** Admin user crafts prompt that extracts system instructions or bypasses intended behavior.

**Mitigation:**
1. **Treat all user input as untrusted**
2. **Validate LLM output structure**, not just parse it
3. **Don't expose raw LLM errors to users**
4. **Rate limit AI generation** per user/session
5. **Log AI interactions** for audit

### Enum/Constraint Attacks

**Risk:** Structured output constraints can be exploited to bypass safety mechanisms.

**Mitigation:**
1. **Don't rely solely on schema constraints** for safety
2. **Validate content** in addition to structure
3. **Human review before publish** (already exists in form builder flow)

**Sources:** [Output Constraints as Attack Surface (2025 research)](https://arxiv.org/html/2503.24191v1)

---

## Quality Degradation from Constraints

**Important research finding:** When you force an LLM to output JSON, you're not just enforcing structure - you may be degrading its reasoning by 10-15%.

**Mitigation:**
1. **Two-pass generation:** First generate reasoning/plan, then structured output
2. **Don't over-constrain:** Let LLM explain before outputting JSON
3. **Use the clarifying question phase** for reasoning, JSON only for final output

**Sources:** [The Guide to Structured Outputs](https://agenta.ai/blog/the-guide-to-structured-outputs-and-function-calling-with-llms)

---

## Testing Recommendations

### Critical Test Cases

1. **Schema validation edge cases:**
   - Maximum field count per step
   - Very long labels/descriptions
   - Special characters in options
   - Missing required properties
   - Unknown field types

2. **Conversation edge cases:**
   - User contradicts themselves
   - Very vague initial request ("make me a form")
   - Very specific initial request (full description upfront)
   - User says "start over" mid-conversation
   - 10+ turn conversations

3. **FT-specific requirements:**
   - Floor lead application pattern
   - Event registration pattern
   - Floor dropdown presence
   - FT brand voice in field labels

4. **Error recovery:**
   - OpenRouter timeout
   - Rate limit hit
   - Invalid JSON response
   - Network disconnection mid-stream
   - Malformed schema returned

5. **Integration with existing system:**
   - Generated form saves correctly
   - Generated form renders in public view
   - Generated form submissions work
   - Generated form editable in builder

---

## Sources

### Verified (HIGH confidence)
- [Structured Output AI Reliability Guide](https://www.cognitivetoday.com/2025/10/structured-output-ai-reliability/)
- [OpenRouter API Documentation](https://openrouter.ai/docs/api/reference/overview)
- [LLMs Get Lost In Multi-Turn Conversation](https://arxiv.org/html/2505.06120v1)
- [Vercel AI SDK Streaming](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/)
- [JSON Schema for LLM Tools](https://blog.promptlayer.com/how-json-schema-works-for-structured-outputs-and-tool-integration/)
- [Output Constraints as Attack Surface](https://arxiv.org/html/2503.24191v1)
- [The Guide to Structured Outputs](https://agenta.ai/blog/the-guide-to-structured-outputs-and-function-calling-with-llms)
- [Sendbird: AI Conversational Forms](https://sendbird.com/developer/tutorials/ai-conversational-forms)
- [PromptHub: Multi-Turn Conversation Failures](https://www.prompthub.us/blog/why-llms-fail-in-multi-turn-conversations-and-how-to-fix-it)

### Codebase References
- `/Users/memehalis/ft-form/src/types/form-schema.ts` - Exact type definitions
- `/Users/memehalis/ft-form/convex/schema.ts` - Database schema with immutable versions
- `/Users/memehalis/ft-form/.planning/research/FT-CONTEXT.md` - Frontier Tower context
- `/Users/memehalis/ft-form/.planning/PROJECT.md` - Feature availability and constraints
- `/Users/memehalis/ft-form/src/components/form-builder/ValidationEditor.tsx` - Validation UI patterns

---

*This document identifies pitfalls specific to adding AI form creation to the existing FrontierOS form builder. Each pitfall includes detection, prevention, and phase assignment to guide v2.1 implementation.*
