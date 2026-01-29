# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.
**Current focus:** v1.2 Dynamic Form Builder - Phase 15 in progress

## Current Position

Phase: 15 of 15 (Admin Integration)
Plan: 03 of 4 complete
Status: Phase 15 in progress
Last activity: 2026-01-29 - Completed 15-03-PLAN.md (Submission Sheet)

Progress: v1.0 [####################] 100% | v1.1 [####################] 100% | v1.2 [###################_] 97%

## Milestones

- **v1.0 MVP** - Shipped 2026-01-28 (7 phases, 16 plans)
- **v1.1 Admin Inline Editing** - Shipped 2026-01-29 (3 phases, 4 plans)
- **v1.2 Dynamic Form Builder** - In progress (5 phases, 15 plans complete)

## Production URLs

- **Application:** https://ft-form.vercel.app
- **Apply form:** https://ft-form.vercel.app/apply
- **Admin login:** https://ft-form.vercel.app/admin/login
- **Convex backend:** https://usable-bobcat-946.convex.cloud

## Performance Metrics

**Velocity:**
- Total plans completed: 35 (v1.0: 16, v1.1: 4, v1.2: 15)
- Average duration: Not tracked for previous milestones
- Total execution time: Not tracked

**By Milestone:**

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 | 7 | 16 | Complete |
| v1.1 | 3 | 4 | Complete |
| v1.2 | 5 | 15/16 | In progress |

## Accumulated Context

### Decisions

All decisions documented in PROJECT.md Key Decisions table.

Recent decisions affecting current work:
- Schema Foundation: JSON string storage for form schemas (avoids Convex 16-level nesting limit)
- Schema Foundation: Immutable form versions for data integrity
- Schema Foundation: Separate submissions table from legacy applications
- Schema Foundation: Reserved slugs list prevents route conflicts
- Schema Foundation: Submissions reference formVersionId (not formId)
- File Upload: Immediate persistence pattern (avoid URL expiration)
- File Upload Backend: Internal mutation for cleanup (not exposed publicly)
- File Upload Backend: 24-hour grace period before orphan deletion
- File Upload Backend: 3 AM UTC cleanup time (low traffic)
- File Upload Frontend: XMLHttpRequest over fetch for upload progress tracking
- File Upload Frontend: Default 50MB max size with configurable override
- File Upload Frontend: Default accepts images and PDF files
- Dynamic Form Renderer: Zod v4 uses message param instead of invalid_type_error/errorMap
- Dynamic Form Renderer: Draft locking via versionId to detect schema changes
- Dynamic Form Renderer: Optional fields use .optional().or(z.literal("")) pattern
- Field Components: URL fields use TextField (browser validation too strict)
- Field Components: Radio fields fall back to SelectField (enhance later if needed)
- Field Components: NumberField uses valueAsNumber for proper type handling
- Form Flow: Route page is server component rendering DynamicFormPage client component
- Form Flow: Step numbering Welcome(0)->Content(1-N)->Review(N+1)->Confirmation(N+2)
- Form Flow: Progress indicator shows content steps + review (excludes welcome/confirmation)
- Form Builder: No persistence middleware for builder store - state resets on navigation
- Form Builder: Status badges use inline className pattern vs separate utility
- Form Builder: Drag handle on left side only to allow click-to-select elsewhere
- Form Builder: 8px activation constraint prevents accidental drags
- Form Builder: Three-panel layout (w-64 left, flex-1 center, w-80 right)
- Form Builder: Debounced metadata updates (500ms) for autosave
- Form Builder: Store resets on page unmount to prevent stale state
- Property Panel: 300ms debounce for field property changes
- Property Panel: Auto-generate option values from labels on blur
- Property Panel: Pattern presets (phone, URL, custom) for text validation
- Preview Panel: Mobile/desktop device modes with visual frame
- Preview Panel: Filter incomplete fields from preview
- Publish Workflow: Validate schema before publishing (labels, options required)
- Draft State: Reset draft when form version changes
- Admin Tabs: URL query params (?tab=) for tab state persistence
- Admin Tabs: Navigate to editor immediately after form duplication
- Submissions Table: Filter by formName column value (not formId) for UI simplicity
- Submission Sheet: DynamicEditableField with file/checkbox read-only
- Submission Sheet: SubmissionEditHistory uses stored fieldLabel (no lookup)
- Submission Sheet: Schema-driven layout iterates over steps/fields

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-29
Stopped at: Completed 15-03-PLAN.md (Submission Sheet)
Resume file: None

---
*v1.2 milestone in progress - Phase 15 Admin Integration in progress*
