# Architecture: Dynamic Form Builder Integration

**Project:** Frontier Tower Application System
**Milestone:** v1.2 Dynamic Form Builder
**Researched:** 2026-01-29
**Confidence:** HIGH (based on existing codebase analysis + Convex official docs)

## Executive Summary

The existing Frontier Tower application has a well-structured but **hardcoded** form system. Adding dynamic forms requires introducing a **form schema layer** that decouples form structure from code while preserving the existing user experience and admin functionality.

**Key architectural decision:** Store form schema in Convex, generate Zod validators at runtime, reuse existing UI components.

This document describes how to integrate a dynamic form builder with the existing architecture without breaking current functionality.

---

## Current Architecture Analysis

### Existing Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Zod Schemas    │────>│  React Hook Form │────>│ Convex Mutation │
│  (hardcoded in  │     │  + Zustand Store │     │ applications.ts │
│  application.ts)│     │  (form-store.ts) │     │ submit()        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        v                        v
┌─────────────────┐     ┌──────────────────┐
│  8 Step         │     │  localStorage    │
│  Components     │     │  (ft-form-draft) │
│  (hardcoded)    │     │                  │
└─────────────────┘     └──────────────────┘
```

### Current Component Inventory

| Component | Location | Current Role | Dynamic Form Impact |
|-----------|----------|--------------|---------------------|
| `MultiStepForm` | `src/components/form/MultiStepForm.tsx` | FormProvider, submission logic | MODIFY: Accept schema prop |
| `StepContent` | `src/components/form/StepContent.tsx` | Step routing via switch | MODIFY: Add dynamic step route |
| `NavigationButtons` | `src/components/form/NavigationButtons.tsx` | Validation + navigation | KEEP: Works unchanged |
| `ProgressIndicator` | `src/components/form/ProgressIndicator.tsx` | Step dots | MODIFY: Read step count from schema |
| `useFormStore` | `src/lib/stores/form-store.ts` | Draft persistence | MODIFY: Schema-agnostic data |
| `stepSchemas` | `src/lib/schemas/application.ts` | Per-step Zod schemas | REPLACE: Generate from schema |
| `EditableField` | `src/components/admin/EditableField.tsx` | Inline editing | KEEP: Works for any field |
| `ApplicationSheet` | `src/components/admin/ApplicationSheet.tsx` | Detail panel | MODIFY: Read sections from schema |

### Current Schema (convex/schema.ts)

```typescript
// Currently: 20 fixed fields in applications table
applications: defineTable({
  fullName: v.string(),
  email: v.string(),
  linkedIn: v.optional(v.string()),
  // ... 17 more hardcoded fields
  status: v.union(...),
  submittedAt: v.number(),
})
```

### Current Limitations to Address

| Issue | Current State | Dynamic Form Solution |
|-------|---------------|----------------------|
| Schema tied to code | `schema.ts` has 20 fixed fields | Schema stored in `forms` table |
| Steps hardcoded | 8 `.tsx` step components | Dynamic step renderer reads schema |
| Validation hardcoded | `application.ts` Zod schemas | Generate Zod from stored schema |
| Submissions tightly coupled | `applications` table = schema | Submissions reference `formVersionId` |
| No file uploads | Not supported | File field type with Convex storage |

---

## Recommended Architecture

### New Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  forms table    │────>│  Schema-to-Zod   │────>│  React Hook     │
│  (schema in DB) │     │  Generator       │     │  Form           │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        v                        v                        v
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  formVersions   │     │  DynamicStep     │     │  submissions    │
│  (immutable     │     │  Renderer        │     │  (references    │
│   snapshots)    │     │  (new component) │     │  formVersionId) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### New Component Architecture

```
src/
├── components/
│   ├── form/
│   │   ├── MultiStepForm.tsx          # MODIFY: Accept schema prop
│   │   ├── StepContent.tsx            # MODIFY: Route to DynamicStep
│   │   ├── NavigationButtons.tsx      # KEEP: Works unchanged
│   │   ├── ProgressIndicator.tsx      # MODIFY: Dynamic step count
│   │   ├── DynamicStep.tsx            # NEW: Renders fields from schema
│   │   ├── DynamicField.tsx           # NEW: Field type router
│   │   ├── fields/                    # NEW: Field type implementations
│   │   │   ├── TextField.tsx
│   │   │   ├── TextareaField.tsx
│   │   │   ├── SelectField.tsx
│   │   │   ├── FileField.tsx
│   │   │   └── index.ts               # Field registry
│   │   └── steps/                     # KEEP: Legacy/custom forms
│   │       └── *.tsx
│   ├── admin/
│   │   ├── ApplicationSheet.tsx       # MODIFY: Read sections from schema
│   │   ├── SubmissionSheet.tsx        # NEW: For dynamic form submissions
│   │   ├── EditableField.tsx          # KEEP: Works for any field
│   │   └── FormBuilder/               # NEW: Admin form editor
│   │       ├── FormBuilder.tsx        # Main builder container
│   │       ├── FieldPalette.tsx       # Draggable field types
│   │       ├── StepEditor.tsx         # Step configuration
│   │       ├── FieldEditor.tsx        # Field property editor
│   │       ├── SortableField.tsx      # Drag handle wrapper
│   │       └── PreviewPane.tsx        # Live form preview
│   └── ui/                            # KEEP: All existing shadcn/ui
├── lib/
│   ├── schemas/
│   │   ├── application.ts             # KEEP: Legacy fallback
│   │   ├── form-schema.ts             # NEW: Form schema type definitions
│   │   └── schema-to-zod.ts           # NEW: Runtime Zod generation
│   ├── stores/
│   │   ├── form-store.ts              # MODIFY: Schema-agnostic
│   │   └── builder-store.ts           # NEW: Form builder state
│   └── constants/
│       ├── floors.ts                  # KEEP: Existing
│       ├── estimatedSizes.ts          # KEEP: Existing
│       └── field-types.ts             # NEW: Field type registry
└── types/
    ├── form.ts                        # MODIFY: Add dynamic form types
    └── form-schema.ts                 # NEW: Form schema TypeScript types
