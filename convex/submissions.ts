import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit a form response
 * Links to formVersionId (immutable), not formId
 */
export const submit = mutation({
  args: {
    formVersionId: v.id("formVersions"),
    data: v.string(), // JSON.stringify({ [fieldId]: value })
  },
  handler: async (ctx, args) => {
    // Verify version exists
    const version = await ctx.db.get(args.formVersionId);
    if (!version) throw new Error("Form version not found");

    // Verify form is still accepting submissions (not archived)
    const form = await ctx.db.get(version.formId);
    if (!form) throw new Error("Form not found");
    if (form.status === "archived") {
      throw new Error("This form is no longer accepting submissions");
    }

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

/**
 * Get submission with its schema (for display)
 */
export const getWithSchema = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) return null;

    const version = await ctx.db.get(submission.formVersionId);
    if (!version) return null;

    const form = await ctx.db.get(version.formId);

    return {
      submission: {
        ...submission,
        data: JSON.parse(submission.data),
      },
      schema: JSON.parse(version.schema),
      formName: form?.name ?? "Unknown Form",
      formSlug: form?.slug,
      version: version.version,
    };
  },
});

/**
 * List submissions (for admin dashboard)
 * Optionally filter by formId
 */
export const list = query({
  args: {
    formId: v.optional(v.id("forms")),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("under_review"),
        v.literal("accepted"),
        v.literal("rejected")
      )
    ),
  },
  handler: async (ctx, args) => {
    let submissions;

    if (args.status) {
      submissions = await ctx.db
        .query("submissions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      submissions = await ctx.db
        .query("submissions")
        .order("desc")
        .collect();
    }

    // If filtering by formId, we need to check each submission's version
    if (args.formId) {
      const versionIds = new Set<string>();
      const versions = await ctx.db
        .query("formVersions")
        .withIndex("by_form", (q) => q.eq("formId", args.formId!))
        .collect();

      versions.forEach((v) => versionIds.add(v._id));
      submissions = submissions.filter((s) => versionIds.has(s.formVersionId));
    }

    // Enrich with form name for list display
    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const version = await ctx.db.get(submission.formVersionId);
        const form = version ? await ctx.db.get(version.formId) : null;

        return {
          _id: submission._id,
          formVersionId: submission.formVersionId,
          status: submission.status,
          submittedAt: submission.submittedAt,
          formName: form?.name ?? "Unknown Form",
          formSlug: form?.slug,
          version: version?.version,
          // Don't include full data in list for performance
        };
      })
    );

    return enriched;
  },
});

/**
 * Update submission status
 */
export const updateStatus = mutation({
  args: {
    submissionId: v.id("submissions"),
    status: v.union(
      v.literal("new"),
      v.literal("under_review"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");

    await ctx.db.patch(args.submissionId, {
      status: args.status,
    });

    return args.submissionId;
  },
});

/**
 * Update a field in submission data (for admin editing)
 * Creates edit history entry
 */
export const updateField = mutation({
  args: {
    submissionId: v.id("submissions"),
    fieldId: v.string(),
    fieldLabel: v.string(),
    newValue: v.string(),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");

    const data = JSON.parse(submission.data) as Record<string, unknown>;
    const oldValue = String(data[args.fieldId] ?? "");

    // Skip if value unchanged
    if (oldValue === args.newValue) {
      return args.submissionId;
    }

    // Update the data
    data[args.fieldId] = args.newValue;
    await ctx.db.patch(args.submissionId, {
      data: JSON.stringify(data),
    });

    // Create edit history entry
    await ctx.db.insert("submissionEditHistory", {
      submissionId: args.submissionId,
      fieldId: args.fieldId,
      fieldLabel: args.fieldLabel,
      oldValue,
      newValue: args.newValue,
      editedAt: Date.now(),
    });

    return args.submissionId;
  },
});

/**
 * Get edit history for a submission
 */
export const getEditHistory = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissionEditHistory")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .order("desc")
      .collect();
  },
});

/**
 * Get submission stats (counts by status)
 * For admin dashboard stats cards
 */
export const getStats = query({
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();

    const stats = {
      total: submissions.length,
      new: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
    };

    for (const sub of submissions) {
      stats[sub.status]++;
    }

    return stats;
  },
});

/**
 * Get recent submission activity for dashboard feed
 * Returns enriched submissions with form name and extracted submitter name
 */
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_submitted")
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const version = await ctx.db.get(sub.formVersionId);
        const form = version ? await ctx.db.get(version.formId) : null;

        // Extract submitter name from data
        const data = JSON.parse(sub.data) as Record<string, unknown>;
        let submitterName = "Anonymous";

        // Look for common name fields
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === "string" && value.trim()) {
            if (
              key.toLowerCase().includes("name") &&
              !key.toLowerCase().includes("email")
            ) {
              submitterName = value;
              break;
            }
          }
        }

        return {
          _id: sub._id,
          formName: form?.name ?? "Unknown Form",
          submitterName,
          status: sub.status,
          submittedAt: sub.submittedAt,
        };
      })
    );

    return enriched;
  },
});

/**
 * List submissions with full data and schema for CSV export
 * Returns all data needed to generate human-readable CSV
 */
export const listForExport = query({
  args: {
    submissionIds: v.array(v.id("submissions")),
  },
  handler: async (ctx, args) => {
    if (args.submissionIds.length === 0) {
      return { submissions: [], schema: null, formName: "submissions" };
    }

    // Fetch all submissions
    const submissions = await Promise.all(
      args.submissionIds.map((id) => ctx.db.get(id))
    );

    // Filter out any nulls (shouldn't happen but defensive)
    const validSubmissions = submissions.filter(
      (s): s is NonNullable<typeof s> => s !== null
    );

    if (validSubmissions.length === 0) {
      return { submissions: [], schema: null, formName: "submissions" };
    }

    // Get schema from first submission's version
    // All filtered submissions should be from same form due to form filter
    const firstVersion = await ctx.db.get(validSubmissions[0].formVersionId);
    const form = firstVersion ? await ctx.db.get(firstVersion.formId) : null;

    return {
      submissions: validSubmissions.map((s) => ({
        _id: s._id,
        status: s.status,
        submittedAt: s.submittedAt,
        data: JSON.parse(s.data) as Record<string, unknown>,
      })),
      schema: firstVersion ? JSON.parse(firstVersion.schema) : null,
      formName: form?.name ?? "submissions",
    };
  },
});
