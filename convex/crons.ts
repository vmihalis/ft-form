import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up orphaned files daily at 3 AM UTC
// Files not associated with any submission and older than 24 hours are deleted
crons.daily(
  "cleanup orphaned files",
  { hourUTC: 3, minuteUTC: 0 },
  internal.files.cleanupOrphanedFiles
);

export default crons;
