---
phase: 13-dynamic-form-renderer
plan: 01
subsystem: ui
tags: [zod, zustand, next.js, convex, dynamic-forms, validation]

# Dependency graph
requires:
  - phase: 11-schema-foundation
    provides: FormSchema types, forms.getBySlug query
provides:
  - Dynamic route at /apply/[slug]
  - Schema-to-Zod validation conversion
  - Multi-form draft persistence with Zustand
affects: [13-02 form-renderer, 13-03 step-navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zod v4 schema generation from JSON config
    - Multi-keyed Zustand store for slug-based drafts

key-files:
  created:
    - src/app/apply/[slug]/page.tsx
    - src/lib/schemas/dynamic-form.ts
    - src/lib/stores/dynamic-form-store.ts
  modified: []

key-decisions:
  - "Zod v4 API: Use message param for coerce.number and enum errors"
  - "Draft locking: Store versionId to detect form version changes"
  - "Optional fields: Use schema.optional().or(z.literal('')) pattern for string types"

patterns-established:
  - "buildFieldSchema: Convert FormField config to Zod validation"
  - "useDynamicFormStore: Multi-form draft persistence by slug"

# Metrics
duration: 3min
completed: 2026-01-29
---

# Phase 13 Plan 01: Dynamic Form Infrastructure Summary

**Dynamic route /apply/[slug] with Convex query, Zod v4 schema generation for all field types, and multi-form Zustand store for draft persistence**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-29T02:02:08Z
- **Completed:** 2026-01-29T02:05:02Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- Created /apply/[slug] route with loading and 404 states
- Implemented buildFieldSchema supporting all 10 field types
- Built useDynamicFormStore for multi-form draft persistence by slug
- Validated compilation with npm run build

## Task Commits

Each task was committed atomically:

1. **Task 1: Create dynamic form route and Zod schema generation** - `86b72f7` (feat)
2. **Task 2: Create dynamic form Zustand store** - `e641ba7` (feat)

**Bug fix:** `533a560` (fix) - Zod v4 API compatibility

## Files Created/Modified

- `src/app/apply/[slug]/page.tsx` - Dynamic route entry point with Convex query
- `src/lib/schemas/dynamic-form.ts` - Schema-to-Zod conversion functions
- `src/lib/stores/dynamic-form-store.ts` - Multi-form draft persistence store

## Decisions Made

- **Zod v4 API:** Used `message` param instead of `invalid_type_error` and `errorMap` for Zod v4 compatibility
- **Draft locking:** Store versionId in draft to detect if form schema changed since draft creation
- **Optional fields:** Use `.optional().or(z.literal(""))` pattern to allow empty strings for optional string-type fields

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod v4 API mismatch**

- **Found during:** Verification (npm run build)
- **Issue:** Used `invalid_type_error` and `errorMap` params which don't exist in Zod v4
- **Fix:** Changed to `message` param for both z.coerce.number and z.enum
- **Files modified:** src/lib/schemas/dynamic-form.ts
- **Verification:** npm run build succeeds
- **Committed in:** 533a560

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix was necessary for compilation. No scope creep.

## Issues Encountered

None - all planned work completed as specified.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dynamic route infrastructure ready for form renderer (Plan 02)
- Schema-to-Zod conversion ready for form validation
- Draft persistence ready for multi-step navigation
- Placeholder UI in place for form renderer to replace

---

*Phase: 13-dynamic-form-renderer*
*Completed: 2026-01-29*
