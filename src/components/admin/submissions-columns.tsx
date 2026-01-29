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
  new: { label: "New", className: "bg-blue-100 text-blue-800 border-blue-200" },
  under_review: {
    label: "Under Review",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export const submissionsColumns: ColumnDef<SubmissionRow>[] = [
  {
    accessorKey: "formName",
    header: "Form",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("formName")}</span>
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
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
];
