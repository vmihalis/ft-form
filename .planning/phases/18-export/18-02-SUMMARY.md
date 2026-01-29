---
phase: 18-export
plan: 02
subsystem: ui
tags: [csv, export, tanstack-table, convex]

# Dependency graph
requires:
  - phase: 18-01
    provides: CSV utility functions, status/date filters
provides:
  - Export button component with loading state
  - Convex listForExport query returning submissions with schema
  - Filter bar integration with export functionality
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional Convex query (skip until triggered)"
    - "Schema-driven CSV headers from form fields"

key-files:
  created:
    - src/components/admin/ExportButton.tsx
  modified:
    - convex/submissions.ts
    - src/components/admin/SubmissionsFilters.tsx
    - src/components/admin/SubmissionsTable.tsx

key-decisions:
  - "Export takes submission IDs from filtered table rows (ensures exact match with UI)"
  - "Schema parsed on export to build human-readable headers"
  - "Filename includes form name and date for organization"

patterns-established:
  - "Conditional query pattern: useQuery(api.x.y, condition ? args : 'skip')"
  - "Export button receives filtered IDs from parent table"

# Metrics
duration: 2min
completed: 2026-01-29
---

# Phase 18 Plan 02: Export Button Summary

**Export button with schema-driven CSV headers that respects all active table filters**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-29T15:23:06Z
- **Completed:** 2026-01-29T15:25:21Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Export button integrated into submissions filter bar
- CSV export includes all form fields with human-readable labels from schema
- Export respects all active filters (form, status, date range, search)
- Loading state shown during data fetch
- Descriptive filename with form name and date

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Convex query for export data** - `734f42e` (feat)
2. **Task 2: Create ExportButton component** - `458365c` (feat)
3. **Task 3: Wire export button into SubmissionsTable** - `5f82401` (feat)

## Files Created/Modified

- `convex/submissions.ts` - Added listForExport query returning submissions with parsed data and schema
- `src/components/admin/ExportButton.tsx` - Export button with conditional query and schema-driven headers
- `src/components/admin/SubmissionsFilters.tsx` - Added ExportButton and filtered count display
- `src/components/admin/SubmissionsTable.tsx` - Pass filtered IDs to SubmissionsFilters

## Decisions Made

- **Export query takes IDs, not filters:** The export query takes submission IDs directly from the filtered table rows rather than re-filtering on the server. This ensures the export exactly matches what the user sees in the UI.
- **Schema headers built on export:** The form schema is fetched and parsed at export time to build human-readable column headers. This ensures labels match the form definition.
- **useEffect for CSV generation:** Used useEffect to handle the async query result and trigger download, preventing React state update issues during render.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- EXPORT-01 complete: Admin can download all submissions for a form as CSV
- EXPORT-02 complete: Admin can filter by status and date range before exporting
- Phase 18 complete - ready for Phase 19 (Dashboard Enhancement)

---
*Phase: 18-export*
*Completed: 2026-01-29*
