# Stack Research: Inline Editing with Edit History

**Project:** Frontier Tower Floor Lead Application System - v1.1 Admin Inline Editing
**Researched:** 2026-01-28
**Overall Confidence:** HIGH
**Research Type:** Subsequent Milestone - Stack Additions Only

---

## Summary

For inline editing with edit history tracking in your existing Convex + shadcn/ui admin dashboard:

1. **No new UI libraries needed for inline editing** - Your existing stack (React Hook Form 7.71.1, Zod 4.3.6, shadcn/ui components) already provides everything required
2. **Add `@convex-dev/table-history` for edit history** - Official Convex component designed exactly for audit logs and edit tracking
3. **Build a simple EditableField component** - Pattern: click-to-edit using existing Input/Textarea components with view/edit state toggle

---

## Recommended Additions

### 1. Edit History Tracking

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@convex-dev/table-history` | ~0.1.x | Audit log / edit history for Convex tables | Official Convex component. Provides `listDocumentHistory()` to show all edits to a specific application, `listHistory()` for full audit trail. Integrates natively with Convex mutations. |

**Installation:**
```bash
npm install @convex-dev/table-history
```

**Integration requires:**
- Create `convex/convex.config.ts` to register the component
- Wrap existing `db.patch()` calls to also record history
- Query history with provided API for display in UI

**Key APIs:**
- `listDocumentHistory(documentId)` - Get all edits for one application
- `listHistory()` - Paginate through all history (for admin audit view)
- Configurable serializability: `"document"` recommended for per-application history

### 2. No Additional UI Libraries Needed

Your existing shadcn/ui components are sufficient:

| Existing Component | Use For Inline Editing |
|-------------------|------------------------|
| `Input` | Short text fields (name, email, tagline) |
| `Textarea` | Long text fields (bio, phase descriptions, values) |
| `Select` | Floor dropdown, status |
| `Button` | Save/Cancel actions |

**Why NOT add Dice UI Editable or similar:**
- Adds unnecessary dependency for simple use case
- Your existing Input/Textarea already support controlled mode
- Custom EditableField component (20-30 lines) gives you exact control over UX
- Avoids version conflicts with React 19

---

## Integration Points

### Existing Stack Compatibility

| Technology | Version | Integration Notes |
|------------|---------|-------------------|
| Convex | 1.31.6 | table-history component designed for this version range |
| React Hook Form | 7.71.1 | Use `useForm()` for edit form state, `reset()` on cancel |
| Zod | 4.3.6 | Reuse existing `combinedApplicationSchema` for edit validation |
| shadcn/ui | current | No changes needed, use existing Input/Textarea |
| Zustand | 5.0.10 | Optional: could track edit mode state, but React state sufficient |

### Convex Mutation Pattern

Current `updateStatus` mutation pattern (in `convex/applications.ts`) extends cleanly:

```typescript
// Current pattern (applications.ts line 74-87)
export const updateStatus = mutation({
  args: { id: v.id("applications"), status: v.union(...) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Extended pattern for field editing with history
export const updateField = mutation({
  args: {
    id: v.id("applications"),
    field: v.string(),
    value: v.string(),
    editedBy: v.string(), // admin identifier
  },
  handler: async (ctx, args) => {
    const before = await ctx.db.get(args.id);
    await ctx.db.patch(args.id, { [args.field]: args.value });
    const after = await ctx.db.get(args.id);

    // Record history via table-history component
    await applicationHistory.update(ctx, args.id, after, {
      attribution: { editedBy: args.editedBy, field: args.field }
    });
  },
});
```

### React Component Pattern

Extend existing `ApplicationSheet.tsx` Field component:

```typescript
// Current read-only Field (ApplicationSheet.tsx line 21-29)
function Field({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
}

// New EditableField pattern using existing components
function EditableField({ label, value, field, applicationId, fieldType = "input" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const updateField = useMutation(api.applications.updateField);

  if (!isEditing) {
    return (
      <div className="space-y-1 group cursor-pointer" onClick={() => setIsEditing(true)}>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm whitespace-pre-wrap">{value}</p>
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {fieldType === "textarea" ? (
        <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} />
      ) : (
        <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { updateField({ id: applicationId, field, value: editValue }); setIsEditing(false); }}>Save</Button>
        <Button size="sm" variant="outline" onClick={() => { setEditValue(value); setIsEditing(false); }}>Cancel</Button>
      </div>
    </div>
  );
}
```

### Schema Reuse

Existing Zod schemas in `/src/lib/schemas/application.ts` can be reused for edit validation:

```typescript
// Reuse existing field validation
import { applicantInfoSchema, proposalSchema } from "@/lib/schemas/application";

// Validate single field before save
const validateField = (field: string, value: string) => {
  const fieldSchemas: Record<string, z.ZodSchema> = {
    fullName: z.string().min(1),
    email: z.string().email(),
    // ... map from existing schemas
  };
  return fieldSchemas[field]?.safeParse(value);
};
```

---

## Edit History Schema Design

### Recommended Approach

Use `@convex-dev/table-history` with document-level serializability:

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import tableHistory from "@convex-dev/table-history/convex.config";

const app = defineApp();
app.use(tableHistory, {
  name: "applicationHistory",
  serializability: "document" // Per-application history ordering
});
export default app;
```

### History Entry Structure

The component automatically tracks:
- `documentId` - which application was edited
- `content` - full document state at time of edit
- `timestamp` - when the edit occurred
- `attribution` - custom metadata (editedBy, field changed)

### Querying History

```typescript
// Get edit history for one application
const history = await applicationHistory.listDocumentHistory(ctx, applicationId, {
  maxTs: Date.now(),
  paginationOpts: { numItems: 20 }
});

// Returns entries with before/after states for diff display
```

---

## Avoid

### DO NOT Add

| Library | Reason |
|---------|--------|
| `@diceui/editable` | Overkill for this use case. Adds React 18 peer dependency (you're on React 19). Custom EditableField component in 30 lines does exactly what you need. |
| `react-contenteditable` | Designed for rich text; your fields are plain text. Unnecessary complexity. |
| `@tanstack/react-query` | You already have Convex's reactive queries. Adding another data layer creates confusion about which to use. |
| `immer` | Convex mutations are atomic; no need for immutable update helpers on the client. |
| Custom history table | Use `@convex-dev/table-history` instead of rolling your own. It handles pagination, timestamps, and query optimization. |

### Anti-Patterns to Avoid

1. **Over-abstracting the editable pattern** - Don't build a generic "make any component editable" wrapper. Your fields are known; just build EditableField with explicit field types.

2. **Optimistic updates for edits** - Unlike status changes, field edits involve validation. Let the mutation complete before updating UI to ensure consistency. The Convex round-trip is fast enough (~50-100ms).

3. **Storing edit history in the same document** - Don't add a `history: []` array to applications table. Use the separate history component - it handles pagination and doesn't bloat your main documents.

4. **Form-based editing for single fields** - Don't wrap the entire sheet in a React Hook Form. Use inline field-by-field editing with local state. Form-based editing is for "edit all fields at once" patterns.

---

## Installation Summary

```bash
# Only addition needed
npm install @convex-dev/table-history
```

No other packages required. Your existing stack handles everything else.

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| Edit History Package | HIGH | Official Convex component, well-documented, designed for this exact use case |
| No UI Library Needed | HIGH | Verified existing shadcn/ui Input/Textarea support controlled mode |
| Integration Pattern | HIGH | Examined existing codebase; pattern extends naturally from current StatusDropdown |
| Version Compatibility | MEDIUM | table-history version 0.1.x; verified works with Convex 1.x but recommend checking npm for latest |

---

## Roadmap Implications

Based on this research, the inline editing milestone should be structured as:

1. **Phase 1: Edit History Infrastructure**
   - Install `@convex-dev/table-history`
   - Create `convex/convex.config.ts`
   - Add `updateField` mutation with history recording

2. **Phase 2: EditableField Component**
   - Build reusable EditableField component
   - Support Input (short text) and Textarea (long text) modes
   - Integrate validation from existing Zod schemas

3. **Phase 3: Update ApplicationSheet**
   - Replace read-only Field components with EditableField
   - Add edit history display section

4. **Phase 4: Edit History UI**
   - Display edit timeline for each application
   - Show who changed what and when

**No research flags needed** - This is a well-understood pattern with official component support.

---

## Sources

- [Convex Table History Component](https://github.com/get-convex/table-history) - Official repository with installation and API documentation
- [Convex Optimistic Updates](https://docs.convex.dev/client/react/optimistic-updates) - Official docs on mutation patterns
- [shadcn/ui Form Component](https://ui.shadcn.com/docs/components/form) - Form patterns with React Hook Form
- [Dice UI Editable](https://www.diceui.com/docs/components/editable) - Evaluated but not recommended for this use case
- [shadcn/ui Input Variants](https://shadcnstudio.com/docs/components/input) - Confirmed inline editable variant exists in shadcn patterns
