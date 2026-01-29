"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { DynamicField } from "@/components/dynamic-form/fields";
import { FieldToolbar } from "./FieldToolbar";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { cn } from "@/lib/utils";
import type { FormField } from "@/types/form-schema";

interface WysiwygFieldProps {
  field: FormField;
  stepIndex: number;
}

export function WysiwygField({ field, stepIndex }: WysiwygFieldProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-lg transition-all pl-8",
        "hover:ring-2 hover:ring-primary/30 hover:bg-muted/30",
        isSelected && "ring-2 ring-primary bg-muted/50"
      )}
      onClick={(e) => {
        e.stopPropagation();
        selectField(field.id);
      }}
    >
      {/* Drag handle - absolute positioned left */}
      <button
        type="button"
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2",
          "opacity-0 group-hover:opacity-100",
          "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted",
          "transition-opacity"
        )}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Actual form field - WYSIWYG rendering with pointer-events-none */}
      <div className="pointer-events-none py-2 pr-2">
        <DynamicField field={field} />
      </div>

      {/* Floating toolbar on selection */}
      {isSelected && <FieldToolbar fieldId={field.id} />}
    </div>
  );
}
