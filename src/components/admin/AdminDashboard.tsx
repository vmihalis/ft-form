"use client";

import { Suspense, useState } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { AdminTabs } from "./AdminTabs";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin Dashboard with tabbed interface
 *
 * Manages shared state for application selection and sheet visibility.
 * Wraps AdminTabs in Suspense for useSearchParams() compatibility.
 */
export function AdminDashboard() {
  const [selectedApplication, setSelectedApplication] =
    useState<Doc<"applications"> | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleApplicationSelect = (application: Doc<"applications">) => {
    setSelectedApplication(application);
    setSheetOpen(true);
  };

  return (
    <Suspense fallback={<Skeleton className="h-10 w-96" />}>
      <AdminTabs
        selectedApplication={selectedApplication}
        sheetOpen={sheetOpen}
        onApplicationSelect={handleApplicationSelect}
        onSheetOpenChange={setSheetOpen}
      />
    </Suspense>
  );
}
