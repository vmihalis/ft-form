"use client";

import { FormFilter } from "./FormFilter";
import { StatusFilter } from "./StatusFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { SearchInput } from "./SearchInput";
import { ExportButton } from "./ExportButton";
import { Id } from "../../../convex/_generated/dataModel";

interface SubmissionsFiltersProps {
  formFilter: string;
  onFormFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredCount: number;
  filteredIds: Id<"submissions">[];
}

export function SubmissionsFilters({
  formFilter,
  onFormFilterChange,
  statusFilter,
  onStatusFilterChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchValue,
  onSearchChange,
  filteredCount,
  filteredIds,
}: SubmissionsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <FormFilter value={formFilter} onValueChange={onFormFilterChange} />
      <StatusFilter value={statusFilter} onValueChange={onStatusFilterChange} />
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search by form name..."
      />

      {/* Spacer to push export right */}
      <div className="flex-1" />

      {/* Count display */}
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {filteredCount} submission{filteredCount !== 1 ? "s" : ""}
      </span>

      {/* Export button */}
      <ExportButton submissionIds={filteredIds} />
    </div>
  );
}
