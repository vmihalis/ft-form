# Technology Stack: v1.2 Dynamic Form Builder

**Project:** Frontier Tower Floor Lead Application System - v1.2 Milestone
**Researched:** 2026-01-29
**Confidence:** HIGH (versions verified via npm registry and official docs)

---

## Executive Summary

The existing stack (Next.js 16, React 19, Tailwind 4, Convex, shadcn/ui) is well-suited for the dynamic form builder. Only **two new dependencies** are required:

1. **@dnd-kit** packages for drag-and-drop
2. **nanoid** for unique field ID generation

All other required functionality (date picker, checkbox, file upload) can be achieved with existing libraries or shadcn/ui components already compatible with React 19.

---

## Existing Stack (No Changes Needed)

| Technology | Current Version | Form Builder Role |
|------------|-----------------|-------------------|
| Next.js | 16.1.5 | App Router for /admin/builder and /apply/[slug] |
| React | 19.2.3 | UI components |
| Tailwind CSS | 4.x | Styling (already configured) |
| Convex | 1.31.6 | Forms table, field storage, file storage |
| shadcn/ui | Latest | Field type UI components |
| Zustand | 5.0.10 | Form builder state management |
| React Hook Form | 7.71.1 | Dynamic form rendering with validation |
| Zod | 4.3.6 | Dynamic schema generation |
| Framer Motion | 12.29.2 | Drag animations, field transitions |

---

## Required New Dependencies

### 1. Drag-and-Drop: @dnd-kit Suite

| Package | Version | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | ^6.3.1 | Core DnD primitives, sensors, collision detection |
| `@dnd-kit/sortable` | ^10.0.0 | Sortable list preset (field reordering) |
| `@dnd-kit/utilities` | ^3.2.2 | CSS transform utilities for drag overlay |

**Why @dnd-kit (stable packages):**

