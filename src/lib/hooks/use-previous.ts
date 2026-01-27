import { useRef, useEffect } from "react";

/**
 * Hook that returns the previous value of a variable.
 * Useful for detecting direction of step changes.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
