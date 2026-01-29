"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { FormBuilder } from "./FormBuilder";
import { Skeleton } from "@/components/ui/skeleton";

interface FormBuilderWrapperProps {
  formId: string;
}

/**
 * Loading skeleton for form builder
 */
function FormBuilderSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header skeleton */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </header>

      {/* Three-panel skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-64 border-r p-4 bg-muted/30">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </aside>

        {/* Center panel */}
        <main className="flex-1 p-6 bg-background">
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full" />
        </main>

        {/* Right panel */}
        <aside className="w-80 border-l p-4 bg-muted/30">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Form not found state
 */
function FormNotFound() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Form not found</h2>
        <p className="text-muted-foreground mb-4">
          The form you&apos;re looking for doesn&apos;t exist or was deleted.
        </p>
        <a
          href="/admin/forms"
          className="text-primary hover:underline"
        >
          Back to Forms
        </a>
      </div>
    </div>
  );
}

/**
 * FormBuilderWrapper
 *
 * Client component that:
 * 1. Loads form data from Convex
 * 2. Initializes Zustand store with form schema
 * 3. Renders FormBuilder once data is ready
 */
export function FormBuilderWrapper({ formId }: FormBuilderWrapperProps) {
  const form = useQuery(api.forms.getById, {
    formId: formId as Id<"forms">,
  });

  const { initSchema, setFormId, resetBuilder } = useFormBuilderStore();

  // Initialize store when form data loads
  useEffect(() => {
    if (form) {
      setFormId(formId);
      initSchema(form.draftSchema);
    }
  }, [form, formId, initSchema, setFormId]);

  // Reset builder when unmounting (leaving page)
  useEffect(() => {
    return () => {
      resetBuilder();
    };
  }, [resetBuilder]);

  // Loading state
  if (form === undefined) {
    return <FormBuilderSkeleton />;
  }

  // Form not found
  if (form === null) {
    return <FormNotFound />;
  }

  return <FormBuilder formId={formId} formName={form.name} formStatus={form.status} />;
}
