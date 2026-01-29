"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { OptionsEditor } from "./OptionsEditor";
import { ValidationEditor } from "./ValidationEditor";
import type { FormField, FieldType, FieldOption } from "@/types/form-schema";

interface PropertyPanelProps {
  fieldId: string;
}

// Field type icons mapping
const FIELD_TYPE_ICONS: Record<FieldType, LucideIcon> = {
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

// Field type labels
const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  email: "Email",
  url: "URL",
  textarea: "Long Text",
  number: "Number",
  date: "Date",
  select: "Dropdown",
  radio: "Radio",
  checkbox: "Checkbox",
  file: "File Upload",
};

interface FormValues {
  label: string;
  placeholder: string;
  description: string;
  required: boolean;
}

export function PropertyPanel({ fieldId }: PropertyPanelProps) {
  const field = useFormBuilderStore((s) => s.getFieldById(fieldId));
  const updateField = useFormBuilderStore((s) => s.updateField);
  const removeField = useFormBuilderStore((s) => s.removeField);
  const selectField = useFormBuilderStore((s) => s.selectField);

  const { register, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      label: field?.label ?? "",
      placeholder: field?.placeholder ?? "",
      description: field?.description ?? "",
      required: field?.required ?? false,
    },
  });

  // Reset form when field changes
  useEffect(() => {
    if (field) {
      reset({
        label: field.label,
        placeholder: field.placeholder ?? "",
        description: field.description ?? "",
        required: field.required,
      });
    }
  }, [fieldId, field, reset]);

  // Watch for changes and update store
  const watchedValues = watch();

  useEffect(() => {
    if (!field) return;

    // Debounced update
    const timer = setTimeout(() => {
      // Only update if values have actually changed
      if (
        watchedValues.label !== field.label ||
        watchedValues.placeholder !== (field.placeholder ?? "") ||
        watchedValues.description !== (field.description ?? "") ||
        watchedValues.required !== field.required
      ) {
        updateField(fieldId, {
          label: watchedValues.label,
          placeholder: watchedValues.placeholder || undefined,
          description: watchedValues.description || undefined,
          required: watchedValues.required,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [watchedValues, field, fieldId, updateField]);

  if (!field) {
    return (
      <div className="text-sm text-muted-foreground">
        Field not found
      </div>
    );
  }

  const Icon = FIELD_TYPE_ICONS[field.type];
  const typeLabel = FIELD_TYPE_LABELS[field.type];

  const handleDelete = () => {
    removeField(fieldId);
    selectField(null);
  };

  const handleOptionsChange = (options: FieldOption[]) => {
    updateField(fieldId, { options });
  };

  const handleValidationChange = (validation: FormField["validation"]) => {
    updateField(fieldId, { validation });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{typeLabel} Field</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Field</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this field? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Separator />

      {/* Basic Properties */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Basic Properties</h4>

        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            {...register("label")}
            placeholder="Field label"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeholder">Placeholder</Label>
          <Input
            id="placeholder"
            {...register("placeholder")}
            placeholder="Placeholder text (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Help Text</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Help text shown below the field (optional)"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="required"
            checked={watchedValues.required}
            onCheckedChange={(checked) => setValue("required", checked === true)}
          />
          <Label htmlFor="required" className="cursor-pointer">
            Required field
          </Label>
        </div>
      </div>

      {/* Type-Specific: Options Editor for select/radio */}
      {(field.type === "select" || field.type === "radio") && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Options</h4>
            <OptionsEditor
              options={field.options ?? []}
              onChange={handleOptionsChange}
            />
          </div>
        </>
      )}

      {/* Validation Editor */}
      <Separator />
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Validation</h4>
        <ValidationEditor
          field={field}
          onChange={handleValidationChange}
        />
      </div>
    </div>
  );
}
