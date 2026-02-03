# Requirements: FrontierOS v2.1 AI Form Creation Assistant

**Defined:** 2026-02-03
**Core Value:** Enable admins to create forms by describing what they need, with AI generating complete form structures that require minimal manual editing.

## v2.1 Requirements

Requirements for AI Form Creation Assistant. Each maps to roadmap phases.

### AI Infrastructure

- [ ] **AI-01**: System accepts natural language prompts describing desired form
- [ ] **AI-02**: AI uses OpenRouter with user-provided API key for LLM access
- [ ] **AI-03**: AI responses stream to client with typing indicator
- [ ] **AI-04**: AI output is validated against FormSchema Zod type before display
- [ ] **AI-05**: Invalid AI outputs show actionable error messages, not raw errors
- [ ] **AI-06**: System prompt includes Frontier Tower context (floors, member types, form patterns)

### Hybrid Questions

- [ ] **HYB-01**: Before open prompt, user selects form type (Application, Feedback, Registration, Survey, Other)
- [ ] **HYB-02**: User selects audience (External/public or Internal/team)
- [ ] **HYB-03**: Structured selections inform AI context for better generation
- [ ] **HYB-04**: AI asks at most 2-3 clarifying questions before generating draft

### Form Generation

- [ ] **GEN-01**: AI generates forms using exactly the 8 existing field types (text, email, textarea, number, date, select, checkbox, file)
- [ ] **GEN-02**: Generated forms have logical step groupings (2-4 fields per step typically)
- [ ] **GEN-03**: Generated forms include FT-specific fields where relevant (floor dropdown for floor-related forms)
- [ ] **GEN-04**: Field IDs are unique and consistently formatted
- [ ] **GEN-05**: Select/radio options have both value and label properties
- [ ] **GEN-06**: Validation rules match field types (minLength for text, min/max for number)

### Preview & Iteration

- [ ] **PRV-01**: Generated form schema displays in preview panel before creation
- [ ] **PRV-02**: Preview uses existing form renderer components for accurate representation
- [ ] **PRV-03**: User can regenerate with same prompt to get alternative structure
- [ ] **PRV-04**: User can modify prompt and regenerate
- [ ] **PRV-05**: Direct-to-draft toggle skips preview for confident users

### Form Creation

- [ ] **CRT-01**: User provides form name and slug before creation
- [ ] **CRT-02**: Slug is validated for uniqueness and reserved words
- [ ] **CRT-03**: Created form is saved as draft (never auto-published)
- [ ] **CRT-04**: After creation, user can choose to edit in builder or view in list
- [ ] **CRT-05**: AI never modifies existing published forms (always creates new drafts)

### User Experience

- [ ] **UX-01**: "Create with AI" option appears in New Form dropdown alongside "Create Manually"
- [ ] **UX-02**: AI wizard has clear visual state (input → generating → preview → confirm)
- [ ] **UX-03**: Streaming responses show progress (not blank screen during generation)
- [ ] **UX-04**: Cancel is available during generation
- [ ] **UX-05**: Errors are recoverable without losing conversation context
- [ ] **UX-06**: Mobile responsive for admin use

## v2.2+ Requirements (Deferred)

Features acknowledged but not in v2.1 scope.

### Iterative Refinement

- **ITER-01**: After generation, user can continue conversation to modify ("add an email field")
- **ITER-02**: Modifications update preview in real-time
- **ITER-03**: Conversation history persists for session

### Advanced Features

- **ADV-01**: Voice input option for form description
- **ADV-02**: AI suggests improvements to existing forms
- **ADV-03**: Template recommendations based on form type
- **ADV-04**: Form analytics predictions (estimated completion rate)

### Learning

- **LRN-01**: AI learns from existing forms in the system
- **LRN-02**: Successful prompts saved as "recipes" for reuse
- **LRN-03**: Model selection (Claude vs GPT-4) per generation

## Out of Scope

Explicitly excluded from v2.1. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| AI editing existing forms | Risk of data loss, unexpected changes to live forms |
| Automatic publishing | Forms must be reviewed before going live |
| Conditional logic generation | FrontierOS doesn't have conditional logic yet (COND-01/02 future) |
| Multi-column layouts | Not supported in current form renderer |
| Persistent conversation history | Session-only to avoid storage/privacy concerns |
| AI-generated slugs | Always require human to set/confirm URL |
| Custom field types | AI uses only the 8 existing types |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AI-01 | Phase 25 | Pending |
| AI-02 | Phase 25 | Pending |
| AI-03 | Phase 25 | Pending |
| AI-04 | Phase 25 | Pending |
| AI-05 | Phase 25 | Pending |
| AI-06 | Phase 25 | Pending |
| HYB-01 | Phase 26 | Pending |
| HYB-02 | Phase 26 | Pending |
| HYB-03 | Phase 26 | Pending |
| HYB-04 | Phase 26 | Pending |
| GEN-01 | Phase 27 | Pending |
| GEN-02 | Phase 27 | Pending |
| GEN-03 | Phase 27 | Pending |
| GEN-04 | Phase 27 | Pending |
| GEN-05 | Phase 27 | Pending |
| GEN-06 | Phase 27 | Pending |
| PRV-01 | Phase 27 | Pending |
| PRV-02 | Phase 27 | Pending |
| PRV-03 | Phase 27 | Pending |
| PRV-04 | Phase 27 | Pending |
| PRV-05 | Phase 27 | Pending |
| CRT-01 | Phase 28 | Pending |
| CRT-02 | Phase 28 | Pending |
| CRT-03 | Phase 28 | Pending |
| CRT-04 | Phase 28 | Pending |
| CRT-05 | Phase 28 | Pending |
| UX-01 | Phase 28 | Pending |
| UX-02 | Phase 26 | Pending |
| UX-03 | Phase 26 | Pending |
| UX-04 | Phase 26 | Pending |
| UX-05 | Phase 26 | Pending |
| UX-06 | Phase 28 | Pending |

**Coverage:**
- v2.1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after initial definition*
