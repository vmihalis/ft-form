# Roadmap: Frontier Tower Floor Lead Application System

## Milestones

- **v1.0 MVP** - Phases 1-7 (shipped 2026-01-28)
- **v1.1 Admin Inline Editing** - Phases 8-10 (shipped 2026-01-29)
- **v1.2 Dynamic Form Builder** - Phases 11-15 (shipped 2026-01-29)
- **v1.3 Unification & Admin Productivity** - Phases 16-19 (shipped 2026-01-29)
- **v2.0 FrontierOS Dashboard** - Phases 20-24 (shipped 2026-01-29)
- **v2.1 AI Form Creation Assistant** - Phases 25-28 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-7) - SHIPPED 2026-01-28</summary>

See `.planning/milestones/` for v1.0 details or git history.

</details>

<details>
<summary>v1.1 Admin Inline Editing (Phases 8-10) - SHIPPED 2026-01-29</summary>

See `.planning/milestones/` for v1.1 details or git history.

</details>

<details>
<summary>v1.2 Dynamic Form Builder (Phases 11-15) - SHIPPED 2026-01-29</summary>

- [x] Phase 11: Schema Foundation (2/2 plans) - completed 2026-01-29
- [x] Phase 12: File Upload Infrastructure (2/2 plans) - completed 2026-01-29
- [x] Phase 13: Dynamic Form Renderer (3/3 plans) - completed 2026-01-29
- [x] Phase 14: Form Builder UI (5/5 plans) - completed 2026-01-29
- [x] Phase 15: Admin Integration (3/3 plans) - completed 2026-01-29

See `.planning/milestones/v1.2-ROADMAP.md` for full details.

</details>

<details>
<summary>v1.3 Unification & Admin Productivity (Phases 16-19) - SHIPPED 2026-01-29</summary>

- [x] Phase 16: Form Migration (1/1 plans) - completed 2026-01-29
- [x] Phase 17: Legacy Cleanup (2/2 plans) - completed 2026-01-29
- [x] Phase 18: Export (2/2 plans) - completed 2026-01-29
- [x] Phase 19: Dashboard Enhancement (3/3 plans) - completed 2026-01-29

See `.planning/milestones/v1.3-ROADMAP.md` for full details.

</details>

<details>
<summary>v2.0 FrontierOS Dashboard (Phases 20-24) - SHIPPED 2026-01-29</summary>

- [x] Phase 20: Design System Foundation (3/3 plans) - completed 2026-01-29
- [x] Phase 21: Dashboard Hub & Navigation (4/4 plans) - completed 2026-01-29
- [x] Phase 22: WYSIWYG Form Builder (4/4 plans) - completed 2026-01-29
- [x] Phase 23: Forms/Submissions Redesign (5/5 plans) - completed 2026-01-29
- [x] Phase 24: Polish & UX (5/5 plans) - completed 2026-01-29

See `.planning/milestones/v2.0-ROADMAP.md` for full details.

</details>

### v2.1 AI Form Creation Assistant (In Progress)

**Milestone Goal:** Enable admins to create forms by describing what they need in natural language, with AI asking clarifying questions and generating complete form structures.

#### Phase 25: Core AI Infrastructure ✓
**Goal:** Establish backend AI foundation with OpenRouter integration, streaming API, and Frontier Tower context
**Depends on:** Phase 24 (v2.0 complete)
**Requirements:** AI-02, AI-04, AI-05, AI-06
**Success Criteria** (what must be TRUE):
  1. Streaming API endpoint accepts natural language prompts and returns AI responses
  2. Invalid AI outputs display actionable error messages, not raw technical errors
  3. AI system prompt includes Frontier Tower context (floors, member types, form patterns)
  4. Zod schemas validate AI output structure before consumption
**Plans:** 3/3 complete

Plans:
- [x] 25-01-PLAN.md — Zod schemas mirroring FormSchema for AI output validation
- [x] 25-02-PLAN.md — System prompt with FT context and error handling utilities
- [x] 25-03-PLAN.md — Streaming API route with OpenRouter integration

