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
});
