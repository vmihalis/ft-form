# Phase 3: Form UI (Static) - Research

**Researched:** 2026-01-27
**Domain:** Multi-step form UI components with shadcn/ui, React Hook Form, and Convex submission
**Confidence:** HIGH

## Summary

Phase 3 builds the actual UI components for each form step, leveraging the infrastructure established in Phase 2. The core challenge is creating cohesive, accessible form step components that integrate with React Hook Form's context, handle conditional field rendering (floor dropdown with "Other" option), display a comprehensive review step, and submit data to Convex. The solution uses shadcn/ui's Form and Field component families for consistent styling and accessibility.

The key architectural insight is that each step component is a focused, single-purpose component that uses `useFormContext` to access form state without prop drilling. The StepContent component acts as a router, rendering the appropriate step component based on currentStep. For the "Other" floor conditional field, `useWatch` provides performance-optimized field observation that isolates re-renders to the component level.

**Primary recommendation:** Use shadcn/ui Field components (Field, FieldLabel, FieldDescription, FieldError) with Input/Textarea/Select for each step. Use `useWatch` for the floor conditional rendering. Implement review step as read-only display of all form data with edit links. Create Convex mutation for submission wired to form onSubmit.

## Standard Stack

The established libraries/tools for form UI:

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.1 | Form state, validation, field registration | Already in Phase 2, provides useFormContext |
| zod | ^4.3.6 | Schema validation | Already in Phase 2, schemas defined |
| zustand | ^5.0.10 | Step navigation, persistence | Already in Phase 2, store defined |
| convex | ^1.31.6 | Database mutations for submission | Already in Phase 1, schema defined |

### shadcn/ui Components (Need Installation)

| Component | Installation | Purpose |
|-----------|--------------|---------|
| form | `npx shadcn@latest add form` | FormField, FormItem, FormLabel, FormControl, FormMessage |
| field | `npx shadcn@latest add field` | Field, FieldLabel, FieldDescription, FieldError (newer API) |
| input | `npx shadcn@latest add input` | Text input fields |
| textarea | `npx shadcn@latest add textarea` | Multi-line text (bio, phase descriptions) |
| select | `npx shadcn@latest add select` | Floor dropdown, estimated size dropdown |
| label | `npx shadcn@latest add label` | Accessible form labels |
| card | `npx shadcn@latest add card` | Review step data display sections |
| separator | `npx shadcn@latest add separator` | Visual separation in review step |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Form components | Raw react-hook-form | shadcn provides consistent styling and accessibility |
| shadcn Field | shadcn Form (older API) | Field is the newer, recommended approach |
| useWatch | watch() | useWatch isolates re-renders for better performance |

**Installation (all at once):**

```bash
npx shadcn@latest add form field input textarea select label card separator
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── form/
│   │   ├── MultiStepForm.tsx          # Main container (Phase 2)
│   │   ├── ProgressIndicator.tsx      # Progress display (Phase 2)
│   │   ├── NavigationButtons.tsx      # Back/Next/Submit (Phase 2)
│   │   ├── StoreHydration.tsx         # SSR hydration (Phase 2)
│   │   ├── StepContent.tsx            # Step router (Phase 2, update)
│   │   └── steps/
│   │       ├── WelcomeStep.tsx        # FORM-01: Hero with logo, headline, CTA
│   │       ├── ApplicantInfoStep.tsx  # FORM-02: Name, email, LinkedIn, role, bio
│   │       ├── ProposalStep.tsx       # FORM-03: Floor dropdown, initiative, tagline, etc.
│   │       ├── RoadmapStep.tsx        # FORM-04: Phase 1/2/3 descriptions
│   │       ├── ImpactStep.tsx         # FORM-05: Benefit to FT
│   │       ├── LogisticsStep.tsx      # FORM-06: Community, space, start date, notes
│   │       ├── ReviewStep.tsx         # FORM-07: All data display, edit links
│   │       └── ConfirmationStep.tsx   # FORM-08: Thank you, next steps
│   └── ui/
│       └── [shadcn components]
├── convex/
│   └── applications.ts                 # Mutation for form submission
└── assets/
    └── ft-logo.svg                     # FT logo for hero/branding
```

