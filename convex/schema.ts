import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Form definition (editable by admin)
  forms: defineTable({
    name: v.string(),                    // "Floor Lead Application 2024"
    slug: v.string(),                    // URL path: "floor-lead-2024" -> /apply/floor-lead-2024
    description: v.optional(v.string()), // Internal admin description
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    draftSchema: v.string(),             // JSON.stringify(FormSchema) - mutable draft
    currentVersionId: v.optional(v.id("formVersions")), // Reference to published version
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

  // Submissions
  submissions: defineTable({
    formVersionId: v.id("formVersions"), // Links to immutable version, NOT form
    data: v.string(),                    // JSON.stringify({ [fieldId]: value })
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
});