```

---

## Schema Design

### New Convex Tables

```typescript
// convex/schema.ts - additions to existing schema

// Form definition (editable draft)
forms: defineTable({
  name: v.string(),                    // "Floor Lead Application"
  slug: v.string(),                    // "floor-lead-2024"
  description: v.optional(v.string()),
  status: v.union(
    v.literal("draft"),
    v.literal("published"),
    v.literal("archived")
  ),
  // Draft schema stored here (mutable)
  draftSchema: v.string(),             // JSON stringified FormSchema
  currentVersionId: v.optional(v.id("formVersions")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_status", ["status"]),

// Immutable version snapshot (created on publish)
formVersions: defineTable({
  formId: v.id("forms"),
  version: v.number(),                 // 1, 2, 3...
  schema: v.string(),                  // JSON stringified FormSchema (immutable)
  publishedAt: v.number(),
})
  .index("by_form", ["formId", "version"])
  .index("by_form_latest", ["formId", "publishedAt"]),

// Dynamic submissions (separate from legacy applications)
submissions: defineTable({
  formVersionId: v.id("formVersions"),
  data: v.string(),                    // JSON stringified response data
  status: v.union(
    v.literal("new"),
    v.literal("under_review"),
    v.literal("accepted"),
    v.literal("rejected")
  ),
  submittedAt: v.number(),
})
  .index("by_version", ["formVersionId"])
  .index("by_status", ["status"])
  .index("by_submitted", ["submittedAt"]),

// Edit history for submissions (mirrors existing editHistory pattern)
submissionEditHistory: defineTable({
  submissionId: v.id("submissions"),
  field: v.string(),
  oldValue: v.string(),
  newValue: v.string(),
  editedAt: v.number(),
})
  .index("by_submission", ["submissionId", "editedAt"]),

// File uploads linked to submissions
submissionFiles: defineTable({
  submissionId: v.id("submissions"),
  fieldId: v.string(),                 // Which field this file belongs to
  storageId: v.id("_storage"),         // Convex storage reference
  filename: v.string(),
  contentType: v.string(),
  size: v.number(),
  uploadedAt: v.number(),
})
  .index("by_submission", ["submissionId"])
  .index("by_field", ["submissionId", "fieldId"]),
```

### Form Schema TypeScript Types

```typescript
// src/types/form-schema.ts

export interface FormSchema {
  id: string;
  version: number;
  steps: FormStep[];
  settings: FormSettings;
}

export interface FormStep {
  id: string;                          // Unique step identifier
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormField {
  id: string;                          // Unique field identifier (used as form key)
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: FieldOption[];             // For select, radio, checkbox
  conditionalLogic?: ConditionalRule[];
  layout?: FieldLayout;
}

export type FieldType =
  | "text"
  | "email"
  | "url"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface ConditionalRule {
  fieldId: string;
  operator: "equals" | "notEquals" | "contains" | "isEmpty";
  value: string;
  action: "show" | "hide" | "require";
}

export interface FieldLayout {
  width: "full" | "half";
  order: number;
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  allowDraftSave: boolean;
  notifyOnSubmission: boolean;
}
```

### Why JSON String for Schema Storage

Convex has a 16-level nesting limit and 1MB document size limit. Storing schema as a JSON string:

1. **Avoids nesting limits** - Complex schemas with nested validation rules would hit limits
2. **Flexible structure** - Schema format can evolve without Convex migrations
3. **Matches pattern in codebase** - `submissions.data` is also stored as JSON string

Parse on read, stringify on write:

```typescript
// Reading
const schema: FormSchema = JSON.parse(formVersion.schema);

// Writing
await ctx.db.insert("formVersions", {
  formId,
  version: 1,
  schema: JSON.stringify(formSchema),
  publishedAt: Date.now(),
});
```

---

## Integration Patterns

### Pattern 1: StepContent Integration

**Current:** Switch statement routes to 8 hardcoded step components.

**Integration:** Add dynamic step handling while preserving legacy support.

```typescript
// StepContent.tsx modification

interface StepContentProps {
  step: number;
  schema?: FormSchema;           // NEW: Optional schema for dynamic forms
  isSubmitting?: boolean;
}

export function StepContent({ step, schema, isSubmitting = false }: StepContentProps) {
  // If schema provided, use dynamic rendering
  if (schema) {
    const stepSchema = schema.steps[step];
    if (stepSchema) {
      return (
        <motion.div key={step} {...animationProps}>
          <DynamicStep step={stepSchema} />
          <NavigationButtons isSubmitting={isSubmitting} step={step} />
        </motion.div>
      );
    }
  }

  // Fallback to legacy hardcoded steps (existing switch statement)
  switch (step) {
    case 0: return <WelcomeStep />;
    case 1: return <ApplicantInfoStep />;
    // ... existing cases preserved
  }
}
```

### Pattern 2: DynamicStep Component

**New component** that renders any step from schema.

```typescript
// src/components/form/DynamicStep.tsx

interface DynamicStepProps {
  step: FormStep;
}

export function DynamicStep({ step }: DynamicStepProps) {
  return (
    <div className="space-y-6">
      {/* Step header - matches existing step styling */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">{step.title}</h2>
        {step.description && (
          <p className="text-muted-foreground mt-2">{step.description}</p>
        )}
      </div>

      {/* Dynamic fields */}
      {step.fields.map((field) => (
        <DynamicField key={field.id} field={field} />
      ))}
    </div>
  );
}
```

### Pattern 3: DynamicField Component

**New component** that routes to correct field implementation.

```typescript
// src/components/form/DynamicField.tsx

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { FIELD_COMPONENTS } from "@/lib/constants/field-types";

interface DynamicFieldProps {
  field: FormField;
}

export function DynamicField({ field }: DynamicFieldProps) {
  const { register, formState: { errors } } = useFormContext();

  const FieldComponent = FIELD_COMPONENTS[field.type];
  const error = errors[field.id];

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={field.id}>
        {field.label}
        {!field.required && (
          <span className="text-muted-foreground font-normal"> (optional)</span>
        )}
      </FieldLabel>

      <FieldComponent
        id={field.id}
        {...register(field.id)}
        placeholder={field.placeholder}
        options={field.options}
        aria-invalid={!!error}
      />

      {field.description && (
        <FieldDescription>{field.description}</FieldDescription>
      )}
      <FieldError>{error?.message as string}</FieldError>
    </Field>
  );
}
```

### Pattern 4: Field Type Registry

**New constant** that maps field types to existing UI components.

```typescript
// src/lib/constants/field-types.ts

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FileUpload } from "@/components/form/fields/FileField";
import type { ComponentType } from "react";

export const FIELD_COMPONENTS: Record<string, ComponentType<any>> = {
  text: Input,
  email: (props) => <Input type="email" {...props} />,
  url: (props) => <Input type="url" {...props} />,
  date: (props) => <Input type="date" {...props} />,
  number: (props) => <Input type="number" {...props} />,
  textarea: Textarea,
  select: Select,           // Uses existing shadcn Select
  file: FileUpload,         // New component for file uploads
};

export const FIELD_INPUT_PROPS: Record<string, Record<string, any>> = {
  email: { type: "email" },
  url: { type: "url" },
  date: { type: "date" },
  number: { type: "number", inputMode: "numeric" },
};
```

### Pattern 5: Schema-to-Zod Generator

**New utility** that creates Zod validators from stored schema.

```typescript
// src/lib/schemas/schema-to-zod.ts

import { z } from "zod";
import type { FormField, FormSchema, FormStep } from "@/types/form-schema";

export function generateFormSchema(formSchema: FormSchema): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const step of formSchema.steps) {
    for (const field of step.fields) {
      shape[field.id] = generateFieldValidator(field);
    }
  }

  return z.object(shape);
}

export function generateStepSchema(step: FormStep): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of step.fields) {
    shape[field.id] = generateFieldValidator(field);
  }

  return z.object(shape);
}

