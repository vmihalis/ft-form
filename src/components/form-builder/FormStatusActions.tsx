"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save, Send, Archive, AlertCircle, Check } from "lucide-react";
import type { FormSchema, FormField } from "@/types/form-schema";

interface FormStatusActionsProps {
  formId: string;
}

/**
 * Status badge styling
 */
const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  published: {
    label: "Published",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  archived: {
    label: "Archived",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
} as const;

/**
 * Validation result type
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate schema before publishing
 */
function validateSchemaForPublish(schema: FormSchema): ValidationResult {
  const errors: string[] = [];

  // Check for at least one step
  if (schema.steps.length === 0) {
    errors.push("Form must have at least one step");
    return { valid: false, errors };
  }

  // Check each step
  schema.steps.forEach((step, stepIndex) => {
    // Each step must have at least one field
    if (step.fields.length === 0) {
      errors.push(`Step ${stepIndex + 1} "${step.title}" has no fields`);
      return;
    }

    // Check each field
    step.fields.forEach((field: FormField, fieldIndex: number) => {
      // Field must have a label
      if (!field.label || field.label.trim() === "") {
        errors.push(
          `Field ${fieldIndex + 1} in step "${step.title}" is missing a label`
        );
      }

      // Select/radio fields must have options
      if (
        (field.type === "select" || field.type === "radio") &&
        (!field.options || field.options.length === 0)
      ) {
        errors.push(`"${field.label || "Unnamed field"}" needs at least one option`);
      }

      // Check options have labels
      if (field.options) {
        field.options.forEach((option, optIndex) => {
          if (!option.label || option.label.trim() === "") {
            errors.push(
              `Option ${optIndex + 1} in "${field.label || "Unnamed field"}" is missing a label`
            );
          }
        });
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * FormStatusActions - Save, publish, and archive actions for form builder
 *
 * Shows current form status and provides action buttons based on state:
 * - Save: Always available when dirty
 * - Publish: For draft/published forms, validates before publishing
 * - Archive: For published forms, with confirmation
 */
export function FormStatusActions({ formId }: FormStatusActionsProps) {
  const form = useQuery(api.forms.getById, { formId: formId as Id<"forms"> });
  const updateForm = useMutation(api.forms.update);
  const publishForm = useMutation(api.forms.publish);
  const archiveForm = useMutation(api.forms.archive);

  const { schema, isDirty, markClean } = useFormBuilderStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Clear feedback after 3 seconds
  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateForm({
        formId: formId as Id<"forms">,
        draftSchema: JSON.stringify(schema),
      });
      markClean();
      showFeedback("success", "Form saved");
    } catch (error) {
      console.error("Failed to save form:", error);
      showFeedback(
        "error",
        error instanceof Error ? error.message : "Failed to save"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle publish
  const handlePublish = async () => {
    // Validate schema first
    const validation = validateSchemaForPublish(schema);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setIsPublishing(true);

    try {
      // Save first if dirty
      if (isDirty) {
        await updateForm({
          formId: formId as Id<"forms">,
          draftSchema: JSON.stringify(schema),
        });
        markClean();
      }

      // Then publish
      const result = await publishForm({
        formId: formId as Id<"forms">,
      });

      showFeedback("success", `Published as version ${result.version}`);
    } catch (error) {
      console.error("Failed to publish form:", error);
      showFeedback(
        "error",
        error instanceof Error ? error.message : "Failed to publish"
      );
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle archive
  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await archiveForm({
        formId: formId as Id<"forms">,
      });
      showFeedback("success", "Form archived");
    } catch (error) {
      console.error("Failed to archive form:", error);
      showFeedback(
        "error",
        error instanceof Error ? error.message : "Failed to archive"
      );
    } finally {
      setIsArchiving(false);
    }
  };

  // Loading state
  if (!form) {
    return null;
  }

  const status = statusConfig[form.status];
  const isPublished = form.status === "published";
  const isArchived = form.status === "archived";
  const canPublish = !isArchived;
  const canArchive = isPublished;

  return (
    <div className="flex items-center gap-2">
      {/* Feedback message */}
      {feedback && (
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Status badge */}
      <Badge variant="outline" className={status.className}>
        {status.label}
        {isPublished && form.currentVersionId && (
          <span className="ml-1">v{form.currentVersionId ? "latest" : ""}</span>
        )}
      </Badge>

      {/* Save button */}
      <Button
        variant={isDirty ? "default" : "outline"}
        size="sm"
        onClick={handleSave}
        disabled={!isDirty || isSaving}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Saving..." : isDirty ? "Save" : "Saved"}
      </Button>

      {/* Publish button with validation errors */}
      {canPublish && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={isPublishing}
            >
              <Send className="h-4 w-4 mr-2" />
              {isPublishing
                ? "Publishing..."
                : isPublished
                  ? "Republish"
                  : "Publish"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isPublished ? "Republish Form?" : "Publish Form?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {validationErrors.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-red-600">
                      Please fix these issues before publishing:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-red-600">
                      {validationErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    {isPublished
                      ? "This will create a new version. Existing submissions will still reference their original version."
                      : "Once published, the form will be available at the public URL. You can still edit and republish later."}
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setValidationErrors([])}>
                Cancel
              </AlertDialogCancel>
              {validationErrors.length === 0 && (
                <AlertDialogAction
                  onClick={handlePublish}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPublished ? "Republish" : "Publish"}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Archive button */}
      {canArchive && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600"
              disabled={isArchiving}
            >
              <Archive className="h-4 w-4 mr-2" />
              {isArchiving ? "Archiving..." : "Archive"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this form?</AlertDialogTitle>
              <AlertDialogDescription>
                This will make the form unavailable for new submissions. Existing
                submissions will be preserved. You can unarchive later if needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleArchive}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
