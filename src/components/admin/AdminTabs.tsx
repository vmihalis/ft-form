"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationsTable } from "./ApplicationsTable";
import { ApplicationSheet } from "./ApplicationSheet";
import { SubmissionsTable } from "./SubmissionsTable";
import { SubmissionSheet } from "./SubmissionSheet";
import { SubmissionRow } from "./submissions-columns";
import { FormsList } from "@/components/form-builder/FormsList";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface AdminTabsProps {
  selectedApplication: Doc<"applications"> | null;
  sheetOpen: boolean;
  onApplicationSelect: (application: Doc<"applications">) => void;
  onSheetOpenChange: (open: boolean) => void;
}

/**
 * Tab navigation for admin dashboard
 *
 * Three tabs:
 * - Applications: Legacy floor lead applications (existing functionality)
 * - Submissions: Dynamic form submissions (with FormFilter)
 * - Forms: Form management with FormsList
 *
 * Tab state is synced to URL via ?tab= query param for bookmarking/sharing.
 */
export function AdminTabs({
  selectedApplication,
  sheetOpen,
  onApplicationSelect,
  onSheetOpenChange,
}: AdminTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for submissions tab
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [submissionSheetOpen, setSubmissionSheetOpen] = useState(false);

  // Handle submission row click
  const handleSubmissionClick = (submission: SubmissionRow) => {
    setSelectedSubmission(submission);
    setSubmissionSheetOpen(true);
  };

  // Get current tab from URL, default to "applications"
  const currentTab = searchParams.get("tab") || "applications";

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "applications") {
      // Remove tab param for default value (cleaner URL)
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const queryString = params.toString();
    router.push(`/admin${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <>
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <ApplicationsTable onRowClick={onApplicationSelect} />
        </TabsContent>

        <TabsContent value="submissions">
          <SubmissionsTable onRowClick={handleSubmissionClick} />
        </TabsContent>

        <TabsContent value="forms">
          <FormsList />
        </TabsContent>
      </Tabs>

      {/* ApplicationSheet for applications tab */}
      <ApplicationSheet
        application={selectedApplication}
        open={sheetOpen}
        onOpenChange={onSheetOpenChange}
      />

      {/* SubmissionSheet for submissions tab */}
      <SubmissionSheet
        submissionId={selectedSubmission?._id as Id<"submissions"> | null}
        open={submissionSheetOpen}
        onOpenChange={setSubmissionSheetOpen}
      />
    </>
  );
}
