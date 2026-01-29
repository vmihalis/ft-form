# Roadmap: Frontier Tower Floor Lead Application System

## Milestones

- v1.0 MVP - Phases 1-7 (shipped 2026-01-28)
- v1.1 Admin Inline Editing - Phases 8-10 (shipped 2026-01-29)
- **v1.2 Dynamic Form Builder** - Phases 11-15 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-7) - SHIPPED 2026-01-28</summary>

See git history for v1.0 phase details.

</details>

<details>
<summary>v1.1 Admin Inline Editing (Phases 8-10) - SHIPPED 2026-01-29</summary>

See git history for v1.1 phase details.

</details>

### v1.2 Dynamic Form Builder (In Progress)

**Milestone Goal:** Enable admins to create and customize application forms with full control over fields, types, and structure. Multiple forms with unique URLs, form versioning for data integrity, and rich field types including file uploads.

- [x] **Phase 11: Schema Foundation** - Database tables and versioning infrastructure
- [x] **Phase 12: File Upload Infrastructure** - Convex storage integration for file fields
- [ ] **Phase 13: Dynamic Form Renderer** - Field components and public form rendering
- [ ] **Phase 14: Form Builder UI** - Drag-and-drop form creation interface
- [ ] **Phase 15: Admin Integration** - Forms management and dynamic submission viewing

## Phase Details

### Phase 11: Schema Foundation
**Goal**: Forms and submissions can be stored with immutable version snapshots that preserve structure at publish time
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04, SCHEMA-05
**Success Criteria** (what must be TRUE):
  1. Form can be created in database with unique slug for URL routing
  2. Publishing a form creates an immutable version snapshot
  3. Submissions reference the exact form version they were submitted against
  4. Dynamic submissions store responses as flexible JSON with formVersionId
  5. Legacy applications table continues to work alongside new dynamic submissions
**Plans**: 2 plans

Plans:
- [x] 11-01-PLAN.md — TypeScript types and Convex schema for dynamic forms
- [x] 11-02-PLAN.md — Form and submission mutations/queries with versioning

### Phase 12: File Upload Infrastructure
**Goal**: Users can upload files in dynamic forms with immediate persistence to Convex storage
**Depends on**: Phase 11 (requires schema for file storage references)
**Requirements**: FIELD-08
**Success Criteria** (what must be TRUE):
  1. File field component renders with upload UI
  2. Selected files persist immediately to Convex storage (before form submission)
  3. Upload handles reasonable file sizes (up to 50MB)
**Plans**: 2 plans

Plans:
- [x] 12-01-PLAN.md — Convex storage mutations, queries, and orphan cleanup cron
- [x] 12-02-PLAN.md — useFileUpload hook and FileField component with drag-and-drop

### Phase 13: Dynamic Form Renderer
**Goal**: Dynamic forms render at unique URLs with Typeform-style UX and validate based on field configuration
**Depends on**: Phase 11 (requires form schema), Phase 12 (requires file upload for complete field support)
**Requirements**: FIELD-01, FIELD-02, FIELD-03, FIELD-04, FIELD-05, FIELD-06, FIELD-07, PUBLIC-01, PUBLIC-02, PUBLIC-03, PUBLIC-04, PUBLIC-05, PUBLIC-06
**Success Criteria** (what must be TRUE):
  1. Each form is accessible at unique URL /apply/[slug]
  2. Text, textarea, email, dropdown, number, date, and checkbox fields render correctly
  3. Typeform-style step-by-step UX works with dynamic field counts
  4. Required fields and format validation (email) enforces field configuration
  5. File uploads persist immediately on selection
  6. Submission stores response data with formVersionId reference
  7. Uploaded files are associated with form version and can be retrieved
**Plans**: 3 plans

Plans:
- [ ] 13-01-PLAN.md — Dynamic route, Zod schema generation, and Zustand store
- [ ] 13-02-PLAN.md — Field renderer components for all field types
- [ ] 13-03-PLAN.md — Form container, step components, navigation, and review

### Phase 14: Form Builder UI
**Goal**: Admins can create and configure forms through drag-and-drop interface with real-time preview
**Depends on**: Phase 11 (requires schema), Phase 13 (preview uses renderer)
**Requirements**: BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05, BUILD-06, BUILD-07, BUILD-08
**Success Criteria** (what must be TRUE):
  1. Admin can create new form with name and URL slug
  2. Admin can add fields from type palette and configure properties
  3. Admin can drag-and-drop to reorder fields within form
  4. Admin can remove fields from form
  5. Real-time preview shows form as users will see it
  6. Form has draft/published/archived status lifecycle
  7. Publishing creates immutable form version snapshot
**Plans**: TBD

Plans:
- [ ] 14-01: TBD
- [ ] 14-02: TBD
- [ ] 14-03: TBD

### Phase 15: Admin Integration
**Goal**: Admins can manage forms and view dynamic submissions with schema-aware rendering
**Depends on**: Phase 13 (requires renderer for submission display), Phase 14 (requires forms to exist)
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05
**Success Criteria** (what must be TRUE):
  1. Forms tab in admin dashboard lists all forms with status
  2. Admin can filter submissions by which form they came from
  3. Admin can duplicate existing form as starting point
  4. Submission detail panel renders fields based on form schema (not hardcoded)
  5. Edit history displays dynamic field labels correctly
**Plans**: TBD

Plans:
- [ ] 15-01: TBD
- [ ] 15-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13 -> 14 -> 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-7 | v1.0 | 16/16 | Complete | 2026-01-28 |
| 8-10 | v1.1 | 4/4 | Complete | 2026-01-29 |
| 11. Schema Foundation | v1.2 | 2/2 | Complete | 2026-01-29 |
| 12. File Upload Infrastructure | v1.2 | 2/2 | Complete | 2026-01-29 |
| 13. Dynamic Form Renderer | v1.2 | 0/3 | Planned | - |
| 14. Form Builder UI | v1.2 | 0/TBD | Not started | - |
| 15. Admin Integration | v1.2 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-29*
*Last updated: 2026-01-29 after Phase 13 planning complete*
