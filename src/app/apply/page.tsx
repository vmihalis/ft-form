"use client";

import { StoreHydration } from "@/components/form/StoreHydration";
import { MultiStepForm } from "@/components/form/MultiStepForm";
import { useFormStore } from "@/lib/stores/form-store";

/**
 * Apply page - Floor Lead Application form
 *
 * Renders the multi-step application form with:
 * - StoreHydration for SSR-safe localStorage restoration
 * - MultiStepForm as the main form container
 * - Conditional vertical centering for hero screens (welcome/confirmation)
 */
export default function ApplyPage() {
  const currentStep = useFormStore((state) => state.currentStep);
  const isHeroScreen = currentStep === 0 || currentStep === 7;

  return (
    <>
      <StoreHydration />
      <main
        className={`min-h-[100dvh] px-4 pb-safe ${
          isHeroScreen
            ? "flex items-center justify-center py-8"
            : "pt-8 pb-16"
        }`}
      >
        <div className="mx-auto max-w-2xl w-full glass-card rounded-2xl p-6 sm:p-8">
          <MultiStepForm />
        </div>
      </main>
    </>
  );
}
