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
    <div className="glass-card rounded-2xl p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filter controls: Search + Form + Status + Date Range */}
        <div className="flex flex-wrap flex-1 gap-4">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search by form name..."
            className="bg-background/50 border-glass-border"
          />
          <FormFilter value={formFilter} onValueChange={onFormFilterChange} />
          <StatusFilter value={statusFilter} onValueChange={onStatusFilterChange} />
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </div>

        {/* Results count + Export */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredCount} submission{filteredCount !== 1 ? "s" : ""}
          </span>
          <ExportButton submissionIds={filteredIds} />
        </div>
      </div>
    </div>
  );
}
