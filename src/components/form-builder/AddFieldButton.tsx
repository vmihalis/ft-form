"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldTypePicker } from "./FieldTypePicker";
import { cn } from "@/lib/utils";
import type { FieldType } from "@/types/form-schema";

interface AddFieldButtonProps {
  onAddField: (type: FieldType) => void;
}

export function AddFieldButton({ onAddField }: AddFieldButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: FieldType) => {
    onAddField(type);
    setOpen(false);
  };

  return (
    <div className="relative h-6 group">
      {/* Horizontal line indicator on hover */}
      <div
        className={cn(
          "absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5",
          "bg-transparent group-hover:bg-primary/30 transition-colors",
          open && "bg-primary/30"
        )}
      />

      {/* Plus button - centered */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "h-6 w-6 rounded-full",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "shadow-sm bg-background",
              open && "opacity-100"
            )}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="center">
          <FieldTypePicker onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
