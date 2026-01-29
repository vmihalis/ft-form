# Phase 13: Dynamic Form Renderer - Research

**Researched:** 2026-01-29
**Domain:** React dynamic form rendering with Typeform-style UX
**Confidence:** HIGH

## Summary

Phase 13 transforms the existing hardcoded apply form into a dynamic renderer that can display any form schema from the database. The existing codebase provides a strong foundation: a complete Typeform-style multi-step form with react-hook-form, Zustand persistence, animated transitions, and comprehensive UI components. The schema system from Phase 11 and file upload infrastructure from Phase 12 are already in place.

The primary challenge is adapting the existing step-by-step architecture to work with dynamic field counts and types rather than hardcoded step components. The form schema already defines steps with fields, and the existing component patterns (Field, FieldLabel, FieldError, etc.) can be reused directly.

**Primary recommendation:** Create a DynamicFormRenderer component that mirrors the existing MultiStepForm structure but generates field components from schema configuration. Reuse existing UI primitives and create a field type registry that maps schema field types to renderer components.

## Existing Implementation Analysis

### Current Architecture (Hardcoded Form)

The existing `/apply` page uses this structure:

```
src/app/apply/page.tsx
  -> StoreHydration (localStorage restoration)
  -> MultiStepForm
     -> react-hook-form FormProvider
     -> ProgressIndicator
     -> StepContent
        -> [Step Component] (WelcomeStep, ApplicantInfoStep, etc.)
        -> NavigationButtons
```

**Key components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| MultiStepForm | `src/components/form/MultiStepForm.tsx` | Form container with react-hook-form, Zustand sync, submit handler |
| StepContent | `src/components/form/StepContent.tsx` | Routes to step components, handles animations |
| NavigationButtons | `src/components/form/NavigationButtons.tsx` | Back/Next with per-step validation |
| ProgressIndicator | `src/components/form/ProgressIndicator.tsx` | Horizontal step dots |
| form-store | `src/lib/stores/form-store.ts` | Zustand store with localStorage persistence |

**Navigation flow:**
1. Welcome (step 0) - No form fields, "Begin" button
2. Steps 1-5 - Form fields with validation on Next
3. Review (step 6) - Read-only summary with Edit buttons
4. Confirmation (step 7) - Success message

### Existing UI Components (Reusable)

All form UI primitives exist and should be reused:

| Component | Location | Maps to Field Type |
|-----------|----------|-------------------|
| Input | `src/components/ui/input.tsx` | text, email, url, number, date |
| Textarea | `src/components/ui/textarea.tsx` | textarea |
| Select | `src/components/ui/select.tsx` | select (dropdown) |
| FileField | `src/components/form/fields/FileField.tsx` | file |
| Field, FieldLabel, FieldDescription, FieldError | `src/components/ui/field.tsx` | All (wrapper) |
| Button | `src/components/ui/button.tsx` | Navigation |

**Note:** No dedicated checkbox component exists - needs to be created or use native input with styling.

### Current Validation Pattern

The existing form uses Zod schemas defined in `src/lib/schemas/application.ts`:

```typescript
// Per-step schemas
export const applicantInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  // ...
});

// Field arrays for trigger() validation
export const stepFields: (string[] | null)[] = [
  null, // Welcome
  ["fullName", "email", "linkedIn", "role", "bio"], // Step 1
  // ...
];
```

Navigation uses `trigger(stepFields[currentStep])` to validate only current step fields before advancing.

## Schema and Types Analysis

### FormSchema Type (from Phase 11)

Location: `src/types/form-schema.ts`

```typescript
interface FormSchema {
  steps: FormStep[];
  settings: FormSettings;
}

interface FormStep {
  id: string;           // "step_1"
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  id: string;           // Key for responses
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: FieldOption[];  // For select, radio, checkbox
}

type FieldType = "text" | "email" | "url" | "textarea" | "number" | "date" | "select" | "radio" | "checkbox" | "file";

interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;           // For number
  max?: number;           // For number
  pattern?: string;       // Regex
  customMessage?: string;
}
```