### Pattern 1: Step Component with useFormContext

**What:** Each step component accesses form state via React context
**When to use:** All form step components with input fields
**Example:**

```typescript
// src/components/form/steps/ApplicantInfoStep.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationFormData } from "@/types/form";

export function ApplicantInfoStep() {
  const { register, formState: { errors } } = useFormContext<ApplicationFormData>();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
        <p className="text-muted-foreground mt-2">
          We want to know who's leading this initiative
        </p>
      </div>

      <Field data-invalid={!!errors.fullName}>
        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
        <Input
          id="fullName"
          {...register("fullName")}
          aria-invalid={!!errors.fullName}
          placeholder="Your full name"
        />
        <FieldError>{errors.fullName?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          placeholder="you@example.com"
        />
        <FieldError>{errors.email?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.bio}>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <Textarea
          id="bio"
          {...register("bio")}
          aria-invalid={!!errors.bio}
          placeholder="Tell us about your background and what drives you..."
          rows={5}
        />
        <FieldDescription>Minimum 50 characters</FieldDescription>
        <FieldError>{errors.bio?.message}</FieldError>
      </Field>
    </div>
  );
}
```

### Pattern 2: Conditional Field with useWatch

**What:** Show/hide fields based on another field's value using performance-optimized observer
**When to use:** UX-08 - "Other" floor option revealing text field
**Example:**

```typescript
// src/components/form/steps/ProposalStep.tsx (partial)
"use client";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationFormData } from "@/types/form";

// Frontier Tower floors (research-based)
const FRONTIER_TOWER_FLOORS = [
  { value: "2", label: "Floor 2 - The Spaceship (Events)" },
  { value: "3", label: "Floor 3 - Private Offices" },
  { value: "4", label: "Floor 4 - Robotics / Cyberpunk Lab" },
  { value: "8", label: "Floor 8 - Biotech" },
  { value: "11", label: "Floor 11 - Longevity" },
  { value: "12", label: "Floor 12 - Ethereum House" },
  { value: "ai", label: "AI Floor" },
  { value: "neurotech", label: "Neurotech Floor" },
  { value: "arts-music", label: "Arts & Music Floor" },
  { value: "human-flourishing", label: "Human Flourishing Floor" },
  { value: "other", label: "Other (propose a new floor)" },
] as const;

export function ProposalStep() {
  const { register, control, formState: { errors } } = useFormContext<ApplicationFormData>();

  // useWatch isolates re-renders to this component
  const selectedFloor = useWatch({
    control,
    name: "floor",
    defaultValue: "",
  });

  const showOtherFloorInput = selectedFloor === "other";

  return (
    <div className="space-y-6">
      {/* Floor Select with Controller for controlled component */}
      <Field data-invalid={!!errors.floor}>
        <FieldLabel htmlFor="floor">Which floor?</FieldLabel>
        <Controller
          name="floor"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="floor" aria-invalid={!!errors.floor}>
                <SelectValue placeholder="Select a floor" />
              </SelectTrigger>
              <SelectContent>
                {FRONTIER_TOWER_FLOORS.map((floor) => (
                  <SelectItem key={floor.value} value={floor.value}>
                    {floor.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError>{errors.floor?.message}</FieldError>
      </Field>

      {/* Conditional "Other" floor text input */}
      {showOtherFloorInput && (
        <Field data-invalid={!!errors.floorOther}>
          <FieldLabel htmlFor="floorOther">Describe your proposed floor</FieldLabel>
          <Input
            id="floorOther"
            {...register("floorOther")}
            aria-invalid={!!errors.floorOther}
            placeholder="e.g., Quantum Computing Lab"
          />
          <FieldError>{errors.floorOther?.message}</FieldError>
        </Field>
      )}

      {/* ... other proposal fields ... */}
    </div>
  );
}
```

### Pattern 3: Review Step with Data Display

