"use client";

import { usePathname } from "next/navigation";
import { NeuralBackground } from "./neural-background";

export function BackgroundWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return <NeuralBackground />;
}
