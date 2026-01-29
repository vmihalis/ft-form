"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FormDraft {
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, unknown>;
  versionId: string; // Lock to version at form start
}

interface DynamicFormState {
  // State
  drafts: Record<string, FormDraft>; // Keyed by slug
  isHydrated: boolean;

  // Actions
  getDraft: (slug: string) => FormDraft | null;
  initDraft: (slug: string, versionId: string) => void;
  setCurrentStep: (slug: string, step: number) => void;
  markStepCompleted: (slug: string, step: number) => void;
  updateFormData: (slug: string, data: Record<string, unknown>) => void;
  clearDraft: (slug: string) => void;
  setHydrated: (value: boolean) => void;
}

export const useDynamicFormStore = create<DynamicFormState>()(
  persist(
    (set, get) => ({
      drafts: {},
      isHydrated: false,

      getDraft: (slug: string) => {
        const { drafts } = get();
        return drafts[slug] ?? null;
      },

      initDraft: (slug: string, versionId: string) => {
        const { drafts } = get();
        const existingDraft = drafts[slug];

        // Reset if doesn't exist OR version changed
        if (!existingDraft || existingDraft.versionId !== versionId) {
          set({
            drafts: {
              ...drafts,
              [slug]: {
                currentStep: 0,
                completedSteps: [],
                formData: {},
                versionId,
              },
            },
          });
        }
      },

      setCurrentStep: (slug: string, step: number) => {
        const { drafts } = get();
        if (!drafts[slug]) return; // No-op if slug not in drafts
        set({
          drafts: {
            ...drafts,
            [slug]: {
              ...drafts[slug],
              currentStep: step,
            },
          },
        });
      },

      markStepCompleted: (slug: string, step: number) => {
        const { drafts } = get();
        if (!drafts[slug]) return; // No-op if slug not in drafts
        const completedSteps = drafts[slug].completedSteps.includes(step)
          ? drafts[slug].completedSteps
          : [...drafts[slug].completedSteps, step];
        set({
          drafts: {
            ...drafts,
            [slug]: {
              ...drafts[slug],
              completedSteps,
            },
          },
        });
      },

      updateFormData: (slug: string, data: Record<string, unknown>) => {
        const { drafts } = get();
        if (!drafts[slug]) return; // No-op if slug not in drafts
        set({
          drafts: {
            ...drafts,
            [slug]: {
              ...drafts[slug],
              formData: {
                ...drafts[slug].formData,
                ...data,
              },
            },
          },
        });
      },

      clearDraft: (slug: string) => {
        const { drafts } = get();
        if (!drafts[slug]) return; // No-op if slug not in drafts
        const newDrafts = { ...drafts };
        delete newDrafts[slug];
        set({ drafts: newDrafts });
      },

      setHydrated: (value: boolean) => set({ isHydrated: value }),
    }),
    {
      name: "ft-dynamic-form-drafts",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        drafts: state.drafts,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
