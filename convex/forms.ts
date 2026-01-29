import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Reserved slugs that conflict with app routes
const RESERVED_SLUGS = ["admin", "api", "apply", "login", "logout", "auth", "_next"];

/**
 * Normalize slug to URL-safe format
 * - lowercase
 * - alphanumeric + hyphens only
 * - no leading/trailing hyphens
 * - no consecutive hyphens
 */
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Create a new form with empty schema
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = normalizeSlug(args.slug);

    if (!slug) {
      throw new Error("Slug cannot be empty");
    }

    if (RESERVED_SLUGS.includes(slug)) {
      throw new Error(`"${slug}" is a reserved path`);
    }

    // Check for existing slug (manual unique constraint)
    const existing = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      throw new Error(`A form with slug "${slug}" already exists`);
    }

    // Empty schema for new forms
    const emptySchema = JSON.stringify({
      steps: [],
      settings: {
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
      },
    });

    const now = Date.now();
    return await ctx.db.insert("forms", {
      name: args.name,
      slug,
      description: args.description,
      status: "draft",
      draftSchema: emptySchema,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update form metadata and draft schema
 */
export const update = mutation({
  args: {
    formId: v.id("forms"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    draftSchema: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.description !== undefined) {
      updates.description = args.description;
    }

    if (args.draftSchema !== undefined) {
      // Validate JSON
      try {
        JSON.parse(args.draftSchema);
      } catch {
        throw new Error("Invalid JSON in draftSchema");
      }
      updates.draftSchema = args.draftSchema;
    }

    if (args.slug !== undefined) {
      const slug = normalizeSlug(args.slug);

      if (!slug) {
        throw new Error("Slug cannot be empty");
      }

      if (RESERVED_SLUGS.includes(slug)) {
        throw new Error(`"${slug}" is a reserved path`);
      }

      // Check uniqueness (excluding current form)
      const existing = await ctx.db
        .query("forms")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (existing && existing._id !== args.formId) {
        throw new Error(`A form with slug "${slug}" already exists`);
      }

      updates.slug = slug;
    }

    await ctx.db.patch(args.formId, updates);
    return args.formId;
  },
});

/**
 * Publish form - creates immutable version snapshot
 */
export const publish = mutation({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    // Validate schema before publishing
    let schema;
    try {
      schema = JSON.parse(form.draftSchema);
    } catch {
      throw new Error("Invalid form schema: malformed JSON");
    }

    if (!schema.steps || !Array.isArray(schema.steps)) {
      throw new Error("Invalid schema: missing steps array");
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

    // Update form status and current version reference
    await ctx.db.patch(args.formId, {
      status: "published",
      currentVersionId: versionId,
      updatedAt: Date.now(),
    });

    return { versionId, version: nextVersion };
  },
});

/**
 * Archive form - makes it unavailable for new submissions
 */
export const archive = mutation({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    await ctx.db.patch(args.formId, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return args.formId;
  },
});

/**
 * Get form by slug (for public form rendering)
 * Returns null if form doesn't exist or isn't published
 */
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

/**
 * Get form by ID (for admin editing)
 */
export const getById = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) return null;

    return {
      ...form,
      draftSchema: JSON.parse(form.draftSchema),
    };
  },
});

/**
 * List all forms (for admin dashboard)
 */
export const list = query({
  handler: async (ctx) => {
    const forms = await ctx.db
      .query("forms")
      .order("desc")
      .collect();

    return forms.map((form) => ({
      _id: form._id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      status: form.status,
      currentVersionId: form.currentVersionId,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      // Don't include draftSchema in list view for performance
    }));
  },
});

/**
 * Get all versions of a form (for version history)
 */
export const listVersions = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("formVersions")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .order("desc")
      .collect();
  },
});