**What:** Display all collected form data in organized sections before submission
**When to use:** FORM-07 - Review step
**Example:**

```typescript
// src/components/form/steps/ReviewStep.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { useFormStore } from "@/lib/stores/form-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ApplicationFormData } from "@/types/form";

interface ReviewSectionProps {
  title: string;
  stepIndex: number;
  children: React.ReactNode;
}

function ReviewSection({ title, stepIndex, children }: ReviewSectionProps) {
  const setCurrentStep = useFormStore((state) => state.setCurrentStep);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep(stepIndex)}
        >
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value || <span className="text-muted-foreground italic">Not provided</span>}</dd>
    </div>
  );
}

export function ReviewStep() {
  const { getValues } = useFormContext<ApplicationFormData>();
  const data = getValues();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold">Review Your Application</h2>
        <p className="text-muted-foreground mt-2">
          Please review your information before submitting
        </p>
      </div>

      <ReviewSection title="About You" stepIndex={1}>
        <dl className="grid gap-3">
          <ReviewItem label="Full Name" value={data.fullName} />
          <ReviewItem label="Email" value={data.email} />
          <ReviewItem label="LinkedIn" value={data.linkedIn} />
          <ReviewItem label="Role" value={data.role} />
          <ReviewItem label="Bio" value={data.bio} />
        </dl>
      </ReviewSection>

      <ReviewSection title="Your Proposal" stepIndex={2}>
        <dl className="grid gap-3">
          <ReviewItem label="Floor" value={data.floor === "other" ? data.floorOther : data.floor} />
          <ReviewItem label="Initiative Name" value={data.initiativeName} />
          <ReviewItem label="Tagline" value={data.tagline} />
          <ReviewItem label="Values" value={data.values} />
          <ReviewItem label="Target Community" value={data.targetCommunity} />
          <ReviewItem label="Estimated Size" value={data.estimatedSize} />
        </dl>
      </ReviewSection>

      <ReviewSection title="Roadmap" stepIndex={3}>
        <dl className="grid gap-3">
          <ReviewItem label="Phase 1: MVP" value={data.phase1Mvp} />
          <Separator className="my-2" />
          <ReviewItem label="Phase 2: Expansion" value={data.phase2Expansion} />
          <Separator className="my-2" />
          <ReviewItem label="Phase 3: Long-term" value={data.phase3LongTerm} />
        </dl>
      </ReviewSection>

      <ReviewSection title="Impact" stepIndex={4}>
        <dl>
          <ReviewItem label="Benefit to FT Members" value={data.benefitToFT} />
        </dl>
      </ReviewSection>

      <ReviewSection title="Logistics" stepIndex={5}>
        <dl className="grid gap-3">
          <ReviewItem label="Existing Community" value={data.existingCommunity} />
          <ReviewItem label="Space Needs" value={data.spaceNeeds} />
          <ReviewItem label="Start Date" value={data.startDate} />
          <ReviewItem label="Additional Notes" value={data.additionalNotes} />
        </dl>
      </ReviewSection>

      <p className="text-sm text-muted-foreground text-center pt-4">
        Click "Submit Application" below to finalize your submission.
      </p>
    </div>
  );
}
```

### Pattern 4: Convex Mutation for Form Submission

**What:** Server-side mutation to store form data in Convex database
**When to use:** UX-10 - Form submission to Convex
**Example:**

```typescript
// convex/applications.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    linkedIn: v.optional(v.string()),
    role: v.string(),
    bio: v.string(),
    floor: v.string(),
    floorOther: v.optional(v.string()),
    initiativeName: v.string(),
    tagline: v.string(),
    values: v.string(),
    targetCommunity: v.string(),
    estimatedSize: v.string(),
    phase1Mvp: v.string(),
    phase2Expansion: v.string(),
    phase3LongTerm: v.string(),
    benefitToFT: v.string(),
    existingCommunity: v.string(),
    spaceNeeds: v.string(),
    startDate: v.string(),
    additionalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const applicationId = await ctx.db.insert("applications", {
      ...args,
      status: "new",
      submittedAt: Date.now(),
    });
    return applicationId;
  },
});
```

