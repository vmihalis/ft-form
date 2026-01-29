"use client";

import {
  Type,
  Mail,
  Link,
  AlignLeft,
  Hash,
  Calendar,
  ChevronDown,
  Circle,
  CheckSquare,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FormField, FieldType } from "@/types/form-schema";
import { cn } from "@/lib/utils";

interface FieldPreviewProps {
  field: FormField;
  isDragging?: boolean;
}

const fieldIcons: Record<FieldType, LucideIcon> = {
  text: Type,
  email: Mail,
  url: Link,
  textarea: AlignLeft,
  number: Hash,
  date: Calendar,
  select: ChevronDown,
  radio: Circle,
  checkbox: CheckSquare,
  file: Upload,
};

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  email: "Email",
  url: "URL",
  textarea: "Long text",
  number: "Number",
  date: "Date",
  select: "Dropdown",
  radio: "Radio",
  checkbox: "Checkbox",
  file: "File upload",
};

function getFieldTypeDescription(field: FormField): string {
  if (field.type === "select" || field.type === "radio") {
    const optionCount = field.options?.length ?? 0;
    return `${optionCount} option${optionCount !== 1 ? "s" : ""}`;
  }
  return fieldTypeLabels[field.type];
}

export function FieldPreview({ field, isDragging }: FieldPreviewProps) {
  const Icon = fieldIcons[field.type];

  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-3",
        isDragging && "bg-card"
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{field.label}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {getFieldTypeDescription(field)}
          </span>
          {field.required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
