# Phase 8: Edit Infrastructure - Research

**Researched:** 2026-01-28
**Domain:** Convex schema extension, atomic mutations, edit history tracking
**Confidence:** HIGH

## Summary

Phase 8 establishes the database infrastructure for admin inline editing. The goal is to add an `editHistory` table and create mutations that atomically update application fields while recording changes. This is foundational work - no UI involved.

Convex's transactional model makes this straightforward: the entire mutation function is a single transaction, so updating a field and inserting a history record happen atomically. No explicit transaction management is needed. The approach uses a simple manual pattern rather than the `convex-table-history` component, keeping dependencies minimal and giving full control over the schema.

The key insight: store old/new values as strings regardless of underlying type. This simplifies the schema and history display - all values become human-readable text. The field name stored should be the technical key (e.g., "fullName") with a display name mapping handled at the UI layer.

**Primary recommendation:** Add `editHistory` table with (applicationId, field, oldValue, newValue, editedAt) and create a single `updateField` mutation that patches the application and inserts history in one atomic operation.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Convex | 1.31.6 | Database, mutations, queries | Already in project; handles transactions automatically |

### Supporting

No additional libraries needed. Convex provides everything required:
- `defineTable` for schema extension
- `v.id()` for foreign key references
- `ctx.db.patch()` for partial updates
- `ctx.db.insert()` for history records
- Index support for efficient history queries

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual history tracking | `convex-table-history` component | Component adds abstraction, requires `convex.config.ts` setup, stores full document snapshots. Manual approach is simpler for field-level tracking. |
| Triggers via `convex-helpers` | Explicit mutation logic | Triggers are implicit/magical. Explicit code is clearer for a simple use case. |
| Storing typed values | Storing all values as strings | Strings are simpler, display-ready. Type information can be inferred from field name if needed. |

**Installation:**
```bash
# No new packages needed - Convex already installed
```

## Architecture Patterns

### Recommended Schema Extension

```typescript
// convex/schema.ts - ADD this table
editHistory: defineTable({
  applicationId: v.id("applications"),
  field: v.string(),           // Technical field name: "fullName", "email", "floor"
  oldValue: v.string(),        // Previous value as string
  newValue: v.string(),        // New value as string
  editedAt: v.number(),        // Unix timestamp (Date.now())
})
  .index("by_application", ["applicationId", "editedAt"])
  .index("by_application_field", ["applicationId", "field"])
```

### Pattern 1: Atomic Update + History

**What:** Single mutation that updates application field and creates history record
**When to use:** Every field edit from the admin UI
**Example:**
```typescript
// Source: Convex mutations run as atomic transactions
// convex/applications.ts
export const updateField = mutation({
  args: {
    id: v.id("applications"),
    field: v.string(),
    newValue: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current document to capture old value
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error("Application not found");
    }

    // Get old value (handle undefined gracefully)
    const oldValue = String(application[args.field as keyof typeof application] ?? "");

    // Skip if no actual change
    if (oldValue === args.newValue) {
      return { changed: false };
    }

    // Update the field (atomic with history insert below)
    await ctx.db.patch(args.id, { [args.field]: args.newValue });

    // Insert history record (same transaction)
    await ctx.db.insert("editHistory", {
      applicationId: args.id,
      field: args.field,
      oldValue,
      newValue: args.newValue,
      editedAt: Date.now(),
    });

    return { changed: true };
  },
});
```

### Pattern 2: Query History by Application

**What:** Retrieve edit history for a specific application
**When to use:** Displaying edit history timeline in detail panel
**Example:**
```typescript
// Source: Convex index queries
export const getEditHistory = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("editHistory")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .order("desc")  // Most recent first
      .collect();
  },
});
```

### Anti-Patterns to Avoid

- **Separate mutations for update and history:** Loses atomicity. If history insert fails, field update already committed. Always do both in same mutation.
- **Storing typed values in history:** Complex schema, type coercion issues. Store everything as strings.
- **Using `_creationTime` as `editedAt`:** Convex adds `_creationTime` automatically, but explicit `editedAt` is clearer and matches the domain.
- **Generic `ctx.db.patch` without history:** Future edits must use `updateField`, not raw `ctx.db.patch`, to maintain audit trail.
- **Fetching full history without index:** Always use `.withIndex("by_application")` for efficient queries.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Transaction management | Manual begin/commit/rollback | Convex automatic transactions | Entire mutation is a transaction; no manual work needed |
| Foreign key validation | Manual ID existence checks | `v.id("tableName")` validator | Convex validates ID references at runtime |
| Timestamp generation | Custom timestamp logic | `Date.now()` | Standard JS, stored as number, Convex-friendly |
| Index definition | Query-time filtering | Schema-level `.index()` | Indexes are defined in schema, used at query time |

**Key insight:** Convex handles the hard parts (transactions, consistency, real-time updates). Focus on business logic, not infrastructure.

## Common Pitfalls

### Pitfall 1: Forgetting to Handle Optional Fields

**What goes wrong:** `application[field]` returns `undefined` for optional fields, then `String(undefined)` becomes `"undefined"` string.
**Why it happens:** TypeScript doesn't catch this at compile time; Convex schema allows optional fields.
**How to avoid:** Use nullish coalescing: `String(application[field] ?? "")`
**Warning signs:** History records showing "undefined" as old value.

### Pitfall 2: Not Checking for Actual Changes

**What goes wrong:** User opens edit, makes no change, blurs. Empty history record created.
**Why it happens:** Save-on-blur triggers mutation even without changes.
**How to avoid:** Compare `oldValue === newValue` before inserting history.
**Warning signs:** History timeline cluttered with no-op entries.