#### Phase 26: Chat UI & Conversation Flow ✓
**Goal:** Build the conversational interface with hybrid structured/open questions and clear wizard states
**Depends on:** Phase 25
**Requirements:** HYB-01, HYB-02, HYB-03, HYB-04, UX-02, UX-03, UX-04, UX-05
**Success Criteria** (what must be TRUE):
  1. Before writing a prompt, user selects form type (Application, Feedback, Registration, Survey, Other) and audience (External/Internal)
  2. AI asks at most 2-3 clarifying questions before generating a form draft
  3. Wizard displays clear visual state progression (input -> generating -> preview -> confirm)
  4. User can cancel during generation without losing conversation context
  5. Streaming responses show visible progress during generation
**Plans:** 3/3 complete

Plans:
- [x] 26-01-PLAN.md — Wizard container, step indicator, form type and audience selection steps
- [x] 26-02-PLAN.md — Chat interface with streaming, typing indicator, stop/retry functionality
- [x] 26-03-PLAN.md — Page route, API key input, and end-to-end verification

#### Phase 27: Form Generation & Preview
**Goal:** Generate valid form schemas using the 8 existing field types with accurate preview and iteration options
**Depends on:** Phase 26
**Requirements:** GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06, PRV-01, PRV-02, PRV-03, PRV-04, PRV-05
**Success Criteria** (what must be TRUE):
  1. Generated forms use only the 8 existing field types (text, email, textarea, number, date, select, checkbox, file)
  2. Generated forms have logical step groupings with 2-4 fields per step
  3. Generated form schema displays in preview panel using existing form renderer components
  4. User can regenerate with same or modified prompt to get alternative structure
  5. Direct-to-draft toggle allows confident users to skip preview
**Plans:** 3 plans

Plans:
- [ ] 27-01-PLAN.md — Schema extraction utility for detecting and validating AI-generated schemas
- [ ] 27-02-PLAN.md — Form preview panel using DynamicField components
- [ ] 27-03-PLAN.md — Wizard integration with preview step and iteration flows

#### Phase 28: Integration & Polish
**Goal:** Complete the workflow from preview to created draft form with entry point integration and mobile support
**Depends on:** Phase 27
**Requirements:** CRT-01, CRT-02, CRT-03, CRT-04, CRT-05, UX-01, UX-06
**Success Criteria** (what must be TRUE):
  1. "Create with AI" option appears in New Form dropdown alongside "Create Manually"
  2. User provides form name and slug (validated for uniqueness) before creation
  3. Created form is saved as draft (never auto-published)
  4. After creation, user can choose to edit in builder or view in list
  5. AI wizard is mobile responsive for admin use
**Plans:** TBD

Plans:
- [ ] 28-01: TBD
- [ ] 28-02: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-7 | v1.0 | 16/16 | Complete | 2026-01-28 |
| 8-10 | v1.1 | 4/4 | Complete | 2026-01-29 |
| 11-15 | v1.2 | 15/15 | Complete | 2026-01-29 |
| 16-19 | v1.3 | 8/8 | Complete | 2026-01-29 |
| 20 | v2.0 | 3/3 | Complete | 2026-01-29 |
| 21 | v2.0 | 4/4 | Complete | 2026-01-29 |
| 22 | v2.0 | 4/4 | Complete | 2026-01-29 |
| 23 | v2.0 | 5/5 | Complete | 2026-01-29 |
| 24 | v2.0 | 5/5 | Complete | 2026-01-29 |
| 25 | v2.1 | 3/3 | Complete | 2026-02-03 |
| 26 | v2.1 | 3/3 | Complete | 2026-02-03 |
| 27 | v2.1 | 0/3 | Planned | - |
| 28 | v2.1 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-28*
*Last updated: 2026-02-03 after Phase 27 planned*
