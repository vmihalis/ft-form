"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function FormFilter({ value, onValueChange }: FormFilterProps) {
  const forms = useQuery(api.forms.list);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by form" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Forms</SelectItem>
        {forms?.map((form) => (
          <SelectItem key={form._id} value={form.name}>
            {form.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
