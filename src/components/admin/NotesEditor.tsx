"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface NotesEditorProps {
  submissionId: Id<"submissions">;
  initialNotes?: string;
}

/**
 * NotesEditor - Component for viewing and editing submission internal notes
 *
 * Features:
 * - Save on blur (following project pattern)
 * - Escape to cancel changes
 * - Ctrl+Enter to save explicitly
 * - Visual feedback during save
 */
export function NotesEditor({ submissionId, initialNotes }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const updateNotes = useMutation(api.submissions.updateNotes);

  // Sync external value when not focused (for real-time updates)
  useEffect(() => {
    setNotes(initialNotes ?? "");
  }, [initialNotes]);

  const handleSave = async () => {
    // No change - skip save
    if (notes === (initialNotes ?? "")) {
      return;
    }

    setIsSaving(true);
    try {
      await updateNotes({ submissionId, notes });
      setLastSaved(notes);
      // Clear success indicator after 2s
      setTimeout(() => setLastSaved(null), 2000);
    } catch (error) {
      console.error("Failed to save notes:", error);
      // Revert on error
      setNotes(initialNotes ?? "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setNotes(initialNotes ?? "");
      e.currentTarget.blur();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
      e.currentTarget.blur();
    }
  };

  const hasUnsavedChanges = notes !== (initialNotes ?? "");
  const showSavedIndicator = lastSaved !== null && !hasUnsavedChanges;

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Add notes about this submission..."
        disabled={isSaving}
        rows={4}
        className={cn(
          "resize-none transition-opacity",
          isSaving && "opacity-60"
        )}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Notes are only visible to admins. Press Ctrl+Enter to save.
        </p>
        {showSavedIndicator && (
          <span className="text-xs text-green-600">Saved</span>
        )}
        {hasUnsavedChanges && !isSaving && (
          <span className="text-xs text-amber-600">Unsaved changes</span>
        )}
        {isSaving && (
          <span className="text-xs text-muted-foreground">Saving...</span>
        )}
      </div>
    </div>
  );
}
