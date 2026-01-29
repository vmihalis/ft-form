---
status: resolved
trigger: "React hooks order violation in SubmissionsTable - hook #16 changes from undefined to useEffect between renders"
created: 2026-01-29T00:00:00Z
updated: 2026-01-29T00:05:00Z
---

## Current Focus

hypothesis: CONFIRMED - Early return on line 92-94 (before useEffect on line 110) caused hook count to change between renders
test: Moved useEffect before early return
expecting: All hooks now called consistently on every render
next_action: COMPLETE

## Symptoms

expected: React hooks called in same order on every render
actual: Hook #16 is undefined on previous render, useEffect on next render - order violation
errors: React has detected a change in the order of Hooks called by SubmissionsTable
reproduction: Rendering SubmissionsTable, triggered by state change when data loads
started: Current - happening during admin dashboard rendering

## Eliminated

(none - first hypothesis was correct)

## Evidence

- timestamp: 2026-01-29T00:01:00Z
  checked: src/components/admin/SubmissionsTable.tsx structure
  found: Early return at line 92-94 (`if (submissions === undefined) return <TableSkeleton />`) occurs BEFORE useEffect at line 110
  implication: When submissions is undefined (loading state), useEffect is never called. When data loads, useEffect IS called. This changes the hook count between renders.

- timestamp: 2026-01-29T00:02:00Z
  checked: Hook count analysis
  found: |
    Hooks before early return:
    1. useQuery (line 68)
    2-6. useState x5 (lines 69-73)
    7. useReactTable (which contains multiple internal hooks - useMemo, useContext, useMemo, useState, useEffect, useMemo, useState, useEffect, useState x7)

    Hook AFTER early return (line 110):
    16. useEffect - THIS IS THE PROBLEM
  implication: The useEffect at line 110 is hook #16. When early return triggers, only 15 hooks run. When data loads, 16 hooks run.

- timestamp: 2026-01-29T00:04:00Z
  checked: Fix applied and verified
  found: useEffect moved from line 110 to line 93 (before early return at line 99)
  implication: All hooks now called consistently regardless of loading state

- timestamp: 2026-01-29T00:05:00Z
  checked: ESLint verification
  found: No hook order errors. Only pre-existing TanStack Table warning (unrelated)
  implication: Fix is correct and complete

## Resolution

root_cause: Early return on line 92-94 occurred BEFORE the useEffect on line 110. When `submissions === undefined`, the component returned early and the useEffect was never called. When submissions loaded (became defined), the useEffect WAS called. This changed the total hook count from 15 to 16 between renders, violating React's Rules of Hooks.

fix: Moved the useEffect (date filter effect) from after the early return to BEFORE the early return (now at lines 91-96). Added explanatory comment documenting why hook must be before early return.

verification: ESLint check passed with no hooks-related errors. File compiles correctly. Hook order is now consistent: all 16 hooks run on every render.

files_changed:
  - src/components/admin/SubmissionsTable.tsx
