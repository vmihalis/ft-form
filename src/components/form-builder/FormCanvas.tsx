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
import { SortableFieldCard } from "./SortableFieldCard";
import { FieldPreview } from "./FieldPreview";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";

export function FormCanvas() {
  const { schema, selectedStepIndex, reorderFields, getFieldById } =
    useFormBuilderStore();

  const [activeId, setActiveId] = useState<string | null>(null);

  // Get fields for current step
  const currentStep = schema.steps[selectedStepIndex];
  const fields = currentStep?.fields ?? [];

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

  const activeField = activeId ? getFieldById(activeId) : null;

  // Empty state
  if (fields.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-center text-muted-foreground">
          Add your first field from the palette
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {fields.map((field) => (
            <SortableFieldCard key={field.id} field={field} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeField ? (
          <div className="rounded-lg border bg-card p-4 shadow-lg">
            <FieldPreview field={activeField} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
