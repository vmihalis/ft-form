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
 * Matches styling of original /apply page with glass-card effect.
 */
export function DynamicFormPage({ slug }: DynamicFormPageProps) {
  const form = useQuery(api.forms.getBySlug, { slug });
  const isHydrated = useDynamicFormStore((state) => state.isHydrated);
  const draft = useDynamicFormStore((state) => state.drafts[slug]);
  const initDraft = useDynamicFormStore((state) => state.initDraft);

  // Hydrate store on mount
  useEffect(() => {
    useDynamicFormStore.persist.rehydrate();
  }, []);

  // Initialize draft when form loads
  useEffect(() => {
    if (form && isHydrated) {
      // Only init if no draft or version changed
      if (!draft || draft.versionId !== form.versionId) {
        initDraft(slug, form.versionId);
      }
    }
  }, [form, isHydrated, slug, draft, initDraft]);

  // Calculate if this is a hero screen (welcome or confirmation)
  const currentStep = draft?.currentStep ?? 0;
  const totalContentSteps = form?.schema?.steps?.length ?? 0;
  const totalSteps = totalContentSteps + 3;
  const isHeroScreen = currentStep === 0 || currentStep === totalSteps - 1;

  // Loading state
  if (form === undefined) {
    return (
      <main className="min-h-[100dvh] px-4 pb-safe flex items-center justify-center py-8">
        <div className="mx-auto max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading form...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Not found state
  if (form === null) {
    return (
      <main className="min-h-[100dvh] px-4 pb-safe flex items-center justify-center py-8">
        <div className="mx-auto max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Form Not Found</h2>
              <p className="text-muted-foreground">
                This form doesn&apos;t exist or is no longer accepting submissions.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Wait for hydration
  if (!isHydrated) {
    return (
      <main className="min-h-[100dvh] px-4 pb-safe flex items-center justify-center py-8">
        <div className="mx-auto max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="mt-4 text-muted-foreground">Restoring your progress...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-[100dvh] px-4 pb-safe ${
        isHeroScreen
          ? "flex items-center justify-center py-8"
          : "pt-8 pb-16"
      }`}
    >
      <div className="mx-auto max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8">
        <DynamicFormRenderer
          slug={slug}
          schema={form.schema}
          versionId={form.versionId}
          formName={form.formName}
        />
      </div>
    </main>
  );
}