```typescript
// src/components/form/MultiStepForm.tsx (updated onSubmit)
"use client";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function MultiStepForm() {
  // ... existing code ...
  const submitApplication = useMutation(api.applications.submit);

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      await submitApplication({
        ...data,
        linkedIn: data.linkedIn || undefined,
        floorOther: data.floorOther || undefined,
        additionalNotes: data.additionalNotes || undefined,
      });

      // Move to confirmation step
      setCurrentStep(7);

      // Clear localStorage
      resetForm();
    } catch (error) {
      console.error("Submission failed:", error);
      // TODO: Show error toast in Phase 4
    }
  };

  // ... rest of component ...
}
```

### Pattern 5: Welcome Step with Hero Design

**What:** Landing step with branding, headline, and CTA to begin
**When to use:** FORM-01 - Welcome/hero step
**Example:**

```typescript
// src/components/form/steps/WelcomeStep.tsx
"use client";
import Image from "next/image";

export function WelcomeStep() {
  return (
    <div className="text-center py-12">
      {/* FT Logo - BRAND-02 */}
      <div className="mx-auto mb-8 w-24 h-24 relative">
        <Image
          src="/ft-logo.svg"
          alt="Frontier Tower"
          fill
          className="object-contain"
          priority
        />
      </div>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Become a Floor Lead
      </h1>

      <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
        Shape the future of Frontier Tower by leading a themed floor.
        Tell us about your vision for building community at the intersection
        of frontier technology and human flourishing.
      </p>

      <p className="mt-4 text-sm text-muted-foreground">
        This application takes about 10-15 minutes to complete.
        Your progress is automatically saved.
      </p>

      {/* CTA is handled by NavigationButtons "Begin" */}
    </div>
  );
}
```

### Pattern 6: Confirmation Step with Next Steps

**What:** Thank you message with clear expectations and next actions
**When to use:** FORM-08 - Confirmation step
**Example:**

