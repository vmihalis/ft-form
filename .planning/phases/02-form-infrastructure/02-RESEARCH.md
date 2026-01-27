# Phase 2: Form Infrastructure - Research

**Researched:** 2026-01-27
**Domain:** Multi-step form state management, validation, and persistence
**Confidence:** HIGH

## Summary

Phase 2 establishes the invisible infrastructure that powers the Typeform-style multi-step form. The core challenge is managing form state across multiple steps while providing per-step validation, localStorage persistence, and seamless navigation. The solution combines React Hook Form for field-level state management, Zod for schema-based validation, and Zustand for cross-step state persistence.

The key architectural insight is that React Hook Form handles individual field state and validation, while Zustand manages the step navigation and localStorage persistence. This separation of concerns keeps each tool doing what it does best. The `FormProvider` + `useFormContext` pattern from React Hook Form allows step components to access form methods without prop drilling.

**Primary recommendation:** Use React Hook Form with FormProvider wrapping all steps, Zod schemas per step for validation, and Zustand with persist middleware for localStorage. Handle Next.js SSR hydration using `skipHydration: true` and manual rehydration in useEffect.

## Standard Stack

The established libraries/tools for form infrastructure:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.54.x | Form state management, validation orchestration | Minimal re-renders, TypeScript-native, field-level control |
| @hookform/resolvers | ^3.10.x | Connect Zod to React Hook Form | Official bridge, zodResolver function |
| zod | ^3.24.x | Schema validation with TypeScript inference | Type-safe, composable schemas, great error messages |
| zustand | ^5.0.x | Cross-step state, localStorage persistence | Lightweight (1.2kb), persist middleware built-in, React 19 compatible |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | (already installed) | Icons for progress indicator | Step completion checkmarks, navigation arrows |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | React Context | Context causes re-renders on all state changes; Zustand has fine-grained subscriptions |
| Zustand | little-state-machine | Zustand has better TypeScript support and larger ecosystem |
| Zod | Yup | Zod has better TypeScript inference and is more actively maintained |

**Installation:**

```bash
npm install react-hook-form @hookform/resolvers zod zustand
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── apply/
│       └── page.tsx              # Multi-step form page (client component)
├── components/
│   └── form/
│       ├── MultiStepForm.tsx     # Main form container with FormProvider
│       ├── ProgressIndicator.tsx # Step progress display
│       ├── NavigationButtons.tsx # Back/Next/Submit buttons
│       └── steps/                # Individual step components
│           ├── WelcomeStep.tsx
│           ├── ApplicantInfoStep.tsx
│           ├── ProposalStep.tsx
│           ├── RoadmapStep.tsx
│           ├── ImpactStep.tsx
│           ├── LogisticsStep.tsx
│           ├── ReviewStep.tsx
│           └── ConfirmationStep.tsx
├── lib/
│   ├── schemas/
│   │   └── application.ts        # Zod schemas per step + combined
│   └── stores/
│       └── form-store.ts         # Zustand store for step navigation + persistence
└── types/
    └── form.ts                   # TypeScript types for form data
```

### Pattern 1: FormProvider + useFormContext for Multi-Step Forms

**What:** Single form instance shared across all steps via React Context
**When to use:** Always for multi-step forms where steps share data
**Example:**

```typescript
// src/components/form/MultiStepForm.tsx
"use client";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { combinedApplicationSchema, type ApplicationFormData } from "@/lib/schemas/application";
import { useFormStore } from "@/lib/stores/form-store";

export function MultiStepForm() {
  const { currentStep, formData } = useFormStore();

  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(combinedApplicationSchema),
    defaultValues: formData,
    mode: "onSubmit", // Validate only on step navigation
  });

  return (
    <FormProvider {...methods}>
      <form>
        {/* Step content rendered based on currentStep */}
        <ProgressIndicator />
        <StepContent step={currentStep} />
        <NavigationButtons />
      </form>
    </FormProvider>
  );
}
```

