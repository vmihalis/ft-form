"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

/**
 * New Form Page
 *
 * Creates a new form with name, URL slug, and optional description.
 * On success, redirects to the form builder edit page.
 */
export default function NewFormPage() {
  const router = useRouter();
  const createForm = useMutation(api.forms.create);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formId = await createForm({
        name: name.trim(),
        slug: slug.trim(),
      });
      router.push(`/admin/forms/${formId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create form";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/admin/forms"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            &larr; Back to Forms
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-md px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Create New Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Name */}
              <Field>
                <FieldLabel htmlFor="name">Form Name</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Floor Lead Application"
                  required
                  autoFocus
                />
              </Field>

              {/* URL Slug */}
              <Field>
                <FieldLabel htmlFor="slug">URL Slug</FieldLabel>
                <div className="flex items-center gap-0">
                  <span className="text-muted-foreground text-sm bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input h-11 flex items-center">
                    /apply/
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="floor-lead-2024"
                    required
                    className="rounded-l-none"
                  />
                </div>
                <FieldDescription>
                  Lowercase letters, numbers, and hyphens only
                </FieldDescription>
              </Field>

              {/* Error message */}
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !slug.trim()}
                >
                  {isSubmitting ? "Creating..." : "Create Form"}
                </Button>
                <Link href="/admin/forms">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
