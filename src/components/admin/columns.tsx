"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "../../../convex/_generated/dataModel";
import { StatusBadge } from "./StatusBadge";
import { getFloorLabel } from "@/lib/constants/floors";

export const columns: ColumnDef<Doc<"applications">>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "floor",
    header: "Floor",
    cell: ({ row }) => getFloorLabel(row.getValue("floor")),
    filterFn: "equals",
  },
  {
    accessorKey: "initiativeName",
    header: "Initiative",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "submittedAt",
    header: "Date",
    cell: ({ row }) => {
      const timestamp = row.getValue("submittedAt") as number;
      return new Date(timestamp).toLocaleDateString();
    },
  },
];
