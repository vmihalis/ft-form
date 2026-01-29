"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { debounce } from "@/lib/utils";

interface FormMetadataFormProps {
  formId: string;
}

/**
 * FormMetadataForm
 *
 * Right panel component shown when no field is selected.
 * Allows editing form name, slug, description, and settings.
 * Changes are debounced and saved automatically.
 */
export function FormMetadataForm({ formId }: FormMetadataFormProps) {
  const form = useQuery(api.forms.getById, {
    formId: formId as Id<"forms">,
  });
  const updateForm = useMutation(api.forms.update);

  const { schema, isDirty } = useFormBuilderStore();

  // Local state for controlled inputs
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize local state from form data
  useEffect(() => {
    if (form) {
      setName(form.name);
      setSlug(form.slug);
      setSubmitButtonText(form.draftSchema.settings?.submitButtonText || "Submit");
      setSuccessMessage(form.draftSchema.settings?.successMessage || "Thank you!");
      setWelcomeMessage(form.draftSchema.settings?.welcomeMessage || "Please complete this form to submit your application. Your progress is automatically saved.");
    }
  }, [form]);

  // Debounced save for metadata fields
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveMetadata = useCallback(
    debounce(async (updates: {
      name?: string;
      slug?: string;
      description?: string;
    }) => {
      try {
        setError(null);
        await updateForm({
          formId: formId as Id<"forms">,
          ...updates,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save";
        setError(message);
      }
    }, 500),
    [formId, updateForm]
  );

  // Update store settings when settings change
  const updateSettings = useCallback(
    (key: "submitButtonText" | "successMessage" | "welcomeMessage", value: string) => {
      const { schema: currentSchema } = useFormBuilderStore.getState();
      useFormBuilderStore.setState({
        schema: {
          ...currentSchema,
          settings: {
            ...currentSchema.settings,
            [key]: value,
          },
        },
        isDirty: true,
      });
    },
    []
  );

  if (!form) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Form Settings</h3>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          {isDirty ? "Unsaved changes" : "Editing Draft"}
        </Badge>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Separator />

      {/* Form Metadata */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Details</h4>

        <Field>
          <FieldLabel htmlFor="form-name">Form Name</FieldLabel>
          <Input
            id="form-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              debouncedSaveMetadata({ name: e.target.value });
            }}
            placeholder="Form name"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="form-slug">URL Slug</FieldLabel>
          <div className="flex items-center gap-0">
            <span className="text-muted-foreground text-sm bg-muted px-2 py-1.5 rounded-l-md border border-r-0 border-input h-11 flex items-center">
              /apply/
            </span>
            <Input
              id="form-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                debouncedSaveMetadata({ slug: e.target.value });
              }}
              placeholder="form-slug"
              className="rounded-l-none"
            />
          </div>
          <FieldDescription>
            Lowercase letters, numbers, and hyphens only
          </FieldDescription>
        </Field>
      </div>

      <Separator />

      {/* Form Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Settings</h4>

        <Field>
          <FieldLabel htmlFor="submit-button-text">Submit Button Text</FieldLabel>
          <Input
            id="submit-button-text"
            value={submitButtonText}
            onChange={(e) => {
              setSubmitButtonText(e.target.value);
              updateSettings("submitButtonText", e.target.value);
            }}
            placeholder="Submit"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="success-message">Success Message</FieldLabel>
          <Textarea
            id="success-message"
            value={successMessage}
            onChange={(e) => {
              setSuccessMessage(e.target.value);
              updateSettings("successMessage", e.target.value);
            }}
            placeholder="Thank you for your submission!"
            rows={2}
          />
          <FieldDescription>
            Shown after successful form submission
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="welcome-message">Welcome Message</FieldLabel>
          <Textarea
            id="welcome-message"
            value={welcomeMessage}
            onChange={(e) => {
              setWelcomeMessage(e.target.value);
              updateSettings("welcomeMessage", e.target.value);
            }}
            placeholder="Please complete this form to submit your application."
            rows={3}
          />
          <FieldDescription>
            Intro text shown on the first screen of the form
          </FieldDescription>
        </Field>
      </div>
    </div>
  );
}
