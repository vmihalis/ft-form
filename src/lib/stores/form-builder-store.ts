"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  FormSchema,
  FormField,
  FieldType,
  FormStep,
} from "@/types/form-schema";

interface FormBuilderState {
  // Form state
  formId: string | null;
  schema: FormSchema;
  isDirty: boolean;

  // UI state
  selectedFieldId: string | null;
  selectedStepIndex: number;
  previewMode: "edit" | "preview";

  // Form management actions
  initSchema: (schema: FormSchema) => void;
  setFormId: (formId: string | null) => void;

  // Field actions
  addField: (stepIndex: number, type: FieldType) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  removeField: (fieldId: string) => void;
  reorderFields: (
    stepIndex: number,
    oldIndex: number,
    newIndex: number
  ) => void;
  selectField: (fieldId: string | null) => void;

  // Step actions
  addStep: () => void;
  updateStep: (stepIndex: number, updates: Partial<FormStep>) => void;
  removeStep: (stepIndex: number) => void;
  reorderSteps: (oldIndex: number, newIndex: number) => void;
  selectStep: (stepIndex: number) => void;

  // Helpers
  getFieldById: (fieldId: string) => FormField | undefined;
  getStepByFieldId: (
    fieldId: string
  ) => { step: FormStep; stepIndex: number } | undefined;

  // Persistence
  markClean: () => void;
  resetBuilder: () => void;
}

const emptySchema: FormSchema = {
  steps: [],
  settings: {
    submitButtonText: "Submit",
    successMessage: "Thank you!",
  },
};

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  // Initial state
  formId: null,
  schema: emptySchema,
  isDirty: false,
  selectedFieldId: null,
  selectedStepIndex: 0,
  previewMode: "edit",

  // Form management actions
  initSchema: (schema) =>
    set({
      schema,
      isDirty: false,
      selectedFieldId: null,
      selectedStepIndex: 0,
    }),

  setFormId: (formId) => set({ formId }),

  // Field actions
  addField: (stepIndex, type) => {
    const { schema } = get();

    // Create field with default values based on type
    const newField: FormField = {
      id: nanoid(),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: "",
    };

    // Add default options for select/radio types
    if (type === "select" || type === "radio") {
      newField.options = [
        { value: "option_1", label: "Option 1" },
        { value: "option_2", label: "Option 2" },
      ];
    }

    const newSteps = [...schema.steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      fields: [...newSteps[stepIndex].fields, newField],
    };

    set({
      schema: { ...schema, steps: newSteps },
      isDirty: true,
      selectedFieldId: newField.id,
    });
  },

  updateField: (fieldId, updates) => {
    const { schema } = get();
    const newSteps = schema.steps.map((step) => ({
      ...step,
      fields: step.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
    set({ schema: { ...schema, steps: newSteps }, isDirty: true });
  },

  removeField: (fieldId) => {
    const { schema, selectedFieldId } = get();
    const newSteps = schema.steps.map((step) => ({
      ...step,
      fields: step.fields.filter((f) => f.id !== fieldId),
    }));
    set({
      schema: { ...schema, steps: newSteps },
      isDirty: true,
      selectedFieldId: selectedFieldId === fieldId ? null : selectedFieldId,
    });
  },

  reorderFields: (stepIndex, oldIndex, newIndex) => {
    const { schema } = get();
    const newSteps = [...schema.steps];
    const fields = [...newSteps[stepIndex].fields];

    // Remove from old position and insert at new position
    const [removed] = fields.splice(oldIndex, 1);
    fields.splice(newIndex, 0, removed);

    newSteps[stepIndex] = { ...newSteps[stepIndex], fields };
    set({ schema: { ...schema, steps: newSteps }, isDirty: true });
  },

  selectField: (fieldId) => set({ selectedFieldId: fieldId }),

  // Step actions
  addStep: () => {
    const { schema } = get();
    const newStep: FormStep = {
      id: `step_${nanoid(8)}`,
      title: `Step ${schema.steps.length + 1}`,
      description: "",
      fields: [],
    };
    set({
      schema: { ...schema, steps: [...schema.steps, newStep] },
      isDirty: true,
      selectedStepIndex: schema.steps.length,
    });
  },

  updateStep: (stepIndex, updates) => {
    const { schema } = get();
    const newSteps = [...schema.steps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates };
    set({ schema: { ...schema, steps: newSteps }, isDirty: true });
  },

  removeStep: (stepIndex) => {
    const { schema, selectedStepIndex } = get();
    // Keep at least one step
    if (schema.steps.length <= 1) return;

    const newSteps = schema.steps.filter((_, i) => i !== stepIndex);
    set({
      schema: { ...schema, steps: newSteps },
      isDirty: true,
      selectedStepIndex: Math.min(selectedStepIndex, newSteps.length - 1),
      selectedFieldId: null,
    });
  },

  reorderSteps: (oldIndex, newIndex) => {
    const { schema } = get();
    const newSteps = [...schema.steps];

    // Remove from old position and insert at new position
    const [removed] = newSteps.splice(oldIndex, 1);
    newSteps.splice(newIndex, 0, removed);

    set({ schema: { ...schema, steps: newSteps }, isDirty: true });
  },

  selectStep: (stepIndex) =>
    set({
      selectedStepIndex: stepIndex,
      selectedFieldId: null,
    }),

  // Helpers
  getFieldById: (fieldId) => {
    const { schema } = get();
    for (const step of schema.steps) {
      const field = step.fields.find((f) => f.id === fieldId);
      if (field) return field;
    }
    return undefined;
  },

  getStepByFieldId: (fieldId) => {
    const { schema } = get();
    for (let i = 0; i < schema.steps.length; i++) {
      if (schema.steps[i].fields.some((f) => f.id === fieldId)) {
        return { step: schema.steps[i], stepIndex: i };
      }
    }
    return undefined;
  },

  // Persistence
  markClean: () => set({ isDirty: false }),

  resetBuilder: () =>
    set({
      formId: null,
      schema: emptySchema,
      isDirty: false,
      selectedFieldId: null,
      selectedStepIndex: 0,
    }),
}));
