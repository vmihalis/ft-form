# Pitfalls Research: Inline Editing + Edit History (v1.1)

**Domain:** Adding inline editing and edit history tracking to existing Convex admin dashboard
**Researched:** 2026-01-28
**Project:** FT Floor Lead Application System v1.1
**Confidence:** HIGH (Convex-specific verified via official docs and table-history component)

---

## Critical Pitfalls

High-impact mistakes that cause rewrites, data loss, or major issues.

### Pitfall 1: Race Conditions with Rapid Inline Edits

**What goes wrong:** User rapidly edits multiple fields or clicks save multiple times. Optimistic updates show incorrect intermediate states, then "snap back" to wrong values when mutations complete out of order.

**Why it happens:** Each inline edit fires a mutation. If user edits field A, then B, then A again before first mutation completes, the final state can be wrong. React's `useOptimistic` doesn't solve this automatically.

**Consequences:**
- UI shows one value, database has another
- User loses trust in the system
- Potential data corruption if history is logged incorrectly

**Warning signs:**
- UI "flickers" between values during rapid edits
- History shows duplicate or out-of-order entries
- Users report "my changes didn't save"

**Prevention:**
- Debounce save operations (300-500ms delay after last keystroke)
- Use local state during editing, only commit on blur/Enter
- Consider disabling field while mutation is in-flight
- For Convex: Rely on automatic rollback - if small mistakes happen, UI will eventually show correct values

**Phase to address:** Phase 1 (Inline Edit Infrastructure)

