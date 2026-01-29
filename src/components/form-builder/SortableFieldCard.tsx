"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FieldPreview } from "./FieldPreview";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import type { FormField } from "@/types/form-schema";
import { cn } from "@/lib/utils";

interface SortableFieldCardProps {
  field: FormField;
}

export function SortableFieldCard({ field }: SortableFieldCardProps) {
  const { selectedFieldId, selectField } = useFormBuilderStore();
  const isSelected = field.id === selectedFieldId;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer py-0 transition-all hover:bg-muted/50",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => selectField(field.id)}
    >
      <div className="flex items-center gap-2 p-4">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 hover:bg-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </button>
        <FieldPreview field={field} />
      </div>
    </Card>
  );
}