### Convex Query for Form by Slug

Already exists in `convex/forms.ts`:

```typescript
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!form || form.status !== "published") return null;
    if (!form.currentVersionId) return null;

    const version = await ctx.db.get(form.currentVersionId);
    if (!version) return null;

    return {
      formId: form._id,
      formName: form.name,
      versionId: version._id,
      version: version.version,
      schema: JSON.parse(version.schema),  // Already parsed!
    };
  },
});
```

### Submission Mutation

Already exists in `convex/submissions.ts`:

```typescript
export const submit = mutation({
  args: {
    formVersionId: v.id("formVersions"),
    data: v.string(),  // JSON.stringify({ [fieldId]: value })
  },
  handler: async (ctx, args) => {
    // Validates version exists and form not archived
    return await ctx.db.insert("submissions", {
      formVersionId: args.formVersionId,
      data: args.data,
      status: "new",
      submittedAt: Date.now(),
    });
  },
});
```

## Routing Approach

### Current Structure

```
src/app/
  apply/
    page.tsx           # Hardcoded form at /apply
  admin/
    page.tsx
    login/
      page.tsx
```

### Recommended New Structure

```
src/app/
  apply/
    page.tsx                    # KEEP: Legacy hardcoded form at /apply
    [slug]/
      page.tsx                  # NEW: Dynamic forms at /apply/[slug]
```

**Why keep /apply?**
- Backward compatibility for existing links
- `/apply` is reserved in `RESERVED_SLUGS` so no collision possible
- Legacy form continues working while dynamic forms roll out

### Dynamic Route Implementation

```typescript
// src/app/apply/[slug]/page.tsx
import { DynamicFormPage } from "@/components/dynamic-form/DynamicFormPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <DynamicFormPage slug={slug} />;
}
```

## Field Components Inventory

### What Exists (Reuse)

| Field Type | Component | Notes |
|------------|-----------|-------|
| text | `<Input type="text" />` | Direct reuse |
| email | `<Input type="email" />` | Direct reuse |
| url | `<Input type="url" />` | Direct reuse |
| textarea | `<Textarea />` | Direct reuse |
| number | `<Input type="number" />` | Direct reuse |
| date | `<Input type="date" />` | Uses native date picker (current approach in LogisticsStep) |
| select | `<Select>` with Radix | Exists, used in ProposalStep |
| file | `<FileField />` | From Phase 12, immediate upload pattern |

### What Needs to Be Built

| Field Type | Component Needed | Complexity |
|------------|------------------|------------|
| checkbox | `<CheckboxField />` | LOW - native input or Radix checkbox |
| radio | `<RadioField />` | LOW - similar to checkbox group |

### Field Renderer Registry Pattern

```typescript
// src/components/dynamic-form/field-renderers.tsx
const fieldRenderers: Record<FieldType, FieldRenderer> = {
  text: TextFieldRenderer,
  email: EmailFieldRenderer,
  url: UrlFieldRenderer,
  textarea: TextareaFieldRenderer,
  number: NumberFieldRenderer,
  date: DateFieldRenderer,
  select: SelectFieldRenderer,
  checkbox: CheckboxFieldRenderer,
  radio: RadioFieldRenderer,
  file: FileFieldRenderer,
};

export function renderField(field: FormField, props: FieldRenderProps) {
  const Renderer = fieldRenderers[field.type];
  return <Renderer field={field} {...props} />;
}
```

## Validation Approach

### Dynamic Zod Schema Generation

The schema configuration contains all validation info. Generate Zod schema at runtime:

