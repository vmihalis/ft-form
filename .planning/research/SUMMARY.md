# Project Research Summary: v1.1 Admin Inline Editing

**Project:** Frontier Tower Floor Lead Application System
**Domain:** Admin inline editing with edit history tracking
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

This milestone adds inline editing to the admin detail panel, allowing admins to click any field to edit it directly, with full edit history tracking. Research indicates this is a **well-understood pattern** with minimal stack additions needed.

**Key findings:**
1. **No new UI libraries needed** — existing shadcn/ui Input/Textarea components support the click-to-edit pattern
2. **Simple history table design** — separate `editHistory` table with field, oldValue, newValue, timestamp
3. **Single generic mutation** — `updateField` handles all fields with atomic history recording
4. **Critical UX patterns** — save on blur/Enter, cancel on Escape, hover affordance with pencil icon

**Risk assessment:** LOW — this is a standard pattern with official Convex support and well-documented React patterns.

## Key Findings

### Recommended Stack Additions

| Package | Version | Purpose |
|---------|---------|---------|
| None required | — | Existing shadcn/ui components sufficient for inline editing |

**Alternative considered:** `@convex-dev/table-history` for automatic edit tracking. Research found custom implementation is simpler for this use case (explicit admin edits only, ~50 lines of code).

### Expected Features

**Table Stakes (must have):**
- Click any field to edit inline
- Save on blur or Enter key
- Cancel on Escape key
- Visual edit state (border, background change)
- Loading indicator during save
- Error handling with message
- Pencil icon hover affordance
- Validation before save (email format, required fields)

**Differentiators (nice to have, defer to v1.2+):**
- Field-level history view (click field to see its specific changes)
- Undo last edit
- Keyboard navigation between fields (Tab to next field)
- Compare current vs original submission

**Anti-Features (do NOT build):**
- Full-form edit mode toggle — field-level inline is simpler
- Modal for each field — breaks context
- Auto-save with debounce — confusing state
- Required comments on every edit — friction
- Real-time collaborative editing — overkill for 1-3 admin team

### Architecture Approach

**Schema addition:**
```typescript
editHistory: defineTable({
  applicationId: v.id("applications"),
  field: v.string(),
  oldValue: v.string(),
  newValue: v.string(),
  editedAt: v.number(),
})
  .index("by_application", ["applicationId", "editedAt"])
```

**Component integration:**
- Replace read-only `Field` components with `EditableField` wrapper
- Add `EditHistory` collapsible section to ApplicationSheet
- Pattern mirrors existing `StatusDropdown` implementation

**Build order:**
1. Schema + mutations (foundation)
2. EditableField component (core UX)
3. Field integration (wire up all 18 fields)
4. Edit history display (timeline UI)

### Critical Pitfalls to Avoid

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| **Non-atomic history operations** | Data inconsistency | Both update AND history insert in single mutation |
| **Input focus loss** | Unusable UX | Define EditableField component outside render function |
| **Dropdown blur issues** | Field won't save | Handle dropdowns via onValueChange, not blur |
| **No cancel affordance** | Accessibility fail | Escape key must cancel and restore original |
| **Object mutation in optimistic updates** | Corrupted state | Always create new objects, never mutate |

## Implications for Roadmap

**Suggested phase structure:**

### Phase 8: Edit Infrastructure
- Add `editHistory` table to schema
- Create `updateField` mutation with atomic history recording
- Create `getEditHistory` query
- Requirements: EDIT-03 (history tracking)

### Phase 9: Inline Editing UI
- Build `EditableField` component with display/edit toggle
- Support text, textarea, select field types
- Implement keyboard handlers (Enter save, Escape cancel)
- Replace Field with EditableField in ApplicationSheet
- Requirements: EDIT-01, EDIT-02, EDIT-04

### Phase 10: Edit History Display
- Build `EditHistory` timeline component
- Add collapsible section to ApplicationSheet
- Format timestamps and field labels
- Requirements: EDIT-05

**Phase numbering note:** v1.0 ended at Phase 7, so v1.1 continues from Phase 8.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new dependencies needed, existing shadcn/ui sufficient |
| Features | HIGH | Clear table stakes from PatternFly and industry patterns |
| Architecture | HIGH | Standard Convex patterns, verified with official docs |
| Pitfalls | HIGH | Well-documented issues with clear prevention strategies |

**Overall confidence:** HIGH

## Sources

### Primary (HIGH confidence)
- [Convex Writing Data](https://docs.convex.dev/database/writing-data) — db.patch for partial updates
- [Convex OCC and Atomicity](https://docs.convex.dev/database/advanced/occ) — mutation transaction guarantees
- [PatternFly Inline Edit](https://www.patternfly.org/components/inline-edit/design-guidelines/) — UX patterns
- [How to build an inline edit component in React](https://www.emgoto.com/react-inline-edit/) — implementation pattern

### Secondary (MEDIUM confidence)
- [Convex table-history component](https://github.com/get-convex/table-history) — evaluated but not required
- [4 Common Designs of Audit Trail](https://medium.com/techtofreedom/4-common-designs-of-audit-trail-tracking-data-changes-in-databases-c894b7bb6d18) — history schema patterns
- [React.js loses input focus on typing](https://reactkungfu.com/2015/09/react-js-loses-input-focus-on-typing/) — pitfall prevention

---
*Research completed: 2026-01-28*
*Ready for requirements: yes*
