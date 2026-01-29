# Phase 12: File Upload Infrastructure - Research

**Researched:** 2026-01-29
**Domain:** Convex file storage, React file upload UX
**Confidence:** HIGH

## Summary

This phase implements file upload functionality for dynamic forms using Convex's built-in file storage system. The research covers the three-step upload pattern (generateUploadUrl -> POST -> save storageId), React upload components with drag-and-drop UX, and the integration with the existing form schema infrastructure.

The key architectural decision is **immediate persistence** - files are uploaded to Convex storage as soon as the user selects them (before form submission). This avoids URL expiration issues and matches modern UX expectations. The uploaded file's storage ID (`Id<"_storage">`) is stored in the submission data JSON.

**Primary recommendation:** Use Convex's native `generateUploadUrl` mutation pattern with `react-dropzone` for drag-and-drop UX, storing `Id<"_storage">` references in submission data. Implement a cron job for orphaned file cleanup.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| convex | 1.31.6 (current) | File storage backend | Already in project, native storage API |
| react-dropzone | ^14.2 | Drag-and-drop file selection | De facto React standard, 10k+ GitHub stars, shadcn ecosystem |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.3.6 (current) | File validation schemas | Validate file type, size on client |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-dropzone | Native HTML input | Loses drag-drop UX, accessibility features |
| Convex storage | Cloudflare R2 (@convex-dev/r2) | More complex setup, useful for very large files or CDN needs |
| Convex storage | UploadThing | External service, additional cost, not needed for basic uploads |

**Installation:**
```bash
npm install react-dropzone
```

## Architecture Patterns

### Convex File Upload Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ User selects │ ──> │ Call         │ ──> │ POST file to │ ──> │ Save storage │
│ file         │     │ generateUrl  │     │ upload URL   │     │ ID to data   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                           │                     │                     │
                           v                     v                     v
                     Mutation returns      Returns JSON         Mutation stores
                     signed URL            { storageId }        Id<"_storage">
```

### Recommended Project Structure
```
convex/
├── storage.ts           # generateUploadUrl, deleteFile mutations
├── files.ts             # File metadata queries, orphan cleanup
└── crons.ts             # Orphaned file cleanup cron

src/
├── components/
│   └── form/
│       └── fields/
│           └── FileField.tsx   # File upload field component
└── hooks/
    └── useFileUpload.ts        # Upload logic hook
```

### Pattern 1: Generate Upload URL Mutation

**What:** Server-side mutation that generates a signed upload URL
**When to use:** Before any file upload
**Example:**
```typescript
// convex/storage.ts
// Source: https://docs.convex.dev/file-storage/upload-files
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
```

### Pattern 2: Client Upload with Storage ID Capture

**What:** POST file to signed URL, receive storage ID
**When to use:** After user selects file, before form submission
**Example:**
```typescript
// Source: https://docs.convex.dev/file-storage/upload-files
async function uploadFile(file: File): Promise<Id<"_storage">> {
  // Step 1: Get upload URL
  const postUrl = await generateUploadUrl();

  // Step 2: POST file to Convex storage
  const result = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  // Step 3: Extract storage ID
  const { storageId } = await result.json();
  return storageId as Id<"_storage">;
}
```

### Pattern 3: Serving Files via Query

**What:** Generate serving URL from storage ID
**When to use:** Displaying uploaded files in UI
**Example:**
```typescript
// convex/storage.ts
// Source: https://docs.convex.dev/file-storage/serve-files
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

### Pattern 4: File Metadata Access

**What:** Access file size, contentType, checksum from system table
**When to use:** Validating files server-side, displaying file info
**Example:**
```typescript
// convex/files.ts
// Source: https://docs.convex.dev/file-storage/file-metadata
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Access _storage system table
    return await ctx.db.system.get(args.storageId);
  },
});

// Returns:
// {
//   _id: Id<"_storage">,
//   _creationTime: number,
//   contentType: string | null,
//   sha256: string,
//   size: number  // bytes
// }
```

### Pattern 5: Delete Files

**What:** Remove files from storage
**When to use:** User removes file before submission, orphan cleanup
**Example:**
```typescript
// convex/storage.ts
// Source: https://docs.convex.dev/file-storage/delete-files
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
```