```typescript
// src/lib/schemas/dynamic-form.ts
import { z, ZodSchema } from "zod";
import type { FormField, FormSchema } from "@/types/form-schema";

export function buildFieldSchema(field: FormField): ZodSchema {
  let schema: ZodSchema;

  switch (field.type) {
    case "text":
    case "textarea":
    case "url":
      schema = z.string();
      if (field.validation?.minLength) {
        schema = (schema as z.ZodString).min(field.validation.minLength);
      }
      if (field.validation?.maxLength) {
        schema = (schema as z.ZodString).max(field.validation.maxLength);
      }
      if (field.validation?.pattern) {
        schema = (schema as z.ZodString).regex(new RegExp(field.validation.pattern));
      }
      break;

    case "email":
      schema = z.string().email(field.validation?.customMessage || "Invalid email");
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

    case "date":
      schema = z.string().min(1, "Date is required");
      break;

    case "select":
    case "radio":
      const values = field.options?.map(o => o.value) || [];
      schema = z.enum(values as [string, ...string[]]);
      break;

    case "checkbox":
      schema = z.boolean();
      break;

    case "file":
      // File fields store Id<"_storage"> string
      schema = z.string();
      break;

    default:
      schema = z.string();
  }

  // Make optional if not required
  if (!field.required) {
    schema = schema.optional().or(z.literal(""));
  }

  return schema;
}

export function buildFormSchema(formSchema: FormSchema): ZodSchema {
  const shape: Record<string, ZodSchema> = {};

  for (const step of formSchema.steps) {
    for (const field of step.fields) {
      shape[field.id] = buildFieldSchema(field);
    }
  }

  return z.object(shape);
}
```

### Per-Step Field Arrays for Navigation

```typescript
export function getStepFieldIds(formSchema: FormSchema, stepIndex: number): string[] {
  const step = formSchema.steps[stepIndex];
  return step?.fields.map(f => f.id) || [];
}
```

## Standard Stack

### Core (Already in Project)

| Library | Version | Purpose |
|---------|---------|---------|
| react-hook-form | 7.71.1 | Form state management |
| @hookform/resolvers | 5.2.2 | Zod integration |
| zod | 4.3.6 | Validation |
| zustand | 5.0.10 | Form progress/draft persistence |
| motion | 12.29.2 | Step transitions |
| @radix-ui/react-select | 2.2.6 | Dropdown |
| react-dropzone | 14.3.8 | File upload (Phase 12) |
| lucide-react | 0.563.0 | Icons |

### No New Dependencies Required

All necessary libraries are already installed.

## Architecture Patterns

### Pattern 1: Dynamic Form Container

Mirrors MultiStepForm but with schema-driven content:

```typescript
// src/components/dynamic-form/DynamicFormRenderer.tsx
export function DynamicFormRenderer({
  schema,
  versionId,
  formName
}: DynamicFormRendererProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const submitMutation = useMutation(api.submissions.submit);

  // +1 for welcome, +1 for review, +1 for confirmation
  const totalSteps = schema.steps.length + 3;
  const isWelcome = currentStep === 0;
  const isConfirmation = currentStep === totalSteps - 1;
  const isReview = currentStep === totalSteps - 2;
  const contentStepIndex = currentStep - 1; // Maps to schema.steps

  const zodSchema = useMemo(() => buildFormSchema(schema), [schema]);
  const methods = useForm({
    resolver: zodResolver(zodSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    await submitMutation({
      formVersionId: versionId,
      data: JSON.stringify(data),
    });
    setCurrentStep(totalSteps - 1); // Confirmation
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <DynamicProgressIndicator
          currentStep={currentStep}
          totalSteps={schema.steps.length}
        />
        <DynamicStepContent
          schema={schema}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        <DynamicNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepFieldIds={getStepFieldIds(schema, contentStepIndex)}
          onNext={() => setCurrentStep(s => s + 1)}
          onBack={() => setCurrentStep(s => s - 1)}
        />
      </form>
    </FormProvider>
  );
}
```

### Pattern 2: Field Type Registry

