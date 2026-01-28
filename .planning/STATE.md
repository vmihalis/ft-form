# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-27)

**Core value:** Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.
**Current focus:** Phase 6 - Admin Dashboard (COMPLETE)

## Current Position

Phase: 6 of 7 (Admin Dashboard)
Plan: 3 of 3 complete
Status: Phase complete
Last activity: 2026-01-28 - Completed 06-03-PLAN.md

Progress: [##########] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 17
- Average duration: 2min 16s
- Total execution time: ~41min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-data-layer | 2 | 9min 27s | 4min 44s |
| 02-form-infrastructure | 2 | 5min 25s | 2min 43s |
| 03-form-ui-static | 5 | 13min 8s | 2min 38s |
| 04-form-polish-and-animations | 3 | ~4min | ~1min 20s |
| 05-admin-authentication | 2 | 3min 21s | 1min 41s |
| 06-admin-dashboard | 3 | 5min 0s | 1min 40s |

**Recent Trend:**
- Last 5 plans: 05-02 (1m 48s), 06-01 (1m 7s), 06-02 (1m 51s), 06-03 (2m 2s)
- Trend: Fast execution continues

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Rationale | Plan |
|----------|-----------|------|
| Tailwind CSS 4 @import syntax | Default in Next.js 16, no config file needed | 01-01 |
| Module-scope Convex client | Prevents WebSocket reconnection on re-renders | 01-01 |
| shadcn/ui New York style | Professional appearance for application form | 01-02 |
| CSS variables enabled | Allows easy theme customization later | 01-02 |
| Zod 4 schema syntax | Latest version with improved API | 02-01 |
| skipHydration: true | Prevents SSR hydration mismatches in Zustand | 02-01 |
| localStorage key: ft-form-draft | Consistent naming for form draft persistence | 02-01 |
| Loading spinner during hydration | Prevents flash of default state | 02-02 |
| ProgressIndicator hidden on Welcome/Confirmation | Cleaner flow for non-form steps | 02-02 |
| Back saves values without validation | Better UX, users can go back freely | 02-02 |
| kebab-case floor values | Cleaner database storage while labels show human-readable format | 03-01 |
| 11 floor options including "other" | Covers existing floors and allows custom proposals | 03-01 |
| h1 only on WelcomeStep | Proper document outline, other steps use h2 | 03-02 |
| Controller for Select | Required for Radix Select with react-hook-form | 03-02 |
| useWatch with defaultValue | Prevents undefined flash on conditional fields | 03-02 |
| Consistent 50 char minimum for roadmap | All phases share same validation for consistency | 03-03 |
| Time-based phase labels | Clear timeframes (3mo, 3-6mo, 6+mo) for scoping responses | 03-03 |
| Native date input for startDate | Uses browser date picker for better UX | 03-03 |
| getValues() for live data in ReviewStep | Shows current form state, not stale snapshot | 03-04 |
| Optional fields to undefined | Convex v.optional() expects undefined, not empty string | 03-04 |
| Prevent reset on confirmation | resetForm() should not run when user views confirmation | 03-05 |
| Explicit button type="button" | Prevents accidental form submission on step transitions | 03-05 |
| break-words for Review cards | Long text wraps properly in card boundaries | 03-05 |
| oklch color space for brand purple | Better perceptual uniformity than hex | 04-01 |
| Same purple for light/dark modes | Consistent brand identity across themes | 04-01 |
| 50px slide distance | Subtle movement for premium Typeform-style feel | 04-02 |
| 300ms animation duration | Matches Typeform-style smooth timing | 04-02 |
| Inline animation values over variants | More reliable with AnimatePresence mode="wait" | 04-03 |
| jose for JWT sessions | Official Next.js docs recommend, Edge-compatible, zero deps | 05-01 |
| server-only import guard | Prevents SESSION_SECRET exposure to client bundle | 05-01 |
| 7-day session expiration | Balance security with admin convenience | 05-01 |
| Middleware at src/ root | Next.js convention, not in app/ folder | 05-02 |
| Defense-in-depth session checks | Both middleware AND page verify session | 05-02 |
| useActionState for login form | Modern React pattern with pending state | 05-02 |
| TanStack Table 8.x for admin table | Headless state management, pairs with shadcn | 06-01 |
| Convex query with index ordering | by_submitted index with desc order for newest first | 06-01 |
| Relative imports for Convex types | @/* maps to ./src/*, convex is at project root | 06-02 |
| globalFilterFn targets name/initiative only | Custom filter searches fullName and initiativeName columns | 06-02 |
| StatusDropdown stopPropagation | Prevents row click when interacting with status dropdown | 06-03 |
| AdminDashboard as client component | Allows server page to verify session while client handles state | 06-03 |

### Pending Todos

None.

### Blockers/Concerns

None - Phase 6 complete.

## Phase 6 Complete

**All 3 plans complete:**
- 06-01: Foundation Dependencies (TanStack Table, shadcn components, Convex functions)
- 06-02: ApplicationsTable Component (table with real-time data, filters, skeleton)
- 06-03: Detail Sheet & Status Actions (ApplicationSheet, StatusDropdown, AdminDashboard)

**What's ready:**
- Complete admin dashboard at /admin
- Applications table with floor filter and name/initiative search
- Detail sheet showing all application fields organized by section
- Status management via dropdown with real-time Convex updates
- Session-protected with middleware and page-level verification

## Session Continuity

Last session: 2026-01-28
Stopped at: Completed 06-03-PLAN.md (Phase 6 complete)
Resume file: None

---
*Next step: Phase 7 - Review & Polish*
