"use client";

import { create } from "zustand";

/**
 * Sidebar state management store with localStorage persistence.
 *
 * Features:
 * - isCollapsed: persists to localStorage, controls sidebar width
 * - isHovering: transient state for hover-to-peek interaction
 * - SSR-safe: handles server-side rendering gracefully
 *
 * Usage:
 * ```tsx
 * const { isCollapsed, toggleCollapsed } = useSidebarStore();
 * const effectivelyExpanded = !isCollapsed || isHovering;
 * ```
 */

interface SidebarState {
  isCollapsed: boolean;
  isHovering: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setHovering: (hovering: boolean) => void;
  toggleCollapsed: () => void;
}

const STORAGE_KEY = "frontierios-sidebar-state";

/**
 * Safely read from localStorage (client-side only).
 * Returns default false (expanded) for new users or on errors.
 */
const getPersistedState = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return typeof parsed.isCollapsed === "boolean" ? parsed.isCollapsed : false;
    }
    return false;
  } catch {
    // Storage quota error, parsing error, or other issues
    return false;
  }
};

/**
 * Safely write to localStorage (client-side only).
 * Silently fails on storage quota errors.
 */
const persistState = (isCollapsed: boolean): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isCollapsed }));
  } catch {
    // Storage quota error - silently fail
    console.warn("[sidebar-store] Failed to persist sidebar state to localStorage");
  }
};

export const useSidebarStore = create<SidebarState>((set, get) => ({
  // Default: expanded (false) for new users per CONTEXT.md
  // Will be hydrated from localStorage on client mount
  isCollapsed: false,
  isHovering: false,

  setCollapsed: (collapsed) => {
    set({ isCollapsed: collapsed });
    persistState(collapsed);
  },

  setHovering: (hovering) => set({ isHovering: hovering }),

  toggleCollapsed: () => {
    const newState = !get().isCollapsed;
    set({ isCollapsed: newState });
    persistState(newState);
  },
}));

/**
 * Hook for lazy hydration of sidebar state from localStorage.
 * Call this in a useEffect on the client side to hydrate stored state.
 *
 * Usage:
 * ```tsx
 * useEffect(() => {
 *   hydrateSidebarState();
 * }, []);
 * ```
 */
export const hydrateSidebarState = (): void => {
  const persisted = getPersistedState();
  if (persisted !== useSidebarStore.getState().isCollapsed) {
    useSidebarStore.setState({ isCollapsed: persisted });
  }
};
