"use client";

import { useState } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { ApplicationsTable } from "./ApplicationsTable";
import { ApplicationSheet } from "./ApplicationSheet";

export function AdminDashboard() {
  const [selectedApplication, setSelectedApplication] =
    useState<Doc<"applications"> | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRowClick = (application: Doc<"applications">) => {
    setSelectedApplication(application);
    setSheetOpen(true);
  };

  return (
    <>
      <ApplicationsTable onRowClick={handleRowClick} />
      <ApplicationSheet
        application={selectedApplication}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
