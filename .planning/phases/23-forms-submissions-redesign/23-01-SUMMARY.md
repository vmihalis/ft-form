---
phase: 23
plan: 01
subsystem: forms
tags: [glassmorphism, forms, cards, quick-actions, convex]
dependency-graph:
  requires: [phase-19-glassmorphism, phase-22-form-builder]
  provides: [FormCard, FormQuickActions, forms.list.submissionCount]
  affects: [23-02, 23-03]
tech-stack:
  added: []
  patterns: [glass-card, motion-hover, dropdown-actions]
key-files:
  created:
    - src/components/form-builder/FormCard.tsx
    - src/components/form-builder/FormQuickActions.tsx
  modified:
    - convex/forms.ts
decisions:
  - id: 23-01-D1
    choice: "Join through formVersions for submission count"
    reason: "submissions table has by_version index, not by_form; must aggregate across all versions"
metrics:
  duration: "~5 minutes"
  completed: 2026-01-29
---

# Phase 23 Plan 01: Glass Form Cards Summary

Glass-styled form cards with submission counts and quick actions dropdown for premium forms list UI.

## What Was Built

### 1. Backend: forms.list with submissionCount

Updated the `forms.list` query to include submission count for each form:

```typescript
// convex/forms.ts - list query now returns submissionCount
const formsWithCounts = await Promise.all(
  forms.map(async (form) => {
    // Get all versions for this form
    const versions = await ctx.db
      .query("formVersions")
      .withIndex("by_form", (q) => q.eq("formId", form._id))
      .collect();

    // Count submissions across all versions
    let submissionCount = 0;
    for (const version of versions) {
      const submissions = await ctx.db
        .query("submissions")
        .withIndex("by_version", (q) => q.eq("formVersionId", version._id))
        .collect();
      submissionCount += submissions.length;
    }

    return { ...form, submissionCount };
  })
);
```

Also added `unarchive` mutation for restoring archived forms to draft status.

### 2. FormQuickActions Component

New dropdown component with all form management actions:

- **Edit** - Link to form editor
- **Duplicate** - Callback to duplicate handler
- **Publish** - For draft forms
- **View Live** - For published forms (opens in new tab)
- **Unpublish** - For published forms
- **Archive** - For non-archived forms (destructive styling)
- **Restore** - For archived forms (uses new unarchive mutation)

Located at: `src/components/form-builder/FormQuickActions.tsx`

### 3. FormCard Component

Premium glass-styled card component featuring:

- **glass-card** utility for glassmorphism effect
- Status badge with theme-aware colors (draft=yellow, published=green, archived=muted)
- Form name and slug URL preview
- Submission count and last updated date in footer
- Motion animations (scale on hover/tap) matching ModuleCard pattern
- FormQuickActions dropdown in header

Located at: `src/components/form-builder/FormCard.tsx`

## Key Integration Points

| Component | Depends On | Used By |
|-----------|-----------|---------|
| FormCard | FormQuickActions, forms.list | FormsList (future 23-02) |
| FormQuickActions | api.forms.publish/unpublish/archive/unarchive | FormCard |
| forms.list | formVersions, submissions tables | FormsList, FormCard |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Submission count aggregation | Join through formVersions | submissions table uses by_version index, not by_form; must count across all published versions |
| Glass border styling | Inline style with CSS variable | Tailwind doesn't recognize border-glass-border class; var(--glass-border) used directly |
| Action promise return type | `Promise<unknown>` | Mutations return different types (Id vs object); unknown is safe |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| cd2f3c9 | feat | Add submissionCount to forms.list and unarchive mutation |
| 20a7e17 | feat | Create FormQuickActions dropdown component |
| 1798fb1 | feat | Create FormCard glass component |

## Verification Results

- [x] `npx convex dev` deploys successfully
- [x] `npx tsc --noEmit` passes with no errors
- [x] FormCard.tsx uses glass-card class
- [x] FormQuickActions.tsx has all quick actions with DropdownMenu

## Next Phase Readiness

**Ready for 23-02:** FormCard and FormQuickActions are ready to be integrated into the FormsList component. The forms.list query now returns submissionCount which FormCard expects.

**Integration notes:**
- FormsList will need to render FormCard components in a grid layout
- Duplicate handler exists in FormsList, pass it to FormCard.onDuplicate
- Empty state and loading skeleton should be preserved
