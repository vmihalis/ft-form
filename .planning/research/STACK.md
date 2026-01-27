# Stack Research: Typeform-Style Multi-Step Form Application

**Project:** Frontier Tower Floor Lead Application System
**Researched:** 2026-01-27
**Overall Confidence:** HIGH (versions verified via npm registry)

---

## Core Stack (Pre-Decided)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Next.js | 16.1.5 | Full-stack React framework | VERIFIED |
| Tailwind CSS | 4.1.18 | Utility-first styling | VERIFIED |
| Convex | 1.31.6 | Backend-as-a-service (database + real-time) | VERIFIED |
| Vercel | - | Deployment platform | CONFIRMED |

### Next.js 16 Key Features for This Project

- **App Router** (stable): File-based routing, layouts, server/client components
- **Turbopack** (now default): 10x faster Fast Refresh, 2-5x faster builds
- **React 19.2 integration**: View Transitions API for smooth page animations
- **React Compiler** (stable): Auto-memoization, no manual optimization needed

**Confidence:** HIGH - Verified via [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)

---

## Form Handling

### Recommended: React Hook Form + Zod + @hookform/resolvers

| Package | Version | Purpose |
|---------|---------|---------|
| react-hook-form | 7.71.1 | Form state management, validation orchestration |
| zod | 4.3.6 | Schema validation, TypeScript type inference |
| @hookform/resolvers | 5.2.2 | Connect Zod schemas to React Hook Form |

**Why React Hook Form:**
- Uncontrolled form approach = minimal re-renders
- Built-in multi-step form support via `useFormContext` and `FormProvider`
- Battle-tested with millions of weekly downloads
- Perfect integration with Zod for type-safe validation

**Why Zod over Yup:**
- TypeScript-first design (better type inference)
- Smaller bundle size
- Can share validation schemas between client (React Hook Form) and server (Convex mutations)
- More intuitive API for complex validations

**Multi-Step Pattern:**
```typescript
// Separate schema per step, merged for final submission
const step1Schema = z.object({ name: z.string().min(1), email: z.string().email() });
const step2Schema = z.object({ experience: z.string(), motivation: z.string() });
const fullSchema = step1Schema.merge(step2Schema);
```

**Confidence:** HIGH - Pattern verified via [React Hook Form Advanced Usage](https://react-hook-form.com/advanced-usage) and [LogRocket Multi-Step Form Guide](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/)

---

## Animations & Transitions

### Recommended: Framer Motion (now "Motion")

| Package | Version | Purpose |
|---------|---------|---------|
| framer-motion | 12.29.2 | Page transitions, step animations, micro-interactions |

**Why Framer Motion over Motion One:**
- **React-first**: Deeply integrated with React component lifecycle
- **AnimatePresence**: Built-in exit animations (critical for Typeform-style step transitions)
- **Layout animations**: Automatic animation when elements change position
- **Gesture support**: Swipe navigation for mobile forms
- **Variants system**: Define animation states declaratively

**Bundle Size Tradeoff:**
- Framer Motion: ~32KB gzipped (full feature set)
- Motion One: ~3.8KB (limited features, manual work for exit animations)
- **Verdict:** For Typeform-style UX, the 28KB difference is worth the AnimatePresence feature

**Typeform-Style Transition Pattern:**
```typescript
// Wrap steps in AnimatePresence with mode="wait"
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

**App Router Caveat:**
Next.js App Router can disrupt Framer Motion animations due to context updates during navigation. For this project (single-page form), this is NOT an issue since steps are component transitions, not page navigations.

**Confidence:** HIGH - Verified via [Motion Blog](https://motion.dev/blog/should-i-use-framer-motion-or-motion-one) and [React Libraries Performance Guide](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025)

---

## UI Components

### Recommended: shadcn/ui (Copy-Paste Components)

**Why shadcn/ui:**
- Not a dependency - you own the code
- Built on Radix UI primitives (accessibility baked in)
- Tailwind CSS styling (matches our stack)
- Form components integrate seamlessly with React Hook Form
- Highly customizable (easy to apply brand colors)

**Components Needed:**

| Component | Purpose |
|-----------|---------|
| Button | Form navigation, submit |
| Input | Text fields |
| Textarea | Multi-line responses |
| Select | Dropdown selections |
| Radio Group | Single-choice questions |
| Checkbox | Multi-choice questions |
| Progress | Step progress indicator |
| Card | Admin dashboard submission cards |
| Table | Admin submission list |
| Dialog | Confirmation modals |
| Toast | Success/error notifications |

**Installation:**
```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea select radio-group checkbox progress card table dialog toast
```

**Important:** Do NOT use Radix Form component alongside React Hook Form - they compete for form control. shadcn/ui's Form component is a thin wrapper around RHF + Radix primitives, which is the correct integration.

**Confidence:** HIGH - Verified via [WorkOS shadcn vs Radix comparison](https://workos.com/blog/what-is-the-difference-between-radix-and-shadcn-ui) and [Radix Primitives Discussion #3110](https://github.com/radix-ui/primitives/discussions/3110)

---

## Icons

### Recommended: Lucide React

| Package | Version | Purpose |
|---------|---------|---------|
| lucide-react | 0.563.0 | Icon library (bundled with shadcn/ui) |

**Why Lucide:**
- Default icon set for shadcn/ui (consistent styling)
- Tree-shakeable (only imports used icons)
- MIT licensed
- 1500+ icons, modern/minimal aesthetic

**Confidence:** HIGH - Standard pairing with shadcn/ui

---

## State Management

### For Multi-Step Form: React Hook Form's FormProvider

For Typeform-style forms where data persists across steps, React Hook Form's built-in context is sufficient:

```typescript
// Parent component
const methods = useForm();
return (
  <FormProvider {...methods}>
    {currentStep === 1 && <Step1 />}
    {currentStep === 2 && <Step2 />}
  </FormProvider>
);

// Child step component
const { register, watch } = useFormContext();
```

### Alternative: Zustand (If Needed)

| Package | Version | Purpose |
|---------|---------|---------|
| zustand | 5.0.10 | Global state, localStorage persistence |

**When to use Zustand:**
- Form data should survive page refreshes (persist to localStorage)
- Complex form with branching logic based on previous answers
- Need to share state outside React component tree

**For this project:** Start with FormProvider. Add Zustand only if persistence requirements emerge.

**Confidence:** MEDIUM - Depends on final UX requirements

---

## Convex Integration Patterns

### Form Submission Pattern

```typescript
// convex/applications.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitApplication = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    experience: v.string(),
    motivation: v.string(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    // Convex validates args at runtime (not just TypeScript!)
    const applicationId = await ctx.db.insert("applications", {
      ...args,
      submittedAt: Date.now(),
      status: "pending",
    });
    return applicationId;
  },
});
```

```typescript
// React component
const submitApplication = useMutation(api.applications.submitApplication);

