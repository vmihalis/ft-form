# Phase 15: Admin Integration - Research

**Researched:** 2026-01-29
**Domain:** Admin Dashboard Enhancement with Dynamic Form/Submission Viewing
**Confidence:** HIGH

## Summary

Phase 15 integrates the dynamic forms system (Phase 11-14) with the existing admin dashboard (Phase 5-6). The codebase already has:
1. A working admin dashboard with `ApplicationsTable`, `ApplicationSheet`, `EditableField`, and `EditHistory` components
2. A separate `/admin/forms` route with `FormsList` for managing forms
3. Complete Convex backend for dynamic submissions with `submissions.list`, `submissions.getWithSchema`, `submissions.updateField`, and `submissions.getEditHistory`
4. The `DynamicReview` component pattern for rendering schema-driven field displays

The main work involves: (1) Adding a "Forms" tab to the main admin dashboard, (2) Creating a filter dropdown for submissions by form, (3) Adding form duplication, (4) Creating a dynamic `SubmissionSheet` that renders fields based on schema, and (5) Creating a dynamic `SubmissionEditHistory` component.

**Primary recommendation:** Reuse existing patterns - the ApplicationSheet/EditableField/EditHistory trio for applications provides the exact template for SubmissionSheet/DynamicEditableField/SubmissionEditHistory.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | 8.21.3 | Data tables | Already used for ApplicationsTable |
| convex/react | 1.31.6 | Real-time data | Already the data layer |
| react-hook-form | 7.71.1 | Form handling | Already used throughout |
| zod | 4.3.6 | Validation | Already used for field validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icons | Already used for all icons |
| @radix-ui/react-select | 2.2.6 | Dropdowns | Already used for filters/selects |
| @radix-ui/react-dialog | 1.1.15 | Sheet component | Already used for ApplicationSheet |

### No New Dependencies Needed
All UI components exist in `src/components/ui/`:
- Table, Sheet, Badge, Button, Select, Input, Skeleton, Separator, Collapsible

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/admin/
│   ├── page.tsx                    # UPDATE: Add tabs navigation
│   └── forms/
│       ├── page.tsx                # UPDATE: Add duplicate action
│       └── [formId]/page.tsx       # Existing form builder
├── components/admin/
│   ├── AdminDashboard.tsx          # UPDATE: Add tabs/form filter
│   ├── SubmissionsTable.tsx        # NEW: Like ApplicationsTable but for submissions
│   ├── SubmissionSheet.tsx         # NEW: Dynamic version of ApplicationSheet
│   ├── DynamicEditableField.tsx    # NEW: Schema-driven EditableField
│   ├── SubmissionEditHistory.tsx   # NEW: Uses fieldLabel from history record
│   ├── FormFilter.tsx              # NEW: Filter by form dropdown
│   └── AdminTabs.tsx               # NEW: Tab navigation component
└── convex/
    ├── forms.ts                    # UPDATE: Add duplicate mutation
    └── submissions.ts              # Existing - already complete
```

### Pattern 1: Schema-Driven Field Rendering (from DynamicReview)
**What:** Iterate over schema.steps and step.fields to render form data
**When to use:** Displaying submission data in SubmissionSheet
**Example:**
```typescript
// From DynamicReview.tsx - this pattern is reusable
{schema.steps.map((step) => (
  <Section key={step.id} title={step.title}>
    {step.fields.map((field) => (
      <EditableItem
        key={field.id}
        field={field}
        value={data[field.id]}
      />
    ))}
  </Section>
))}
```

### Pattern 2: Table with Column Filters (from ApplicationsTable)
**What:** TanStack Table with column filters and global search
**When to use:** SubmissionsTable
**Example:**
```typescript
// ApplicationsTable pattern - column filter for floor
table.getColumn("floor")?.setFilterValue(value === "all" ? undefined : value);

// Adapt for form filter
table.getColumn("formId")?.setFilterValue(value === "all" ? undefined : value);
```

### Pattern 3: Sheet Detail Panel (from ApplicationSheet)
**What:** Sheet sliding from right with sections and editable fields
**When to use:** SubmissionSheet for viewing/editing submissions
**Example:**
```typescript
// ApplicationSheet sections pattern
<Section title="Applicant Information">
  <EditableField field="fullName" label="Name" value={...} />
</Section>
// Adapt for dynamic schema
<Section title={step.title}>
  <DynamicEditableField field={field} value={data[field.id]} />