| Criteria | @dnd-kit/core | pragmatic-drag-and-drop | react-beautiful-dnd |
|----------|---------------|-------------------------|---------------------|
| React 19 support | YES (works) | [Partial - Issue #181 open](https://github.com/atlassian/pragmatic-drag-and-drop/issues/181) | NO (deprecated) |
| Maintenance | Active (6.3.1 stable) | Active | Archived |
| npm dependents | 2,039 (@dnd-kit/core) | ~500 | Declining |
| Customization | HIGH (sensors, collision strategies) | HIGH | LOW |
| Bundle size | ~15KB | ~8KB | ~30KB |
| Learning curve | Medium | Medium | Easy |

**Why NOT @dnd-kit/react (v0.2.x):**
- Version 0.2.3 released Jan 2026 - still in early development
- API not stable; documentation incomplete
- @dnd-kit/core + @dnd-kit/sortable are production-proven

**Form Builder Integration Pattern:**
```typescript
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function FormCanvas({ fields }: { fields: FormField[] }) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Reorder fields in Zustand store
      reorderFields(active.id, over.id);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
        {fields.map(field => (
          <SortableField key={field.id} field={field} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableField({ field }: { field: FormField }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners}>
        <GripVertical /> {/* Drag handle */}
      </div>
      <FieldEditor field={field} />
    </Card>
  );
}
```

**Sources:**
- [dnd-kit Official Documentation](https://docs.dndkit.com)
- [npm: @dnd-kit/core](https://www.npmjs.com/package/@dnd-kit/core) - 6.3.1, 2039 dependents
- [npm: @dnd-kit/sortable](https://www.npmjs.com/package/@dnd-kit/sortable) - 10.0.0
- [GitHub Releases](https://github.com/clauderic/dnd-kit/releases)
- [Top 5 DnD Libraries 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)

---

### 2. ID Generation: nanoid

| Package | Version | Purpose |
|---------|---------|---------|
| `nanoid` | ^5.0.9 | Generate unique, URL-safe field IDs |

**Why nanoid over alternatives:**

| Option | Size | Output | Decision |
|--------|------|--------|----------|
| nanoid | 118 bytes | `V1StGXR8_Z5jdHi6B-myT` (21 chars) | **RECOMMENDED** |
| uuid | 423 bytes | `550e8400-e29b-41d4-a716-446655440000` (36 chars) | Too long for URLs |
| React useId | 0 bytes | `:r1:` | Not persistent (regenerates on remount) |
| crypto.randomUUID | 0 bytes | Same as uuid | Same length issue |

**Why NOT React's useId():**
- `useId()` generates IDs for accessibility (label-input linking)
- IDs regenerate on component remount
- Field IDs must persist in Convex database
- `nanoid()` generates once at field creation time

**Usage Pattern:**
```typescript
import { nanoid } from 'nanoid';

// When admin adds a new field to form builder
function addField(type: FieldType) {
  const newField: FormField = {
    id: nanoid(),          // "V1StGXR8_Z5jdHi6B-myT"
    type,
    label: `New ${type} field`,
    required: false,
    placeholder: '',
    order: fields.length,
  };
  // Save to Zustand store and eventually to Convex
}
```

**Source:** [GitHub: nanoid](https://github.com/ai/nanoid) - 118 bytes, URL-safe, secure

---

## Leverage Existing Stack (No New Packages)

### File Upload: Convex Built-in Storage

Convex has native file storage. **No react-dropzone or similar needed.**

**Implementation Pattern:**
```typescript
// convex/forms.ts
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Auth check here if needed
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFileField = mutation({
  args: {
    responseId: v.id("formResponses"),
    fieldId: v.string(),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    // Store file reference with response
  },
});
```

```typescript
// Client component
async function uploadFile(file: File) {
  const uploadUrl = await generateUploadUrl();
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const { storageId } = await result.json();
  return storageId; // Store this with form response
}
```

**Constraints (from Convex docs):**
- Upload URLs expire in 1 hour
- POST request has 2-minute timeout
- HTTP action size limited to 20MB (use upload URLs for larger)

**Source:** [Convex File Storage Documentation](https://docs.convex.dev/file-storage/upload-files)

---

### Date Picker: shadcn/ui Calendar + Popover

shadcn/ui Date Picker is **React 19 compatible** per official documentation.

**Installation:**
```bash
npx shadcn@latest add calendar popover
```

**Note for npm users:** May require `--legacy-peer-deps` due to react-day-picker peer dependencies. pnpm and bun work without flags.

**Form Builder Integration:**
```typescript
// When rendering a date field type
function DateFieldRenderer({ field }: { field: DateFormField }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {value ? format(value, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
```

**Source:** [shadcn/ui React 19 Compatibility](https://ui.shadcn.com/docs/react-19)

---

### Checkbox: shadcn/ui Checkbox

Uses `@radix-ui/react-checkbox` v1.3.3 which supports React 19.

**Installation:**
```bash
npx shadcn@latest add checkbox
```

**Form Builder Integration:**
```typescript
function CheckboxFieldRenderer({ field }: { field: CheckboxFormField }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={field.id} checked={value} onCheckedChange={onChange} />
      <Label htmlFor={field.id}>{field.label}</Label>
    </div>
  );
}
```

**Source:** [Radix Primitives Releases](https://www.radix-ui.com/primitives/docs/overview/releases)

---

### Number Input: Native HTML type="number"

No additional library needed. Use existing shadcn Input.

```typescript
function NumberFieldRenderer({ field }: { field: NumberFormField }) {
  return (
    <Input
      type="number"
      min={field.min}
      max={field.max}
      step={field.step || 1}
      value={value}
      onChange={onChange}
    />
  );
}
```

---

### Form Builder State: Zustand (Already Installed)

Zustand 5.0.10 is already in the project. Use for:

1. **Form Builder State** - Fields, order, selected field, undo/redo
2. **Draft Persistence** - Auto-save form design to localStorage
3. **Validation Preview** - Show validation errors as admin builds

**Store Structure Example:**
```typescript
interface FormBuilderState {
  // Form definition
  formId: string | null;
  formName: string;
  formSlug: string;
  fields: FormField[];

  // UI state
  selectedFieldId: string | null;
  isDirty: boolean;

  // Actions
  addField: (type: FieldType) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  reorderFields: (activeId: string, overId: string) => void;
  selectField: (id: string | null) => void;
  saveForm: () => Promise<void>;
}
```

---

## Form Versioning: Convex Schema Pattern

**Problem:** When form structure changes, existing submissions must preserve their original form structure.

**Solution:** Snapshot form definition on each submission.

```typescript
// convex/schema.ts additions
forms: defineTable({
  name: v.string(),
  slug: v.string(),           // URL path: /apply/[slug]
  fields: v.array(v.object({  // Form field definitions
    id: v.string(),
    type: v.string(),
    label: v.string(),
    required: v.boolean(),
    placeholder: v.optional(v.string()),
    options: v.optional(v.array(v.string())), // For dropdown
    validation: v.optional(v.object({
      min: v.optional(v.number()),
      max: v.optional(v.number()),
      pattern: v.optional(v.string()),
    })),
  })),
  version: v.number(),        // Increment on publish
  isPublished: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_version", ["slug", "version"]),

formResponses: defineTable({
  formId: v.id("forms"),
  formVersion: v.number(),    // Snapshot version at submission time
  formSnapshot: v.array(...), // Copy of form fields at submission
  responses: v.object({}),    // Dynamic response data
  fileUploads: v.optional(v.array(v.object({
    fieldId: v.string(),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
  }))),
  status: v.string(),
  submittedAt: v.number(),
})
```

**Source:** [Convex Schema Best Practices](https://gist.github.com/srizvi/966e583693271d874bf65c2a95466339)

---

## Installation Commands

```bash
# Required new dependencies
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities nanoid

# Add shadcn components (if not present)
npx shadcn@latest add calendar popover checkbox
```

**For npm with React 19 peer dependency warnings:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities nanoid --legacy-peer-deps
npx shadcn@latest add calendar popover checkbox --legacy-peer-deps
```

---

## Package.json Additions

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "nanoid": "^5.0.9"
  }
}
```

Use caret (`^`) for minor/patch updates. These are stable, well-maintained packages.

---

## Explicitly NOT Adding

| Library | Reason |
|---------|--------|
| `react-dropzone` | Convex upload + native input sufficient for file fields |
| `@dnd-kit/react` (v0.2.x) | Too early; API unstable; use stable core+sortable |
| `uuid` | nanoid is smaller (118B vs 423B), URL-safe |
| `react-beautiful-dnd` | Deprecated, no React 19 support |
| `@hello-pangea/dnd` | Fork of rbd, less flexible than dnd-kit |
| `formik` | Already using React Hook Form |
| `date-fns` | Only add if complex date formatting needed |
| `@tanstack/react-query` | Convex has built-in reactivity |
| `immer` | Zustand handles state updates simply |

---

## Integration Summary

| Form Builder Feature | Library/Tool | Status |
|---------------------|--------------|--------|
| Drag-and-drop fields | @dnd-kit/core + sortable | **NEW DEPENDENCY** |
| Field ID generation | nanoid | **NEW DEPENDENCY** |
| Form builder state | Zustand | Existing |
| Field property forms | React Hook Form | Existing |
| Field validation | Zod | Existing |
| Date picker fields | shadcn Calendar + Popover | Add component |
| Checkbox fields | shadcn Checkbox | Add component |
| File upload fields | Convex Storage | Built-in |
| Form versioning | Convex schema pattern | Schema design |
| Drag animations | Framer Motion | Existing |
| UI components | shadcn/ui | Existing |

---

## Confidence Assessment

| Decision | Confidence | Verification Method |
|----------|------------|---------------------|
| @dnd-kit/core choice | HIGH | npm stats, GitHub activity, React 19 compatibility |
| nanoid choice | HIGH | Official docs, bundle size comparison |
| Convex file storage | HIGH | Official Convex documentation |
| shadcn/ui React 19 compatibility | HIGH | Official shadcn React 19 page |
| Form versioning pattern | MEDIUM | Convex best practices gist, standard pattern |
| No @dnd-kit/react (v0.2.x) | HIGH | Version number, release frequency, API stability |

---

## Open Questions (Low Priority)

1. **@dnd-kit/react evolution:** Monitor v0.3+ for when it becomes stable.
2. **File size limits:** Confirm 20MB per file sufficient for typical form uploads.
3. **Form version pruning:** Strategy for cleaning old form versions (or keep all).

---

## Sources

### Official Documentation
- [dnd-kit Documentation](https://docs.dndkit.com)
- [Convex File Storage](https://docs.convex.dev/file-storage/upload-files)
- [shadcn/ui React 19](https://ui.shadcn.com/docs/react-19)
- [nanoid GitHub](https://github.com/ai/nanoid)

### npm Registry
- [@dnd-kit/core](https://www.npmjs.com/package/@dnd-kit/core) - v6.3.1
- [@dnd-kit/sortable](https://www.npmjs.com/package/@dnd-kit/sortable) - v10.0.0
- [nanoid](https://www.npmjs.com/package/nanoid) - v5.0.9

### Community/Comparisons
- [Top 5 DnD Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [pragmatic-drag-and-drop React 19 Issue #181](https://github.com/atlassian/pragmatic-drag-and-drop/issues/181)
- [dnd-kit React 19 Discussion](https://github.com/clauderic/dnd-kit/issues/1654)
