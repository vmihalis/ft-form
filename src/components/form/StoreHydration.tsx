"use client";

import { useEffect } from "react";
import { useFormStore } from "@/lib/stores/form-store";

/**
 * StoreHydration component
 *
 * Handles SSR-safe rehydration of the Zustand store from localStorage.
 * Must be rendered as a child component to trigger client-side hydration.
 * Renders nothing - purely for side effects.
 */
export function StoreHydration() {
  const setHydrated = useFormStore((state) => state.setHydrated);

  useEffect(() => {
    // Rehydrate the store from localStorage
    useFormStore.persist.rehydrate();
    // Mark as hydrated after rehydration completes
    setHydrated(true);
  }, [setHydrated]);

  return null;
}
