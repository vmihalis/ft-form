"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type SubmissionRow = {
  _id: string;
  formVersionId: string;
  status: "new" | "under_review" | "accepted" | "rejected";
  submittedAt: number;
  formName: string;
  formSlug?: string;
  version?: number;
};

const statusConfig = {
  new: {
    label: "New",
    className:
      "bg-blue-100/90 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800",
  },
  under_review: {
    label: "Under Review",
    className:
      "bg-yellow-100/90 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-800",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-green-100/90 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-100/90 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800",
  },
};

export const submissionsColumns: ColumnDef<SubmissionRow>[] = [
  {
    accessorKey: "formName",
    header: "Form",
    cell: ({ row }) => (
      <span className="text-foreground font-medium truncate max-w-[200px] block">
        {row.getValue("formName")}
      </span>
    ),
    filterFn: (row, id, filterValue) => {
      if (!filterValue || filterValue === "all") return true;
      return row.getValue(id) === filterValue;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusConfig;
      const config = statusConfig[status];
      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue || filterValue === "all") return true;
      return row.getValue(id) === filterValue;
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("submittedAt") as number);
      return (
        <span className="text-muted-foreground text-sm">
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      );
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue) return true;
      const { start, end } = filterValue as { start?: string; end?: string };
      const timestamp = row.getValue(id) as number;

      if (start) {
        const startTime = new Date(start).getTime();
        if (timestamp < startTime) return false;
      }
      if (end) {
        // End of day for end date (23:59:59.999)
        const endTime = new Date(end).getTime() + (24 * 60 * 60 * 1000 - 1);
        if (timestamp > endTime) return false;
      }
      return true;
    },
  },
];
