---
phase: 15
plan: 01
subsystem: admin-ui
tags: [tabs, navigation, form-management, duplication]
dependency-graph:
  requires: [14-form-builder-ui]
  provides: [admin-tabs, form-duplication]
  affects: [15-02-submissions-table, 15-03-submission-sheet]
tech-stack:
  added: ["@radix-ui/react-tabs"]
  patterns: [url-synced-tabs, mutation-with-navigation]
key-files:
  created:
    - src/components/admin/AdminTabs.tsx
    - src/components/ui/tabs.tsx
  modified:
    - src/components/admin/AdminDashboard.tsx
    - src/components/form-builder/FormsList.tsx
    - convex/forms.ts
decisions:
  - id: tab-url-sync
    choice: URL query params (?tab=) for tab state
    why: Enables bookmarking/sharing, maintains single /admin route
  - id: duplicate-navigation
    choice: Navigate to new form immediately after duplication
    why: User expectation is to edit the newly created copy
metrics:
  duration: 3m
  completed: 2026-01-29
---

# Phase 15 Plan 01: Admin Tabs and Form Duplication Summary

**One-liner:** Tabbed admin dashboard with Applications/Submissions/Forms tabs and form duplication via slug-collision-safe mutation.

## What Was Built

### AdminTabs Component (`src/components/admin/AdminTabs.tsx`)

Tab navigation component with three tabs:
- **Applications**: Legacy floor lead applications (existing functionality)
- **Submissions**: Placeholder for Plan 02 (SubmissionsTable)
- **Forms**: Renders FormsList component

Key features:
- URL-synced tab state via `?tab=` query param
- Clean URL for default (applications) tab
- Suspense boundary for useSearchParams compatibility
- Passes application selection state to child components

### Form Duplication (`convex/forms.ts`)

New `forms.duplicate` mutation:
- Creates copy with "(Copy)" suffix in name
- Generates unique slug with "-copy" suffix
- Handles slug collisions: `-copy`, `-copy-1`, `-copy-2`, etc.
- New form starts in draft status
- Preserves original form's schema and description

### FormsList Updates (`src/components/form-builder/FormsList.tsx`)

Added Duplicate action:
- Copy icon button in Actions column
- Disabled state while duplicating
- Navigates to new form editor on success
- Error logging on failure

## Technical Details

### Tab State Management

```typescript
// URL sync pattern
const searchParams = useSearchParams();
const currentTab = searchParams.get("tab") || "applications";

const handleTabChange = (value: string) => {
  const params = new URLSearchParams(searchParams.toString());
  if (value === "applications") {
    params.delete("tab"); // Clean URL for default
  } else {
    params.set("tab", value);
  }
  router.push(`/admin${queryString}`);
};
```

### Slug Collision Handling

```typescript
// convex/forms.ts
const baseSlug = form.slug + "-copy";
let slug = baseSlug;
let counter = 1;

while (true) {
  const existing = await ctx.db
    .query("forms")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (!existing) break;
  slug = `${baseSlug}-${counter++}`;
}
```

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tab state storage | URL query params | Enables bookmarking, sharing, browser history |
| Default tab URL | No query param | Cleaner URL for most common case |
| Post-duplicate action | Navigate to editor | User expectation to edit new copy |
| Duplicate naming | "(Copy)" suffix | Clear indication of relationship to original |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed shadcn/ui tabs component**
- **Found during:** Task 1
- **Issue:** tabs.tsx didn't exist in components/ui
- **Fix:** Ran `npx shadcn@latest add tabs --yes`
- **Files created:** `src/components/ui/tabs.tsx`
- **Commit:** bbf91f8

## Commit Log

| Hash | Type | Description |
|------|------|-------------|
| bbf91f8 | feat | Add admin tabs navigation |
| 537ab88 | feat | Add form duplication capability |

## Files Changed

### Created
- `src/components/admin/AdminTabs.tsx` - Tab navigation component
- `src/components/ui/tabs.tsx` - shadcn tabs component (auto-installed)

### Modified
- `src/components/admin/AdminDashboard.tsx` - Now renders AdminTabs
- `src/components/form-builder/FormsList.tsx` - Added Duplicate action
- `convex/forms.ts` - Added duplicate mutation
- `package.json` / `package-lock.json` - Added @radix-ui/react-tabs

## Verification Checklist

- [x] Navigate to /admin - three tabs visible (Applications, Submissions, Forms)
- [x] Click Forms tab - shows list of forms
- [x] Click Duplicate on a form - creates copy with unique slug
- [x] New form opens in editor with "(Copy)" suffix in name
- [x] URL reflects current tab (?tab=forms)
- [x] TypeScript compiles without errors
- [x] Convex functions synced successfully

## Next Phase Readiness

**Ready for Plan 02:** SubmissionsTable and FormFilter
- AdminTabs has placeholder for submissions tab content
- FormsList pattern provides table structure template
- Tab infrastructure ready for new content
