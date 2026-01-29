"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormProvider, useForm } from "react-hook-form";
import { WysiwygField } from "./WysiwygField";
import { AddFieldButton } from "./AddFieldButton";
import { DynamicField } from "@/components/dynamic-form/fields";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import type { FieldType } from "@/types/form-schema";

/**
 * WysiwygCanvas - WYSIWYG Form Builder Canvas
 *
 * Renders form fields as they will appear to users (WYSIWYG),
 * with drag-and-drop reordering and AddFieldButton between fields
 * for Notion-style field insertion.
 *
 * No separate preview mode - the builder IS the preview (BUILD-09).
 */
export function WysiwygCanvas() {
  const {
    schema,
    selectedStepIndex,
    reorderFields,
    addFieldAtIndex,
    selectField,
    getFieldById,
  } = useFormBuilderStore();

  const [activeId, setActiveId] = useState<string | null>(null);

  const currentStep = schema.steps[selectedStepIndex];
  const fields = currentStep?.fields ?? [];

  // Mock form context for DynamicField rendering
  const methods = useForm({ defaultValues: {}, mode: "onChange" });

  // Configure sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddField = (index: number) => (type: FieldType) => {
    addFieldAtIndex(selectedStepIndex, type, index);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderFields(selectedStepIndex, oldIndex, newIndex);
    }
  };

  // Click on canvas background deselects field
  const handleCanvasClick = () => {
    selectField(null);
  };

  const activeField = activeId ? getFieldById(activeId) : null;

  // Empty state
  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-lg border-2 border-dashed">
        <p className="text-center text-muted-foreground mb-4">
          Add your first field to get started
        </p>
        <AddFieldButton onAddField={handleAddField(0)} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="space-y-1 py-4"
          onClick={handleCanvasClick}
        >
          {/* Add button at top */}
          <AddFieldButton onAddField={handleAddField(0)} />

          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <div key={field.id}>
                <WysiwygField
                  field={field}
                  stepIndex={selectedStepIndex}
                />
                {/* Add button after each field */}
                <AddFieldButton onAddField={handleAddField(index + 1)} />
              </div>
            ))}
          </SortableContext>
        </div>

        {/* Drag overlay shows actual field appearance */}
        <DragOverlay>
          {activeField ? (
            <div className="rounded-lg border bg-card p-4 shadow-lg pointer-events-none opacity-90">
              <DynamicField field={activeField} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </FormProvider>
  );
}
