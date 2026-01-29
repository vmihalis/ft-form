import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  applications: defineTable({
    // Applicant Info
    fullName: v.string(),
    email: v.string(),
    linkedIn: v.optional(v.string()),
    role: v.string(),
    bio: v.string(),

    // Proposal
    floor: v.string(),
    initiativeName: v.string(),
    tagline: v.string(),
    values: v.string(),
    targetCommunity: v.string(),
    estimatedSize: v.string(),

    // Roadmap
    phase1Mvp: v.string(),
    phase2Expansion: v.string(),
    phase3LongTerm: v.string(),

    // Impact
    benefitToFT: v.string(),

    // Logistics
    existingCommunity: v.string(),
    spaceNeeds: v.string(),
    startDate: v.string(),
    additionalNotes: v.optional(v.string()),

    // Meta
    status: v.union(
      v.literal("new"),
      v.literal("under_review"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    submittedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_floor", ["floor"])
    .index("by_email", ["email"])
    .index("by_submitted", ["submittedAt"]),

  editHistory: defineTable({
    applicationId: v.id("applications"),
    field: v.string(), // Technical field name: "fullName", "email", etc.
    oldValue: v.string(), // Previous value as string
    newValue: v.string(), // New value as string
    editedAt: v.number(), // Unix timestamp (Date.now())
  })
    .index("by_application", ["applicationId", "editedAt"])
    .index("by_application_field", ["applicationId", "field"]),

  // Dynamic Form Builder Tables (v1.2)

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

  // Dynamic submissions (separate from legacy applications)
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
