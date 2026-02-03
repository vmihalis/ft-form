"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateCSV, downloadCSV } from "@/lib/csv-export";
import type { FormSchema, FormField } from "@/types/form-schema";

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

/**
 * Convert raw field value to display label
 * - Select/radio: look up option label
 * - Checkbox with options (array): join option labels
 * - Checkbox (boolean): Yes/No
 * - Other: return as-is
 */
function formatFieldValue(
  value: unknown,
  field: FormField
): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const { type, options } = field;

  // Select or radio: single value lookup
  if ((type === "select" || type === "radio") && options) {
    const option = options.find((opt) => opt.value === String(value));
    return option?.label ?? String(value);
  }

  // Checkbox with options: array of values
  if (type === "checkbox" && options && Array.isArray(value)) {
    if (value.length === 0) return "";
    return value
      .map((v) => {
        const option = options.find((opt) => opt.value === String(v));
        return option?.label ?? String(v);
      })
      .join("; "); // Use semicolon to avoid CSV comma conflicts
  }

  // Simple boolean checkbox
  if (type === "checkbox") {
    return value === true || value === "true" ? "Yes" : "No";
  }

  return String(value);
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

    // Build field map for value transformation
    const fieldMap = new Map<string, FormField>();
    if (parsedSchema) {
      parsedSchema.steps.forEach((step) => {
        step.fields.forEach((field) => {
          headers.push({ key: field.id, label: field.label });
          fieldMap.set(field.id, field);
        });
      });
    }

    // Build data rows with formatted values
    const data = submissions.map((sub) => {
      const row: Record<string, string> = {
        _status: formatStatus(sub.status),
        _submittedAt: new Date(sub.submittedAt).toISOString().split("T")[0],
      };

      // Format each field value using schema
      const subData = sub.data as Record<string, unknown>;
      for (const [fieldId, value] of Object.entries(subData)) {
        const field = fieldMap.get(fieldId);
        row[fieldId] = field ? formatFieldValue(value, field) : String(value ?? "");
      }

      return row;
    });

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