```typescript
// src/components/dynamic-form/fields/index.tsx
import type { FormField } from "@/types/form-schema";
import { Control } from "react-hook-form";

interface FieldRenderProps {
  field: FormField;
  control: Control;
  error?: string;
}

export function DynamicField({ field, control, error }: FieldRenderProps) {
  switch (field.type) {
    case "text":
    case "url":
      return <TextField field={field} control={control} error={error} />;
    case "email":
      return <EmailField field={field} control={control} error={error} />;
    case "textarea":
      return <TextareaField field={field} control={control} error={error} />;
    case "number":
      return <NumberField field={field} control={control} error={error} />;
    case "date":
      return <DateField field={field} control={control} error={error} />;
    case "select":
      return <SelectField field={field} control={control} error={error} />;
    case "checkbox":
      return <CheckboxField field={field} control={control} error={error} />;
    case "radio":
      return <RadioField field={field} control={control} error={error} />;
    case "file":
      return <FileUploadField field={field} control={control} error={error} />;
    default:
      return <TextField field={field} control={control} error={error} />;
  }
}
```

### Pattern 3: Dynamic Step Rendering

```typescript
// src/components/dynamic-form/DynamicStepContent.tsx
export function DynamicStepContent({
  schema,
  currentStep,
  totalSteps
}: DynamicStepContentProps) {
  const isWelcome = currentStep === 0;
  const isReview = currentStep === totalSteps - 2;
  const isConfirmation = currentStep === totalSteps - 1;
  const contentStepIndex = currentStep - 1;

  if (isWelcome) {
    return <DynamicWelcome formName={schema.settings.formName} />;
  }

  if (isReview) {
    return <DynamicReview schema={schema} />;
  }

  if (isConfirmation) {
    return <DynamicConfirmation message={schema.settings.successMessage} />;
  }

  const step = schema.steps[contentStepIndex];
  return (
    <div className="space-y-6">
      <StepHeader title={step.title} description={step.description} />
      {step.fields.map(field => (
        <DynamicField key={field.id} field={field} />
      ))}
    </div>
  );
}
```

### Pattern 4: Form Draft Persistence

Similar to existing Zustand store but keyed by form slug:

```typescript
// src/lib/stores/dynamic-form-store.ts
interface DynamicFormState {
  drafts: Record<string, {  // keyed by slug
    currentStep: number;
    formData: Record<string, unknown>;
  }>;
  getDraft: (slug: string) => { currentStep: number; formData: Record<string, unknown> } | null;
  setDraft: (slug: string, step: number, data: Record<string, unknown>) => void;
  clearDraft: (slug: string) => void;
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom state machine | react-hook-form | Already integrated, handles validation |
| Validation | Manual field checking | Zod + zodResolver | Type-safe, composable |
| Step transitions | CSS transitions | motion (framer-motion) | Already used, smooth animations |
| File upload | Custom upload logic | FileField + useFileUpload | Phase 12 provides this |
| Dropdown | Custom select | Radix Select | Accessibility, keyboard nav |
| Progress persistence | Manual localStorage | Zustand persist middleware | Already proven pattern |

## Common Pitfalls

### Pitfall 1: Schema Mismatch After Publish

**What goes wrong:** User starts form with version N, admin publishes version N+1, user submits against wrong schema.
**Why it happens:** Dynamic route fetches latest version on each render.
**How to avoid:** Capture versionId at form start, use that versionId for submission regardless of subsequent publishes.
**Warning signs:** Submission data has fields not in version schema.

### Pitfall 2: File Upload Orphans

**What goes wrong:** User uploads file, abandons form, file never associated with submission.
**Why it happens:** Files upload immediately (Phase 12 pattern) before form submit.
**How to avoid:** Phase 12 implemented cleanup cron. Ensure storageId stored in submission data links file to submission.
**Warning signs:** Storage usage grows without corresponding submissions.

### Pitfall 3: Validation Timing

**What goes wrong:** User gets errors on required fields when navigating back then forward.
**Why it happens:** Eager validation (`mode: "onChange"`) shows errors immediately.
**How to avoid:** Use `mode: "onSubmit"` or `mode: "onTouched"`. Only validate on step navigation.
**Warning signs:** Error messages flash when user hasn't interacted with field.

### Pitfall 4: Number Field Coercion

**What goes wrong:** Number fields submit as strings, validation fails.
**Why it happens:** HTML inputs always produce strings.
**How to avoid:** Use `z.coerce.number()` in schema generation.
**Warning signs:** Type errors on number comparisons, NaN values.

### Pitfall 5: Checkbox Required Handling

**What goes wrong:** Required checkbox validates as invalid even when unchecked is intentional.
**Why it happens:** `z.boolean()` accepts false, but required checkbox means must be true.
**How to avoid:** For required checkboxes, use `z.literal(true)` with custom message.
**Warning signs:** User can't submit form even though "I agree" checkbox exists.

### Pitfall 6: Empty Select/Radio Values

**What goes wrong:** Select shows placeholder but submits empty string.
**Why it happens:** No default value, placeholder isn't a valid option.
**How to avoid:** Required selects need explicit "Please select" prompt as non-value, validation catches empty.
**Warning signs:** Submissions have "" for required select fields.

## Code Examples

### Dynamic Field Renderer (Text)

```typescript
// src/components/dynamic-form/fields/TextField.tsx
import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormField } from "@/types/form-schema";

