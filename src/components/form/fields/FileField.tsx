"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useFileUpload } from "@/hooks/useFileUpload";
import { cn } from "@/lib/utils";
import { Upload, X, FileIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileFieldProps {
  value: Id<"_storage"> | null;
  onChange: (storageId: Id<"_storage"> | null) => void;
  accept?: Record<string, string[]>; // e.g., { "image/*": [], "application/pdf": [] }
  maxSize?: number; // bytes, default 50MB
  label?: string;
  description?: string;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const DEFAULT_ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "application/pdf": [".pdf"],
};

export function FileField({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  label,
  description,
  disabled = false,
}: FileFieldProps) {
  const {
    isUploading,
    progress,
    error: uploadError,
    uploadFile,
    reset,
  } = useFileUpload();
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Get file URL for preview if we have a value
  const fileUrl = useQuery(
    api.storage.getFileUrl,
    value ? { storageId: value } : "skip"
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setRejectionError(null);
      reset();

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const error = rejection.errors[0];

        if (error.code === "file-too-large") {
          const maxMB = Math.round(maxSize / 1024 / 1024);
          setRejectionError(`File too large. Maximum size is ${maxMB}MB`);
        } else if (error.code === "file-invalid-type") {
          setRejectionError("Invalid file type. Please upload an image or PDF.");
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
    },
    [uploadFile, onChange, maxSize, reset]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  const handleRemove = useCallback(() => {
    onChange(null);
    setRejectionError(null);
    reset();
  }, [onChange, reset]);

  const displayError = uploadError || rejectionError;

  // Show uploaded file with preview/link
  if (value && fileUrl) {
    return (
      <div className="space-y-2">
        {label && (
          <p className="text-sm font-medium text-foreground">{label}</p>
        )}
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
          <FileIcon className="h-8 w-8 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline truncate block"
            >
              View uploaded file
            </a>
            <p className="text-xs text-muted-foreground">
              Click to open in new tab
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove file"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Show uploading state
  if (isUploading) {
    return (
      <div className="space-y-2">
        {label && (
          <p className="text-sm font-medium text-foreground">{label}</p>
        )}
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/20">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground mt-2">
            Uploading... {progress}%
          </p>
          <div className="w-full bg-muted rounded-full h-2 mt-3 max-w-xs mx-auto">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show dropzone
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          displayError && "border-destructive bg-destructive/5",
          disabled && "cursor-not-allowed opacity-50",
          !isDragActive &&
            !displayError &&
            !disabled &&
            "hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <input {...getInputProps()} />

        <Upload
          className={cn(
            "h-8 w-8 mx-auto",
            displayError ? "text-destructive" : "text-muted-foreground"
          )}
        />

        <p className="text-sm mt-2">
          {isDragActive
            ? "Drop file here..."
            : "Drag and drop or click to select"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Images or PDF, max {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
