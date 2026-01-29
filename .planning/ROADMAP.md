# Roadmap: Frontier Tower Floor Lead Application System

## Milestones

- **v1.0 MVP** - Phases 1-7 (shipped 2026-01-28)
- **v1.1 Admin Inline Editing** - Phases 8-10 (shipped 2026-01-29)
- **v1.2 Dynamic Form Builder** - Phases 11-15 (shipped 2026-01-29)
- **v1.3 Unification & Admin Productivity** - Phases 16-19 (shipped 2026-01-29)
- **v2.0 FrontierOS Dashboard** - Phases 20-24 (in progress)

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

### v2.0 FrontierOS Dashboard (In Progress)

**Milestone Goal:** Transform the admin dashboard into FrontierOS - a premium command center with glassmorphism design system, dashboard hub navigation, light/dark mode, and complete visual overhaul of all existing features.

- [x] **Phase 20: Design System Foundation** - Theme infrastructure and glass utilities (completed 2026-01-29)
- [x] **Phase 21: Dashboard Hub & Navigation** - Module cards, sidebar, placeholder modules (completed 2026-01-29)
- [x] **Phase 22: WYSIWYG Form Builder** - Inline editing with floating toolbar (completed 2026-01-29)
- [ ] **Phase 23: Forms/Submissions Redesign** - Glass styling and animations
- [ ] **Phase 24: Polish & UX** - Microinteractions, accessibility, refinement

## Phase Details

### Phase 20: Design System Foundation
**Goal:** Theme infrastructure enables light/dark mode switching and glass utilities work correctly in both themes.
**Depends on:** Nothing (first phase of v2.0)
**Requirements:** DS-01, DS-02, DS-03, DS-04, DS-07
**Success Criteria** (what must be TRUE):
  1. User can toggle between light and dark modes via visible toggle control
  2. Theme preference persists across browser sessions and page refreshes
  3. All existing UI remains functional in both light and dark modes
  4. Glass utilities display correctly on both light and dark backgrounds
  5. CSS variables document all theme-aware colors and effects
**Plans:** 3 plans

Plans:
- [x] 20-01-PLAN.md — Install next-themes and theme-aware glass CSS variables
- [x] 20-02-PLAN.md — Create ModeToggle component and add to admin header
- [x] 20-03-PLAN.md — Document design tokens

### Phase 21: Dashboard Hub & Navigation
**Goal:** Users land on a dashboard hub with module cards and can navigate via collapsible sidebar.
**Depends on:** Phase 20 (theme infrastructure)
**Requirements:** NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, NAV-07, NAV-08, PLACE-01, PLACE-02, PLACE-03, PLACE-04, PLACE-05
**Success Criteria** (what must be TRUE):
  1. After login, user sees dashboard hub with module cards (Forms + 4 placeholders)
  2. Each module card displays icon and label (minimal content per CONTEXT.md)
  3. Clicking a module card navigates to that module's main view
  4. Sidebar can be expanded (with labels) or collapsed (icons only)
  5. Sidebar collapse state persists across sessions
  6. Dashboard layout adapts properly to mobile viewport
**Plans:** 4 plans

Plans:
- [x] 21-01-PLAN.md — Sidebar store with localStorage persistence and admin layout structure
- [x] 21-02-PLAN.md — Collapsible sidebar component with navigation items
- [x] 21-03-PLAN.md — Dashboard hub with module cards grid
- [x] 21-04-PLAN.md — Mobile navigation with hamburger menu and shared header

### Phase 22: WYSIWYG Form Builder
**Goal:** Form builder displays forms exactly as users will see them with inline editing and floating toolbar.
**Depends on:** Phase 20 (design system)
**Requirements:** BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05, BUILD-06, BUILD-07, BUILD-08, BUILD-09
**Success Criteria** (what must be TRUE):
  1. Form builder shows form in its actual rendered appearance (WYSIWYG)
  2. Clicking a field reveals floating toolbar with edit/delete/duplicate actions
  3. Plus button between fields opens field type picker for adding new fields
  4. Field properties can be edited inline or via floating panel
  5. Fields can be reordered via drag-and-drop
  6. No separate preview mode needed - builder IS the preview
**Plans:** 4 plans

Plans:
- [x] 22-01-PLAN.md — Install popover/tooltip and add store WYSIWYG actions
- [x] 22-02-PLAN.md — Create WysiwygField and FieldToolbar components
- [x] 22-03-PLAN.md — Create AddFieldButton and FieldTypePicker components
- [x] 22-04-PLAN.md — Create WysiwygCanvas and update FormBuilder

### Phase 23: Forms/Submissions Redesign
**Goal:** Forms list and submission management display with glassmorphism styling and smooth animations.
**Depends on:** Phase 20 (design system), Phase 22 (builder complete)
**Requirements:** FORM-01, FORM-02, FORM-03, FORM-04, SUB-01, SUB-02, SUB-03, SUB-04
**Success Criteria** (what must be TRUE):
  1. Forms list displays with glassmorphism card styling
  2. Forms list shows status, submission count, and last updated for each form
  3. Quick actions (edit, duplicate, archive) available from forms list without opening form
  4. Submissions table displays with glass styling consistent with dashboard
  5. Submission detail panel uses glass panel styling
  6. Smooth animated transitions occur when navigating between list/detail views
**Plans:** 5 plans

Plans:
- [ ] 23-01-PLAN.md — Backend submission count + FormCard and FormQuickActions components
- [ ] 23-02-PLAN.md — FormsGrid with stagger animations and FormsList refactor
- [ ] 23-03-PLAN.md — Submissions table glass container and SubmissionSheet glass styling
- [ ] 23-04-PLAN.md — SubmissionsFilters glass styling and column optimization
- [ ] 23-05-PLAN.md — Tab switching and page navigation animations

### Phase 24: Polish & UX
**Goal:** Microinteractions feel premium, common actions are fast, and the interface guides users clearly.
**Depends on:** Phases 20-23 (all core phases)
**Requirements:** DS-05, DS-06, UX-01, UX-02, UX-03, UX-04, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. All interactive elements have 200-500ms transition animations on hover/focus/active
  2. Glassmorphism effects applied to floating elements (modals, dropdowns, tooltips)
  3. Common actions (create form, view submissions) reachable within 2 clicks from dashboard
  4. All async operations show loading states or skeleton screens
  5. Empty states provide helpful guidance on next action
  6. Error states clearly communicate what went wrong and how to recover
**Plans:** TBD

Plans:
- [ ] 24-01: TBD
- [ ] 24-02: TBD

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
| 23 | v2.0 | 0/5 | Not started | - |
| 24 | v2.0 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-28*
*Last updated: 2026-01-29 after Phase 22 completion*
