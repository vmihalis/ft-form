---
phase: 06-admin-dashboard
plan: 02
subsystem: ui
tags: [tanstack-table, react-table, convex, real-time, filtering]

# Dependency graph
requires:
  - phase: 06-01
    provides: TanStack Table installed, shadcn UI components (table, badge, skeleton), Convex list query
provides:
  - ApplicationsTable component with real-time Convex subscription
  - Floor filter dropdown using FRONTIER_TOWER_FLOORS constants
  - Global search filtering by name and initiative
  - StatusBadge component for status visualization
  - TanStack Table column definitions
affects: [06-03, admin-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TanStack Table with Convex useQuery for real-time tables
    - Column filtering with filterFn: "equals"
    - Global filter with custom search function

key-files:
  created:
    - src/components/admin/ApplicationsTable.tsx
    - src/components/admin/columns.tsx
    - src/components/admin/StatusBadge.tsx
    - src/components/admin/FloorFilter.tsx
    - src/components/admin/SearchInput.tsx
  modified: []

key-decisions:
  - "Relative imports for convex/_generated (not in src/ path alias)"
  - "globalFilterFn searches only fullName and initiativeName columns"
  - "TableSkeleton inline in ApplicationsTable for colocation"

patterns-established:
  - "Admin table components in src/components/admin/"
  - "Convex Doc type import via relative path from columns"

# Metrics
duration: 1min 51s
completed: 2026-01-28
---

# Phase 6 Plan 2: Applications Table Summary

**TanStack Table with real-time Convex subscription, floor filtering, and name/initiative search**

## Performance

- **Duration:** 1min 51s
- **Started:** 2026-01-28T00:45:04Z
- **Completed:** 2026-01-28T00:46:55Z
- **Tasks:** 3
- **Files created:** 5

## Accomplishments
- ApplicationsTable component with real-time useQuery subscription
- Floor filter dropdown populated from FRONTIER_TOWER_FLOORS constants
- Global search filtering by applicant name and initiative name only
- Color-coded StatusBadge component (new/under_review/accepted/rejected)
- Skeleton loading state with 5 rows while data loads
- Empty state with "No applications found" message
- Clickable rows with onRowClick callback for detail sheet

## Task Commits

Each task was committed atomically:

1. **Task 1: Create StatusBadge, FloorFilter, and SearchInput components** - `3370fb9` (feat)
2. **Task 2: Create column definitions for TanStack Table** - `13c7914` (feat)
3. **Task 3: Create ApplicationsTable with real-time data and filtering** - `7d4d810` (feat)

## Files Created

- `src/components/admin/StatusBadge.tsx` - Color-coded badge for application status
- `src/components/admin/FloorFilter.tsx` - Floor dropdown filter using FRONTIER_TOWER_FLOORS
- `src/components/admin/SearchInput.tsx` - Search input with magnifying glass icon
- `src/components/admin/columns.tsx` - TanStack Table column definitions with 6 columns
- `src/components/admin/ApplicationsTable.tsx` - Main table with real-time data, filters, skeleton

## Decisions Made

- **Relative imports for Convex types:** Used `../../../convex/_generated/dataModel` because `@/*` path alias maps to `./src/*` and convex is at project root
- **Inline TableSkeleton:** Kept skeleton component in same file as ApplicationsTable for colocation and single-use pattern
- **globalFilterFn targeting:** Custom filter function only searches fullName and initiativeName (not email, floor, etc.) per plan spec

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Convex import path**
- **Found during:** Task 2 (column definitions)
- **Issue:** `@/convex/_generated/dataModel` failed because @/* maps to ./src/*, convex is at root
- **Fix:** Changed to relative import `../../../convex/_generated/dataModel`
- **Files modified:** src/components/admin/columns.tsx
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 13c7914 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Path alias fix necessary for compilation. No scope creep.

## Issues Encountered

None - plan executed as written after import path fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ApplicationsTable ready to integrate into admin page
- onRowClick callback prepared for detail sheet integration (06-03)
- Floor filter and search working, ready for real data testing

---
*Phase: 06-admin-dashboard*
*Completed: 2026-01-28*