interface TextFieldProps {
  field: FormField;
}

export function TextField({ field }: TextFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message as string | undefined;

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={field.id}>
        {field.label}
        {!field.required && (
          <span className="text-muted-foreground font-normal"> (optional)</span>
        )}
      </FieldLabel>
      <Input
        id={field.id}
        type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
        {...register(field.id)}
        placeholder={field.placeholder}
        aria-invalid={!!error}
      />
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
```

### Dynamic Select Field

```typescript
// src/components/dynamic-form/fields/SelectField.tsx
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormField } from "@/types/form-schema";

interface SelectFieldProps {
  field: FormField;
}

export function SelectField({ field }: SelectFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message as string | undefined;

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
      <Controller
        name={field.id}
        control={control}
        render={({ field: rhfField }) => (
          <Select onValueChange={rhfField.onChange} value={rhfField.value || ""}>
            <SelectTrigger id={field.id} aria-invalid={!!error}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
```

### Dynamic File Upload Field

```typescript
// src/components/dynamic-form/fields/FileUploadField.tsx
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { FileField } from "@/components/form/fields/FileField";
import type { FormField } from "@/types/form-schema";
import type { Id } from "@/../convex/_generated/dataModel";

interface FileUploadFieldProps {
  field: FormField;
}

export function FileUploadField({ field }: FileUploadFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message as string | undefined;

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhfField }) => (
        <FileField
          value={rhfField.value as Id<"_storage"> | null}
          onChange={rhfField.onChange}
          label={field.label}
          description={field.description}
        />
      )}
    />
  );
}
```

### Navigation with Per-Step Validation

```typescript
// src/components/dynamic-form/DynamicNavigation.tsx
interface DynamicNavigationProps {
  currentStep: number;
  totalSteps: number;
  stepFieldIds: string[];
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function DynamicNavigation({
  currentStep,
  totalSteps,
  stepFieldIds,
  onNext,
  onBack,
  isSubmitting,
}: DynamicNavigationProps) {
  const { trigger } = useFormContext();

  const isWelcome = currentStep === 0;
  const isReview = currentStep === totalSteps - 2;
  const isConfirmation = currentStep === totalSteps - 1;

  if (isConfirmation) return null;

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Validate current step fields
    if (stepFieldIds.length > 0) {
      const isValid = await trigger(stepFieldIds);
      if (!isValid) return;
    }

    onNext();
  };