function generateFieldValidator(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "email":
      schema = z.string().email(field.validation?.customMessage || "Invalid email");
      break;
    case "url":
      schema = z.string().url(field.validation?.customMessage || "Invalid URL");
      break;
    case "number":
      schema = z.coerce.number();
      if (field.validation?.min !== undefined) {
        schema = (schema as z.ZodNumber).min(field.validation.min);
      }
      if (field.validation?.max !== undefined) {
        schema = (schema as z.ZodNumber).max(field.validation.max);
      }
      break;
    case "file":
      schema = z.string(); // Storage ID reference
      break;
    default:
      schema = z.string();
      if (field.validation?.minLength) {
        schema = (schema as z.ZodString).min(
          field.validation.minLength,
          field.validation.customMessage || `Minimum ${field.validation.minLength} characters`
        );
      }
      if (field.validation?.maxLength) {
        schema = (schema as z.ZodString).max(
          field.validation.maxLength,
          `Maximum ${field.validation.maxLength} characters`
        );
      }
  }

  // Handle optional fields
  if (!field.required) {
    schema = schema.optional().or(z.literal(""));
  }

  return schema;
}

// Get field names for a step (for trigger() validation)
export function getStepFieldNames(step: FormStep): string[] {
  return step.fields.map((f) => f.id);
}
```

### Pattern 6: Form Store Modification

**Modify existing store** to be schema-agnostic.

```typescript
// src/lib/stores/form-store.ts - modifications

