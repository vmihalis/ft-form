'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { useDebounce } from 'use-debounce';
import { CheckCircle } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';

interface CreateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: AIFormSchemaOutput;
}

/**
 * Normalize slug to URL-safe format
 * - lowercase
 * - alphanumeric + hyphens only
 * - no leading/trailing hyphens
 * - no consecutive hyphens
 */
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Modal for creating a form from an AI-generated schema
 *
 * Collects form name and slug, validates slug availability in real-time,
 * creates the form as a draft, and shows success state with navigation options.
 */
export function CreateFormModal({ open, onOpenChange, schema }: CreateFormModalProps) {
  // Form input state
  const [name, setName] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdFormId, setCreatedFormId] = useState<Id<'forms'> | null>(null);

  // Normalize slug for validation and submission
  const slug = useMemo(() => normalizeSlug(slugInput), [slugInput]);

  // Debounce slug for availability check (300ms)
  const [debouncedSlug] = useDebounce(slug, 300);

  // Check slug availability (skip if slug < 2 chars)
  const slugAvailable = useQuery(
    api.forms.isSlugAvailable,
    debouncedSlug.length >= 2 ? { slug: debouncedSlug } : 'skip'
  );

  // Create form mutation
  const createForm = useMutation(api.forms.createWithSchema);

  // Validation state
  const hasStartedTypingSlug = slugInput.length > 0;
  const isSlugTooShort = hasStartedTypingSlug && slug.length < 2;
  const isSlugTaken = slugAvailable === false;
  const isSlugValid = slug.length >= 2 && slugAvailable === true;

  // Can submit when name and slug are valid and not already submitting
  const canSubmit = name.trim().length > 0 && isSlugValid && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formId = await createForm({
        name: name.trim(),
        slug,
        draftSchema: JSON.stringify(schema),
      });
      setCreatedFormId(formId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form state when closing
      setName('');
      setSlugInput('');
      setError(null);
      setCreatedFormId(null);
      setIsSubmitting(false);
    }
    onOpenChange(newOpen);
  };

  // Success state - form was created
  if (createdFormId) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle>Form Created!</DialogTitle>
            <DialogDescription>
              Your form has been saved as a draft.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Link href="/admin/forms" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                View All Forms
              </Button>
            </Link>
            <Link href={`/admin/forms/${createdFormId}`} className="w-full sm:w-auto">
              <Button className="w-full">Edit in Builder</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Form input state
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Your Form</DialogTitle>
          <DialogDescription>
            Give your AI-generated form a name and URL.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form Name */}
          <Field>
            <FieldLabel htmlFor="form-name">Form Name</FieldLabel>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Job Application Form"
              autoFocus
            />
          </Field>

          {/* URL Slug */}
          <Field data-invalid={isSlugTooShort || isSlugTaken}>
            <FieldLabel htmlFor="form-slug">URL Slug</FieldLabel>
            <div className="flex items-center">
              <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                /apply/
              </span>
              <Input
                id="form-slug"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="job-application"
                className="rounded-l-none"
              />
            </div>
            {isSlugTooShort && (
              <FieldError>Slug must be at least 2 characters</FieldError>
            )}
            {isSlugTaken && (
              <FieldError>This slug is already in use</FieldError>
            )}
            {isSlugValid && (
              <FieldDescription className="text-green-600 dark:text-green-400">
                Available!
              </FieldDescription>
            )}
          </Field>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
