"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { submissionsColumns, SubmissionRow } from "./submissions-columns";
import { SubmissionsFilters } from "./SubmissionsFilters";
import { EmptyState } from "@/components/ui/empty-state";
import { Inbox } from "lucide-react";

interface SubmissionsTableProps {
  onRowClick?: (submission: SubmissionRow) => void;
}

function TableSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SubmissionsTable({ onRowClick }: SubmissionsTableProps) {
  const submissions = useQuery(api.submissions.list, {});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const table = useReactTable({
    data: (submissions ?? []) as SubmissionRow[],
    columns: submissionsColumns,
    state: { columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      // Search by formName only
      const formName = row.getValue("formName") as string;
      const search = (filterValue as string).toLowerCase();
      return formName.toLowerCase().includes(search);
    },
  });

  // Date filter effect - update when dates change
  // IMPORTANT: This must be before any early returns to maintain consistent hook order
  useEffect(() => {
    const dateFilter = startDate || endDate ? { start: startDate, end: endDate } : undefined;
    table.getColumn("submittedAt")?.setFilterValue(dateFilter);
  }, [startDate, endDate, table]);

  // Loading state
  if (submissions === undefined) {
    return <TableSkeleton />;
  }

  // Form filter handler
  const handleFormFilter = (value: string) => {
    table
      .getColumn("formName")
      ?.setFilterValue(value === "all" ? undefined : value);
  };

  // Status filter handler
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
  };

  // Get filtered row IDs for export
  const filteredRows = table.getFilteredRowModel().rows;
  const filteredIds = filteredRows.map((row) => row.original._id as Id<"submissions">);

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <SubmissionsFilters
        formFilter={(table.getColumn("formName")?.getFilterValue() as string) ?? "all"}
        onFormFilterChange={handleFormFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilter}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        searchValue={globalFilter}
        onSearchChange={(e) => setGlobalFilter(e.target.value)}
        filteredCount={filteredRows.length}
        filteredIds={filteredIds}
      />

      {/* Table */}
      <motion.div
        className="glass-card rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className="cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={submissionsColumns.length} className="p-0">
                  <EmptyState
                    icon={Inbox}
                    title="No submissions found"
                    description="Try adjusting your filters or wait for new submissions to come in."
                    className="rounded-none border-0 shadow-none bg-transparent"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
