# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-29)

**Core value:** Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.
**Current focus:** v1.2 Dynamic Form Builder - Phase 13 Plan 02 complete

## Current Position

Phase: 13 of 15 (Dynamic Form Renderer)
Plan: 2 complete
Status: In progress
Last activity: 2026-01-29 - Completed 13-02-PLAN.md

Progress: v1.0 [####################] 100% | v1.1 [####################] 100% | v1.2 [############________] 60%

## Milestones

- **v1.0 MVP** - Shipped 2026-01-28 (7 phases, 16 plans)
- **v1.1 Admin Inline Editing** - Shipped 2026-01-29 (3 phases, 4 plans)
- **v1.2 Dynamic Form Builder** - In progress (5 phases, 5 plans complete)

## Production URLs

- **Application:** https://ft-form.vercel.app
- **Apply form:** https://ft-form.vercel.app/apply
- **Admin login:** https://ft-form.vercel.app/admin/login
- **Convex backend:** https://usable-bobcat-946.convex.cloud

## Performance Metrics

**Velocity:**
- Total plans completed: 25 (v1.0: 16, v1.1: 4, v1.2: 5)
- Average duration: Not tracked for previous milestones
- Total execution time: Not tracked

**By Milestone:**

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 | 7 | 16 | Complete |
| v1.1 | 3 | 4 | Complete |
| v1.2 | 5 | 5/TBD | In progress |

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

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-29
Stopped at: Completed 13-02-PLAN.md
Resume file: None

---
*v1.2 milestone in progress - Phase 13 Plan 02 complete, field renderers ready for DynamicFormRenderer*
