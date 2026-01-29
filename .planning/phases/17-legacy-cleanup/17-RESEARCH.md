# Phase 17: Legacy Cleanup - Research

**Researched:** 2026-01-29
**Domain:** Codebase cleanup (legacy code removal)
**Confidence:** HIGH

## Summary

This research catalogs all legacy application code that needs to be deleted now that Phase 16 has successfully migrated the /apply form to the dynamic form system. The legacy system consists of:

1. A Convex `applications` table with a hardcoded 19-field schema
2. An `editHistory` table for tracking edits to applications
3. Convex mutations and queries in `applications.ts`
4. Frontend components that display and manage legacy applications in the admin panel
5. Legacy form infrastructure (store, schemas, types, step components, constants)

The cleanup is straightforward file deletion with one critical ordering constraint: the admin dashboard must be updated BEFORE deleting components to maintain a working build state at every step.

**Primary recommendation:** Delete in dependency order (furthest from entry points first), update the admin dashboard to remove the Applications tab, then delete backend code.

## Standard Stack

Not applicable - this is a deletion phase, not a building phase.

## Architecture Patterns

### Deletion Order Pattern

When deleting interconnected code, follow this order:

1. **Remove UI entry points** - Delete or modify components that render the legacy code
2. **Remove dependent components** - Delete components that are only used by legacy code
3. **Remove backend endpoints** - Delete mutations and queries
4. **Remove data schema** - Delete table definitions

This ensures the build passes at each step.

### Recommended Deletion Sequence

```
Phase 1: Update Admin Dashboard (remove Applications tab)
  ├── Modify AdminTabs.tsx (remove applications tab and state)
  ├── Modify AdminDashboard.tsx (remove applications state)
  └── Build should pass (Applications tab removed)

Phase 2: Delete Legacy Admin Components
  ├── Delete ApplicationsTable.tsx
  ├── Delete ApplicationSheet.tsx
  ├── Delete EditableField.tsx (legacy applications version)
  ├── Delete EditHistory.tsx (legacy applications version)
  ├── Delete StatusDropdown.tsx (legacy applications version)
  ├── Delete FloorFilter.tsx (only used by ApplicationsTable)
  ├── Delete columns.tsx (legacy applications columns)
  └── Build should pass (no broken imports)

Phase 3: Delete Legacy Form Components
  ├── Delete MultiStepForm.tsx
  ├── Delete StepContent.tsx
  ├── Delete NavigationButtons.tsx
  ├── Delete ProgressIndicator.tsx
  ├── Delete StoreHydration.tsx
  ├── Delete all step components (src/components/form/steps/*)
  └── Build should pass

Phase 4: Delete Legacy Supporting Code
  ├── Delete src/lib/stores/form-store.ts
  ├── Delete src/lib/schemas/application.ts
  ├── Delete src/types/form.ts
  ├── Delete src/lib/constants/fieldLabels.ts
  └── Build should pass

Phase 5: Delete Legacy Backend
  ├── Delete convex/applications.ts
  ├── Remove applications and editHistory tables from convex/schema.ts
  └── Deploy Convex (schema change)
```

## Don't Hand-Roll

Not applicable - this is a deletion phase.

## Common Pitfalls

### Pitfall 1: Breaking the Build During Deletion

**What goes wrong:** Deleting files out of order leaves broken imports
**Why it happens:** Files import from each other in a dependency chain
**How to avoid:** Follow the deletion order strictly, verify build passes after each phase
**Warning signs:** TypeScript compilation errors, missing module errors

### Pitfall 2: Orphaned Constants

**What goes wrong:** Constants files that were only used by legacy code remain in codebase
**Why it happens:** Not checking all usages of constants before deletion
**How to avoid:** Use grep to verify no remaining imports before deleting
**Warning signs:** Files with zero imports remaining

### Pitfall 3: Deleting Shared Components

**What goes wrong:** Deleting a component used by both legacy and new systems
**Why it happens:** Similar names (StatusBadge, SearchInput) may be shared
**How to avoid:** Verify each component's imports before deletion
**Warning signs:** Build errors after deletion referencing new system components

