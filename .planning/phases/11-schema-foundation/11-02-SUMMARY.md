---
phase: 11-schema-foundation
plan: 02
subsystem: database
tags: [convex, mutations, queries, forms, submissions, versioning]

# Dependency graph
requires:
  - phase: 11-01
    provides: Convex schema tables (forms, formVersions, submissions, submissionEditHistory)
provides:
  - Form CRUD mutations (create, update, archive)
  - Form publishing with immutable version snapshots
  - Slug uniqueness enforcement
  - Submission mutations with version linking
  - Submission queries with schema lookup
affects: [13-dynamic-renderer, 14-form-builder, 15-admin-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JSON string storage for nested form schemas"
    - "Immutable version snapshots on publish"
    - "Submissions reference formVersionId, not formId"
    - "Manual slug uniqueness via index query"

key-files:
  created:
    - convex/forms.ts
    - convex/submissions.ts
  modified: []

key-decisions:
  - "Reserved slugs list prevents route conflicts (admin, api, apply, etc.)"
  - "Slug normalization enforces URL-safe format (lowercase, alphanumeric+hyphens)"
  - "Empty schema created on form creation (not null)"
  - "List queries exclude full schema/data for performance"

patterns-established:
  - "Version increment: query by_form desc, get latest, add 1"
  - "Form status transitions: draft -> published -> archived"
  - "Edit history creation: capture old value before patch"

# Metrics
duration: 3min
completed: 2026-01-29
---

# Phase 11 Plan 02: Forms and Submissions API Summary

**Convex mutations and queries for form CRUD, publishing with immutable versions, and submission handling with schema lookup**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-29T00:47:04Z
- **Completed:** 2026-01-29T00:50:00Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- Form CRUD with slug uniqueness and reserved path protection
- Immutable version snapshots created on publish (version number auto-increments)
- Submissions linked to formVersionId (not formId) for data integrity
- Query for submission with schema lookup for display rendering
- Edit history tracking for submission field updates

## Task Commits

Each task was committed atomically:

1. **Task 1: Create forms.ts with CRUD and publishing mutations** - `cb9d388` (feat)
2. **Task 2: Create submissions.ts with submission handling** - `e983714` (feat)

## Files Created

- `convex/forms.ts` - Form CRUD mutations (create, update, publish, archive) and queries (getBySlug, getById, list, listVersions)
- `convex/submissions.ts` - Submission mutations (submit, updateStatus, updateField) and queries (getWithSchema, list, getEditHistory)

## API Reference

### forms.ts Exports

| Export | Type | Purpose |
|--------|------|---------|
| `create` | mutation | Create new form with empty schema, validates slug uniqueness |
| `update` | mutation | Update form metadata and draft schema |
| `publish` | mutation | Create immutable version snapshot, increment version number |
| `archive` | mutation | Mark form as archived (no new submissions) |
| `getBySlug` | query | Get published form with parsed schema (public rendering) |
| `getById` | query | Get form with parsed draftSchema (admin editing) |
| `list` | query | List all forms without schema (admin dashboard) |
| `listVersions` | query | Get all versions of a form (version history) |

### submissions.ts Exports

| Export | Type | Purpose |
|--------|------|---------|
| `submit` | mutation | Submit form response, links to formVersionId |
| `getWithSchema` | query | Get submission with parsed data AND schema |
| `list` | query | List submissions with form metadata, filter by formId/status |
| `updateStatus` | mutation | Change submission status |
| `updateField` | mutation | Update single field value, creates edit history |
| `getEditHistory` | query | Get edit history for a submission |

## Decisions Made

1. **Reserved slugs list** - Prevents form slugs from conflicting with app routes (admin, api, apply, login, logout, auth, _next)
2. **Slug normalization** - Automatically converts to URL-safe format (lowercase, alphanumeric + hyphens only)
3. **Empty schema on create** - New forms start with `{ steps: [], settings: {...} }` rather than null
4. **Performance optimization** - List queries exclude full schema/data payloads
5. **Version number strategy** - Query latest version by formId descending, increment by 1

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for:
- **Phase 12 (Form Builder Types):** TypeScript types for form builder UI components
- **Phase 13 (Dynamic Renderer):** Can use `getBySlug` query to render forms
- **Phase 14 (Form Builder UI):** Can use `create`, `update`, `publish` mutations

No blockers or concerns.

---
*Phase: 11-schema-foundation*
*Completed: 2026-01-29*
