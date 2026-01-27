"use client";

import { StoreHydration } from "@/components/form/StoreHydration";
import { MultiStepForm } from "@/components/form/MultiStepForm";

/**
 * Apply page - Floor Lead Application form
 *
 * Renders the multi-step application form with:
 * - StoreHydration for SSR-safe localStorage restoration
 * - MultiStepForm as the main form container
 */
export default function ApplyPage() {
  return (
    <>
      <StoreHydration />
      <main className="min-h-screen py-8 px-4">
        <div className="mx-auto max-w-2xl">
          <MultiStepForm />
        </div>
      </main>
    </>
  );
}