### Pitfall 4: Convex Schema Deletion Without Data Consideration

**What goes wrong:** Schema change fails or data is lost unexpectedly
**Why it happens:** Convex enforces schema against existing data
**How to avoid:** Understand that table deletion requires handling existing data
**Warning signs:** Convex deployment errors

## Inventory of Legacy Code to Delete

### Convex Backend (convex/)

| File | Purpose | References | Safe to Delete |
|------|---------|------------|----------------|
| `convex/applications.ts` | Legacy mutations/queries (submit, list, updateStatus, updateField, getEditHistory) | Imported by AdminTabs, ApplicationsTable, ApplicationSheet, EditableField, EditHistory, StatusDropdown, MultiStepForm | YES - after frontend components deleted |

### Convex Schema Tables (convex/schema.ts)

| Table | Purpose | References | Safe to Delete |
|-------|---------|------------|----------------|
| `applications` | 19-field hardcoded application storage | Used by applications.ts mutations/queries | YES - after applications.ts deleted |
| `editHistory` | Edit tracking for legacy applications | Used by applications.ts getEditHistory query | YES - after applications.ts deleted |

### Admin Components (src/components/admin/)

| File | Purpose | References | Safe to Delete |
|------|---------|------------|----------------|
| `AdminTabs.tsx` | Tab navigation with Applications tab | AdminDashboard.tsx | NO - modify to remove Applications tab |
| `AdminDashboard.tsx` | Wrapper with selectedApplication state | src/app/admin/page.tsx | NO - modify to remove applications state |
| `ApplicationsTable.tsx` | Legacy applications table view | AdminTabs.tsx | YES - after AdminTabs modified |
| `ApplicationSheet.tsx` | Legacy application detail view | AdminTabs.tsx | YES - after AdminTabs modified |
| `EditableField.tsx` | Inline editing for legacy applications (uses `Id<"applications">`) | ApplicationSheet.tsx | YES - after ApplicationSheet deleted |
| `EditHistory.tsx` | Edit history for legacy applications (uses `Id<"applications">`) | ApplicationSheet.tsx | YES - after ApplicationSheet deleted |
| `StatusDropdown.tsx` | Status change for legacy applications (uses `Id<"applications">`) | ApplicationSheet.tsx | YES - after ApplicationSheet deleted |
| `FloorFilter.tsx` | Floor filter for ApplicationsTable | ApplicationsTable.tsx | YES - after ApplicationsTable deleted |
| `columns.tsx` | Column definitions for legacy applications table | ApplicationsTable.tsx | YES - after ApplicationsTable deleted |

**Shared Components (DO NOT DELETE):**
| File | Purpose | Used By |
|------|---------|---------|
| `StatusBadge.tsx` | Status badge rendering | columns.tsx (legacy), submissions-columns.tsx (new) |
| `SearchInput.tsx` | Search input | ApplicationsTable.tsx (legacy), SubmissionsTable.tsx (new) |
| `FormFilter.tsx` | Form filter | SubmissionsTable.tsx (new only) |
| `DynamicEditableField.tsx` | Inline editing for submissions | SubmissionSheet.tsx (new) |
| `SubmissionEditHistory.tsx` | Edit history for submissions | SubmissionSheet.tsx (new) |
| `SubmissionSheet.tsx` | Submission detail view | AdminTabs.tsx (new) |
| `SubmissionsTable.tsx` | Submissions table view | AdminTabs.tsx (new) |
| `submissions-columns.tsx` | Column definitions for submissions | SubmissionsTable.tsx (new) |

### Legacy Form Components (src/components/form/)

