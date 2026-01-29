---
phase: 19
plan: 03
subsystem: admin-dashboard
tags: [notes, internal, admin-tools]
dependency-graph:
  requires: [19-01, 19-02]
  provides: [internal-notes, submission-annotations]
  affects: []
tech-stack:
  added: []
  patterns: [save-on-blur, optimistic-ui]
file-tracking:
  key-files:
    created:
      - src/components/admin/NotesEditor.tsx
    modified:
      - convex/schema.ts
      - convex/submissions.ts
      - src/components/admin/SubmissionSheet.tsx
decisions: []
metrics:
  duration: 4 minutes
  completed: 2026-01-29
---

# Phase 19 Plan 03: Internal Notes Summary

Internal notes feature enables admin collaboration on submissions with save-on-blur persistence.

## What Was Built

### 1. Schema Extension
**File:** `convex/schema.ts`

Added optional `notes` field to submissions table:
```typescript
notes: v.optional(v.string()),  // Admin internal notes
```

Field is optional so existing submissions work without migration.

### 2. updateNotes Mutation
**File:** `convex/submissions.ts`

New mutation for saving notes:
```typescript
export const updateNotes = mutation({
  args: {
    submissionId: v.id("submissions"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    await ctx.db.patch(args.submissionId, { notes: args.notes });
    return args.submissionId;
  },
});
```

### 3. NotesEditor Component
**File:** `src/components/admin/NotesEditor.tsx`

Full-featured notes editing component:
- Save on blur (project pattern)
- Escape to cancel changes
- Ctrl+Enter for explicit save
- Visual feedback states:
  - "Unsaved changes" indicator
  - "Saving..." state
  - "Saved" confirmation (2s)
- 107 lines, follows DynamicEditableField patterns

### 4. SubmissionSheet Integration
**File:** `src/components/admin/SubmissionSheet.tsx`

Added Internal Notes section between Edit History and Footer:
```tsx
<Section title="Internal Notes">
  <NotesEditor
    submissionId={submission._id}
    initialNotes={submission.notes}
  />
</Section>
```

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Save on blur (not debounce) | Matches existing project pattern for editable fields |
| Optional field | No migration needed for existing submissions |
| No edit history for notes | Notes are internal drafts, not formal data |
| Admin-only visibility note | Clear UX that notes are internal |

## Verification Results

| Check | Result |
|-------|--------|
| `npx convex dev` | Schema + mutation deployed |
| `npm run build` | Build succeeds |
| TypeScript | No errors |
| Artifacts | All present per must_haves |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 2bc420d | feat | Add notes field to submissions schema |
| f9a4484 | feat | Create NotesEditor component |
| 555944e | feat | Integrate NotesEditor into SubmissionSheet |

Note: Task 2 (updateNotes mutation) was already committed at c068529 from a previous session.

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Phase 19 now complete:
- 19-01: Dashboard stats cards (complete)
- 19-02: Activity feed (complete)
- 19-03: Internal notes (complete)

v1.3 Unification & Admin Productivity milestone ready for final verification.
