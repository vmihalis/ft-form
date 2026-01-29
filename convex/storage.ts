import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a signed upload URL for file upload
 * Client POSTs file to this URL, receives storageId in response
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Delete a file from storage
 * Used when user removes file before submission or for cleanup
 */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});

/**
 * Get serving URL for a stored file
 * Returns null if file doesn't exist
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get file metadata from system table
 * Returns contentType, size, sha256, or null if not found
 */
export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const file = await ctx.db.system.get(args.storageId);
    if (!file) return null;

    return {
      contentType: file.contentType,
      size: file.size,
      sha256: file.sha256,
    };
  },
});
