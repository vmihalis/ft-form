---
phase: 12-file-upload-infrastructure
plan: 01
subsystem: storage
tags: [convex, file-upload, storage-api, cron, cleanup]

# Dependency graph
requires:
  - phase: 11-schema-foundation
    provides: submissions table for orphan cleanup reference
provides:
  - generateUploadUrl mutation for file uploads
  - deleteFile mutation for storage cleanup
  - getFileUrl query for serving files
  - getFileMetadata query for file info
  - cleanupOrphanedFiles internal mutation
  - Daily cron job for orphan cleanup at 3 AM UTC
affects: [12-02, file-upload-frontend, dynamic-forms]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Convex storage API pattern (generateUploadUrl -> POST -> storageId)
    - System table access via ctx.db.system.get()
    - Internal mutations for cron jobs
    - Cron scheduling with cronJobs()

key-files:
  created:
    - convex/storage.ts
    - convex/files.ts
    - convex/crons.ts
  modified: []

key-decisions:
  - "Internal mutation for cleanup (not exposed publicly)"
  - "24-hour grace period before orphan deletion"
  - "3 AM UTC cleanup time (low traffic)"

patterns-established:
  - "Storage ID references: Store Id<'_storage'> in submission data JSON"
  - "Orphan detection: Compare storage files against submission data values"
  - "Cron job pattern: cronJobs() + internal mutation"

# Metrics
duration: 2min
completed: 2026-01-29
---

# Phase 12 Plan 01: File Upload Backend Summary

**Convex storage mutations/queries (generateUploadUrl, deleteFile, getFileUrl, getFileMetadata) and daily orphan cleanup cron job**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-29T01:15:42Z
- **Completed:** 2026-01-29T01:17:28Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- Complete file storage lifecycle API (upload URL generation, deletion, URL retrieval, metadata)
- Orphan file cleanup automation via daily cron job
- System table access pattern for file metadata

## Task Commits

Each task was committed atomically:

1. **Task 1: Create storage mutations and queries** - `0639e0f` (feat)
2. **Task 2: Create orphan cleanup cron job** - `fe70b57` (feat)

## Files Created/Modified
- `convex/storage.ts` - generateUploadUrl, deleteFile, getFileUrl, getFileMetadata exports
- `convex/files.ts` - cleanupOrphanedFiles internal mutation
- `convex/crons.ts` - Daily cron job scheduling at 3 AM UTC

## Decisions Made
None - followed plan as specified

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required

## Next Phase Readiness
- Backend storage infrastructure complete
- Frontend can now implement file upload hook using generateUploadUrl
- Ready for Plan 02: Frontend file upload component and hook

---
*Phase: 12-file-upload-infrastructure*
*Completed: 2026-01-29*
