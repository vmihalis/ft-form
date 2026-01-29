"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useDynamicFormStore } from "@/lib/stores/dynamic-form-store";
import { DynamicFormRenderer } from "./DynamicFormRenderer";

interface DynamicFormPageProps {
  slug: string;
}

/**
 * DynamicFormPage - Container with data fetching and store hydration
 *
 * Loads form schema from Convex, manages localStorage hydration,
 * and initializes drafts when form loads.
 */
export function DynamicFormPage({ slug }: DynamicFormPageProps) {
  const form = useQuery(api.forms.getBySlug, { slug });
  const isHydrated = useDynamicFormStore((state) => state.isHydrated);
  const initDraft = useDynamicFormStore((state) => state.initDraft);
  const getDraft = useDynamicFormStore((state) => state.getDraft);

  // Hydrate store on mount
  useEffect(() => {
    useDynamicFormStore.persist.rehydrate();
  }, []);

  // Initialize draft when form loads
  useEffect(() => {
    if (form && isHydrated) {
      const draft = getDraft(slug);
      // Only init if no draft or version changed
      if (!draft || draft.versionId !== form.versionId) {
        initDraft(slug, form.versionId);
      }
    }
  }, [form, isHydrated, slug, getDraft, initDraft]);

  // Loading state
  if (form === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (form === null) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Form Not Found</h2>
          <p className="text-muted-foreground">
            This form doesn&apos;t exist or is no longer accepting submissions.
          </p>
        </div>
      </div>
    );
  }

  // Wait for hydration
  if (!isHydrated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Restoring your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <DynamicFormRenderer
      slug={slug}
      schema={form.schema}
      versionId={form.versionId}
      formName={form.formName}
    />
  );
}