### Anti-Patterns to Avoid
- **Uploading on form submit:** Files should upload immediately when selected. Waiting until form submit risks URL expiration (1 hour) and poor UX.
- **Storing file bytes in database:** Use `Id<"_storage">` references, not base64 or blob data. Convex documents have 1MB size limit.
- **Trusting Content-Type header:** The Content-Type is user-provided and can be spoofed. Use allowlist and consider server-side validation.
- **Using deprecated getMetadata:** Use `ctx.db.system.get(storageId)` instead of the deprecated `ctx.storage.getMetadata()`.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop file selection | Custom drag event handlers | react-dropzone | Accessibility, browser compat, file rejection |
| Upload progress tracking | Custom XHR wrapper | XMLHttpRequest with onprogress | fetch() doesn't support upload progress |
| File type validation | Manual MIME checking | react-dropzone accept prop + server validation | Edge cases, security |
| Signed upload URLs | Custom token system | Convex generateUploadUrl | Built-in, secure, 1-hour expiry |

**Key insight:** File upload has many edge cases (browser differences, large files, network failures). Use established patterns.

## Common Pitfalls

### Pitfall 1: URL Expiration
**What goes wrong:** Upload URL expires (1 hour) before user submits form
**Why it happens:** Generating URL too early, long form sessions
**How to avoid:** Generate URL immediately before upload, not on form load. Implement immediate persistence pattern.
**Warning signs:** "Upload failed" errors after long form sessions

### Pitfall 2: Orphaned Files
**What goes wrong:** Files uploaded but form never submitted, storage fills with unused files
**Why it happens:** User abandons form, browser crash, validation failure
**How to avoid:** Implement cron job to clean up orphaned files. Track file association with submissions.
**Warning signs:** Storage usage growing faster than submission count

### Pitfall 3: Missing Content-Type
**What goes wrong:** Files served without proper Content-Type, browser renders incorrectly
**Why it happens:** Not setting Content-Type header on upload POST
**How to avoid:** Always include `headers: { "Content-Type": file.type }` in upload request
**Warning signs:** Images not displaying, PDFs downloading instead of opening

### Pitfall 4: File Size Validation Only on Client
**What goes wrong:** Malicious users bypass client validation, upload huge files
**Why it happens:** Relying only on react-dropzone maxSize
**How to avoid:** Validate file size server-side using `ctx.db.system.get(storageId).size`
**Warning signs:** Unexpected large files in storage

### Pitfall 5: No Upload Progress for Large Files
**What goes wrong:** Users think app is frozen during large file upload
**Why it happens:** Using fetch() which doesn't support upload progress
**How to avoid:** For 50MB files, use XMLHttpRequest with upload.onprogress event
**Warning signs:** User complaints about "frozen" uploads

## Code Examples

Verified patterns from official sources:

### Complete File Upload Hook
```typescript
// src/hooks/useFileUpload.ts
import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface UploadState {
  isUploading: boolean;
  progress: number;  // 0-100
  error: string | null;
}

export function useFileUpload() {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadFile = useCallback(async (file: File): Promise<Id<"_storage"> | null> => {
    setState({ isUploading: true, progress: 0, error: null });

    try {
      // Step 1: Get signed URL
      const postUrl = await generateUploadUrl();

      // Step 2: Upload with progress tracking (XMLHttpRequest for progress)
      const storageId = await new Promise<Id<"_storage">>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setState(s => ({ ...s, progress }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const { storageId } = JSON.parse(xhr.responseText);
            resolve(storageId as Id<"_storage">);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));

        xhr.open("POST", postUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setState({ isUploading: false, progress: 100, error: null });
      return storageId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setState({ isUploading: false, progress: 0, error: message });
      return null;
    }
  }, [generateUploadUrl]);

  return { ...state, uploadFile };
}
```

### React Dropzone Integration with shadcn/ui
```typescript
// src/components/form/fields/FileField.tsx
import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useFileUpload } from "@/hooks/useFileUpload";
import { cn } from "@/lib/utils";
import { Upload, X, File as FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileFieldProps {
  value: Id<"_storage"> | null;
  onChange: (storageId: Id<"_storage"> | null) => void;
  accept?: Record<string, string[]>;  // e.g., { "image/*": [], "application/pdf": [] }
  maxSize?: number;  // bytes, default 50MB
  label?: string;
  description?: string;
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function FileField({
  value,
  onChange,
  accept = { "image/*": [], "application/pdf": [] },
  maxSize = DEFAULT_MAX_SIZE,
  label,
  description,
}: FileFieldProps) {
  const { isUploading, progress, error, uploadFile } = useFileUpload();
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Get file URL for preview if we have a value
  const fileUrl = useQuery(
    api.storage.getFileUrl,
    value ? { storageId: value } : "skip"
  );

  const onDrop = useCallback(async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    setRejectionError(null);

    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === "file-too-large") {
        setRejectionError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      } else if (error.code === "file-invalid-type") {
        setRejectionError("Invalid file type");
      } else {
        setRejectionError(error.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const storageId = await uploadFile(acceptedFiles[0]);
      if (storageId) {
        onChange(storageId);
      }
    }
  }, [uploadFile, onChange, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleRemove = () => {
    onChange(null);
    setRejectionError(null);
  };

  // Show uploaded file
  if (value && fileUrl) {
    return (
      <div className="space-y-2">
        {label && <p className="text-sm font-medium">{label}</p>}
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline truncate block"
            >
              View uploaded file
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Show dropzone
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          isUploading && "cursor-not-allowed opacity-50",
          (error || rejectionError) && "border-destructive",
          !isDragActive && !error && !rejectionError && "hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm">
              {isDragActive
                ? "Drop file here..."
                : "Drag and drop or click to select"}
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSize / 1024 / 1024}MB
            </p>
          </div>
        )}
      </div>

      {(error || rejectionError) && (
        <p className="text-sm text-destructive">{error || rejectionError}</p>
      )}
    </div>
  );
}
```

