import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit a new floor lead application
 *
 * All fields match the schema in convex/schema.ts
 * Optional fields use v.optional() wrapper
 */
export const submit = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const applicationId = await ctx.db.insert("applications", {
      ...args,
      status: "new",
      submittedAt: Date.now(),
    });

    return applicationId;
  },
});

/**
 * List all applications for admin dashboard
 *
 * Returns all applications ordered by submission date (newest first)
 * Uses the by_submitted index for efficient ordering
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_submitted")
      .order("desc")
      .collect();
  },
});

/**
 * Update application status
 *
 * Used by admin dashboard to change application status
 */
export const updateStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.union(
      v.literal("new"),
      v.literal("under_review"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

/**
 * Update a single field on an application and record edit history
 *
 * Atomically:
 * 1. Gets current value
 * 2. Patches the application
 * 3. Inserts history record
 *
 * Returns { changed: false } if value unchanged (no history created)
 */
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

    // Get old value, handling undefined for optional fields
    const oldValue = String(
      (application as Record<string, unknown>)[args.field] ?? ""
    );

    // Skip if no actual change
    if (oldValue === args.newValue) {
      return { changed: false };
    }

    // Atomic: update field and insert history
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

/**
 * Get edit history for an application
 *
 * Returns all edit records ordered by most recent first
 */
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
