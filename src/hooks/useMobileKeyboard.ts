"use client";

import { useCallback } from "react";

/**
 * Hook to handle mobile keyboard scrolling
 * On iOS Safari, keyboard opens without resizing viewport,
 * which can hide the active input. This scrolls it into view.
 */
export function useMobileKeyboard() {
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Small delay allows keyboard animation to start
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    },
    []
  );

  return { onFocus: handleFocus };
}
