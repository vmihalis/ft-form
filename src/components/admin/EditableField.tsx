"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface EditableFieldProps {
  applicationId: Id<"applications">;
  field: string;
  label: string;
  value: string | undefined;
  type: "text" | "textarea" | "select" | "date" | "email" | "url";
  options?: { value: string; label: string }[];
  required?: boolean;
  maxLength?: number;
  /** Display transformer for value (e.g., getFloorLabel) */
  displayValue?: string;
}

/**
 * Get a Zod validator for the field based on type and constraints
 */
function getFieldValidator(
  type: string,
  required: boolean,
  maxLength?: number
): z.ZodSchema {
  // URL fields are optional by nature (LinkedIn)
  if (type === "url") {
    return z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal(""));
  }

  // Email validation
  if (type === "email") {
    let schema = z.string().email("Please enter a valid email");
    if (required) {
      schema = schema.min(1, "This field is required");
    }
    return schema;
  }

  // Standard string validation
  let schema = z.string();

  if (required) {
    schema = schema.min(1, "This field is required");
  }

  if (maxLength) {
    schema = schema.max(maxLength, `Maximum ${maxLength} characters`);
  }

  return schema;
}

export function EditableField({
  applicationId,
  field,
  label,
  value,
  type,
  options,
  required = true,
  maxLength,
  displayValue,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const updateField = useMutation(api.applications.updateField);

  // Sync external value to edit value ONLY when not editing
  // This prevents Convex reactive updates from clobbering user input
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value ?? "");
    }
  }, [value, isEditing]);

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      if (type === "textarea" && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    // Don't save if already saving
    if (isSaving) return;

    // Validate
    const validator = getFieldValidator(type, required, maxLength);
    const result = validator.safeParse(editValue);

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid value");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await updateField({
        id: applicationId,
        field,
        newValue: editValue,
      });
      setIsEditing(false);
    } catch (e) {
      setError("Failed to save. Please try again.");
      console.error("Failed to update field:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value ?? "");
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    } else if (e.key === "Enter") {
      // For textarea, only save on Ctrl/Cmd+Enter
      if (type === "textarea") {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleSave();
        }
        // Otherwise let Enter add newline
      } else {
        // For other types, Enter saves
        e.preventDefault();
        handleSave();
      }
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the new focus target is within our container
    // This prevents saving when clicking between elements within the field
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    // Use small timeout to allow click events to fire first
    // This handles the race condition where blur fires before click
    setTimeout(() => {
      if (isEditing && !isSaving) {
        handleSave();
      }
    }, 100);
  };

  const handleSelectChange = async (newValue: string) => {
    setEditValue(newValue);
    setError(null);
    setIsSaving(true);

    try {
      await updateField({
        id: applicationId,
        field,
        newValue,
      });
      setIsEditing(false);
    } catch (e) {
      setError("Failed to save. Please try again.");
      console.error("Failed to update field:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // What to display when not editing
  const displayText = displayValue ?? value;

  // Edit mode rendering
  if (isEditing) {
    return (
      <div ref={containerRef} className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        {type === "textarea" ? (
          <Textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-invalid={!!error}
            disabled={isSaving}
            rows={3}
            className={cn(
              "resize-none ring-2 ring-ring",
              error && "border-destructive ring-destructive/50"
            )}
          />
        ) : type === "select" && options ? (
          <Select
            value={editValue}
            onValueChange={handleSelectChange}
            disabled={isSaving}
          >
            <SelectTrigger
              className={cn(
                "w-full ring-2 ring-ring",
                error && "border-destructive ring-destructive/50"
              )}
            >
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            ref={inputRef}
            type={type === "date" ? "date" : type === "email" ? "email" : type === "url" ? "url" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-invalid={!!error}
            disabled={isSaving}
            maxLength={maxLength}
            className={cn(
              "ring-2 ring-ring",
              error && "border-destructive ring-destructive/50"
            )}
          />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {type === "textarea" && (
          <p className="text-xs text-muted-foreground">
            Press Ctrl+Enter to save, Escape to cancel
          </p>
        )}
      </div>
    );
  }

  // Display mode rendering
  return (
    <div
      ref={containerRef}
      className="group space-y-1 cursor-pointer rounded-md p-2 -m-2 transition-colors hover:bg-muted/50"
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2">
        <p className="text-sm whitespace-pre-wrap break-words flex-1">
          {displayText || (
            <span className="italic text-muted-foreground">Not set</span>
          )}
        </p>
        <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      </div>
    </div>
  );
}
