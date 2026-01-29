"use client";

import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import type { FieldType } from "@/types/form-schema";

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "email", label: "Email", icon: Mail },
  { type: "url", label: "URL", icon: Link },
  { type: "textarea", label: "Long Text", icon: AlignLeft },
  { type: "number", label: "Number", icon: Hash },
  { type: "date", label: "Date", icon: Calendar },
  { type: "select", label: "Dropdown", icon: ChevronDown },
  { type: "radio", label: "Radio", icon: Circle },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "file", label: "File Upload", icon: Upload },
];

interface FieldTypePickerProps {
  onSelect: (type: FieldType) => void;
}

export function FieldTypePicker({ onSelect }: FieldTypePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
        <Button
          key={type}
          variant="ghost"
          className="h-auto py-2 justify-start gap-2 text-sm"
          onClick={() => onSelect(type)}
        >
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      ))}
    </div>
  );
}
