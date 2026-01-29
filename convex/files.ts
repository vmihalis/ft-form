import { internalMutation } from "./_generated/server";

/**
 * Clean up files not associated with any submission
 * Files older than 24 hours without a submission reference are deleted
 * Called daily by cron job at 3 AM UTC
 */
export const cleanupOrphanedFiles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Get all storage files
    const allFiles = await ctx.db.system.query("_storage").collect();

    // Get all submissions and extract storage IDs from data
    const submissions = await ctx.db.query("submissions").collect();
    const usedStorageIds = new Set<string>();

    for (const submission of submissions) {
      const data = JSON.parse(submission.data);
      // Check each field value for storage IDs
      for (const value of Object.values(data)) {
        if (typeof value === "string" && value.length > 0) {
          usedStorageIds.add(value);
        }
      }
    }

    // Delete orphaned files older than 24 hours
    let deletedCount = 0;
    for (const file of allFiles) {
      if (!usedStorageIds.has(file._id) && file._creationTime < oneDayAgo) {
        await ctx.storage.delete(file._id);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} orphaned files`);
  },
});
