"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FRONTIER_TOWER_FLOORS } from "@/lib/constants/floors";

interface FloorFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function FloorFilter({ value, onValueChange }: FloorFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by floor" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Floors</SelectItem>
        {FRONTIER_TOWER_FLOORS.map((floor) => (
          <SelectItem key={floor.value} value={floor.value}>
            {floor.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