  return (
    <div className={`flex gap-4 pt-6 ${isWelcome ? "justify-center" : "justify-between"}`}>
      {!isWelcome && (
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
      )}

      {isReview ? (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      ) : (
        <Button type="button" onClick={handleNext}>
          {isWelcome ? "Begin" : "Next"}
        </Button>
      )}
    </div>
  );
}
```

## Key Decisions for Planning

### Decision 1: Step Structure

**Options:**
- A) Welcome -> Content Steps -> Review -> Confirmation (matches existing)
- B) Content Steps only (no welcome/review/confirmation)
- C) Configurable via schema.settings

**Recommendation:** Option A - maintains Typeform-style UX consistency, existing patterns work.

### Decision 2: Form Draft Persistence

**Options:**
- A) Single Zustand store for all dynamic forms (keyed by slug)
- B) Separate localStorage keys per form
- C) No persistence for dynamic forms

**Recommendation:** Option A - proven pattern, single source of truth.

### Decision 3: Review Step Generation

**Options:**
- A) Auto-generate review from schema (generic)
- B) Schema-defined review sections
- C) Skip review step for dynamic forms

**Recommendation:** Option A - automatic, consistent, less schema complexity.

### Decision 4: File Field Storage in Data

**Options:**
- A) Store `Id<"_storage">` string directly in data JSON
- B) Separate files array in submission
- C) Store file URL instead of storageId

**Recommendation:** Option A - matches schema pattern, storageId is permanent reference.

## File Organization

Recommended new files for Phase 13:

```
src/
  app/
    apply/
      [slug]/
        page.tsx                         # Dynamic route entry
  components/
    dynamic-form/
      DynamicFormPage.tsx                # Container with data fetching
      DynamicFormRenderer.tsx            # Form logic (mirrors MultiStepForm)
      DynamicStepContent.tsx             # Step routing (mirrors StepContent)
      DynamicNavigation.tsx              # Navigation (mirrors NavigationButtons)
      DynamicProgressIndicator.tsx       # Progress dots
      DynamicWelcome.tsx                 # Generic welcome
      DynamicReview.tsx                  # Auto-generated review
      DynamicConfirmation.tsx            # Success message
      fields/
        index.tsx                        # Field type router
        TextField.tsx
        TextareaField.tsx
        NumberField.tsx
        DateField.tsx
        SelectField.tsx
        CheckboxField.tsx
        RadioField.tsx
        FileUploadField.tsx
  lib/
    schemas/
      dynamic-form.ts                    # Schema -> Zod conversion
    stores/
      dynamic-form-store.ts              # Draft persistence by slug
```

## Open Questions

1. **Welcome Step Customization**
   - What we know: FormSettings has submitButtonText and successMessage
   - What's unclear: Should welcome step have configurable text?
   - Recommendation: Add optional welcomeTitle and welcomeDescription to FormSettings in future phase

2. **Progress Indicator Style**
   - What we know: Current form shows steps 1-6 as numbered dots
   - What's unclear: Dynamic forms may have different step counts
   - Recommendation: Adapt existing ProgressIndicator to use schema.steps.length

3. **Error Boundary for Invalid Schemas**
   - What we know: getBySlug returns null for non-existent/unpublished forms
   - What's unclear: What UI to show for invalid schema JSON
   - Recommendation: Wrap in try-catch, show generic error for parse failures

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis (all files read above)
- Phase 11 RESEARCH.md - Schema foundation decisions
- Phase 12 PLAN.md - FileField component interface

### Secondary (MEDIUM confidence)
- react-hook-form documentation - Dynamic form patterns
- Zod documentation - Schema composition

## Metadata

**Confidence breakdown:**
- Existing implementation: HIGH - Direct codebase analysis
- Schema integration: HIGH - Types and Convex queries already exist
- Field renderers: HIGH - UI components already exist, just need wrappers
- Validation: HIGH - Zod already in use, pattern is clear
- File upload: HIGH - FileField from Phase 12 ready to use

**Research date:** 2026-01-29
**Valid until:** 60 days (stable patterns, no external dependencies changing)
