---
phase: 14-form-builder-ui
plan: 05
subsystem: form-builder
tags: [preview-panel, form-status, publish, save, archive, live-preview]
dependency-graph:
  requires: [14-04, 13-03]
  provides: [live-preview, form-lifecycle, publish-workflow]
  affects: []
tech-stack:
  added: []
  patterns: [preview-mode-toggle, status-actions, schema-validation]
key-files:
  created:
    - src/components/form-builder/PreviewPanel.tsx
    - src/components/form-builder/FormStatusActions.tsx
  modified:
    - src/components/form-builder/FormBuilder.tsx
    - src/components/dynamic-form/DynamicFormPage.tsx
decisions:
  - id: preview-device-modes
    choice: "Mobile and desktop preview modes with device frame"
    context: "Allow form designers to see how form looks on different devices"
  - id: preview-field-filtering
    choice: "Filter incomplete fields (missing labels, empty options) from preview"
    context: "Show only valid fields in preview to avoid confusion"
  - id: publish-validation
    choice: "Validate schema before publishing (labels, options required)"
    context: "Prevent publishing broken forms that users can't complete"
  - id: draft-version-reset
    choice: "Reset draft when form version changes"
    context: "Ensure draft state stays in sync with current published version"
metrics:
  duration: "30 minutes"
  completed: "2026-01-29"
---

# Phase 14 Plan 05: Preview and Status Actions Summary

**One-liner:** Live form preview with device modes, save/publish/archive workflow with schema validation, completing the form builder

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create preview panel component | 4cf52d0 | PreviewPanel.tsx |
| 2 | Create form status actions | b820f8b | FormStatusActions.tsx, FormBuilder.tsx |
| 3 | Fix draft reset and confirmation page | 47da2f0, df817e3, 1daef35 | DynamicFormPage.tsx |

## What Was Built

### PreviewPanel Component
- Live preview using Phase 13 DynamicField components
- Mobile/desktop device toggle with visual frame
- Step navigation with progress indicator
- Filters incomplete fields (missing labels, empty options)
- Empty state when no valid fields exist
- FormProvider wrapper for field component compatibility

### FormStatusActions Component
- Status badge display (draft=yellow, published=green, archived=gray)
- Save button with dirty state tracking
- Publish button with schema validation:
  - At least one step required
  - Each step must have at least one field
  - Each field must have a label
  - Select/radio fields must have options
- Archive button with confirmation dialog
- Feedback messages for success/error states
- Saves dirty changes before publish

### FormBuilder Integration
- Preview mode toggle in header
- Side panels hidden in preview mode for focused view
- FormStatusActions replaces simple save button

### Bug Fixes Applied
During verification, these issues were discovered and fixed:
1. Draft reset when form version changes (fixed with versionId tracking)
2. Store subscription for step changes (fixed with explicit data dependency)
3. Confirmation page display (fixed with isSubmitted state tracking)
4. Styling consistency with original apply page (glass-card, centering)

## Key Implementation Details

### Preview Data Flow
```
Schema (store) -> createPreviewSchema -> filter incomplete -> PreviewStep -> DynamicField
```

### Publish Flow
```
Click Publish -> validateSchemaForPublish -> check all rules
    |
    v (validation fails)
Show errors in dialog -> user fixes -> retry
    |
    v (validation passes)
If dirty: save first -> markClean
    |
    v
Call forms.publish -> creates FormVersion -> shows success
```

### Status Lifecycle
```
draft -> publish -> published
             |
             v
        republish (creates new version)
             |
             v
          archive -> archived
```

## Testing Verification

All success criteria met:
1. PREVIEW: Real-time preview reflects current schema
2. SAVE: Dirty state tracked, save persists to database
3. PUBLISH VALIDATION: Empty steps/fields/options caught before publish
4. PUBLISH: Creates immutable version, updates status to published
5. ARCHIVE: Changes status to archived
6. E2E: Create form -> add fields -> reorder -> save -> publish -> access at /apply/[slug]

End-to-end verification completed:
- Form creation with name/slug
- Field palette adds fields to canvas
- PropertyPanel shows on selection
- Label changes update canvas in real-time
- Required toggle works
- Options editor works for select fields
- Drag reordering works
- Preview shows form with device frame
- Save/Publish workflow works
- Published form accessible at public URL
- Begin/Back/Next navigation works
- Confirmation page shows after submission

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Draft reset on version change**
- **Found during:** Checkpoint verification
- **Issue:** Draft state not resetting when form version changed
- **Fix:** Added versionId tracking in useDynamicFormDraft to detect version changes
- **Files modified:** src/lib/hooks/useDynamicFormDraft.ts
- **Commit:** 47da2f0

**2. [Rule 1 - Bug] Store subscription for step changes**
- **Found during:** Checkpoint verification
- **Issue:** Components not re-rendering when step changed
- **Fix:** Added explicit data dependency in useDynamicFormDraft subscription
- **Files modified:** src/lib/hooks/useDynamicFormDraft.ts
- **Commit:** df817e3

**3. [Rule 1 - Bug] Confirmation page not showing**
- **Found during:** Checkpoint verification
- **Issue:** Confirmation page not displaying after form submission
- **Fix:** Added isSubmitted state tracking in DynamicFormPage
- **Files modified:** src/components/dynamic-form/DynamicFormPage.tsx
- **Commit:** 1daef35

**4. [Rule 1 - Bug] Styling mismatch with original apply page**
- **Found during:** Checkpoint verification
- **Issue:** Dynamic form page styling differed from original apply page
- **Fix:** Applied glass-card styling and proper centering
- **Files modified:** src/components/dynamic-form/DynamicFormPage.tsx
- **Commit:** 1daef35

## Phase 14 Completion

This plan completes Phase 14 (Form Builder UI). The form builder is now fully functional with:
- Form creation (14-02)
- Three-panel layout (14-02)
- Field palette with 10 types (14-03)
- Drag-and-drop canvas (14-03)
- Property panel with field editing (14-04)
- Options and validation editors (14-04)
- Live preview with device modes (14-05)
- Save/publish/archive workflow (14-05)

## Next Phase Readiness

Ready for Phase 15 (Submissions Admin):
- Forms can be created, edited, and published
- Published forms accept submissions at /apply/[slug]
- Submissions stored in Convex with formVersionId reference
- Admin can access /admin/forms to manage forms

All v1.2 core functionality complete. Phase 15 will add submission management UI.
