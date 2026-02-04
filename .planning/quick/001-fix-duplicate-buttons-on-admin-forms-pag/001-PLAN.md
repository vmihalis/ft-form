---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/form-builder/FormsList.tsx
autonomous: true

must_haves:
  truths:
    - "Only one 'New Form' button visible in page header"
    - "No 'Create Form' button duplicated in content area"
    - "Forms list still shows form count when loaded"
    - "Loading state shows skeleton without duplicate button"
  artifacts:
    - path: "src/components/form-builder/FormsList.tsx"
      provides: "Forms list without duplicate creation buttons"
  key_links:
    - from: "src/app/admin/forms/page.tsx"
      to: "NewFormDropdown"
      via: "header contains only creation entry point"
---

<objective>
Remove duplicate "Create Form" buttons from FormsList component

Purpose: The /admin/forms page currently shows two creation buttons - the NewFormDropdown in the header (with both manual and AI options) and a redundant "Create Form" button inside the FormsList component. This creates visual clutter and inconsistent UX since the FormsList button only links to manual creation, missing the AI option.

Output: Clean forms page with single "New Form" dropdown in header only
</objective>

<execution_context>
@/Users/memehalis/.claude/get-shit-done/workflows/execute-plan.md
@/Users/memehalis/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/admin/forms/page.tsx
@src/components/form-builder/FormsList.tsx
@src/components/form-builder/NewFormDropdown.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove duplicate Create Form buttons from FormsList</name>
  <files>src/components/form-builder/FormsList.tsx</files>
  <action>
  In FormsList.tsx, remove the duplicate "Create Form" button from two locations:

  1. **Loading state (lines 104-115)**: Remove the entire div containing the Button with "Create Form". The loading state should only show `<FormsGridSkeleton />` without any button.

  2. **Loaded state (lines 126-136)**: Remove the Button entirely from the header div. Keep only the forms count paragraph. The div structure should just show the count text without a button.

  After changes:
  - Loading state returns just `<FormsGridSkeleton />` wrapped in appropriate container
  - Loaded state header shows only the forms count ("X forms")
  - Empty state remains unchanged (FormsListEmpty still has its own CTA)

  Also remove unused imports:
  - Remove `Link` from "next/link" (no longer used after button removal)
  - Remove `Plus` from lucide-react (no longer used after button removal)
  - Keep `FileText` (used by FormsListEmpty)
  </action>
  <verify>
  1. Run `pnpm build` - should pass with no errors
  2. Visual check: /admin/forms page shows only one "New Form" button in the header
  </verify>
  <done>
  - FormsList no longer renders any "Create Form" button
  - Page has single "New Form" dropdown in header (from NewFormDropdown component)
  - Build passes without errors
  </done>
</task>

</tasks>

<verification>
1. `pnpm build` passes
2. Visit /admin/forms - only one creation button visible in header
3. Forms list area shows form count but no button
4. Empty state still shows CTA to create first form
</verification>

<success_criteria>
- Single "New Form" dropdown in page header
- No duplicate button in forms list content area
- All form creation options (manual + AI) accessible from header dropdown only
- Clean, uncluttered UI
</success_criteria>

<output>
After completion, create `.planning/quick/001-fix-duplicate-buttons-on-admin-forms-pag/001-SUMMARY.md`
</output>
