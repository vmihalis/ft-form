"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateCSV, downloadCSV } from "@/lib/csv-export";
import type { FormSchema } from "@/types/form-schema";

interface ExportButtonProps {
  submissionIds: Id<"submissions">[];
  disabled?: boolean;
}

function formatStatus(status: string): string {
  const statusLabels: Record<string, string> = {
    new: "New",
    under_review: "Under Review",
    accepted: "Accepted",
    rejected: "Rejected",
  };
  return statusLabels[status] || status;
}

export function ExportButton({ submissionIds, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  // Query is skipped until export is triggered, then uses the IDs
  const exportData = useQuery(
    api.submissions.listForExport,
    isExporting && submissionIds.length > 0 ? { submissionIds } : "skip"
  );

  const handleExport = () => {
    if (submissionIds.length === 0) return;
    setIsExporting(true);
    setHasExported(false);
  };

  // Effect: when data loads, generate and download CSV
  useEffect(() => {
    if (!isExporting || !exportData || hasExported) return;

    if (exportData.submissions.length === 0) {
      setIsExporting(false);
      return;
    }

    const { submissions, schema, formName } = exportData;
    const parsedSchema = schema as FormSchema | null;

    // Build headers from schema
    const headers: { key: string; label: string }[] = [
      { key: "_status", label: "Status" },
      { key: "_submittedAt", label: "Submitted Date" },
    ];

    if (parsedSchema) {
      parsedSchema.steps.forEach((step) => {
        step.fields.forEach((field) => {
          headers.push({ key: field.id, label: field.label });
        });
      });
    }

    // Build data rows
    const data = submissions.map((sub) => ({
      _status: formatStatus(sub.status),
      _submittedAt: new Date(sub.submittedAt).toISOString().split("T")[0],
      ...sub.data,
    }));

    // Generate and download
    const csv = generateCSV(data, headers);
    const filename = `${formName.toLowerCase().replace(/\s+/g, "-")}-export-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csv, filename);

    // Reset state
    setHasExported(true);
    setIsExporting(false);
  }, [isExporting, exportData, hasExported]);

  const isLoading = isExporting && !exportData;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || submissionIds.length === 0 || isLoading}
      title={
        submissionIds.length === 0
          ? "No submissions to export"
          : `Export ${submissionIds.length} submission${submissionIds.length !== 1 ? "s" : ""}`
      }
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="ml-2">Export CSV</span>
    </Button>
  );
}