```typescript
// src/components/form/steps/ApplicantInfoStep.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ApplicationFormData } from "@/lib/schemas/application";

export function ApplicantInfoStep() {
  const { register, formState: { errors } } = useFormContext<ApplicationFormData>();

  return (
    <div>
      <input {...register("fullName")} />
      {errors.fullName && <span>{errors.fullName.message}</span>}
      {/* More fields... */}
    </div>
  );
}
```

### Pattern 2: Per-Step Zod Schemas with Combined Schema

**What:** Separate validation schemas for each step, merged into one master schema
**When to use:** For per-step validation before allowing navigation
**Example:**

```typescript
// src/lib/schemas/application.ts
import { z } from "zod";

// Step 1: Applicant Info
export const applicantInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  linkedIn: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  role: z.string().min(1, "Current role is required"),
  bio: z.string().min(50, "Please write at least 50 characters about yourself"),
});

// Step 2: Proposal
export const proposalSchema = z.object({
  floor: z.string().min(1, "Please select a floor"),
  floorOther: z.string().optional(),
  initiativeName: z.string().min(1, "Initiative name is required"),
  tagline: z.string().min(1, "Tagline is required").max(100, "Keep tagline under 100 characters"),
  values: z.string().min(20, "Please describe your values"),
  targetCommunity: z.string().min(20, "Please describe your target community"),
  estimatedSize: z.string().min(1, "Please estimate community size"),
});

// Step 3: Roadmap
export const roadmapSchema = z.object({
  phase1Mvp: z.string().min(50, "Please provide more detail about Phase 1"),
  phase2Expansion: z.string().min(50, "Please provide more detail about Phase 2"),
  phase3LongTerm: z.string().min(50, "Please provide more detail about Phase 3"),
});

// Step 4: Impact
export const impactSchema = z.object({
  benefitToFT: z.string().min(50, "Please describe the benefit to FT members"),
});

// Step 5: Logistics
export const logisticsSchema = z.object({
  existingCommunity: z.string().min(1, "Please describe your existing community"),
  spaceNeeds: z.string().min(1, "Please describe your space needs"),
  startDate: z.string().min(1, "Please provide a target start date"),
  additionalNotes: z.string().optional(),
});

// Combined schema for full form validation
export const combinedApplicationSchema = applicantInfoSchema
  .merge(proposalSchema)
  .merge(roadmapSchema)
  .merge(impactSchema)
  .merge(logisticsSchema);

export type ApplicationFormData = z.infer<typeof combinedApplicationSchema>;

// Step schemas array for per-step validation
export const stepSchemas = [
  null, // Step 0: Welcome (no validation)
  applicantInfoSchema,
  proposalSchema,
  roadmapSchema,
  impactSchema,
  logisticsSchema,
  null, // Step 6: Review (no validation, display only)
  null, // Step 7: Confirmation (post-submit)
];

// Field names per step for trigger() validation
export const stepFields: (keyof ApplicationFormData)[][] = [
  [], // Welcome
  ["fullName", "email", "linkedIn", "role", "bio"],
  ["floor", "floorOther", "initiativeName", "tagline", "values", "targetCommunity", "estimatedSize"],
  ["phase1Mvp", "phase2Expansion", "phase3LongTerm"],
  ["benefitToFT"],
  ["existingCommunity", "spaceNeeds", "startDate", "additionalNotes"],
  [], // Review
  [], // Confirmation
];
```

### Pattern 3: Zustand Store with Persist Middleware for Next.js

**What:** Step navigation state + form data persistence with SSR-safe hydration
**When to use:** For localStorage persistence that survives page refresh
**Example:**

