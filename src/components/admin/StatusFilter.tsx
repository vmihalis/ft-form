"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function StatusFilter({ value, onValueChange }: StatusFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="under_review">Under Review</SelectItem>
        <SelectItem value="accepted">Accepted</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}
