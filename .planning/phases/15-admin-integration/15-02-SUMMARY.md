---
phase: 15-admin-integration
plan: 02
completed: 2026-01-29

subsystem: admin-ui
tags: [tanstack-table, convex, submissions, filter]

dependency-graph:
  requires: [15-01]
  provides: [SubmissionsTable, submissionsColumns, FormFilter]
  affects: [15-03]

tech-stack:
  added: []
  patterns: [TanStack Table column definitions, form filter pattern]

key-files:
  created:
    - src/components/admin/SubmissionsTable.tsx
    - src/components/admin/submissions-columns.tsx
    - src/components/admin/FormFilter.tsx
  modified:
    - src/components/admin/SearchInput.tsx
    - src/components/admin/AdminTabs.tsx

decisions:
  - Filter by formName column value (not formId) for UI simplicity
  - Reuse SearchInput with optional placeholder prop
  - State prepared for SubmissionSheet integration (Plan 03)

metrics:
  duration: ~2 minutes
  tasks: 3/3
---

# Phase 15 Plan 02: Submissions Table Summary

Submissions table with form filter for viewing dynamic form submissions in admin dashboard.

## What Was Built

### 1. SubmissionsTable Component (`src/components/admin/SubmissionsTable.tsx`)

TanStack Table for displaying dynamic form submissions following ApplicationsTable pattern:

- **Data source:** `api.submissions.list` query
- **Columns:** Form Name, Status, Submitted Date
- **Global filter:** Search by form name
- **Column filter:** FormFilter integration on formName column
- **Row click:** Callback for opening detail sheet (state ready for Plan 03)
- **Loading state:** TableSkeleton with shimmer effect
- **Empty state:** "No submissions found." message

### 2. Column Definitions (`src/components/admin/submissions-columns.tsx`)

TanStack Table column definitions:

- **SubmissionRow type:** `_id`, `formVersionId`, `status`, `submittedAt`, `formName`, `formSlug`, `version`
- **Status badge colors:**
  - `new`: blue (bg-blue-100 text-blue-800)
  - `under_review`: yellow (bg-yellow-100 text-yellow-800)
  - `accepted`: green (bg-green-100 text-green-800)
  - `rejected`: red (bg-red-100 text-red-800)
- **Date formatting:** "Jan 29, 2026" format

### 3. FormFilter Component (`src/components/admin/FormFilter.tsx`)

Dropdown filter for forms following FloorFilter pattern:

- **Data source:** `api.forms.list` query
- **Options:** "All Forms" + each form by name
- **Integration:** Wired to SubmissionsTable formName column filter

### 4. AdminTabs Integration

- Replaced placeholder with SubmissionsTable
- Added `selectedSubmission` and `submissionSheetOpen` state
- Added `handleSubmissionClick` handler for row selection
- Ready for SubmissionSheet component (Plan 03)

## Key Links Verified

| From | To | Via | Pattern |
|------|------|------|---------|
| SubmissionsTable.tsx | convex/submissions.ts | useQuery | `api\.submissions\.list` |
| SubmissionsTable.tsx | FormFilter.tsx | import | `import.*FormFilter` |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 3a52fa8 | feat | create SubmissionsTable and columns components |
| 595d536 | feat | create FormFilter dropdown component |
| 463563f | feat | wire SubmissionsTable to AdminTabs |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added placeholder prop to SearchInput**

- **Found during:** Task 1
- **Issue:** SearchInput had hardcoded placeholder "Search by name or initiative..." which doesn't apply to submissions
- **Fix:** Added optional `placeholder` prop with default value
- **Files modified:** `src/components/admin/SearchInput.tsx`
- **Commit:** 3a52fa8

## Integration Points

- **AdminTabs:** SubmissionsTable renders in submissions tab
- **Plan 03:** State ready for SubmissionSheet integration
- **Convex API:** Uses existing `api.submissions.list` and `api.forms.list`

## Verification

All must-haves verified:

1. SubmissionsTable displays all dynamic form submissions - PASS
2. Admin can filter submissions by which form they came from - PASS (FormFilter)
3. Submissions show form name, status, and submitted date - PASS
4. Clicking a submission row opens detail sheet (placeholder for Plan 03) - PASS (state set)

## Next Phase Readiness

Plan 03 (SubmissionSheet) can proceed:

- `selectedSubmission` state available in AdminTabs
- `submissionSheetOpen` state available in AdminTabs
- `SubmissionRow` type exported from submissions-columns.tsx