| File | Purpose | References | Safe to Delete |
|------|---------|------------|----------------|
| `MultiStepForm.tsx` | Main legacy form container | NONE (was /apply, now uses DynamicFormPage) | YES |
| `StepContent.tsx` | Step routing | MultiStepForm.tsx | YES |
| `NavigationButtons.tsx` | Nav buttons | Step components | YES |
| `ProgressIndicator.tsx` | Progress bar | MultiStepForm.tsx | YES |
| `StoreHydration.tsx` | Zustand hydration wrapper | Unknown - verify | YES if unused |
| `steps/ApplicantInfoStep.tsx` | Step 1 | StepContent.tsx | YES |
| `steps/ConfirmationStep.tsx` | Confirmation | StepContent.tsx | YES |
| `steps/ImpactStep.tsx` | Step 4 | StepContent.tsx | YES |
| `steps/LogisticsStep.tsx` | Step 5 | StepContent.tsx | YES |
| `steps/ProposalStep.tsx` | Step 2 | StepContent.tsx | YES |
| `steps/ReviewStep.tsx` | Step 6 | StepContent.tsx | YES |
| `steps/RoadmapStep.tsx` | Step 3 | StepContent.tsx | YES |
| `steps/WelcomeStep.tsx` | Step 0 | StepContent.tsx | YES |
| `fields/FileField.tsx` | File upload field | Step components | YES - verify not used by dynamic form |

### Supporting Code (src/lib/, src/types/)

| File | Purpose | References | Safe to Delete |
|------|---------|------------|----------------|
| `src/lib/stores/form-store.ts` | Zustand store for legacy form | MultiStepForm.tsx, step components | YES - after form components deleted |
| `src/lib/schemas/application.ts` | Zod schemas for legacy form | MultiStepForm.tsx, types/form.ts | YES - after form components deleted |
| `src/types/form.ts` | TypeScript types for legacy form | form-store.ts, step components | YES - after form components deleted |
| `src/lib/constants/fieldLabels.ts` | Field name to label mapping | EditHistory.tsx (legacy) | YES - after EditHistory deleted |

**Shared Constants (DO NOT DELETE):**
| File | Purpose | Used By |
|------|---------|---------|
| `src/lib/constants/floors.ts` | Floor options | FloorFilter.tsx (legacy), ApplicationSheet.tsx (legacy), EditHistory.tsx (legacy), form seed scripts (new) |
| `src/lib/constants/estimatedSizes.ts` | Size options | ApplicationSheet.tsx (legacy), EditHistory.tsx (legacy), form seed scripts (new) |

**Note:** After legacy deletion, `floors.ts` and `estimatedSizes.ts` will only be used by form seed scripts. They can potentially be moved or deleted if not needed for future form seeding.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded 19-field form | Dynamic form system | Phase 16 (2026-01-29) | /apply now uses DynamicFormPage |
| applications table | submissions table | Phase 11-15 (v1.2) | New forms use dynamic submissions |
| editHistory table | submissionEditHistory table | Phase 11-15 (v1.2) | New system has schema-aware edit tracking |

## Open Questions

1. **Existing Applications Data**
   - What we know: There may be existing applications in the `applications` table from before migration
   - What's unclear: Whether this data should be preserved, migrated, or can be deleted
   - Recommendation: Ask stakeholder before deleting schema. If data exists and matters, consider:
     a) Export to CSV before deletion
     b) Migration script to convert to submissions format
     c) Or confirm deletion is acceptable

2. **floors.ts and estimatedSizes.ts Post-Cleanup**
   - What we know: These are currently used by legacy components AND form seed scripts
   - What's unclear: Whether seed scripts will continue to be used
   - Recommendation: Keep for now, can clean up later if truly unused

## Sources

### Primary (HIGH confidence)
- Codebase inspection via Read and Grep tools
- File dependency analysis
- Phase 16 verification report confirming migration complete

### Secondary (MEDIUM confidence)
- PROJECT.md documentation for system context
- Previous phase planning documents

## Metadata

**Confidence breakdown:**
- Inventory: HIGH - direct codebase inspection, all files verified
- Deletion order: HIGH - based on import dependency analysis
- Pitfalls: HIGH - standard software engineering practice
- Shared components: HIGH - verified via grep for imports

**Research date:** 2026-01-29
**Valid until:** Until files are actually deleted (this is a point-in-time inventory)
