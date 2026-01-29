# Phase 11: Schema Foundation - Research

**Researched:** 2026-01-29
**Domain:** Convex database schema design for dynamic forms with versioning
**Confidence:** HIGH

## Summary

Phase 11 establishes the database foundation for dynamic forms. The existing codebase has a hardcoded `applications` table with 19 fixed fields. This phase introduces three new tables (`forms`, `formVersions`, `submissions`) that enable admin-created forms while preserving legacy data.

The primary architectural decision is **JSON string storage** for form schemas. This avoids Convex's 16-level nesting limit and allows flexible schema evolution. Form versions are immutable snapshots created at publish time, ensuring submissions always reference the exact form structure they were submitted against.

**Primary recommendation:** Implement a three-table architecture (forms/formVersions/submissions) with JSON string storage for schema data, manual unique constraint enforcement for slugs, and keep the legacy `applications` table untouched.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Convex | 1.31.6 | Database and backend | Already in project, serverless with real-time sync |
| TypeScript | 5.x | Type definitions | Already in project, type-safe schema definitions |
| Zod | 4.3.6 | Validation | Already in project, will be used for schema-to-validator generation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | 5.0.9 | Generate field IDs | When creating new form fields (future phase) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JSON string | Deeply nested Convex objects | Hits 16-level nesting limit with complex forms |
| Separate formVersions table | Version field on forms table | Less query flexibility, harder to get specific version |
| v.any() for schema | v.string() with JSON | v.any() loses all type info at runtime |

**Installation:**
```bash
# No new dependencies needed for Phase 11
# nanoid will be needed in Phase 14 (Form Builder UI)
```

## Architecture Patterns

### Recommended Database Structure

```
Convex Tables:
├── applications          # KEEP: Existing legacy submissions (19 fixed fields)
├── editHistory           # KEEP: Existing edit tracking for legacy
├── forms                 # NEW: Form definitions (metadata + draft schema)
├── formVersions          # NEW: Immutable published snapshots
├── submissions           # NEW: Dynamic form responses (JSON data)
└── submissionEditHistory # NEW: Edit tracking for dynamic submissions
```

### Pattern 1: Three-Table Form Architecture

**What:** Separate form metadata, immutable versions, and submissions into distinct tables
**When to use:** Always for this phase - this is the core architecture

**Schema Definition:**
```typescript
// convex/schema.ts - additions

// Form definition (editable by admin)
forms: defineTable({
  name: v.string(),                    // "Floor Lead Application"
  slug: v.string(),                    // URL path: "floor-lead-2024"
  description: v.optional(v.string()), // Internal description
  status: v.union(
    v.literal("draft"),
    v.literal("published"),
    v.literal("archived")
  ),
  // Draft schema stored as JSON string (mutable)
  draftSchema: v.string(),             // JSON.stringify(FormSchema)
  // Reference to current published version
  currentVersionId: v.optional(v.id("formVersions")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_status", ["status"]),

// Immutable version snapshot (created on publish)
formVersions: defineTable({
  formId: v.id("forms"),
  version: v.number(),                 // 1, 2, 3...
  schema: v.string(),                  // JSON.stringify(FormSchema) - IMMUTABLE
  publishedAt: v.number(),
})
  .index("by_form", ["formId"])
  .index("by_form_version", ["formId", "version"]),

// Dynamic submissions (separate from legacy applications)
submissions: defineTable({
  formVersionId: v.id("formVersions"), // Links to immutable version
  data: v.string(),                    // JSON.stringify(responses)
  status: v.union(
    v.literal("new"),
    v.literal("under_review"),
    v.literal("accepted"),
    v.literal("rejected")
  ),
  submittedAt: v.number(),
})
  .index("by_version", ["formVersionId"])
  .index("by_status", ["status"])
  .index("by_submitted", ["submittedAt"]),

// Edit history for dynamic submissions
submissionEditHistory: defineTable({
  submissionId: v.id("submissions"),
  fieldId: v.string(),                 // Field ID from schema
  fieldLabel: v.string(),              // Human-readable label at edit time
  oldValue: v.string(),
  newValue: v.string(),
  editedAt: v.number(),
})
  .index("by_submission", ["submissionId", "editedAt"]),
```

### Pattern 2: JSON String Storage for Schemas

**What:** Store form schema as JSON string rather than nested Convex objects
**When to use:** Always for schema storage - this is a locked decision from prior research

