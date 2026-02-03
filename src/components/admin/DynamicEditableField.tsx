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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { FormField, FieldOption } from "@/types/form-schema";

interface DynamicEditableFieldProps {
  submissionId: Id<"submissions">;
  field: FormField;
  value: unknown;
}

/**
 * Map field type to edit input type
 */
function getEditType(
  fieldType: string
): "text" | "textarea" | "select" | "date" | "email" | "url" | "number" | "checkbox" | "file" {
  switch (fieldType) {
    case "textarea":
      return "textarea";
    case "select":
    case "radio":
      return "select";
    case "date":
      return "date";
    case "email":
      return "email";
    case "url":
      return "url";
    case "number":
      return "number";
    case "checkbox":
      return "checkbox";
    case "file":
      return "file";
    default:
      return "text";
  }
}

/**
 * Get display value for field
 * - Select/radio: Look up option label
 * - Checkbox: "Yes" or "No"
 * - File: "File uploaded" or empty
 */
function getDisplayValue(
  value: unknown,
  fieldType: string,
  options?: FieldOption[]
): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (fieldType === "select" || fieldType === "radio") {
    if (options) {
      const option = options.find((opt) => opt.value === String(value));
      return option?.label ?? String(value);
    }
    return String(value);
  }

  if (fieldType === "checkbox") {
    // Checkbox with options = multi-select, value is array
    if (options && Array.isArray(value)) {
      if (value.length === 0) return "";
      return value
        .map((v) => {
          const option = options.find((opt) => opt.value === String(v));
          return option?.label ?? String(v);
        })
        .join(", ");
    }
    // Simple boolean checkbox
    return value === true || value === "true" ? "Yes" : "No";
  }

  if (fieldType === "file") {
    return value ? "File uploaded" : "";
  }

  return String(value);
}

/**
 * DynamicEditableField - Schema-driven editable field component
 *
 * Adapts EditableField pattern for dynamic form schemas:
 * - Uses api.submissions.updateField with fieldLabel for edit history
 * - Maps field types to appropriate edit controls
 * - Select/radio fields show option labels, not raw values
 * - File fields are read-only
 */
export function DynamicEditableField({
  submissionId,
  field,
  value,
}: DynamicEditableFieldProps) {
  const editType = getEditType(field.type);
  const displayValue = getDisplayValue(value, field.type, field.options);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const updateField = useMutation(api.submissions.updateField);

  // File fields are read-only
  const isReadOnly = editType === "file" || editType === "checkbox";

  // Sync external value to edit value ONLY when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(value ?? ""));
    }
  }, [value, isEditing]);

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      if (editType === "textarea" && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, editType]);

  const handleSave = async () => {
    if (isSaving) return;

    // Basic validation for required fields
    if (field.required && !editValue.trim()) {
      setError("This field is required");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await updateField({
        submissionId,
        fieldId: field.id,
        fieldLabel: field.label,
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
    setEditValue(String(value ?? ""));
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    } else if (e.key === "Enter") {
      // For textarea, only save on Ctrl/Cmd+Enter
      if (editType === "textarea") {
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
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    // Use small timeout to allow click events to fire first
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
        submissionId,
        fieldId: field.id,
        fieldLabel: field.label,
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

  // Edit mode rendering
  if (isEditing && !isReadOnly) {
    return (
      <div ref={containerRef} className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{field.label}</p>

        {editType === "textarea" ? (
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
        ) : editType === "select" && field.options ? (
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
              {field.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            ref={inputRef}
            type={
              editType === "date"
                ? "date"
                : editType === "email"
                  ? "email"
                  : editType === "url"
                    ? "url"
                    : editType === "number"
                      ? "number"
                      : "text"
            }
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-invalid={!!error}
            disabled={isSaving}
            className={cn(
              "ring-2 ring-ring",
              error && "border-destructive ring-destructive/50"
            )}
          />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {editType === "textarea" && (
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
      className={cn(
        "group space-y-1 rounded-md p-2 -m-2 transition-colors",
        !isReadOnly && "cursor-pointer hover:bg-muted/50"
      )}
      onClick={() => !isReadOnly && setIsEditing(true)}
      role={isReadOnly ? undefined : "button"}
      tabIndex={isReadOnly ? undefined : 0}
      onKeyDown={(e) => {
        if (!isReadOnly && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
    >
      <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
      <div className="flex items-start gap-2">
        <p className="text-sm whitespace-pre-wrap break-words flex-1">
          {displayValue || (
            <span className="italic text-muted-foreground">Not provided</span>
          )}
          {editType === "checkbox" && (
            <Checkbox
              checked={value === true || value === "true"}
              disabled
              className="ml-2 inline-flex"
            />
          )}
        </p>
        {!isReadOnly && (
          <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        )}
      </div>
    </div>
  );
}
