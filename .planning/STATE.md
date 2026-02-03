# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** The FT team can efficiently manage all aspects of Frontier Tower from a single, premium dashboard that feels as cutting-edge as the building itself.
**Current focus:** v2.1 AI Form Creation Assistant - Phase 27 In Progress (Form Generation & Preview)

## Current Position

Phase: 27 of 28 (Form Generation & Preview)
Plan: 2 of 3 complete
Status: In progress
Last activity: 2026-02-03 - Completed 27-02-PLAN.md (Live Form Preview Component)

Progress: v2.1 Phase 27 [######----] 67%

## Milestones

- **v1.0 MVP** - Shipped 2026-01-28 (7 phases, 16 plans)
- **v1.1 Admin Inline Editing** - Shipped 2026-01-29 (3 phases, 4 plans)
- **v1.2 Dynamic Form Builder** - Shipped 2026-01-29 (5 phases, 15 plans)
- **v1.3 Unification & Admin Productivity** - Shipped 2026-01-29 (4 phases, 8 plans)
- **v2.0 FrontierOS Dashboard** - Shipped 2026-01-29, archived 2026-02-02 (5 phases, 21 plans)
- **v2.1 AI Form Creation Assistant** - In progress (4 phases, 12 plans estimated)

## Production URLs

- **Application:** https://ft-form.vercel.app
- **Admin dashboard:** https://ft-form.vercel.app/admin
- **Convex backend:** https://usable-bobcat-946.convex.cloud

## Performance Metrics

**Velocity:**
- Total plans completed: 72 (v1.0: 16, v1.1: 4, v1.2: 15, v1.3: 8, v2.0: 21, v2.1: 8)
- Total requirements validated: 37 (v2.0) + previous milestones

**By Milestone:**

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 | 7 | 16 | Shipped |
| v1.1 | 3 | 4 | Shipped |
| v1.2 | 5 | 15 | Shipped |
| v1.3 | 4 | 8 | Shipped |
| v2.0 | 5 | 21 | Shipped & Archived |
| v2.1 | 4 | 8/12 | In Progress |

## Accumulated Context

### Decisions

All decisions documented in PROJECT.md Key Decisions table.

Recent for v2.1:
- Use OpenRouter with user-provided API key (not built-in key)
- Hybrid questions: structured form type/audience selection + open prompt
- AI never modifies existing forms, always creates new drafts

Phase 25 Plan 01:
- Named main Zod schema AIFormSchemaOutputSchema to avoid collision with inferred type
- Semantic validation separate from structural for better error messages

Phase 25 Plan 02:
- System prompt embeds complete FT-CONTEXT.md content directly
- Error handling uses duck typing for NoObjectGeneratedError (handles cross-package issues)

Phase 25 Plan 03:
- Model: anthropic/claude-sonnet-4 via OpenRouter (can change later)
- API key passed per-request in body, never stored server-side
- maxDuration=60 for complex form generation

Phase 26 Plan 01:
- Wizard state via useState (simple 4-step flow doesn't need Zustand)
- Types (FormType, Audience, WizardStep) exported from AIFormWizard.tsx for reuse
- Click-to-advance pattern: card selection immediately advances to next step

Phase 26 Plan 02:
- DefaultChatTransport used for AI SDK v6 (not direct api/body on useChat)
- Memoize transport to prevent re-creation on render
- Message parts extraction (`.parts` array not `.content` string) per AI SDK v6

Phase 26 Plan 03:
- API key stored in component state (not localStorage) for security
- GeneratingStep is placeholder - Phase 27 implements form schema detection

Phase 27 Plan 01:
- First JSON block only extracted (AI generates one schema per response)
- Dual pattern support for ```json and generic ``` code blocks
- mightContainSchema pre-check uses both markers (json + steps) to avoid false positives

Phase 27 Plan 02:
- PreviewStepContent uses FormProvider for DynamicField context (required by react-hook-form)
- Mobile mode default (360px) matches public /apply/[slug] mobile-first design
- Form submit prevented in preview mode (demonstration only)

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-03
Stopped at: Completed 27-02-PLAN.md (Live Form Preview Component)
Resume with: Execute 27-03-PLAN.md (Wizard Integration)

---
*Phase 27 (Form Generation & Preview) in progress. Schema extraction and form preview components complete. Ready for Plan 03 (Wizard Integration).*