**Why JSON string:**
1. **Avoids 16-level nesting limit** - Complex forms with nested validation rules would hit Convex limits
2. **Flexible structure** - Schema format can evolve without Convex migrations
3. **1MB document limit** - JSON string is more space-efficient than deeply nested objects
4. **Consistency** - Same pattern for draftSchema, version schema, and submission data

**Example:**
```typescript
// Writing a form
await ctx.db.insert("forms", {
  name: "Floor Lead Application",
  slug: "floor-lead-2024",
  status: "draft",
  draftSchema: JSON.stringify({
    steps: [
      {
        id: "step_1",
        title: "Personal Information",
        fields: [
          { id: "field_1", type: "text", label: "Full Name", required: true },
          { id: "field_2", type: "email", label: "Email", required: true },
        ],
      },
    ],
  }),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Reading a form
const form = await ctx.db.get(formId);
const schema = JSON.parse(form.draftSchema) as FormSchema;
```

### Pattern 3: Immutable Version Creation

**What:** Publishing creates a frozen copy of the schema that can never be modified
**When to use:** Every time admin publishes a form

**Workflow:**
```typescript
// convex/forms.ts
export const publish = mutation({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    // Calculate next version number
    const latestVersion = await ctx.db
      .query("formVersions")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .order("desc")
      .first();

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    // Create immutable version snapshot
    const versionId = await ctx.db.insert("formVersions", {
      formId: args.formId,
      version: nextVersion,
      schema: form.draftSchema,  // Copy current draft to immutable version
      publishedAt: Date.now(),
    });

    // Update form to reference new version and mark published
    await ctx.db.patch(args.formId, {
      status: "published",
      currentVersionId: versionId,
      updatedAt: Date.now(),
    });

    return { versionId, version: nextVersion };
  },
});
```

### Pattern 4: Manual Unique Constraint for Slugs

**What:** Enforce slug uniqueness in mutations since Convex lacks native unique constraints
**When to use:** Every mutation that creates or updates a form slug

**Implementation:**
```typescript
// convex/forms.ts
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    draftSchema: v.string(),
  },
  handler: async (ctx, args) => {
    // Normalize slug: lowercase, alphanumeric + hyphens only
    const normalizedSlug = args.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")        // Collapse multiple hyphens
      .replace(/^-|-$/g, "");     // Trim leading/trailing hyphens

    // Check for existing slug (case-insensitive via normalization)
    const existing = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
      .first();

    if (existing) {
      throw new Error(`Slug "${normalizedSlug}" is already in use`);
    }

    // Check reserved paths
    const reserved = ["admin", "api", "apply", "login", "logout"];
    if (reserved.includes(normalizedSlug)) {
      throw new Error(`Slug "${normalizedSlug}" is reserved`);
    }

    return await ctx.db.insert("forms", {
      name: args.name,
      slug: normalizedSlug,
      status: "draft",
      draftSchema: args.draftSchema,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

### Pattern 5: Submission with Version Reference

**What:** Submissions store formVersionId (not formId) to link to immutable schema
**When to use:** Every form submission

**Implementation:**
```typescript
// convex/submissions.ts
export const submit = mutation({
  args: {
    formVersionId: v.id("formVersions"),
    data: v.string(),  // JSON stringified responses
  },
  handler: async (ctx, args) => {
    // Verify version exists
    const version = await ctx.db.get(args.formVersionId);
    if (!version) throw new Error("Form version not found");

    return await ctx.db.insert("submissions", {
      formVersionId: args.formVersionId,
      data: args.data,
      status: "new",
      submittedAt: Date.now(),
    });
  },
});

