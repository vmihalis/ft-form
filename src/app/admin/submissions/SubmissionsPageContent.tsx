"use client";

import { useState } from "react";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { SubmissionSheet } from "@/components/admin/SubmissionSheet";
import { SubmissionRow } from "@/components/admin/submissions-columns";
import { Id } from "../../../../convex/_generated/dataModel";

/**
 * SubmissionsPageContent - Client wrapper for submissions page
 *
 * Manages state for selected submission and sheet visibility.
 * Separated from server component to enable interactive features.
 */
export function SubmissionsPageContent() {
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [submissionSheetOpen, setSubmissionSheetOpen] = useState(false);

  const handleSubmissionClick = (submission: SubmissionRow) => {
    setSelectedSubmission(submission);
    setSubmissionSheetOpen(true);
  };

  return (
    <>
      <SubmissionsTable onRowClick={handleSubmissionClick} />
      <SubmissionSheet
        submissionId={selectedSubmission?._id as Id<"submissions"> | null}
        open={submissionSheetOpen}
        onOpenChange={setSubmissionSheetOpen}
      />
    </>
  );
}
