"use client";

import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Copy } from "lucide-react";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";

interface FieldToolbarProps {
  fieldId: string;
}

export function FieldToolbar({ fieldId }: FieldToolbarProps) {
  const { removeField, duplicateField } = useFormBuilderStore();

  const handleDuplicate = () => {
    duplicateField(fieldId);
  };

  const handleDelete = () => {
    removeField(fieldId);
  };

  // Edit action: field is already selected, PropertyPanel shows.
  // Could optionally trigger inline editing mode in future.
  const handleEdit = () => {
    // Field is selected - PropertyPanel on right handles editing
    // This button is informational / could trigger inline focus
  };

  return (
    <Popover open={true}>
      <PopoverAnchor asChild>
        <div className="absolute inset-0 pointer-events-none" />
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-auto p-1 flex gap-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleEdit}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit in panel</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate field</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete field</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PopoverContent>
    </Popover>
  );
}