// Query submission with its schema for display
export const getWithSchema = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) return null;

    const version = await ctx.db.get(submission.formVersionId);
    if (!version) return null;

    const form = await ctx.db.get(version.formId);

    return {
      submission,
      schema: JSON.parse(version.schema) as FormSchema,
      formName: form?.name ?? "Unknown Form",
    };
  },
});
```

### Anti-Patterns to Avoid

- **Storing only formId on submissions:** Links to current form, not the version at submission time. When form changes, historical submissions become uninterpretable.
- **In-place schema updates:** Editing published forms directly breaks existing submissions. Always create new version.
- **Deeply nested schema objects:** Hits Convex 16-level nesting limit. Use JSON string.
- **Removing legacy applications table:** Breaks existing admin dashboard. Keep and mark as "v0" conceptually.
- **Case-sensitive slug matching:** `Apply` and `apply` should be the same. Always normalize.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique constraint | Custom locking mechanism | Query + throw in mutation | Convex OCC handles race conditions |
| Schema validation | Manual type checking | TypeScript interfaces + JSON.parse | Type assertions catch errors at dev time |
| Version numbering | Manual tracking | Query max + increment | Simple, consistent |
| Slug normalization | Inline logic | Reusable helper function | Consistent across create/update |

**Key insight:** Convex's optimistic concurrency control (OCC) handles race conditions. If two mutations try to create the same slug simultaneously, the second one will be automatically retried after the first commits, at which point the uniqueness check will fail appropriately.

## Common Pitfalls

### Pitfall 1: Breaking Existing Submissions When Schema Changes
**What goes wrong:** Form schema changes, but old submissions stored raw field values now don't match current schema structure.
**Why it happens:** Submissions reference `formId` instead of immutable `formVersionId`.
**How to avoid:** Always store `formVersionId` (immutable snapshot), never just `formId`. Display submissions using their associated version's schema.
**Warning signs:** Admin sees "unknown field" errors, submission data doesn't match displayed form structure.

### Pitfall 2: Slug Collision
**What goes wrong:** Two forms have same slug (possibly different case), URL routing breaks.
**Why it happens:** No database-level unique constraint, no normalization.
**How to avoid:** Normalize slugs (lowercase, alphanumeric + hyphens), check for existing before insert/update.
**Warning signs:** Wrong form displays at URL, 404 for valid forms.

### Pitfall 3: JSON Parse Errors
**What goes wrong:** Invalid JSON in schema field causes runtime crashes.
**Why it happens:** No validation on write, trust issues with external data.
**How to avoid:** Validate JSON structure on write (Zod schema for FormSchema), wrap parse in try-catch on read.
**Warning signs:** "Unexpected token" errors in console, blank form pages.

### Pitfall 4: Large Schema Performance
**What goes wrong:** Forms with 50+ fields cause slow queries.
**Why it happens:** Fetching full schema when only metadata needed.
**How to avoid:** Query only fields needed. For list views, don't include `draftSchema`. Fetch schema only when editing.
**Warning signs:** Slow admin dashboard load times, large network payloads.

### Pitfall 5: Legacy Data Incompatibility
**What goes wrong:** Admin dashboard breaks when mixing legacy `applications` and new `submissions`.
**Why it happens:** Queries assume unified data structure.
**How to avoid:** Keep tables separate. Query each with appropriate structure. Merge only at display layer if needed.
**Warning signs:** Type errors mixing `applications` and `submissions`, broken filters.

## Code Examples

Verified patterns from official sources:

### Creating a Form with Slug Validation
```typescript
// convex/forms.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const RESERVED_SLUGS = ["admin", "api", "apply", "login", "logout", "auth"];

