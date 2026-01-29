"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface UploadState {
  isUploading: boolean;
  progress: number; // 0-100
  error: string | null;
}

export function useFileUpload() {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadFile = useCallback(
    async (file: File): Promise<Id<"_storage"> | null> => {
      setState({ isUploading: true, progress: 0, error: null });

      try {
        // Step 1: Get signed upload URL from Convex
        const postUrl = await generateUploadUrl();

        // Step 2: Upload with XMLHttpRequest for progress tracking
        // (fetch doesn't support upload progress)
        const storageId = await new Promise<Id<"_storage">>(
          (resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setState((s) => ({ ...s, progress }));
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status === 200) {
                const { storageId } = JSON.parse(xhr.responseText);
                resolve(storageId as Id<"_storage">);
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            });

            xhr.addEventListener("error", () =>
              reject(new Error("Network error during upload"))
            );
            xhr.addEventListener("abort", () =>
              reject(new Error("Upload cancelled"))
            );

            xhr.open("POST", postUrl);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
          }
        );

        setState({ isUploading: false, progress: 100, error: null });
        return storageId;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        setState({ isUploading: false, progress: 0, error: message });
        return null;
      }
    },
    [generateUploadUrl]
  );

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return { ...state, uploadFile, reset };
}
