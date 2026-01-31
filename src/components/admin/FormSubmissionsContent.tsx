"use client";

import { useState } from "react";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { SubmissionSheet } from "@/components/admin/SubmissionSheet";
import { SubmissionRow } from "@/components/admin/submissions-columns";
import { Id } from "../../../convex/_generated/dataModel";

interface FormSubmissionsContentProps {
  formId: string;
}

/**
 * FormSubmissionsContent - Per-form submissions wrapper
 *
 * Displays submissions filtered to a specific form with detail sheet.
 * Used in the form detail page's Submissions tab.
 */
export function FormSubmissionsContent({ formId }: FormSubmissionsContentProps) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [submissionSheetOpen, setSubmissionSheetOpen] = useState(false);

  const handleSubmissionClick = (submission: SubmissionRow) => {
    setSelectedSubmission(submission);
    setSubmissionSheetOpen(true);
  };

  return (
    <>
      <SubmissionsTable formId={formId} onRowClick={handleSubmissionClick} />
      <SubmissionSheet
        submissionId={selectedSubmission?._id as Id<"submissions"> | null}
        open={submissionSheetOpen}
        onOpenChange={setSubmissionSheetOpen}
      />
    </>
  );
}