function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const slug = normalizeSlug(args.slug);

    if (RESERVED_SLUGS.includes(slug)) {
      throw new Error(`"${slug}" is a reserved path`);
    }

    const existing = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      throw new Error(`A form with slug "${slug}" already exists`);
    }

    const emptySchema = JSON.stringify({
      steps: [],
      settings: {
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
      },
    });

    return await ctx.db.insert("forms", {
      name: args.name,
      slug,
      status: "draft",
      draftSchema: emptySchema,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

### Publishing a Form Version
```typescript
// convex/forms.ts
export const publish = mutation({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    // Validate schema before publishing
    try {
      const schema = JSON.parse(form.draftSchema);
      if (!schema.steps || !Array.isArray(schema.steps)) {
        throw new Error("Invalid schema: missing steps array");
      }
    } catch (e) {
      throw new Error(`Invalid form schema: ${(e as Error).message}`);
    }

    // Get next version number
    const latestVersion = await ctx.db
      .query("formVersions")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .order("desc")
      .first();

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    // Create immutable snapshot
    const versionId = await ctx.db.insert("formVersions", {
      formId: args.formId,
      version: nextVersion,
      schema: form.draftSchema,
      publishedAt: Date.now(),
    });

    // Update form status
    await ctx.db.patch(args.formId, {
      status: "published",
      currentVersionId: versionId,
      updatedAt: Date.now(),
    });

    return { versionId, version: nextVersion };
  },
});
```

### Getting Form by Slug (for Public Form Rendering)
```typescript
// convex/forms.ts
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!form || form.status !== "published") {
      return null;
    }

    if (!form.currentVersionId) {
      return null;
    }

    const version = await ctx.db.get(form.currentVersionId);
    if (!version) return null;

    return {
      formId: form._id,
      formName: form.name,
      versionId: version._id,
      version: version.version,
      schema: JSON.parse(version.schema),
    };
  },
});
```

### Submitting to a Form
```typescript
// convex/submissions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    formVersionId: v.id("formVersions"),
    data: v.string(),  // JSON stringified { [fieldId]: value }
  },
  handler: async (ctx, args) => {
    // Verify version exists
    const version = await ctx.db.get(args.formVersionId);
    if (!version) throw new Error("Form version not found");

    // Validate data is valid JSON
    try {
      JSON.parse(args.data);
    } catch {
      throw new Error("Invalid submission data format");
    }

    return await ctx.db.insert("submissions", {
      formVersionId: args.formVersionId,
      data: args.data,
      status: "new",
      submittedAt: Date.now(),
    });
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded form fields | Dynamic schema-driven forms | v1.2 milestone | Admins can create custom forms |
| Single form | Multiple forms with unique URLs | v1.2 milestone | Different forms for different purposes |
| Fixed field types | Configurable field types | v1.2 milestone | Text, email, dropdown, file, etc. |
| No versioning | Immutable form versions | v1.2 milestone | Historical data integrity |

**Deprecated/outdated:**
- None in this phase (new architecture)

## TypeScript Type Definitions

```typescript
// src/types/form-schema.ts

export interface FormSchema {
  steps: FormStep[];
  settings: FormSettings;
}

export interface FormStep {
  id: string;                     // Unique step identifier
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormField {
  id: string;                     // Unique field identifier (key for responses)
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: FieldOption[];        // For select, radio, checkbox
}

export type FieldType =
  | "text"
  | "email"
  | "url"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
}

// Convex document types (what comes from database)
export interface FormDoc {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "published" | "archived";
  draftSchema: string;  // JSON string
  currentVersionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FormVersionDoc {
  _id: string;
  _creationTime: number;
  formId: string;
  version: number;
  schema: string;  // JSON string
  publishedAt: number;
}

export interface SubmissionDoc {
  _id: string;
  _creationTime: number;
  formVersionId: string;
  data: string;  // JSON string
  status: "new" | "under_review" | "accepted" | "rejected";
  submittedAt: number;
}
```

## Open Questions

Things that couldn't be fully resolved:

1. **Form version cleanup strategy**
   - What we know: Versions are immutable, can accumulate over time
   - What's unclear: When (if ever) to delete old versions
   - Recommendation: Keep all versions for audit trail. Consider archival strategy in future if storage becomes concern.

2. **Legacy applications migration**
   - What we know: Existing `applications` table should continue working
   - What's unclear: Whether to add `formVersion: "v0"` marker to legacy data
   - Recommendation: Leave legacy data untouched. Handle at query/display layer.

3. **Schema validation depth**
   - What we know: JSON.parse catches basic errors
   - What's unclear: How strict to validate schema structure on save
   - Recommendation: Create Zod schema for FormSchema type, validate on write. Implement in Phase 11.

## Sources

### Primary (HIGH confidence)
- [Convex Data Types](https://docs.convex.dev/database/types) - 16-level nesting limit, 1MB document size
- [Convex Schemas](https://docs.convex.dev/database/schemas) - Table definitions, validators
- [Convex Indexes](https://docs.convex.dev/database/reading-data/indexes/) - Index creation, query optimization
- [Convex File Storage](https://docs.convex.dev/file-storage/upload-files) - v.id("_storage") validator

### Secondary (MEDIUM confidence)
- [Convex Community: Unique Database Fields](https://discord-questions.convex.dev/m/1130486747931877498) - Manual unique constraint pattern with OCC
- [Convex Best Practices Gist](https://gist.github.com/srizvi/966e583693271d874bf65c2a95466339) - Schema design patterns

### Tertiary (Existing project research)
- `.planning/research/STACK-v1.2-form-builder.md` - Technology stack decisions
- `.planning/research/ARCHITECTURE-v1.2-dynamic-forms.md` - Architecture patterns
- `.planning/research/PITFALLS.md` - Common pitfalls to avoid

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing Convex patterns with verified documentation
- Architecture: HIGH - Based on official Convex patterns and existing codebase
- Pitfalls: HIGH - Documented in prior research, verified against Convex limits

**Research date:** 2026-01-29
**Valid until:** 60 days (stable database patterns, unlikely to change)
