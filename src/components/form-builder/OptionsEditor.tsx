"use client";

import { nanoid } from "nanoid";
import { Plus, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FieldOption } from "@/types/form-schema";

interface OptionsEditorProps {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const addOption = () => {
    const newOption: FieldOption = {
      value: `option_${nanoid(6)}`,
      label: "",
    };
    onChange([...options, newOption]);
  };

  const updateOption = (index: number, label: string) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      label,
    };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onChange(newOptions);
  };

  // Generate value from label on blur if value is empty
  const handleBlur = (index: number) => {
    const option = options[index];
    if (!option.label) return;

    // Auto-generate value from label if it's still the default
    if (option.value.startsWith("option_")) {
      const generatedValue = option.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

      if (generatedValue) {
        const newOptions = [...options];
        newOptions[index] = {
          ...newOptions[index],
          value: generatedValue,
        };
        onChange(newOptions);
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Validation warning */}
      {options.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>At least one option required</span>
        </div>
      )}

      {/* Options list */}
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.value} className="flex items-center gap-2">
            <Input
              value={option.label}
              onChange={(e) => updateOption(index, e.target.value)}
              onBlur={() => handleBlur(index)}
              placeholder={`Option ${index + 1}`}
              className={option.label === "" ? "border-yellow-400" : ""}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeOption(index)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove option</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Add option button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={addOption}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Option
      </Button>
    </div>
  );
}