```typescript
// src/lib/stores/form-store.ts
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApplicationFormData } from "@/lib/schemas/application";

interface FormStore {
  // Navigation state
  currentStep: number;
  completedSteps: number[];

  // Form data (synced with React Hook Form)
  formData: Partial<ApplicationFormData>;

  // Actions
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  resetForm: () => void;
}

const initialState = {
  currentStep: 0,
  completedSteps: [],
  formData: {},
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepCompleted: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      resetForm: () => set(initialState),
    }),
    {
      name: "ft-form-draft",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // Critical for Next.js SSR
    }
  )
);
```

```typescript
// src/components/form/StoreHydration.tsx
"use client";
import { useEffect } from "react";
import { useFormStore } from "@/lib/stores/form-store";

export function StoreHydration() {
  useEffect(() => {
    useFormStore.persist.rehydrate();
  }, []);

  return null;
}
```

```typescript
// src/app/apply/page.tsx
"use client";
import { MultiStepForm } from "@/components/form/MultiStepForm";
import { StoreHydration } from "@/components/form/StoreHydration";

export default function ApplyPage() {
  return (
    <>
      <StoreHydration />
      <MultiStepForm />
    </>
  );
}
```

### Pattern 4: Step Navigation with Conditional Validation

**What:** Next button validates, Back button skips validation
**When to use:** All multi-step forms with per-step validation
**Example:**

```typescript
// src/components/form/NavigationButtons.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { useFormStore } from "@/lib/stores/form-store";
import { stepFields, stepSchemas } from "@/lib/schemas/application";
import { Button } from "@/components/ui/button";

export function NavigationButtons() {
  const { trigger, getValues } = useFormContext();
  const { currentStep, setCurrentStep, markStepCompleted, updateFormData } = useFormStore();

  const totalSteps = 8; // 0-7
  const isFirstStep = currentStep === 0;
  const isLastFormStep = currentStep === 5; // Logistics is last input step
  const isReviewStep = currentStep === 6;
  const isConfirmationStep = currentStep === 7;

  const handleNext = async () => {
    // Validate current step fields
    const fieldsToValidate = stepFields[currentStep];

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return; // Stop if validation fails
    }

    // Save form data to Zustand (for persistence)
    const currentValues = getValues();
    updateFormData(currentValues);
    markStepCompleted(currentStep);

    // Advance to next step
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    // Back NEVER triggers validation - just save and go
    const currentValues = getValues();
    updateFormData(currentValues);
    setCurrentStep(currentStep - 1);
  };

  if (isConfirmationStep) return null; // No navigation on confirmation

  return (
    <div className="flex justify-between mt-8">
      {!isFirstStep && (
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
      )}

      {!isReviewStep && (
        <Button type="button" onClick={handleNext} className="ml-auto">
          {isLastFormStep ? "Review" : "Next"}
        </Button>
      )}

      {isReviewStep && (
        <Button type="submit" className="ml-auto">
          Submit Application
        </Button>
      )}
    </div>
  );
}
```

### Pattern 5: Progress Indicator with Accessibility

**What:** Visual step indicator with proper ARIA attributes
**When to use:** Required by UX-02
**Example:**

```typescript
// src/components/form/ProgressIndicator.tsx
"use client";
import { useFormStore } from "@/lib/stores/form-store";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 0, label: "Welcome" },
  { id: 1, label: "About You" },
  { id: 2, label: "Proposal" },
  { id: 3, label: "Roadmap" },
  { id: 4, label: "Impact" },
  { id: 5, label: "Logistics" },
  { id: 6, label: "Review" },
  { id: 7, label: "Done" },
];

export function ProgressIndicator() {
  const { currentStep, completedSteps } = useFormStore();

  return (
    <nav aria-label="Form progress">
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;

          return (
            <li
              key={step.id}
              className="flex items-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isCompleted && !isCurrent && "border-primary bg-primary/10 text-primary",
                  !isCurrent && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  step.id + 1
                )}
              </div>
              <span className="sr-only">
                {step.label}
                {isCompleted && ", completed"}
                {isCurrent && ", current step"}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-8",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Screen reader summary */}
      <p className="sr-only" aria-live="polite">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
      </p>
    </nav>
  );
}
```

