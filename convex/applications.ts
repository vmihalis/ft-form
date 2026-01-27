import { mutation } from "./_generated/server";
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
    floorOther: v.optional(v.string()),
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
