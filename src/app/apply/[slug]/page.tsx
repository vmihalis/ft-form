"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { use } from "react";

interface ApplyFormPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic form page - renders forms by slug
 *
 * Loads published form data from Convex and renders
 * the appropriate form UI based on schema.
 */
export default function ApplyFormPage({ params }: ApplyFormPageProps) {
  const { slug } = use(params);
  const form = useQuery(api.forms.getBySlug, { slug });

  // Loading state
  if (form === undefined) {
    return (
      <main className="min-h-[100dvh] px-4 pb-safe flex items-center justify-center py-8">
        <div className="mx-auto max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            <p className="text-white/60">Loading form...</p>
          </div>
        </div>
      </main>
    );
  }

  // Form not found or not published
  if (form === null) {
    return (
      <main className="min-h-[100dvh] px-4 pb-safe flex items-center justify-center py-8">
        <div className="mx-auto max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-4xl">404</div>
            <h1 className="text-xl font-semibold text-white">Form Not Found</h1>
            <p className="text-white/60">
              This form doesn&apos;t exist or is no longer accepting submissions.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Form found - render placeholder (actual renderer in Plan 02)
  return (
    <main className="min-h-[100dvh] px-4 pb-safe pt-8 pb-16">
      <div className="mx-auto max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-white">{form.formName}</h1>
          <p className="text-white/60">Version {form.version}</p>
          <div className="text-sm text-white/40">
            Form renderer coming in Plan 02
          </div>
        </div>
      </div>
    </main>
  );
}