### Anti-Patterns to Avoid

- **Creating separate useForm per step:** Causes state fragmentation; use single FormProvider
- **Validating on Back button click:** Frustrates users; back should ALWAYS work
- **Storing form state only in React Hook Form:** RHF state doesn't survive page refresh; sync to Zustand
- **Direct localStorage access in render:** Causes hydration mismatches; use Zustand with skipHydration
- **Using `type="submit"` for Next button:** Triggers form submission; use `type="button"` with onClick

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Manual useState/useReducer | react-hook-form | Handles dirty tracking, touched state, field arrays, validation timing |
| Schema validation | Manual if/else validation | Zod + zodResolver | Type inference, composable schemas, consistent error format |
| localStorage persistence | Manual localStorage.setItem | Zustand persist middleware | Handles serialization, hydration, merge strategies |
| SSR hydration | Manual hydration checks | skipHydration + rehydrate() | Zustand provides tested pattern for Next.js |
| Field-level subscriptions | Context re-renders | useFormContext | React Hook Form isolates re-renders to changed fields |

**Key insight:** Multi-step form infrastructure has many subtle edge cases (SSR hydration, validation timing, persistence merging). The React Hook Form + Zustand combo handles these robustly.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with localStorage

**What goes wrong:** "Text content does not match server-rendered HTML" error
**Why it happens:** Server renders with empty state, client renders with localStorage data
**How to avoid:** Use Zustand's `skipHydration: true` option, call `rehydrate()` in useEffect
**Warning signs:** React hydration errors in console, flash of incorrect content

### Pitfall 2: Validation Triggers on Back Navigation

**What goes wrong:** User clicks back but can't go because current step has errors
**Why it happens:** Using `handleSubmit` or `trigger()` for back button
**How to avoid:** Back button should be `type="button"` and directly call `setCurrentStep(currentStep - 1)`
**Warning signs:** User complaints about "stuck" on steps, back button showing validation errors

### Pitfall 3: Form Data Lost After Validation Failure

**What goes wrong:** User fills step, validation fails, navigates back, returns to find data gone
**Why it happens:** Not syncing form data to Zustand before validation
**How to avoid:** Always call `updateFormData(getValues())` before any navigation or validation
**Warning signs:** Users reporting lost data, repeated form filling

### Pitfall 4: React Hook Form defaultValues Not Updating

**What goes wrong:** Restored form data from localStorage doesn't appear in fields
**Why it happens:** defaultValues only used on initial mount, not on re-renders
**How to avoid:** Use `reset(formData)` after hydration, or conditionally render form after hydration
**Warning signs:** Empty form fields despite localStorage having data

### Pitfall 5: Step Navigation Without Field Tracking

**What goes wrong:** Can't validate "only current step fields" because don't know which fields belong to which step
**Why it happens:** Not maintaining a `stepFields` mapping
**How to avoid:** Define `stepFields` array mapping step index to field names, pass to `trigger()`
**Warning signs:** Full form validation when only current step should validate

### Pitfall 6: Progress Indicator Not Accessible

**What goes wrong:** Screen reader users can't understand form progress
**Why it happens:** Visual-only indicators without ARIA attributes
**How to avoid:** Use `aria-current="step"`, `aria-label`, and visually-hidden status text
**Warning signs:** Accessibility audits fail, screen reader testing reveals no progress info

## Code Examples

Verified patterns from official sources:

### React Hook Form with Zod in shadcn/ui

```typescript
// Source: https://ui.shadcn.com/docs/forms/react-hook-form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
      {/* ... */}
    </form>
  );
}
```

### Zustand Persist with Next.js SSR Safety

```typescript
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: "my-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // Required for Next.js
    }
  )
);

// In component:
useEffect(() => {
  useMyStore.persist.rehydrate();
}, []);
```

### Per-Step Validation with trigger()