**Sources:**
- [TkDodo: Concurrent Optimistic Updates in React Query](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query)
- [useOptimistic Won't Save You](https://www.columkelly.com/blog/use-optimistic)
- [Convex Optimistic Updates](https://docs.convex.dev/client/react/optimistic-updates)

---

### Pitfall 2: Non-Atomic History + Update Operations

**What goes wrong:** Updating the application document and inserting the history record happen in separate mutations or actions. If one succeeds and the other fails, data integrity is compromised.

**Why it happens:** Developer writes two separate `ctx.runMutation()` calls, or uses an action loop, losing transaction guarantees.

**Consequences:**
- Application updated but no history record (lost audit trail)
- History record exists but application not updated (phantom edit)
- Inconsistent data state that's hard to debug

**Warning signs:**
- History entries without corresponding document changes
- Edit counts don't match history table row counts
- Intermittent "missing edit" reports from admins

**Prevention:**
- Do BOTH operations in a single mutation function
- Convex mutations are atomic - all writes commit together or none do
- Use Convex triggers (from convex-helpers) to automatically record history on every write
- Consider using the official [table-history component](https://github.com/get-convex/table-history) which handles this correctly

**Phase to address:** Phase 1 (Database schema and mutation design)

**Sources:**
- [Convex OCC and Atomicity](https://docs.convex.dev/database/advanced/occ)
- [Convex Database Triggers](https://stack.convex.dev/triggers)
- [GitHub: convex table-history](https://github.com/get-convex/table-history)

---

### Pitfall 3: Mutating Objects in Optimistic Updates

**What goes wrong:** Developer mutates existing objects inside optimistic update callbacks instead of creating new objects. This corrupts Convex client's internal state.

**Why it happens:** Natural JavaScript instinct to modify objects directly: `localStore.get(id).field = newValue` instead of spreading to new object.

**Consequences:**
- Client state becomes corrupted
- "Surprising results" - UI shows stale or wrong data
- Very hard to debug - symptoms are inconsistent

**Warning signs:**
- Queries return data that doesn't match database
- State "randomly" reverts to old values
- React devtools show different values than UI

**Prevention:**
- Always create NEW objects in optimistic updates
- Pattern: `{ ...existingDoc, fieldName: newValue }`
- Lint rule or code review checklist item
- Consider avoiding optimistic updates for edit operations (Convex real-time is fast enough)

**Phase to address:** Phase 2 (Implementing optimistic updates, if used)

**Sources:**
- [Convex Optimistic Updates - Important Caveat](https://docs.convex.dev/client/react/optimistic-updates)

---

### Pitfall 4: Input Focus Loss During Editing

**What goes wrong:** User starts typing in inline edit field, but after one character the input loses focus. They have to click again to continue typing.

**Why it happens:**
- Component re-mounts on each render (often due to inline component definition)
- Using edited value as part of React `key` prop
- State update triggers parent re-render which unmounts edit component

**Consequences:**
- Unusable inline editing UX
- Users give up and request different editing approach
- Appears as a major bug

**Warning signs:**
- Focus lost after every keystroke
- Works in isolation but breaks in context
- Problem appears when adding state management

**Prevention:**
- Define editable field components OUTSIDE the main component (not inline)
- Never use field value as part of React `key`
- Use local editing state that doesn't trigger parent re-renders
- Pattern: `editingValue` local state, only sync on blur/Enter

**Phase to address:** Phase 1 (Inline Edit Component design)

**Sources:**
- [React.js loses input focus on typing](https://reactkungfu.com/2015/09/react-js-loses-input-focus-on-typing/)
- [How to build an inline edit component in React](https://www.emgoto.com/react-inline-edit/)

---

## Medium Pitfalls

Common issues that cause delays or technical debt.

### Pitfall 5: History Table Schema Coupling

**What goes wrong:** History table schema is tightly coupled to main table schema. When adding/removing fields from applications table, history table breaks or shows incomplete data.

**Why it happens:** Storing individual changed fields as separate columns in history table, mirroring the main schema.

**Consequences:**
- Schema migrations become complex (update N+1 tables)
- Old history entries missing new fields
- Historical data interpretation becomes ambiguous

**Warning signs:**
- History queries require schema version awareness
- Migration scripts grow exponentially complex
- "What was the value of [new field] in January?" returns null incorrectly

**Prevention:**
- Store changes as JSON blob with field name, old value, new value
- Schema: `{ documentId, timestamp, changes: [{ field, oldValue, newValue }], editedBy }`
- History table schema stays stable regardless of main table changes
- Convex table-history component uses this pattern automatically

**Phase to address:** Phase 1 (History table design)

**Sources:**
- [Design a Table to Keep Historical Changes](https://dev.to/zhiyueyi/design-a-table-to-keep-historical-changes-in-database-10fn)
- [4 Common Designs of Audit Trail](https://medium.com/techtofreedom/4-common-designs-of-audit-trail-tracking-data-changes-in-databases-c894b7bb6d18)

---

### Pitfall 6: Blur Save on Dropdown/Select Fields

**What goes wrong:** Save-on-blur works for text inputs but breaks for dropdowns. Dropdown closes (blur) before value is actually selected, saving wrong value or not saving at all.

**Why it happens:** Dropdown menu opening triggers blur on the select element. Click on dropdown option also first causes blur before click registers.

**Consequences:**
- Floor field (dropdown) inline edit doesn't work
- Inconsistent behavior across field types
- Users think their change saved when it didn't

**Warning signs:**
- Text fields save correctly, dropdowns don't
- Value "snaps back" when selecting dropdown option
- Works on some browsers but not others

**Prevention:**
- Handle dropdowns differently than text inputs
- Save on explicit selection (`onValueChange`) not blur
- Use controlled component with explicit save trigger
- Consider save/cancel buttons for dropdown fields instead of auto-save

**Phase to address:** Phase 2 (Field-specific edit implementations)

**Sources:**
- [DevExtreme: Select Dropdown does not blur and save proper value](https://github.com/DevExpress/devextreme-reactive/issues/3123)
- [Atlassian: Allow disabling of save-on-blur for inline editing](https://jira.atlassian.com/browse/JRASERVER-30198)

---

### Pitfall 7: Unbounded History Table Growth

**What goes wrong:** Every edit creates a history record forever. After months of use, history table grows large, slowing queries and increasing storage costs.

**Why it happens:** No retention policy. "We'll deal with it later" becomes technical debt.

**Consequences:**
- Query performance degrades over time
- Convex storage costs increase
- History pagination becomes slow
- Dashboard loads slower as history grows

**Warning signs:**
- History queries take >1 second
- Storage usage growing faster than expected
- Admins complain about slow history panel

**Prevention:**
- Design retention policy upfront (keep last N edits per document, or last 6 months)
- Implement `vacuumHistory` function (table-history component provides this)
- Set up periodic cleanup (scheduled function)
- Add "Load more" pagination instead of loading all history

**Phase to address:** Phase 3 (History viewing) - design now, implement when building history UI

**Sources:**
- [Microsoft: Recover database space by deleting audit logs](https://learn.microsoft.com/en-us/power-platform/admin/recover-database-space-deleting-audit-logs)
- [LogicMonitor: What is log retention?](https://www.logicmonitor.com/blog/what-is-log-retention)
- [GitHub: convex table-history vacuumHistory](https://github.com/get-convex/table-history)

---

### Pitfall 8: No "Cancel" Affordance for Keyboard Users

**What goes wrong:** Save-on-blur means keyboard users can't cancel edits. Tab to next field = save. No escape hatch except refreshing the page.

**Why it happens:** Over-simplified "auto-save" pattern without considering keyboard navigation.

**Consequences:**
- WCAG accessibility failure (2.1.1 Keyboard)
- Users accidentally save wrong values
- No undo creates anxiety about editing

**Warning signs:**
- Accessibility audit fails
- Users ask "how do I cancel?"
- Accidental saves reported

**Prevention:**
- Escape key must cancel edit and restore original value
- Enter key saves (except for textarea where it adds newline)
- Tab key should save and move to next field (or cancel, pick consistent behavior)
- Visual indication that Escape cancels

**Phase to address:** Phase 1 (Inline edit UX specification)

**Sources:**
- [PatternFly: Inline edit design guidelines](https://www.patternfly.org/components/inline-edit/design-guidelines/)
- [WCAG 2.1.1: Full keyboard access](https://wcag.dock.codes/documentation/wcag211/)

---

### Pitfall 9: Concurrent Admin Edits Overwriting Each Other

**What goes wrong:** Two admins (small team, but possible) edit same application simultaneously. Last save wins, silently overwriting first admin's changes.

**Why it happens:** No conflict detection. Convex real-time shows changes, but if both are editing simultaneously, whoever saves last wins.

**Consequences:**
- Lost edits without notification
- Confusion about "what happened to my changes"
- Trust issues with the system

**Warning signs:**
- Admin reports "I edited X but it shows Y"
- History shows two edits from different admins within seconds
- Field values seem to "randomly" change

**Prevention:**
- For 1-3 admin team: Accept as low risk, trust real-time updates to show changes
- Add "last edited by" indicator that updates in real-time
- Consider optimistic locking: compare lastModified timestamp before save
- Show "This field was just edited by [other admin]" warning

**Phase to address:** Phase 3 (Polish) - low risk for small team, but good to have warning

**Sources:**
- [Convex: Keeping Users in Sync](https://stack.convex.dev/keeping-real-time-users-in-sync-convex)
- [Conflict Resolution in Real-Time Collaborative Editing](https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/)

---

## Low Pitfalls

Minor gotchas that cause annoyance but are fixable.

### Pitfall 10: Edit History Shows Technical Field Names

**What goes wrong:** History shows `phase1Mvp changed from X to Y` instead of `Phase 1: MVP changed from X to Y`. Admins don't understand which field was edited.

**Why it happens:** Storing raw database field names in history instead of display labels.

**Consequences:**
- Poor admin UX
- Time wasted figuring out what changed
- Makes history feature feel unpolished

**Warning signs:**
- History entries use camelCase field names
- Admins ask "what does benefitToFT mean?"

**Prevention:**
- Create field label mapping: `{ phase1Mvp: "Phase 1: MVP", benefitToFT: "Benefit to FT" }`
- Store display-friendly labels in history, OR transform on display
- Consistency with how fields are labeled in detail panel

**Phase to address:** Phase 3 (History display)

---

### Pitfall 11: Long Text Fields Awkward for Inline Edit

**What goes wrong:** Bio, proposal, roadmap fields are 200+ character text blocks. Inline edit with a small text input is awkward. User can't see full context while editing.

**Why it happens:** One-size-fits-all inline edit component for all field types.

**Consequences:**
- Poor UX for long-form content
- Users truncate text to fit visible area
- Editing feels cramped

**Warning signs:**
- Long fields show "..." in edit mode
- Users scroll horizontally to edit
- Editing long fields takes multiple attempts

**Prevention:**
- Use textarea for long text fields, text input for short fields
- Auto-expand textarea to fit content
- Consider modal editor for very long fields (bio, proposals)
- Set minimum heights based on field type

**Phase to address:** Phase 2 (Field-specific implementations)

---

### Pitfall 12: No Visual Distinction Between Editable and Non-Editable Fields

**What goes wrong:** Users click on non-editable fields (submittedAt, status) expecting to edit, nothing happens. Or they don't realize editable fields ARE editable.

**Why it happens:** No hover state or visual affordance indicating editability.

**Consequences:**
- Discovery problems - users don't find the feature
- Frustration clicking on things that don't respond
- Confusion about what can be changed

**Warning signs:**
- Users ask "can I edit this?"
- Low adoption of inline editing feature
- Users still request "edit form"

**Prevention:**
- Hover state shows pencil icon or subtle background change
- Non-editable fields have no hover affordance
- Cursor changes to pointer on editable fields
- Consider subtle edit icon always visible

**Phase to address:** Phase 2 (Inline edit styling)

**Sources:**
- [UXPlanet: Best Practices for Inline Editing in Tables](https://uxplanet.org/best-practices-for-inline-editing-in-tables-993caf06c171)
- [Apiko: Inline Editing Implementation Experience](https://apiko.com/blog/inline-editing/)

---

### Pitfall 13: Date Field Inline Edit Browser Inconsistencies

**What goes wrong:** `startDate` field uses native date picker. Behavior varies wildly across browsers. Safari shows text input, Chrome shows date picker, mobile is different again.

**Why it happens:** Relying on `<input type="date">` which has poor cross-browser support.

**Consequences:**
- Inconsistent UX across browsers
- Date format confusion (MM/DD vs DD/MM)
- Mobile users struggle with tiny date picker

**Warning signs:**
- Works on your machine, breaks in user reports
- Date validation errors from wrong format
- Safari users can't select dates

**Prevention:**
- Use consistent date picker component (shadcn/ui has good ones)
- Don't rely on native `<input type="date">`
- Validate date format on save
- Consider keeping date as display-only (how often does start date really change?)

**Phase to address:** Phase 2 (Date field implementation)

---

## Phase-Specific Warnings Summary

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| Phase 1 | Schema design | Non-atomic operations (#2), Schema coupling (#5) | Single mutation for update+history, JSON changes format |
| Phase 1 | Edit component | Focus loss (#4), No cancel (#8) | Component outside render, Escape to cancel |
| Phase 2 | Optimistic updates | Race conditions (#1), Object mutation (#3) | Debounce, create new objects |
| Phase 2 | Field types | Dropdown blur (#6), Long text UX (#11), Dates (#13) | Per-field-type handling |
| Phase 3 | History display | Field names (#10), Growth (#7) | Label mapping, retention policy |
| Phase 3 | Polish | Concurrent edits (#9), Editability affordance (#12) | Real-time indicators, hover states |

---

## Integration Notes for Existing Convex System

### Current Schema Context

The existing `applications` table has 20+ fields:
- Applicant: `fullName`, `email`, `linkedIn`, `role`, `bio`
- Proposal: `floor`, `initiativeName`, `tagline`, `values`, `targetCommunity`, `estimatedSize`
- Roadmap: `phase1Mvp`, `phase2Expansion`, `phase3LongTerm`
- Impact: `benefitToFT`
- Logistics: `existingCommunity`, `spaceNeeds`, `startDate`, `additionalNotes`
- Meta: `status`, `submittedAt`

Adding edit history means:
- New `editHistory` table needed (or use table-history component)
- Existing `updateStatus` mutation should also record history
- Consider whether status changes are "edits" for history purposes

### Current Architecture Fit

- `ApplicationSheet.tsx` displays `Field` components - these become `EditableField`
- `AdminDashboard.tsx` manages sheet state - will need to handle edit states
- `applications.ts` mutations need to be extended, not replaced

### Existing Mutation: `updateStatus`

```typescript
// Current implementation (convex/applications.ts line 74-87)
export const updateStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.union(...),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
```

This needs to be extended to also record edit history (status changes should be tracked too).

### Convex-Specific Advantages for This Project

- **Real-time sync:** Changes propagate immediately - optimistic updates may be unnecessary
- **Transaction guarantees:** Single mutation = atomic update + history record
- **Official component:** `table-history` provides battle-tested audit log solution
- **Triggers:** `convex-helpers` can auto-record history on every write

---

## Recommended Approach for v1.1

Based on pitfall analysis:

1. **Use single mutation for update + history** (avoids #2)
2. **Store history as JSON changes array** (avoids #5)
3. **Define EditableField component outside render** (avoids #4)
4. **Handle dropdowns via onValueChange, not blur** (avoids #6)
5. **Escape to cancel, Enter to save** (avoids #8)
6. **Add field label mapping** (avoids #10)
7. **Use textarea for long fields** (avoids #11)
8. **Add hover state with pencil icon** (avoids #12)

---

## Sources

### Convex Official
- [Convex Optimistic Updates](https://docs.convex.dev/client/react/optimistic-updates)
- [Convex OCC and Atomicity](https://docs.convex.dev/database/advanced/occ)
- [Convex Database Triggers](https://stack.convex.dev/triggers)
- [Convex: Keeping Users in Sync](https://stack.convex.dev/keeping-real-time-users-in-sync-convex)

### Convex Components
- [GitHub: convex table-history](https://github.com/get-convex/table-history)

### UX/Accessibility
- [PatternFly: Inline edit design guidelines](https://www.patternfly.org/components/inline-edit/design-guidelines/)
- [UXPlanet: Best Practices for Inline Editing in Tables](https://uxplanet.org/best-practices-for-inline-editing-in-tables-993caf06c171)
- [Apiko: Inline Editing Implementation Experience](https://apiko.com/blog/inline-editing/)
- [WCAG 2.1.1: Full keyboard access](https://wcag.dock.codes/documentation/wcag211/)

### React Patterns
- [How to build an inline edit component in React](https://www.emgoto.com/react-inline-edit/)
- [React.js loses input focus on typing](https://reactkungfu.com/2015/09/react-js-loses-input-focus-on-typing/)
- [TkDodo: Concurrent Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query)
- [useOptimistic Won't Save You](https://www.columkelly.com/blog/use-optimistic)

### Database Design
- [Design a Table to Keep Historical Changes](https://dev.to/zhiyueyi/design-a-table-to-keep-historical-changes-in-database-10fn)
- [4 Common Designs of Audit Trail](https://medium.com/techtofreedom/4-common-designs-of-audit-trail-tracking-data-changes-in-databases-c894b7bb6d18)

### Data Management
- [Microsoft: Recover database space by deleting audit logs](https://learn.microsoft.com/en-us/power-platform/admin/recover-database-space-deleting-audit-logs)
- [LogicMonitor: What is log retention?](https://www.logicmonitor.com/blog/what-is-log-retention)
