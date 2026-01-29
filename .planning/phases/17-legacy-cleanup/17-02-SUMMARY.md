---
phase: 17-legacy-cleanup
plan: 02
subsystem: cleanup
tags: [refactor, deletion, convex, schema, legacy]

# Dependency graph
requires:
  - phase: 17-01
    provides: Admin dashboard with only Submissions and Forms tabs
provides:
  - Codebase with no legacy application code
  - Clean Convex schema with only 4 dynamic form tables
  - FileField moved to dynamic-form directory
affects: [18-export, 19-dashboard-enhancement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single form system (dynamic forms only)"

key-files:
  created:
    - src/components/dynamic-form/fields/FileField.tsx
  modified:
    - convex/schema.ts
    - src/components/dynamic-form/fields/FileUploadField.tsx
  deleted:
    - src/components/admin/ApplicationsTable.tsx
    - src/components/admin/ApplicationSheet.tsx
    - src/components/admin/EditableField.tsx
    - src/components/admin/EditHistory.tsx
    - src/components/admin/StatusDropdown.tsx
    - src/components/admin/FloorFilter.tsx
    - src/components/admin/columns.tsx
    - src/components/form/ (entire directory)
    - src/lib/stores/form-store.ts
    - src/lib/schemas/application.ts
    - src/types/form.ts
    - src/lib/constants/fieldLabels.ts
    - convex/applications.ts

key-decisions:
  - "FileField relocated to dynamic-form/fields/ instead of deleted (was shared dependency)"
  - "Legacy tables removed from production Convex (applications, editHistory data deleted)"

patterns-established:
  - "All form functionality via dynamic form system only"

# Metrics
duration: 3min
completed: 2026-01-29
---

# Phase 17 Plan 02: Delete Legacy Application Code Summary

**Deleted 26 legacy files including admin components, form directory, and Convex backend - schema now has only 4 dynamic form tables**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-29T14:50:04Z
- **Completed:** 2026-01-29T14:52:42Z
- **Tasks:** 3
- **Files modified/deleted:** 27 (26 deleted, 1 modified)

## Accomplishments

- Deleted 7 legacy admin components (ApplicationsTable, ApplicationSheet, EditableField, EditHistory, StatusDropdown, FloorFilter, columns)
- Deleted entire src/components/form/ directory (13 files: MultiStepForm, steps, fields, etc.)
- Deleted 4 supporting files (form-store, application schema, form types, fieldLabels)
- Deleted convex/applications.ts and removed legacy tables from schema
- Successfully deployed Convex with only 4 tables: forms, formVersions, submissions, submissionEditHistory

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete legacy admin components** - `58f2638` (refactor)
2. **Task 2: Delete legacy form components and supporting code** - `20c5523` (refactor)
3. **Task 3: Remove legacy Convex backend and schema tables** - `f306a33` (refactor)

## Files Created/Modified

- `src/components/dynamic-form/fields/FileField.tsx` - Relocated from deleted form directory (required by FileUploadField)
- `src/components/dynamic-form/fields/FileUploadField.tsx` - Updated import path for FileField
- `convex/schema.ts` - Removed applications table (21 fields, 4 indexes) and editHistory table (5 fields, 2 indexes)

## Decisions Made

- **FileField relocation:** Instead of deleting FileField with the legacy form directory, relocated it to dynamic-form/fields/ since FileUploadField depends on it
- **Data deletion accepted:** Legacy applications and editHistory data was deleted from production Convex as part of schema cleanup

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] FileField dependency relocated**
- **Found during:** Task 2 (Delete legacy form components)
- **Issue:** FileUploadField.tsx imports FileField from deleted src/components/form/fields/FileField
- **Fix:** Moved FileField.tsx to src/components/dynamic-form/fields/ and updated import path
- **Files modified:** src/components/dynamic-form/fields/FileField.tsx (created), src/components/dynamic-form/fields/FileUploadField.tsx (import updated)
- **Verification:** TypeScript compiles successfully
- **Committed in:** 20c5523 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking dependency)
**Impact on plan:** Fix was essential for build to pass. FileField is legitimately needed by dynamic form system.

## Issues Encountered

None - deletions proceeded as expected after fixing the FileField dependency.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Legacy code completely removed
- Codebase is unified under dynamic form system
- Phase 17 (Legacy Cleanup) is complete
- Ready for Phase 18 (Export) - CSV/JSON export functionality
- Admin dashboard works with submissions and forms only

---
*Phase: 17-legacy-cleanup*
*Completed: 2026-01-29*