interface FormState {
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, unknown>;  // Changed from Partial<ApplicationFormData>
  schema: FormSchema | null;          // NEW: Current form schema
  isHydrated: boolean;

  // Existing actions
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  updateFormData: (data: Record<string, unknown>) => void;
  resetForm: () => void;
  setHydrated: (value: boolean) => void;

  // NEW actions
  setSchema: (schema: FormSchema) => void;
  getStepFields: (step: number) => string[];
  getTotalSteps: () => number;
}
```

### Pattern 7: File Upload Integration

**New component** for file field type using Convex storage.

```typescript
// src/components/form/fields/FileField.tsx

"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon } from "lucide-react";

interface FileFieldProps {
  id: string;
  onChange: (storageId: string) => void;
  value?: string;
}

export function FileField({ id, onChange, value }: FileFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // 2. Upload file directly to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Update form with storage ID
      onChange(storageId);
      setFilename(file.name);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        id={id}
        onChange={handleUpload}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
          <FileIcon className="h-4 w-4" />
          <span className="text-sm flex-1 truncate">{filename || "File uploaded"}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("");
              setFilename(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Choose file"}
        </Button>
      )}
    </div>
  );
}
```

### Pattern 8: ApplicationSheet Dynamic Sections

**Modify existing component** to read sections from schema.

```typescript
// src/components/admin/ApplicationSheet.tsx - modification pattern