const onSubmit = async (data: FormData) => {
  try {
    const id = await submitApplication(data);
    // Handle success
  } catch (error) {
    // Handle validation errors from Convex
  }
};
```

### Validation Strategy

**Client-side (React Hook Form + Zod):**
- Immediate feedback as user types
- Prevents invalid submissions
- UX optimization

**Server-side (Convex validators):**
- Security layer (never trust client)
- Final source of truth
- Can add business logic validation

**Share Schemas (DRY):**
```typescript
// shared/schemas.ts
import { z } from "zod";

export const applicationSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  // ...
});

// Client: Use with React Hook Form
// Server: Use Convex's v.* validators (similar shape)
```

**Confidence:** HIGH - Verified via [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/) and [Convex Zod Validation Guide](https://stack.convex.dev/wrappers-as-middleware-zod-validation)

---

## Full Package List

### Production Dependencies

```bash
npm install react-hook-form@7.71.1 zod@4.3.6 @hookform/resolvers@5.2.2 framer-motion@12.29.2 convex@1.31.6 lucide-react@0.563.0
```

### Dev Dependencies

```bash
npm install -D tailwindcss@4.1.18 typescript @types/react @types/node
```

### shadcn/ui Components (copy into project)

```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea select radio-group checkbox progress card table dialog toast form label
```

---

## Anti-Recommendations

### DO NOT Use

| Library | Why Not |
|---------|---------|
| **Formik** | Older, more verbose API than React Hook Form. Re-renders on every keystroke by default. |
| **Redux Form** | Outdated, Redux dependency unnecessary for forms |
| **Radix Form** (standalone) | Competes with React Hook Form; use shadcn/ui's integrated Form instead |
| **react-wizard-typeform** | Last updated 2021, unmaintained |
| **react-typeform** | Last updated 2019, unmaintained |
| **Motion One** | Missing AnimatePresence; requires manual exit animation handling |
| **GSAP** | Overkill for this use case, larger bundle, licensing concerns |
| **styled-components** | Unnecessary with Tailwind; adds runtime CSS-in-JS overhead |
| **MUI (Material UI)** | Heavy bundle, Material Design doesn't match minimal brand |
| **Ant Design** | Heavy, opinionated styling conflicts with custom brand |

### DO NOT Do

| Anti-Pattern | Why Not | Instead |
|--------------|---------|---------|
| Multiple `useForm()` per step | Complex state coordination, data loss on navigation | Single `useForm()` with `FormProvider` |
| `useState` for each field | Prop drilling, no validation integration | React Hook Form controlled/uncontrolled fields |
| Skip Convex validators | Security vulnerability | Always validate on server, even if client validates |
| Use Radix Form + RHF together | Two competing validation systems | Choose one (RHF recommended) |
| Page-based routing for steps | Breaks form context, URL complexity | Component-based step switching with `AnimatePresence` |

---

## Architecture Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Form library | React Hook Form | Performance, multi-step support, ecosystem |
| Validation | Zod | TypeScript-first, client+server sharing |
| Animation | Framer Motion | AnimatePresence for Typeform-style exits |
| UI primitives | shadcn/ui | Accessible, Tailwind-native, customizable |
| State management | FormProvider (+ Zustand if needed) | Start simple, add complexity only if needed |
| Backend | Convex mutations | Real-time, typed, built-in validation |

---

## Sources

### Official Documentation
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [React Hook Form Advanced Usage](https://react-hook-form.com/advanced-usage)
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [Convex Mutations](https://docs.convex.dev/functions/mutation-functions)

### Guides & Tutorials
- [LogRocket: Multi-Step Form with RHF + Zod](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/)
- [ClarityDev: Advanced Multistep Forms](https://claritydev.net/blog/advanced-multistep-forms-with-react)
- [Motion Blog: Framer Motion vs Motion One](https://motion.dev/blog/should-i-use-framer-motion-or-motion-one)
- [Convex: Zod Validation Wrappers](https://stack.convex.dev/wrappers-as-middleware-zod-validation)

### Comparisons
- [WorkOS: Radix vs shadcn/ui](https://workos.com/blog/what-is-the-difference-between-radix-and-shadcn-ui)
- [React Libraries: Framer Motion Performance 2025](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025)
- [Makers' Den: React UI Libraries 2025](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra)
