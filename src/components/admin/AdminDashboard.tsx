"use client";

import { Suspense } from "react";
import { AdminTabs } from "./AdminTabs";
import { DashboardStats } from "./DashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin Dashboard with tabbed interface
 *
 * Displays stats cards above tabbed content.
 * Wraps AdminTabs in Suspense for useSearchParams() compatibility.
 */
export function AdminDashboard() {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-96" />}>
      <div className="space-y-6">
        <DashboardStats />
        <AdminTabs />
      </div>
    </Suspense>
  );
}
