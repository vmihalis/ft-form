---
phase: 28-integration-polish
plan: 01
subsystem: api, ui
tags: [convex, dropdown, form-creation, ai-integration]

# Dependency graph
requires:
  - phase: 27-form-generation-preview
    provides: AI form generation wizard with schema output
provides:
  - isSlugAvailable query for real-time slug validation
  - createWithSchema mutation for AI-generated form creation
  - NewFormDropdown component with Manual/AI creation paths
  - Updated forms list page with dropdown entry point
affects: [28-02-PLAN, 28-03-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Slug availability check before form creation"
    - "AI forms always created as draft (CRT-03)"

key-files:
  created:
    - src/components/form-builder/NewFormDropdown.tsx
  modified:
    - convex/forms.ts
    - src/app/admin/forms/page.tsx

key-decisions:
  - "isSlugAvailable returns false for empty slugs, not just taken/reserved"
  - "createWithSchema validates JSON before insertion"

patterns-established:
  - "NewFormDropdown pattern: trigger button + dropdown menu for multi-path actions"

# Metrics
duration: 2min
completed: 2026-02-04
---

# Phase 28 Plan 01: Backend & Entry Point Summary

**Slug validation query, AI form creation mutation, and NewFormDropdown component for discoverable form creation paths**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-04T00:39:04Z
- **Completed:** 2026-02-04T00:41:02Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- `isSlugAvailable` query enables real-time slug validation before form creation
- `createWithSchema` mutation creates draft forms with pre-populated AI-generated schemas
- NewFormDropdown provides discoverable entry points for both manual and AI form creation
- Forms list page updated to use dropdown instead of simple button

## Task Commits

Each task was committed atomically:

1. **Task 1: Add isSlugAvailable query and createWithSchema mutation** - `70f4b14` (feat)
2. **Task 2: Create NewFormDropdown component** - `315ef32` (feat)
3. **Task 3: Update forms list page to use NewFormDropdown** - `963f597` (feat)

## Files Created/Modified
- `convex/forms.ts` - Added isSlugAvailable query and createWithSchema mutation
- `src/components/form-builder/NewFormDropdown.tsx` - New dropdown component with Manual/AI options
- `src/app/admin/forms/page.tsx` - Replaced Link/Button with NewFormDropdown

## Decisions Made
- `isSlugAvailable` returns false for empty slugs (defensive validation)
- `createWithSchema` validates draftSchema JSON before insertion (prevents corrupt data)
- AI-generated forms always created as draft status per CRT-03 requirement

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Backend ready: `isSlugAvailable` and `createWithSchema` deployed to Convex
- Entry point ready: NewFormDropdown renders on /admin/forms
- Ready for Plan 02: Draft creation flow connecting wizard output to createWithSchema
- /admin/forms/new/ai route needs to be created (Plan 02)

---
*Phase: 28-integration-polish*
*Completed: 2026-02-04*
