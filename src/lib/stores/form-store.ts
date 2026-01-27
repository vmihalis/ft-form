"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApplicationFormData } from "@/types/form";

interface FormState {
  // State
  currentStep: number;
  completedSteps: number[];
  formData: Partial<ApplicationFormData>;
  isHydrated: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  resetForm: () => void;
  setHydrated: (value: boolean) => void;
}

const initialState = {
  currentStep: 0,
  completedSteps: [],
  formData: {},
  isHydrated: false,
};

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepCompleted: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      resetForm: () => {
        set({ ...initialState, isHydrated: true });
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "ft-form-draft",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        formData: state.formData,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
