"use client";

import { Suspense } from "react";
import { AdminTabs } from "./AdminTabs";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin Dashboard with tabbed interface
 *
 * Wraps AdminTabs in Suspense for useSearchParams() compatibility.
 */
export function AdminDashboard() {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-96" />}>
      <AdminTabs />
    </Suspense>
  );
}
