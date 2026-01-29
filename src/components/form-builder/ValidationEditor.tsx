"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormField, FieldValidation } from "@/types/form-schema";

interface ValidationEditorProps {
  field: FormField;
  onChange: (validation: FieldValidation) => void;
}

// Pattern presets for text fields
const PATTERN_PRESETS: { value: string; label: string; pattern?: string }[] = [
  { value: "none", label: "None" },
  { value: "phone", label: "Phone Number", pattern: "^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$" },
  { value: "url", label: "URL", pattern: "^https?://.+" },
  { value: "custom", label: "Custom Regex" },
];

// File type presets
const FILE_TYPE_PRESETS = [
  { value: "images", label: "Images", accept: "image/*" },
  { value: "pdfs", label: "PDFs", accept: "application/pdf" },
  { value: "documents", label: "Documents", accept: ".doc,.docx,.pdf,.txt" },
] as const;

export function ValidationEditor({ field, onChange }: ValidationEditorProps) {
  const validation = field.validation ?? {};

  const updateValidation = (updates: Partial<FieldValidation>) => {
    onChange({ ...validation, ...updates });
  };

  // Determine which preset is active
  const getActivePatternPreset = () => {
    if (!validation.pattern) return "none";
    const preset = PATTERN_PRESETS.find((p) => p.pattern === validation.pattern);
    return preset?.value ?? "custom";
  };

  const handlePatternPresetChange = (preset: string) => {
    if (preset === "none") {
      // Remove pattern
      const { pattern: _removed, ...rest } = validation;
      onChange(rest);
    } else if (preset === "custom") {
      updateValidation({ pattern: "" });
    } else {
      const presetConfig = PATTERN_PRESETS.find((p) => p.value === preset);
      if (presetConfig?.pattern) {
        updateValidation({ pattern: presetConfig.pattern });
      }
    }
  };

  // Render validation options based on field type
  const renderTypeSpecificValidation = () => {
    switch (field.type) {
      case "text":
      case "textarea":
        return (
          <div className="space-y-4">
            {/* Length constraints */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minLength" className="text-xs">Min Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  min={0}
                  value={validation.minLength ?? ""}
                  onChange={(e) =>
                    updateValidation({
                      minLength: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLength" className="text-xs">Max Length</Label>
                <Input
                  id="maxLength"
                  type="number"
                  min={0}
                  value={validation.maxLength ?? ""}
                  onChange={(e) =>
                    updateValidation({
                      maxLength: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="No limit"
                />
              </div>
            </div>

            {/* Pattern validation */}
            <div className="space-y-2">
              <Label className="text-xs">Pattern Validation</Label>
              <Select
                value={getActivePatternPreset()}
                onValueChange={handlePatternPresetChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {PATTERN_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Custom regex input */}
              {getActivePatternPreset() === "custom" && (
                <Input
                  value={validation.pattern ?? ""}
                  onChange={(e) => updateValidation({ pattern: e.target.value })}
                  placeholder="Enter regex pattern"
                  className="mt-2"
                />
              )}
            </div>
          </div>
        );

      case "number":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min" className="text-xs">Min Value</Label>
              <Input
                id="min"
                type="number"
                value={validation.min ?? ""}
                onChange={(e) =>
                  updateValidation({
                    min: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="No limit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max" className="text-xs">Max Value</Label>
              <Input
                id="max"
                type="number"
                value={validation.max ?? ""}
                onChange={(e) =>
                  updateValidation({
                    max: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="No limit"
              />
            </div>
          </div>
        );

      case "email":
        return (
          <p className="text-xs text-muted-foreground">
            Email format is validated automatically.
          </p>
        );

      case "date":
        return (
          <p className="text-xs text-muted-foreground">
            Date validation coming soon.
          </p>
        );

      case "file":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Accepted File Types</Label>
              <div className="space-y-2">
                {FILE_TYPE_PRESETS.map((preset) => (
                  <div key={preset.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`filetype-${preset.value}`}
                      checked={validation.pattern?.includes(preset.accept) ?? false}
                      onCheckedChange={(checked) => {
                        const currentTypes = validation.pattern?.split(",") ?? [];
                        let newTypes: string[];
                        if (checked) {
                          newTypes = [...currentTypes, preset.accept].filter(Boolean);
                        } else {
                          newTypes = currentTypes.filter((t) => t !== preset.accept);
                        }
                        updateValidation({
                          pattern: newTypes.length > 0 ? newTypes.join(",") : undefined,
                        });
                      }}
                    />
                    <Label
                      htmlFor={`filetype-${preset.value}`}
                      className="text-xs cursor-pointer"
                    >
                      {preset.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Max file size: 50MB (default)
            </p>
          </div>
        );

      case "select":
      case "radio":
      case "checkbox":
        return (
          <p className="text-xs text-muted-foreground">
            No additional validation needed.
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderTypeSpecificValidation()}

      {/* Custom error message (for all types) */}
      <div className="space-y-2">
        <Label htmlFor="customMessage" className="text-xs">
          Custom Error Message
        </Label>
        <Input
          id="customMessage"
          value={validation.customMessage ?? ""}
          onChange={(e) =>
            updateValidation({
              customMessage: e.target.value || undefined,
            })
          }
          placeholder="Custom validation error (optional)"
        />
      </div>
    </div>
  );
}