interface ApplicationSheetProps {
  submission: Doc<"submissions">;
  schema: FormSchema;           // NEW: Pass schema for section rendering
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmissionSheet({
  submission,
  schema,
  open,
  onOpenChange,
}: ApplicationSheetProps) {
  // Parse submission data
  const data = JSON.parse(submission.data);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Submission Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4 py-4">
          <Section title="Status">
            <StatusDropdown
              submissionId={submission._id}
              currentStatus={submission.status}
            />
          </Section>

          <Separator />

          {/* Dynamic sections from schema */}
          {schema.steps.map((step) => (
            <React.Fragment key={step.id}>
              <Section title={step.title}>
                <div className="space-y-3">
                  {step.fields.map((field) => (
                    <EditableField
                      key={field.id}
                      submissionId={submission._id}
                      field={field.id}
                      label={field.label}
                      value={data[field.id]}
                      type={mapFieldTypeToEditable(field.type)}
                      options={field.options}
                      required={field.required}
                    />
                  ))}
                </div>
              </Section>
              <Separator />
            </React.Fragment>
          ))}

          {/* Edit History */}
          <SubmissionEditHistory submissionId={submission._id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Form Builder Architecture

### Overview

The form builder is an admin-only feature that provides drag-and-drop form editing.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FormBuilder.tsx                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────┐  ┌─────────────┐ │
│  │FieldPalette │  │      StepEditor         │  │PreviewPane  │ │
│  │             │  │  ┌─────────────────┐    │  │             │ │
│  │ [Text]      │  │  │ SortableField   │    │  │ (Live       │ │
│  │ [Email]     │  │  │ SortableField   │    │  │  preview)   │ │
│  │ [Select]    │  │  │ SortableField   │    │  │             │ │
│  │ [File]      │  │  └─────────────────┘    │  │             │ │
│  │ ...         │  │  [+ Add Field]          │  │             │ │
│  └─────────────┘  └─────────────────────────┘  └─────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     FieldEditor                             ││
│  │  [Label] [Type] [Required] [Placeholder] [Validation]       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Drag-and-Drop with @dnd-kit

Using `@dnd-kit` for sortable fields within steps.

```typescript
// src/components/admin/FormBuilder/StepEditor.tsx

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function StepEditor({ step, onUpdate }: StepEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = step.fields.findIndex((f) => f.id === active.id);
      const newIndex = step.fields.findIndex((f) => f.id === over.id);

      const newFields = arrayMove(step.fields, oldIndex, newIndex);
      onUpdate({ ...step, fields: newFields });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={step.fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        {step.fields.map((field) => (
          <SortableField key={field.id} field={field} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Builder State Management

```typescript
// src/lib/stores/builder-store.ts

import { create } from "zustand";
import type { FormSchema, FormStep, FormField } from "@/types/form-schema";

interface BuilderState {
  schema: FormSchema;
  selectedStepId: string | null;
  selectedFieldId: string | null;
  isDirty: boolean;

  // Step actions
  addStep: (step: FormStep) => void;
  updateStep: (stepId: string, updates: Partial<FormStep>) => void;
  removeStep: (stepId: string) => void;
  reorderSteps: (oldIndex: number, newIndex: number) => void;

  // Field actions
  addField: (stepId: string, field: FormField) => void;
  updateField: (stepId: string, fieldId: string, updates: Partial<FormField>) => void;
  removeField: (stepId: string, fieldId: string) => void;
  reorderFields: (stepId: string, oldIndex: number, newIndex: number) => void;

  // Selection
  selectStep: (stepId: string | null) => void;
  selectField: (fieldId: string | null) => void;

  // Persistence
  loadSchema: (schema: FormSchema) => void;
  resetDirty: () => void;
}
```

---

## Route Architecture

### New Routes

```
app/
├── apply/
│   ├── page.tsx                 # KEEP: Legacy form
│   └── [slug]/
│       └── page.tsx             # NEW: Dynamic form by slug
├── admin/
│   ├── page.tsx                 # MODIFY: Add form selector
│   ├── forms/
│   │   ├── page.tsx             # NEW: Form list
│   │   ├── new/
│   │   │   └── page.tsx         # NEW: Create form
│   │   └── [id]/
│   │       ├── page.tsx         # NEW: Form builder
│   │       └── submissions/
│   │           └── page.tsx     # NEW: Form submissions
```

### Legacy Form Preservation

The existing `/apply` route continues working with hardcoded form:

```typescript
// app/apply/page.tsx - unchanged
export default function ApplyPage() {
  return <MultiStepForm />;  // Uses legacy hardcoded steps
}
```

New dynamic forms use slug-based routing:

```typescript
// app/apply/[slug]/page.tsx - new
export default async function DynamicFormPage({
  params,
}: {
  params: { slug: string };
}) {
  // Server component fetches form
  const form = await fetchQuery(api.forms.getBySlug, { slug: params.slug });

  if (!form || form.status !== "published") {
    notFound();
  }

  const version = await fetchQuery(api.formVersions.getCurrent, {
    formId: form._id,
  });

  const schema = JSON.parse(version.schema) as FormSchema;

  return <DynamicMultiStepForm schema={schema} versionId={version._id} />;
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Schema in Component State Only

**What:** Loading schema into useState without persistence.
**Why bad:** Schema lost on page refresh, validation fails, draft restoration breaks.
**Instead:** Load via Convex query, cache in Zustand with localStorage.

### Anti-Pattern 2: Modifying Submissions When Schema Changes

**What:** Updating old submissions to match new schema structure.
**Why bad:** Loses historical accuracy, breaks audit trails, causes data loss.
**Instead:** Submissions reference immutable `formVersionId`; render using that version's schema.

### Anti-Pattern 3: Hardcoding Field IDs in Admin Components

**What:** `ApplicationSheet.tsx` directly referencing field names like `"fullName"`.
**Why bad:** Breaks when form schema changes.
**Instead:** Iterate over schema steps/fields dynamically.

### Anti-Pattern 4: Single Schema for All Submissions

**What:** Storing one "current" schema and applying to all submissions.
**Why bad:** Old submissions rendered incorrectly when schema changes.
**Instead:** Each submission references specific `formVersionId` (immutable snapshot).

### Anti-Pattern 5: Deeply Nested Schema in Convex

**What:** Storing schema as nested Convex objects.
**Why bad:** Hits 16-level nesting limit with complex forms.
**Instead:** Store as JSON string, parse on read.

---

## Build Order Recommendation

Based on dependencies and integration with existing architecture:

```
Phase 1: Schema Foundation                    [No breaking changes]
├── Add new Convex tables (forms, formVersions, submissions)
├── Create FormSchema TypeScript types
├── Build schema-to-zod.ts generator
└── Test with hardcoded schema matching current form

Phase 2: Dynamic Renderer                     [Additive, no breaks]
├── Create DynamicStep.tsx component
├── Create DynamicField.tsx component
├── Create field type registry
├── Modify StepContent.tsx (add schema prop, preserve fallback)
└── Test with hardcoded schema

Phase 3: File Upload Support                  [New capability]
├── Create FileField.tsx component
├── Add files.ts Convex functions (generateUploadUrl, saveFile)
├── Add submissionFiles table
└── Test file upload flow

Phase 4: Form Builder                         [Admin-only feature]
├── Install @dnd-kit packages
├── Create builder-store.ts
├── Build FormBuilder.tsx and sub-components
├── Create /admin/forms routes
└── Test form creation and editing

Phase 5: Submission Pipeline                  [New data flow]
├── Create submissions.ts Convex functions
├── Build /apply/[slug] route
├── Create DynamicMultiStepForm wrapper
├── Test end-to-end submission

Phase 6: Admin Updates                        [Modifies existing]
├── Create SubmissionSheet.tsx (dynamic version)
├── Modify admin dashboard to show form selector
├── Add submission list for each form
└── Test admin workflow
```

### Phase Dependencies

```
Phase 1 ──────> Phase 2 ──────> Phase 5
    │               │
    │               v
    │          Phase 3
    │
    └────────> Phase 4

Phase 2 + 5 ──> Phase 6
```

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Drag-and-drop | `@dnd-kit` | Lightweight, React-native, excellent sortable preset |
| Schema storage | JSON string in Convex | Avoids 16-level nesting limit, flexible structure |
| Validation | Runtime Zod generation | Consistent with existing react-hook-form + Zod pattern |
| File storage | Convex native storage | Already in stack, upload URL method handles large files |
| State management | Extend existing Zustand store | Maintains draft persistence pattern |
| New routes | Parallel to existing | Preserves `/apply` for legacy, adds `/apply/[slug]` |

---

## Sources

**HIGH Confidence (Official Documentation):**
- [Convex Schema Philosophy](https://docs.convex.dev/database/advanced/schema-philosophy)
- [Convex Data Types](https://docs.convex.dev/database/types) - 16-level nesting limit, 1MB document size
- [Convex File Upload](https://docs.convex.dev/file-storage/upload-files) - Upload URL method
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [dnd-kit Documentation](https://docs.dndkit.com) - Sortable preset

**MEDIUM Confidence (Verified Tutorials):**
- [Schema-Driven Dynamic Forms](https://medium.com/hike-medical/scaling-clinical-workflows-with-schema-driven-dynamic-forms-091f89cc730f)
- [Next.js + Shadcn Dynamic Form Builder](https://github.com/ansyg/nextjs-shadcn-dynamic-form)
- [MongoDB Schema Versioning](https://www.mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/schema-versioning/) - Immutable version pattern
- [Top Drag-and-Drop Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