```typescript
// src/components/form/steps/ConfirmationStep.tsx
"use client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmationStep() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>

      <h2 className="text-2xl font-semibold">Application Submitted!</h2>

      <p className="mt-4 text-muted-foreground max-w-md mx-auto">
        Thank you for your interest in leading a floor at Frontier Tower.
        We've received your application and will review it carefully.
      </p>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg max-w-md mx-auto text-left">
        <h3 className="font-medium mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>1. Our team will review your application within 5-7 business days</li>
          <li>2. We may reach out with follow-up questions</li>
          <li>3. You'll receive a decision via email</li>
        </ul>
      </div>

      <div className="mt-8">
        <Button asChild variant="outline">
          <a href="https://frontiertower.io">Visit Frontier Tower</a>
        </Button>
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Using watch() instead of useWatch():** watch() re-renders the entire form; useWatch() isolates re-renders
- **Skipping Controller for Select:** Select is a controlled component; must use Controller from react-hook-form
- **Hardcoding floor values in multiple places:** Define FRONTIER_TOWER_FLOORS constant once, import where needed
- **Not handling optional fields in Convex mutation:** Pass undefined instead of empty string for optional fields
- **Missing aria-invalid on inputs:** Required for accessibility; errors must be announced
- **Putting validation logic in step components:** Validation is handled by NavigationButtons via trigger()

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form field styling | Custom input styles | shadcn Input/Textarea | Consistent styling, accessibility, dark mode |
| Error message display | Custom error span | shadcn FieldError | Proper ARIA, consistent formatting |
| Dropdown with custom options | Custom dropdown | shadcn Select + Controller | Accessible, keyboard navigation, proper mobile support |
| Data display cards | Custom divs | shadcn Card | Consistent spacing, headers, borders |
| Conditional field rendering | Complex useEffect | useWatch + boolean | Performance optimized, declarative |
| Form submission | fetch/axios | useMutation from Convex | Automatic retries, transaction safety, type-safe |

**Key insight:** shadcn/ui provides all the form components needed. The Field family (Field, FieldLabel, FieldDescription, FieldError) is the recommended approach for building forms, providing built-in accessibility and consistent styling.

## Common Pitfalls

### Pitfall 1: Controller Missing for Select/Checkbox

**What goes wrong:** Select value doesn't update, validation fails
**Why it happens:** Select is a controlled component, register() doesn't work
**How to avoid:** Always wrap Select with Controller from react-hook-form
**Warning signs:** Select appears empty after setting value, validation errors on valid selections

### Pitfall 2: useWatch Default Value Timing

**What goes wrong:** Conditional field flashes or shows incorrectly on first render
**Why it happens:** useWatch returns undefined before subscription is established
**How to avoid:** Always provide defaultValue to useWatch that matches the expected initial state
**Warning signs:** Brief flash of conditional content, layout shift on mount

### Pitfall 3: Review Step Stale Data

**What goes wrong:** Review step shows old data after editing and returning
**Why it happens:** Using stored snapshot instead of live getValues()
**How to avoid:** Call getValues() directly in review render, not in useEffect
**Warning signs:** Edits not reflected in review, outdated values shown

### Pitfall 4: Optional Fields in Convex

**What goes wrong:** Convex throws validation error on empty optional fields
**Why it happens:** Empty string "" is not the same as undefined for v.optional()
**How to avoid:** Transform empty strings to undefined before submission: `field || undefined`
**Warning signs:** "Invalid value" errors from Convex on form submission

### Pitfall 5: Missing Form Step Header Hierarchy

**What goes wrong:** Screen readers announce wrong heading levels, poor accessibility
**Why it happens:** Using h2 in step but h1 elsewhere, or inconsistent nesting
**How to avoid:** Welcome uses h1, all step titles use h2, subsections use h3
**Warning signs:** WAVE accessibility tool warnings, VoiceOver announces incorrect structure

### Pitfall 6: Floor Dropdown Without "Other" Conditional Validation

**What goes wrong:** User selects "Other" but floorOther remains empty, form submits
**Why it happens:** floorOther schema says optional, no conditional required
**How to avoid:** Use Zod refine() or superRefine() to make floorOther required when floor === "other"
**Warning signs:** Incomplete applications in database with floor="other" but no description

## Code Examples

Verified patterns from official sources:

### shadcn/ui Field Pattern with React Hook Form

```typescript
// Source: https://ui.shadcn.com/docs/components/field
import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function EmailField() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Field data-invalid={!!errors.email}>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input
        id="email"
        type="email"
        {...register("email")}
        aria-invalid={!!errors.email}
        placeholder="you@example.com"
      />
      <FieldDescription>We'll use this to contact you</FieldDescription>
      <FieldError>{errors.email?.message}</FieldError>
    </Field>
  );
}
```

### Controlled Select with Controller

```typescript
// Source: https://react-hook-form.com/docs/usecontroller/controller
import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FloorSelect() {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Controller
      name="floor"
      control={control}
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger aria-invalid={!!errors.floor}>
            <SelectValue placeholder="Select a floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">Floor 12 - Ethereum House</SelectItem>
            <SelectItem value="11">Floor 11 - Longevity</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      )}
    />
  );
}
```

### useWatch for Conditional Rendering

```typescript
// Source: https://react-hook-form.com/docs/usewatch
import { useWatch, useFormContext } from "react-hook-form";

