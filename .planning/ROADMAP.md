# Roadmap: Frontier Tower Floor Lead Application System

## Milestones

- ✅ **v1.0 MVP** - Phases 1-7 (shipped 2026-01-28)
- 🚧 **v1.1 Admin Inline Editing** - Phases 8-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-7) - SHIPPED 2026-01-28</summary>

### Phase 1: Foundation Setup
**Goal**: Project scaffolding, database schema, and development environment
**Plans**: 2 plans

Plans:
- [x] 01-01: Project scaffolding and Convex setup
- [x] 01-02: Database schema and base components

### Phase 2: Public Form Structure
**Goal**: Typeform-style form with all 8 steps
**Plans**: 3 plans

Plans:
- [x] 02-01: Form flow architecture and step components
- [x] 02-02: Form fields and validation
- [x] 02-03: Review and submission

### Phase 3: Form UX Polish
**Goal**: Smooth transitions, progress indicator, localStorage persistence
**Plans**: 2 plans

Plans:
- [x] 03-01: Animations and transitions
- [x] 03-02: Progress indicator and localStorage

### Phase 4: Admin Authentication
**Goal**: Password login with JWT sessions
**Plans**: 2 plans

Plans:
- [x] 04-01: Login page and auth flow
- [x] 04-02: Session management and middleware

### Phase 5: Admin Dashboard
**Goal**: Table view with filtering, search, and detail panel
**Plans**: 3 plans

Plans:
- [x] 05-01: Data table with TanStack Table
- [x] 05-02: Filtering and search
- [x] 05-03: Detail panel with status management

### Phase 6: Branding & Design
**Goal**: Brand colors, logo, modern aesthetic
**Plans**: 2 plans

Plans:
- [x] 06-01: Brand colors and typography
- [x] 06-02: Logo and visual polish

### Phase 7: Mobile Optimization & Deployment
**Goal**: Mobile responsive, Vercel deployment
**Plans**: 2 plans

Plans:
- [x] 07-01: Mobile responsive design
- [x] 07-02: Vercel deployment

</details>

### 🚧 v1.1 Admin Inline Editing (In Progress)

**Milestone Goal:** Enable admins to edit any field of a submitted application directly from the detail view, with full edit history tracking.

#### Phase 8: Edit Infrastructure
**Goal**: Database schema and mutations for field updates with atomic history recording
**Depends on**: Phase 7 (v1.0 complete)
**Requirements**: HIST-01
**Success Criteria** (what must be TRUE):
  1. `editHistory` table exists in Convex schema with applicationId, field, oldValue, newValue, editedAt
  2. `updateField` mutation atomically updates application AND creates history record
  3. `getEditHistory` query returns history records for an application ordered by timestamp
  4. Editing a field via direct Convex call correctly records the change in history
**Plans**: 1 plan

Plans:
- [x] 08-01-PLAN.md — Add editHistory table, updateField mutation, getEditHistory query

#### Phase 9: Inline Editing UI
**Goal**: Click-to-edit functionality for all form fields with proper UX patterns
**Depends on**: Phase 8
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06
**Success Criteria** (what must be TRUE):
  1. Admin can click any field in detail panel to enter edit mode
  2. All 19 form fields (name, email, floor, proposal, roadmap, impact, logistics, etc.) are editable inline
  3. Pressing Enter or clicking outside saves the change; pressing Escape cancels
  4. Field shows visual edit state (border/background change) when being edited
  5. Pencil icon appears on field hover to indicate editability
  6. Invalid input (bad email format, empty required field) shows error and prevents save
**Plans**: 2 plans

Plans:
- [x] 09-01-PLAN.md — Create EditableField component with all field type variants
- [x] 09-02-PLAN.md — Integrate EditableField into ApplicationSheet for all 19 fields

#### Phase 10: Edit History Display
**Goal**: Collapsible timeline showing edit history in detail panel
**Depends on**: Phase 8, Phase 9
**Requirements**: HIST-02, HIST-03, HIST-04
**Success Criteria** (what must be TRUE):
  1. Detail panel shows collapsible "Edit History" section
  2. Timeline displays all edits with field name, old value, new value, and timestamp
  3. Most recent edits appear first in the timeline
  4. Field names display as human-readable labels (e.g., "Floor Preference" not "floorPreference")
**Plans**: TBD

Plans:
- [ ] 10-01: Edit history timeline

## Progress

**Execution Order:**
Phases execute in numeric order: 8 → 9 → 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation Setup | v1.0 | 2/2 | Complete | 2026-01-28 |
| 2. Public Form Structure | v1.0 | 3/3 | Complete | 2026-01-28 |
| 3. Form UX Polish | v1.0 | 2/2 | Complete | 2026-01-28 |
| 4. Admin Authentication | v1.0 | 2/2 | Complete | 2026-01-28 |
| 5. Admin Dashboard | v1.0 | 3/3 | Complete | 2026-01-28 |
| 6. Branding & Design | v1.0 | 2/2 | Complete | 2026-01-28 |
| 7. Mobile & Deployment | v1.0 | 2/2 | Complete | 2026-01-28 |
| 8. Edit Infrastructure | v1.1 | 1/1 | Complete | 2026-01-28 |
| 9. Inline Editing UI | v1.1 | 2/2 | Complete | 2026-01-28 |
| 10. Edit History Display | v1.1 | 0/1 | Not started | - |

---
*Roadmap created: 2026-01-28*
*v1.1 milestone started: 2026-01-28*
