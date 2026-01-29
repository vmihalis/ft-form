"use client";

import { useState, useRef, useEffect } from "react";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

/**
 * StepTabs
 *
 * Horizontal tabs for navigating between form steps.
 * Features:
 * - Select step by clicking
 * - Add new step with + button
 * - Rename step inline (double-click or edit icon)
 * - Delete step (only if >1 step exists)
 */
export function StepTabs() {
  const {
    schema,
    selectedStepIndex,
    selectStep,
    addStep,
    updateStep,
    removeStep,
  } = useFormBuilderStore();

  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingStepIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingStepIndex]);

  const startEditing = (index: number) => {
    setEditingStepIndex(index);
    setEditValue(schema.steps[index].title);
  };

  const cancelEditing = () => {
    setEditingStepIndex(null);
    setEditValue("");
  };

  const saveEdit = () => {
    if (editingStepIndex !== null && editValue.trim()) {
      updateStep(editingStepIndex, { title: editValue.trim() });
    }
    cancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const handleDeleteStep = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (schema.steps.length > 1) {
      removeStep(index);
    }
  };

  // No steps yet - show add button
  if (schema.steps.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addStep}
          className="border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Step
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 border-b pb-2 overflow-x-auto">
      {schema.steps.map((step, index) => {
        const isSelected = index === selectedStepIndex;
        const isEditing = index === editingStepIndex;

        return (
          <div
            key={step.id}
            className={cn(
              "group relative flex items-center gap-2 px-3 py-2 rounded-t-md cursor-pointer transition-colors",
              isSelected
                ? "bg-background border border-b-0 border-border -mb-[1px]"
                : "hover:bg-muted/50"
            )}
            onClick={() => !isEditing && selectStep(index)}
          >
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  className="h-7 w-32 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveEdit();
                  }}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelEditing();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}
                  onDoubleClick={() => startEditing(index)}
                >
                  {step.title}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(index);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  {schema.steps.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteStep(index, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Add Step Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-full"
        onClick={addStep}
        title="Add Step"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