</Section>
```

### Pattern 4: Form Duplication
**What:** Copy form schema to create new form
**When to use:** "Duplicate" action in forms list
**Example:**
```typescript
// convex/forms.ts - new mutation
export const duplicate = mutation({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    // Generate unique slug
    const baseSlug = form.slug + "-copy";
    let slug = baseSlug;
    let counter = 1;
    while (await ctx.db.query("forms").withIndex("by_slug", q => q.eq("slug", slug)).first()) {
      slug = `${baseSlug}-${counter++}`;
    }

    return await ctx.db.insert("forms", {
      name: `${form.name} (Copy)`,
      slug,
      description: form.description,
      status: "draft",
      draftSchema: form.draftSchema, // Copy the schema
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

### Anti-Patterns to Avoid
- **Hardcoding field layouts:** The current ApplicationSheet hardcodes 20+ fields - SubmissionSheet must iterate over schema
- **Multiple filter queries:** Don't make separate Convex queries per filter - use client-side filtering with TanStack Table
- **Duplicating EditHistory logic:** Use the existing submissionEditHistory table which already stores fieldLabel

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Field rendering by type | Custom switch statement | DynamicField from dynamic-form/fields | Already handles all 10 field types |
| Value formatting | Per-type formatters | ReviewItem from DynamicReview | Already handles checkbox, file, empty states |
| Status badge | New badge component | StatusBadge component | Same status values for submissions |
| Table filtering | Manual array filtering | TanStack Table getFilteredRowModel | Performance, pagination-ready |

**Key insight:** The SubmissionSheet should use the same Section/ReviewItem patterns from DynamicReview for display, but wrap values in DynamicEditableField for editing.

## Common Pitfalls

### Pitfall 1: Field ID vs Label Confusion
**What goes wrong:** Trying to get field labels from schema when viewing old submissions
**Why it happens:** Schema can change between versions, but old submissions reference old schema
**How to avoid:**
- For display: Always fetch schema from the submission's formVersionId (already done in getWithSchema)
- For edit history: Already solved - submissionEditHistory stores fieldLabel at edit time
**Warning signs:** Labels showing as field IDs like "field_1abc"

### Pitfall 2: Select Option Display
**What goes wrong:** Showing stored value instead of label for select/radio fields
**Why it happens:** Data stores `value`, but UI should show `label`
**How to avoid:** Look up option label from schema: `field.options?.find(o => o.value === value)?.label`
**Warning signs:** UI showing "option_1" instead of "First Option"

### Pitfall 3: Tab Navigation State
**What goes wrong:** Tabs lose state on page refresh or break back button
**Why it happens:** Client-side tabs without URL sync
**How to avoid:**
- Option A: Use Next.js dynamic routes (`/admin/applications`, `/admin/forms`)
- Option B: Use URL query params (`/admin?tab=forms`)
**Warning signs:** User bookmarks don't work, browser history broken

### Pitfall 4: Form Duplication Slug Collision
**What goes wrong:** Duplicate fails if slug already exists
**Why it happens:** Simple "-copy" suffix without uniqueness check
**How to avoid:** Loop with counter until unique slug found (see Pattern 4)
**Warning signs:** "Slug already exists" error on duplicate

## Code Examples

Verified patterns from existing codebase:

### Dynamic Field Display (from DynamicReview)
```typescript
// Source: src/components/dynamic-form/DynamicReview.tsx:29-51
function ReviewItem({ label, value, type }: ReviewItemProps) {
  let displayValue: React.ReactNode;

  if (value === undefined || value === null || value === "") {
    displayValue = (
      <span className="italic text-muted-foreground">Not provided</span>
    );
  } else if (type === "checkbox") {
    displayValue = value ? "Yes" : "No";
  } else if (type === "file" && typeof value === "string") {
    displayValue = <span className="text-primary">File uploaded</span>;
  } else {
    displayValue = String(value);
  }

  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm whitespace-pre-wrap break-words">
        {displayValue}
      </dd>
    </div>
  );
}
```

### Form Filter Pattern (adapted from FloorFilter)
```typescript
// Source: src/components/admin/FloorFilter.tsx (adapt for forms)
interface FormFilterProps {
  forms: Array<{ _id: string; name: string }>;
  value: string;
  onValueChange: (value: string) => void;
}

export function FormFilter({ forms, value, onValueChange }: FormFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by form" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Forms</SelectItem>
        {forms.map((form) => (
          <SelectItem key={form._id} value={form._id}>
            {form.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Edit History with Dynamic Labels (from submissionEditHistory schema)
```typescript
// Source: convex/schema.ts:106-114 - submissionEditHistory already stores fieldLabel
submissionEditHistory: defineTable({
  submissionId: v.id("submissions"),
  fieldId: v.string(),
  fieldLabel: v.string(),  // <-- Already captured at edit time!
  oldValue: v.string(),
  newValue: v.string(),
  editedAt: v.number(),
})

// SubmissionEditHistory component just displays this directly
{history.map((edit) => (
  <div key={edit._id}>
    <p className="font-medium">{edit.fieldLabel}</p>  {/* No lookup needed */}
    <p><span className="line-through">{edit.oldValue}</span> → {edit.newValue}</p>
  </div>
))}
```

### Submissions List Query (already exists)
```typescript
// Source: convex/submissions.ts:72-133
export const list = query({
  args: {
    formId: v.optional(v.id("forms")),  // Already supports form filtering
    status: v.optional(v.union(...)),
  },
  handler: async (ctx, args) => {
    // ... filtering logic already implemented
    // Returns: _id, formVersionId, status, submittedAt, formName, formSlug, version
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded ApplicationSheet | Schema-driven SubmissionSheet | This phase | Dynamic forms work in admin |
| Floor-only filter | Form + status filter | This phase | Admin can find submissions |
| Manual form creation | Duplicate existing form | This phase | Faster form creation |

**Current in codebase:**
- Applications use hardcoded fields (legacy, will remain for backwards compatibility)
- Forms list exists at `/admin/forms` but is separate from main dashboard
- Submissions backend is complete, needs frontend integration

## Open Questions

Things that couldn't be fully resolved:

1. **Tab Navigation Strategy**
   - What we know: Can use Next.js routes (`/admin/applications`) or query params (`?tab=forms`)
   - What's unclear: User preference for URL structure
   - Recommendation: Use query params for simplicity - existing dashboard is at `/admin`, keep it unified

2. **Legacy Applications Handling**
   - What we know: `applications` table has hardcoded floor-lead schema
   - What's unclear: Should legacy applications appear in unified "Submissions" view?
   - Recommendation: Keep separate - "Applications" tab for legacy, add new "Submissions" tab for dynamic forms

3. **Select/Radio Value Display**
   - What we know: Stored value needs label lookup from schema
   - What's unclear: Performance for large forms with many options
   - Recommendation: Pre-compute option maps when loading schema - small overhead, much cleaner code

## Sources

### Primary (HIGH confidence)
- `/home/memehalis/ft-form/convex/schema.ts` - Data model with submissions, submissionEditHistory
- `/home/memehalis/ft-form/convex/submissions.ts` - Already has list, getWithSchema, updateField, getEditHistory
- `/home/memehalis/ft-form/src/components/admin/ApplicationSheet.tsx` - Template for SubmissionSheet
- `/home/memehalis/ft-form/src/components/admin/EditHistory.tsx` - Template for SubmissionEditHistory
- `/home/memehalis/ft-form/src/components/admin/EditableField.tsx` - Template for DynamicEditableField
- `/home/memehalis/ft-form/src/components/dynamic-form/DynamicReview.tsx` - Schema iteration pattern
- `/home/memehalis/ft-form/src/types/form-schema.ts` - FormSchema, FormField, FormStep types

### Secondary (MEDIUM confidence)
- `/home/memehalis/ft-form/src/components/form-builder/FormsList.tsx` - Can add duplicate action
- `/home/memehalis/ft-form/src/components/admin/FloorFilter.tsx` - Template for FormFilter

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use
- Architecture: HIGH - Patterns directly from existing codebase
- Pitfalls: HIGH - Identified from code analysis
- Data layer: HIGH - Convex backend already complete

**Research date:** 2026-01-29
**Valid until:** 60 days (stable codebase, internal patterns)

---

## Implementation Summary

### Requirements Mapping

| Requirement | Implementation |
|-------------|----------------|
| ADMIN-01: Forms tab lists all forms | Add tab navigation to AdminDashboard, include FormsList |
| ADMIN-02: Filter submissions by form | Add FormFilter using submissions.list(formId) |
| ADMIN-03: Duplicate existing form | Add forms.duplicate mutation, add "Duplicate" action to FormsList |
| ADMIN-04: Dynamic submission detail | Create SubmissionSheet using getWithSchema, iterate schema |
| ADMIN-05: Edit history with dynamic labels | Create SubmissionEditHistory using stored fieldLabel |

### Key Decisions (for planner)

1. **Tab Structure**: Keep "Applications" tab (legacy) + add "Submissions" tab (dynamic) + "Forms" tab
2. **No New UI Dependencies**: Use existing Sheet, Table, Badge, Select components
3. **Backend Ready**: All Convex queries/mutations exist, frontend-only work
4. **Reuse Patterns**: SubmissionSheet = ApplicationSheet structure + DynamicReview iteration logic