export function ConditionalFloorInput() {
  const { control, register } = useFormContext();

  // Isolates re-renders to this component only
  const floor = useWatch({
    control,
    name: "floor",
    defaultValue: "",
  });

  if (floor !== "other") return null;

  return (
    <Input {...register("floorOther")} placeholder="Describe your floor idea" />
  );
}
```

### Convex Mutation Call

```typescript
// Source: https://docs.convex.dev/functions/mutation-functions
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function SubmitForm() {
  const submit = useMutation(api.applications.submit);

  const handleSubmit = async (data: FormData) => {
    try {
      const id = await submit(data);
      console.log("Created application:", id);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };
}
```

## Frontier Tower Floor Data

Research-based floor information for the dropdown (UX-07):

| Floor | Theme | Description |
|-------|-------|-------------|
| 2 | The Spaceship | Hub for town halls and events |
| 3 | Private Offices | At-capacity workspace |
| 4 | Robotics / Cyberpunk Lab | Humanoid robots, VR remote tools |
| 8 | Biotech | Synthetic biology research, BSL-2 lab |
| 11 | Longevity | Health tech, hyperbaric therapy, IV drips |
| 12 | Ethereum House | Crypto meetups, validator station |
| - | AI | AI/ML research and development |
| - | Neurotech | Brain-computer interfaces |
| - | Arts & Music | Creative community |
| - | Human Flourishing | Wellness and personal development |
| - | Other | Propose a new themed floor |

**Note:** Not all floors have confirmed numbers. The dropdown should use descriptive names for unnumbered themes.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadcn Form components | shadcn Field components | 2025 | Simpler API, better composability |
| watch() for conditionals | useWatch() for conditionals | Always | Better performance, isolated re-renders |
| Full page thank you | Confirmation step in flow | Current | Better UX, maintains context |
| Custom error styling | FieldError with data-invalid | 2025 | Consistent, accessible error display |

**Deprecated/outdated:**

- `FormField` pattern: Still works but `Field` pattern is newer and recommended
- Using watch() for single field observation: useWatch() is more performant
- Inline style for error messages: Use FieldError component for consistency

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Frontier Tower floor numbers**
   - What we know: Floors 2, 3, 4, 8, 11, 12 are confirmed with themes
   - What's unclear: Exact floor numbers for AI, Neurotech, Arts & Music, Human Flourishing
   - Recommendation: Use descriptive names without numbers for unconfirmed floors; allow "Other" for proposals

2. **FT Logo asset**
   - What we know: BRAND-02 requires FT logo in hero and admin header
   - What's unclear: Whether logo asset exists in project or needs to be obtained
   - Recommendation: Placeholder during development, request actual logo from stakeholder

3. **Character count display**
   - What we know: Bio requires 50+ chars, Phase descriptions require 50+ chars
   - What's unclear: Whether to show live character count or just validation error
   - Recommendation: Show current/minimum count below textarea fields for better UX

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Form Documentation](https://ui.shadcn.com/docs/components/form) - FormField, FormItem patterns
- [shadcn/ui Field Documentation](https://ui.shadcn.com/docs/components/field) - Newer Field component family
- [shadcn/ui Input Documentation](https://ui.shadcn.com/docs/components/input) - Input with field integration
- [shadcn/ui Textarea Documentation](https://ui.shadcn.com/docs/components/textarea) - Textarea patterns
- [shadcn/ui Select Documentation](https://ui.shadcn.com/docs/components/select) - Controlled select with Controller
- [React Hook Form useWatch](https://react-hook-form.com/docs/usewatch) - Performance-optimized field watching
- [Convex Mutation Functions](https://docs.convex.dev/functions/mutation-functions) - Server mutation patterns

### Secondary (MEDIUM confidence)
- [SF Standard - Frontier Tower](https://sfstandard.com/2025/05/18/first-look-frontier-tower-san-francisco-vertical-village/) - Floor theme information
- [Typeform UX Best Practices](https://www.typeform.com/blog/mobile-form-design-best-practices) - One-question-at-a-time design
- [CXL Thank You Page Best Practices](https://cxl.com/blog/thank-you-page/) - Confirmation step design
- [ClarityDev Multi-Step Form](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form) - Review step patterns

### Tertiary (LOW confidence)
- Frontier Tower official website - Limited floor details available
- WebSearch for floor themes - Verified against multiple sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shadcn/ui + React Hook Form is the established pattern
- Architecture: HIGH - Patterns verified in official documentation
- Pitfalls: HIGH - Common issues documented in react-hook-form FAQs
- Floor data: MEDIUM - Multiple sources agree but some floors unconfirmed

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (stable libraries, 30-day validity)
