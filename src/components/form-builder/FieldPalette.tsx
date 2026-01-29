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
import { Button } from "@/components/ui/button";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import type { FieldType } from "@/types/form-schema";

interface FieldTypeConfig {
  type: FieldType;
  label: string;
  icon: LucideIcon;
}

const FIELD_TYPES: FieldTypeConfig[] = [
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

export function FieldPalette() {
  const { selectedStepIndex, addField, addStep, schema } =
    useFormBuilderStore();

  const handleAddField = (type: FieldType) => {
    // If no steps exist, add one first
    if (schema.steps.length === 0) {
      addStep();
      // After addStep, selectedStepIndex will be 0
      addField(0, type);
    } else {
      addField(selectedStepIndex, type);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Field Types
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant="outline"
            className="h-auto justify-start gap-2 py-3"
            onClick={() => handleAddField(type)}
          >
            <Icon className="size-4" />
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