### Orphaned File Cleanup Cron
```typescript
// convex/crons.ts
// Source: https://docs.convex.dev/scheduling/cron-jobs
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up orphaned files daily at 3 AM UTC
crons.daily(
  "cleanup orphaned files",
  { hourUTC: 3, minuteUTC: 0 },
  internal.files.cleanupOrphanedFiles,
);

export default crons;
```

```typescript
// convex/files.ts
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Clean up files not associated with any submission
 * Files older than 24 hours without a submission reference are deleted
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
```

### File Field Schema Extension
```typescript
// src/types/form-schema.ts - Extension for file fields
export interface FileFieldValidation extends FieldValidation {
  maxSizeBytes?: number;        // Default: 50MB
  allowedTypes?: string[];      // MIME types, e.g., ["image/*", "application/pdf"]
}

export interface FileField extends FormField {
  type: "file";
  validation?: FileFieldValidation;
}

// Submission data stores storage ID as string
// { "field_123": "storage_id_abc" }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Base64 in database | Storage IDs | Convex launch | No document size limits for files |
| storage.getMetadata() | ctx.db.system.get() | 2024 | Deprecated method, use system table |
| fetch() for uploads | XMLHttpRequest | N/A | Progress tracking requires XHR |

**Deprecated/outdated:**
- `storage.getMetadata()`: Use `ctx.db.system.get(storageId)` instead
- Storing file bytes in documents: Use `Id<"_storage">` references

## Open Questions

Things that couldn't be fully resolved:

1. **Upload progress with fetch()**
   - What we know: fetch() doesn't support upload progress, XHR does
   - What's unclear: If Convex plans to add progress support
   - Recommendation: Use XMLHttpRequest for large file progress

2. **Multi-file upload per field**
   - What we know: Single file per field is simpler
   - What's unclear: User requirements for multiple files
   - Recommendation: Start with single file, extend if needed

3. **File previews for non-images**
   - What we know: Images can use `<img src={fileUrl}>`, PDFs can open in new tab
   - What's unclear: Best UX for arbitrary file types
   - Recommendation: Show file icon + "View file" link for non-images

## Sources

### Primary (HIGH confidence)
- [Convex File Storage - Upload Files](https://docs.convex.dev/file-storage/upload-files) - generateUploadUrl pattern, POST format
- [Convex File Storage - Serve Files](https://docs.convex.dev/file-storage/serve-files) - getUrl, serving patterns
- [Convex File Storage - File Metadata](https://docs.convex.dev/file-storage/file-metadata) - system table access
- [Convex File Storage - Delete Files](https://docs.convex.dev/file-storage/delete-files) - cleanup patterns
- [Convex Cron Jobs](https://docs.convex.dev/scheduling/cron-jobs) - scheduled cleanup
- [Convex Limits](https://docs.convex.dev/production/state/limits) - storage and bandwidth limits

### Secondary (MEDIUM confidence)
- [react-dropzone](https://react-dropzone.js.org/) - Official documentation
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) - Security best practices
- [shadcn-dropzone](https://github.com/diragb/shadcn-dropzone) - shadcn/ui integration example

### Tertiary (LOW confidence)
- Community discussions on upload progress tracking
- WebSearch results for file upload UX patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Convex docs are authoritative, react-dropzone is established
- Architecture: HIGH - Official Convex patterns documented
- Pitfalls: MEDIUM - Based on general file upload knowledge + Convex specifics
- Code examples: HIGH - Based on official documentation

**Research date:** 2026-01-29
**Valid until:** 60 days (stable patterns, Convex storage API is mature)
