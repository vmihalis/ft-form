---
phase: 17-legacy-cleanup
plan: 01
subsystem: ui
tags: [admin, dashboard, tabs, cleanup, refactor]

# Dependency graph
requires:
  - phase: 16-form-migration
    provides: Dynamic form submissions system replacing legacy applications
provides:
  - Admin dashboard with only Submissions and Forms tabs
  - Submissions as default admin view
  - Clean separation from legacy application components
affects: [17-02-component-deletion, 17-03-database-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Simplified component composition (no prop drilling for removed state)"

key-files:
  created: []
  modified:
    - src/components/admin/AdminDashboard.tsx
    - src/components/admin/AdminTabs.tsx

key-decisions:
  - "Submissions becomes default tab (was Applications)"
  - "AdminDashboard no longer manages any state (AdminTabs handles its own)"

patterns-established:
  - "Tab default handling via URL params with cleaner URLs for default value"

# Metrics
duration: 5min
completed: 2026-01-29
---

# Phase 17 Plan 01: Remove Applications Tab Summary

**Removed legacy Applications tab from admin dashboard, making Submissions the default view with simplified component structure**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-29T14:42:00Z
- **Completed:** 2026-01-29T14:47:44Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Removed all legacy application state from AdminDashboard (selectedApplication, sheetOpen, handleApplicationSelect)
- Removed Applications tab, ApplicationsTable, and ApplicationSheet from AdminTabs
- Changed default tab from "applications" to "submissions"
- Simplified AdminDashboard to a pure Suspense wrapper with no state management

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove legacy application state from AdminDashboard** - `8a3792a` (refactor)
2. **Task 2: Remove Applications tab from AdminTabs** - `38dab19` (refactor)
3. **Task 3: Verify build and runtime** - No commit (verification only)

## Files Created/Modified

- `src/components/admin/AdminDashboard.tsx` - Simplified to pure Suspense wrapper, removed all application state
- `src/components/admin/AdminTabs.tsx` - Removed Applications tab, ApplicationsTable import, ApplicationSheet import, and AdminTabsProps interface

## Decisions Made

- **Submissions as default:** Changed from Applications to Submissions as the default tab since legacy applications are being phased out
- **Clean URL for default:** When on Submissions tab, no `?tab=` param in URL (cleaner URLs)
- **No state in AdminDashboard:** Removed all state management since AdminTabs handles submission state internally

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward removal of legacy code.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Admin dashboard now cleanly separated from legacy application components
- ApplicationsTable.tsx, ApplicationSheet.tsx, and applications-columns.tsx files still exist but are no longer imported
- Plan 02 can safely delete all legacy application component files
- Plan 03 can clean up the database schema and unused Convex functions

---
*Phase: 17-legacy-cleanup*
*Completed: 2026-01-29*
