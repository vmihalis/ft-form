"use client";

import { Input } from "@/components/ui/input";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="w-[150px]"
        aria-label="Start date"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="w-[150px]"
        aria-label="End date"
      />
    </div>
  );
}