```typescript
// Source: https://react-hook-form.com/docs/useform/trigger
import { useFormContext } from "react-hook-form";

function StepNavigation() {
  const { trigger, getValues } = useFormContext();

  const validateCurrentStep = async (fields: string[]) => {
    // trigger() returns true if all specified fields are valid
    const isValid = await trigger(fields);
    return isValid;
  };

  const handleNext = async () => {
    const currentStepFields = ["firstName", "lastName", "email"];
    const isValid = await validateCurrentStep(currentStepFields);

    if (isValid) {
      // Proceed to next step
      goToNextStep();
    }
    // If invalid, errors are automatically set on the form
  };
}
```

### Back Navigation Without Validation

```typescript
// Source: https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form
function BackButton({ onBack }: { onBack: () => void }) {
  const { getValues } = useFormContext();

  const handleBack = () => {
    // Save current values (even if invalid) before navigating
    const values = getValues();
    saveToStore(values);

    // Navigate without validation
    onBack();
  };

  return (
    <button type="button" onClick={handleBack}>
      Back
    </button>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux Form / Formik | React Hook Form | 2020+ | Fewer re-renders, better TypeScript, smaller bundle |
| Yup validation | Zod validation | 2022+ | Full TypeScript inference, no @types needed |
| Context for persistence | Zustand persist | 2021+ | Built-in localStorage, SSR handling, smaller API |
| Manual hydration checks | skipHydration option | 2023+ | Official pattern for Next.js SSR |

**Deprecated/outdated:**

- `little-state-machine`: Works but less maintained; Zustand is preferred
- Formik: Still works but React Hook Form has better performance
- Manual localStorage in useEffect: Error-prone; use Zustand persist middleware

## Open Questions

Things that couldn't be fully resolved:

1. **Exact validation timing preference**
   - What we know: Can validate onChange, onBlur, or onSubmit
   - What's unclear: Whether inline validation (onBlur) is desired or only on "Next" click
   - Recommendation: Start with `mode: "onSubmit"` (only validate on Next), can add `onBlur` later if users want earlier feedback

2. **Form data encryption in localStorage**
   - What we know: Form contains email and personal info
   - What's unclear: Whether localStorage data should be encrypted
   - Recommendation: localStorage is only draft data; clear on submit. If encryption needed, use Web Crypto API or skip localStorage entirely

3. **Session timeout for drafts**
   - What we know: Zustand persist stores indefinitely
   - What's unclear: Whether old drafts should expire
   - Recommendation: Add `submittedAt` timestamp, clear drafts older than 7 days on load

## Sources

### Primary (HIGH confidence)
- [React Hook Form Advanced Usage](https://react-hook-form.com/advanced-usage) - Multi-step form patterns
- [React Hook Form useFormContext](https://react-hook-form.com/docs/useformcontext) - FormProvider setup
- [shadcn/ui React Hook Form Integration](https://ui.shadcn.com/docs/forms/react-hook-form) - Form field patterns
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) - localStorage persistence
- [Zustand Next.js Guide](https://zustand.docs.pmnd.rs/guides/nextjs) - SSR considerations

### Secondary (MEDIUM confidence)
- [LogRocket Multi-Step Form Tutorial](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/) - Schema-per-step pattern (Feb 2025)
- [ClarityDev Multi-Step Form](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form) - Back navigation pattern (Apr 2025)
- [Build with Matija Multi-Step Tutorial](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps) - Zustand + Zod combo
- [U.S. Web Design System Step Indicator](https://designsystem.digital.gov/components/step-indicator/) - Accessibility patterns

### Tertiary (LOW confidence)
- WebSearch findings on hydration patterns - verified against official Zustand docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React Hook Form, Zod, Zustand are the established 2026 stack for this use case
- Architecture: HIGH - Patterns verified across multiple official docs and tutorials
- Pitfalls: HIGH - Hydration issues well-documented in Next.js and Zustand docs

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (stable libraries, 30-day validity)