### Pitfall 3: Field Name Mismatch

**What goes wrong:** UI sends "name" but schema uses "fullName". Patch silently adds new field instead of updating.
**Why it happens:** Convex `patch` doesn't validate field names against schema.
**How to avoid:** Use TypeScript to type the field argument: `field: v.union(v.literal("fullName"), v.literal("email"), ...)` or validate explicitly.
**Warning signs:** Applications have unexpected extra fields; edits don't appear.

### Pitfall 4: Missing Index on History Queries

**What goes wrong:** History query scans entire `editHistory` table.
**Why it happens:** Forgot to add `.withIndex()` to query.
**How to avoid:** Define index in schema, always query with `.withIndex()`.
**Warning signs:** Slow history loads as history table grows.

### Pitfall 5: Breaking Existing `updateStatus` Mutation

**What goes wrong:** Status changes don't appear in edit history.
**Why it happens:** Existing `updateStatus` mutation bypasses new `updateField` pattern.
**How to avoid:** Either update `updateStatus` to record history, or route status changes through `updateField`.
**Warning signs:** Status changes missing from timeline; inconsistent audit trail.

## Code Examples

Verified patterns from official sources:

### Schema Definition with Index

```typescript
// Source: https://docs.convex.dev/database/schemas
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing applications table ...

  editHistory: defineTable({
    applicationId: v.id("applications"),
    field: v.string(),
    oldValue: v.string(),
    newValue: v.string(),
    editedAt: v.number(),
  })
    .index("by_application", ["applicationId", "editedAt"])
    .index("by_application_field", ["applicationId", "field"]),
});
```

### Complete updateField Mutation

```typescript
// Source: https://docs.convex.dev/functions/mutation-functions
// Source: https://docs.convex.dev/database/writing-data
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateField = mutation({
  args: {
    id: v.id("applications"),
    field: v.string(),
    newValue: v.string(),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error("Application not found");
    }

    // Type-safe field access
    const oldValue = String(
      (application as Record<string, unknown>)[args.field] ?? ""
    );

    // No-op check
    if (oldValue === args.newValue) {
      return { changed: false };
    }

    // Atomic: both succeed or both fail
    await ctx.db.patch(args.id, { [args.field]: args.newValue });
    await ctx.db.insert("editHistory", {
      applicationId: args.id,
      field: args.field,
      oldValue,
      newValue: args.newValue,
      editedAt: Date.now(),
    });

    return { changed: true };
  },
});
```

### History Query with Ordering

```typescript
// Source: https://docs.convex.dev/database/reading-data/indexes/
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getEditHistory = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("editHistory")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", args.applicationId)
      )
      .order("desc")
      .collect();
  },
});
```

### Testing via Convex Dashboard or Direct Call

```typescript
// From React component (for verification)
const updateField = useMutation(api.applications.updateField);

// Test call
await updateField({
  id: applicationId,
  field: "fullName",
  newValue: "John D. Smith",
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate history table with triggers | Still valid; manual or trigger-based | - | Manual is clearer for simple cases |
| Storing full document snapshots | Field-level change tracking | - | Field-level is more efficient, easier to display |
| `convex-table-history` component | Manual implementation | - | Component exists but overkill for this use case |

**Note on convex-table-history component:**
The [convex-table-history](https://github.com/get-convex/table-history) npm package provides automatic document-level history tracking. It stores full document snapshots on every change. For this project's field-level requirements (showing "Name changed from X to Y"), a manual approach is simpler and more suitable.

## Open Questions

Things that couldn't be fully resolved:

1. **Should status changes also record history?**
   - What we know: Existing `updateStatus` mutation doesn't record history
   - What's unclear: Is status a "field" for history purposes?
   - Recommendation: Yes, treat status as a field. Either modify `updateStatus` to call `updateField` internally, or record history there too. Keeps audit trail complete.

2. **How to handle array/object fields like `additionalNotes`?**
   - What we know: Schema has mostly string fields, one optional string field
   - What's unclear: If future fields are arrays/objects, how to stringify?
   - Recommendation: `JSON.stringify()` for non-string values. For v1.1, all editable fields are strings, so this is deferred.

## Sources

### Primary (HIGH confidence)
- [Convex Mutations](https://docs.convex.dev/functions/mutation-functions) - Mutation definition, transaction guarantees
- [Convex Writing Data](https://docs.convex.dev/database/writing-data) - `ctx.db.patch`, `ctx.db.insert` patterns
- [Convex Schemas](https://docs.convex.dev/database/schemas) - `defineTable`, `v.id()`, index creation
- [Convex Indexes](https://docs.convex.dev/database/reading-data/indexes/) - `.withIndex()` queries, ordering

### Secondary (MEDIUM confidence)
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/) - Granular mutations, query efficiency
- [Convex OCC and Atomicity](https://docs.convex.dev/database/advanced/occ) - Transaction model explanation
- [Convex Database Triggers](https://stack.convex.dev/triggers) - Alternative trigger-based pattern (not used, but researched)

### Tertiary (LOW confidence)
- [convex-table-history GitHub](https://github.com/get-convex/table-history) - Alternative component approach (evaluated, not recommended for this use case)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Convex only, already in project, well-documented
- Architecture: HIGH - Patterns verified against official docs
- Pitfalls: HIGH - Based on Convex documentation and common database patterns

**Research date:** 2026-01-28
**Valid until:** 60 days (Convex API is stable; schema patterns unlikely to change)
