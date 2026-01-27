# Architecture Research

**Project:** Frontier Tower Floor Lead Application System
**Domain:** Typeform-style Multi-step Form + Admin Dashboard
**Researched:** 2026-01-27
**Overall Confidence:** HIGH

## Executive Summary

This architecture combines Next.js App Router with Convex backend to build a Typeform-style multi-step form application with an admin dashboard. The architecture leverages:

- **Next.js App Router** for file-system routing, server/client component split
- **Convex** for real-time database, mutations, and queries
- **React Hook Form + Zod** for form state management and validation
- **Framer Motion** for smooth step transitions
- **shadcn/ui** for consistent UI components
- **NextAuth.js** for simple password-protected admin access

The key architectural insight: form state lives client-side during completion (React Hook Form), then persists to Convex on submission. Admin reads directly from Convex with real-time updates.

---

## Application Structure

### Routes & Pages

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Redirect to /apply or landing
├── apply/
│   └── page.tsx            # Multi-step form (client component)
├── admin/
│   ├── layout.tsx          # Admin layout with auth check
│   ├── page.tsx            # Dashboard/table view
│   ├── login/
│   │   └── page.tsx        # Password login page
│   └── applications/
│       └── [id]/
│           └── page.tsx    # Individual application detail
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts    # NextAuth.js API route
```

### Key Route Responsibilities

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Server | Landing or redirect to `/apply` |
| `/apply` | Client | Multi-step form with animations |
| `/admin` | Server | Protected dashboard entry |
| `/admin/login` | Client | Password authentication |
| `/admin/applications/[id]` | Server/Client | Application detail view |

### Server vs Client Components

**Server Components (default):**
- Admin dashboard layout (auth check)
- Application detail page (data fetching)
- Static content pages

**Client Components ("use client"):**
- Multi-step form (`/apply`)
- Form step components
- Admin login form
- Data tables with sorting/filtering
- Any component using useState, useEffect, or event handlers

**Architectural Principle:** Keep client components small and "leaf-level" - most of the tree stays server-rendered while interactive parts pay the JavaScript cost.

---

## Form Architecture

### Multi-Step State Management

**Recommended Pattern:** React Hook Form + Zustand + Zod

```
User Input → Zod Validates → React Hook Form Handles → Zustand Stores → localStorage Persists
```

**Why this combination:**
- **React Hook Form:** Minimizes re-renders, handles field-level state
- **Zustand:** Lightweight store for step navigation and cross-step state
- **Zod:** Schema-per-step validation, type-safe
- **localStorage:** Persist progress for returning users

### Form State Architecture

```typescript
// types/form.ts
interface FormState {
  currentStep: number;
  data: {
    applicantInfo: ApplicantInfoData;
    proposal: ProposalData;
    roadmap: RoadmapData;
    impact: ImpactData;
    logistics: LogisticsData;
  };
  completedSteps: number[];
}

// Each step has its own Zod schema
const applicantInfoSchema = z.object({
  fullName: z.string().min(1, "Name required"),
  email: z.string().email(),
  unitNumber: z.string().min(1),
  phone: z.string().optional(),
});
```

### Step Navigation Flow

```
┌─────────────┐    validate     ┌─────────────┐    validate     ┌─────────────┐
│  Step N     │ ──────────────► │  Step N+1   │ ──────────────► │  Step N+2   │
│  (Form)     │ ◄────────────── │  (Form)     │ ◄────────────── │  (Form)     │
└─────────────┘    no validate  └─────────────┘    no validate  └─────────────┘
      │                               │                               │
      └───────────────────────────────┼───────────────────────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │   Review    │
                               │   (Read)    │
                               └─────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │   Submit    │
                               │ (Mutation)  │
                               └─────────────┘
```

**Navigation Rules:**
- `nextStep()`: Validates current step schema, only proceeds if valid
- `previousStep()`: No validation required, always allowed
- `goToStep(n)`: Only allowed for completed steps (enables progress indicator shortcuts)
- All navigation saves to localStorage before transition

### Step Components Structure

```typescript
// components/form/steps/FormStep.tsx
interface FormStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

// Each step is a self-contained component
// components/form/steps/ApplicantInfoStep.tsx
// components/form/steps/ProposalStep.tsx
// etc.
```

### Animation Implementation

**Framer Motion AnimatePresence Pattern:**

```tsx
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {stepComponents[currentStep]}
  </motion.div>
</AnimatePresence>
```

### Form Sections Mapping

| Step | Section | Key Fields | Validation Focus |
|------|---------|------------|------------------|
| 0 | Welcome | (intro only) | None |
| 1 | Applicant Info | name, email, unit, phone | Required fields, email format |
| 2 | Proposal | title, description, goals | Min lengths, completeness |
| 3 | Roadmap | timeline, milestones | Date validation, logical order |
| 4 | Impact | community benefit, metrics | Substantive responses |
| 5 | Logistics | resources, budget, support | Numeric validation |
| 6 | Review | (read-only summary) | None (display only) |
| 7 | Confirmation | (success message) | N/A (post-submit) |

---

## Data Layer (Convex)

### Schema Design

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  applications: defineTable({
    // Applicant Info
    fullName: v.string(),
    email: v.string(),
    unitNumber: v.string(),
    phone: v.optional(v.string()),

    // Proposal
    proposalTitle: v.string(),
    proposalDescription: v.string(),
    proposalGoals: v.array(v.string()),

    // Roadmap
    timeline: v.string(),
    milestones: v.array(v.object({
      title: v.string(),
      targetDate: v.string(),
      description: v.string(),
    })),

    // Impact
    communityBenefit: v.string(),
    expectedOutcomes: v.array(v.string()),
    successMetrics: v.string(),

    // Logistics
    resourcesNeeded: v.array(v.string()),
    estimatedBudget: v.optional(v.number()),
    supportRequested: v.string(),

    // Meta
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_submitted", ["submittedAt"]),
});
```

### Convex Functions

```
convex/
├── schema.ts                 # Schema definition
├── applications.ts           # Application mutations/queries
│   ├── submit()             # Create new application
│   ├── list()               # Get all (admin)
│   ├── getById()            # Get single application
│   ├── updateStatus()       # Change status (admin)
│   └── addReviewNotes()     # Add notes (admin)
└── _generated/              # Auto-generated types
```

**Example Functions:**

```typescript
// convex/applications.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Public: Submit application
export const submit = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    unitNumber: v.string(),
    // ... all form fields
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("applications", {
      ...args,
      status: "pending",
      submittedAt: Date.now(),
    });
  },
});

// Admin: List all applications
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("applications")
      .order("desc")
      .collect();
  },
});

// Admin: Get single application
export const getById = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Admin: Update status
export const updateStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      reviewedAt: Date.now(),
    });
  },
});
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         PUBLIC FORM                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ Form Steps  │───►│ React Hook  │───►│ localStorage│          │
│  │ (UI)        │    │ Form State  │    │ (persist)   │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                            │                                      │
│                            │ on submit                            │
│                            ▼                                      │
│                     ┌─────────────┐                              │
│                     │  Convex     │                              │
│                     │  Mutation   │                              │
│                     │  (submit)   │                              │
│                     └──────┬──────┘                              │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │    CONVEX      │
                    │   DATABASE     │
                    │  (applications)│
                    └────────┬───────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                            │          ADMIN DASHBOARD            │
│                            ▼                                      │
│                     ┌─────────────┐                              │
│                     │  Convex     │                              │
│                     │  Query      │                              │
│                     │  (list)     │                              │
│                     └──────┬──────┘                              │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ Data Table  │◄───│ useQuery()  │◄───│ Real-time   │          │
│  │ (UI)        │    │ Hook        │    │ Updates     │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Admin Architecture

### Authentication Flow

**Simple Password Protection with NextAuth.js:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  /admin     │────►│  Middleware │────►│  /admin/    │
│  (request)  │     │  (check)    │     │  login      │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                           │ has session        │ submit password
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Dashboard  │◄────│  NextAuth   │
                    │  (allowed)  │     │  (validate) │
                    └─────────────┘     └─────────────┘
```

**Implementation:**

```typescript
// src/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.password === process.env.ADMIN_PASSWORD) {
          return { id: "admin" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
};
```

**Middleware Protection:**

```typescript
// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
```

### Admin Dashboard Components

```
components/admin/
├── ApplicationsTable.tsx    # Main data table
├── ApplicationDetail.tsx    # Full application view
├── StatusBadge.tsx          # Status indicator
├── StatusDropdown.tsx       # Change status
├── ReviewNotesForm.tsx      # Add/edit notes
└── DashboardStats.tsx       # Summary counts
```

### Data Table Architecture

**shadcn/ui + TanStack Table Pattern:**

```
app/admin/
├── page.tsx           # Server component - fetch initial data
├── columns.tsx        # Column definitions (client)
└── data-table.tsx     # DataTable component (client)
```

**Columns Definition:**

```typescript
// app/admin/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/convex/_generated/dataModel";

export const columns: ColumnDef<Doc<"applications">>[] = [
  {
    accessorKey: "fullName",
    header: "Applicant",
  },
  {
    accessorKey: "unitNumber",
    header: "Unit",
  },
  {
    accessorKey: "proposalTitle",
    header: "Proposal",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => formatDate(row.getValue("submittedAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsDropdown application={row.original} />,
  },
];
```

### Admin Actions

| Action | Convex Function | UI Trigger |
|--------|-----------------|------------|
| View details | `getById` | Row click or action menu |
| Change status | `updateStatus` | Dropdown in detail view |
| Add notes | `addReviewNotes` | Text area in detail view |
| Filter by status | `list` with status arg | Tab or dropdown filter |

---

## Component Hierarchy

### Full Component Tree

```
app/
├── layout.tsx
│   └── ConvexClientProvider
│       └── children
│
├── apply/page.tsx (client)
│   └── MultiStepForm
│       ├── ProgressIndicator
│       │   └── StepDot (x8)
│       ├── AnimatePresence
│       │   └── FormStep (current)
│       │       ├── WelcomeStep
│       │       ├── ApplicantInfoStep
│       │       │   ├── Input (name)
│       │       │   ├── Input (email)
│       │       │   ├── Input (unit)
│       │       │   └── Input (phone)
│       │       ├── ProposalStep
│       │       │   ├── Input (title)
│       │       │   ├── Textarea (description)
│       │       │   └── TagInput (goals)
│       │       ├── RoadmapStep
│       │       │   ├── Input (timeline)
│       │       │   └── MilestoneList
│       │       │       └── MilestoneItem (xN)
│       │       ├── ImpactStep
│       │       │   ├── Textarea (benefit)
│       │       │   ├── TagInput (outcomes)
│       │       │   └── Textarea (metrics)
│       │       ├── LogisticsStep
│       │       │   ├── TagInput (resources)
│       │       │   ├── Input (budget)
│       │       │   └── Textarea (support)
│       │       ├── ReviewStep
│       │       │   └── SummarySection (x6)
│       │       └── ConfirmationStep
│       │           └── SuccessMessage
│       └── NavigationButtons
│           ├── BackButton
│           └── NextButton / SubmitButton
│
└── admin/
    ├── layout.tsx
    │   └── SessionProvider
    │       └── AdminLayout
    │           ├── AdminHeader
    │           └── children
    │
    ├── login/page.tsx (client)
    │   └── LoginForm
    │       ├── Input (password)
    │       └── Button (submit)
    │
    └── page.tsx
        └── ApplicationsDashboard
            ├── DashboardStats
            │   └── StatCard (x4)
            ├── FilterTabs
            └── DataTable
                ├── TableHeader
                ├── TableBody
                │   └── TableRow (xN)
                │       ├── Cell (name)
                │       ├── Cell (unit)
                │       ├── Cell (proposal)
                │       ├── StatusBadge
                │       ├── Cell (date)
                │       └── ActionsDropdown
                └── Pagination
```

### Shared Components

```
components/
├── ui/                      # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dropdown-menu.tsx
│   ├── table.tsx
│   └── dialog.tsx
│
├── form/                    # Form-specific components
│   ├── MultiStepForm.tsx
│   ├── ProgressIndicator.tsx
│   ├── NavigationButtons.tsx
│   ├── FormStep.tsx
│   └── steps/
│       ├── WelcomeStep.tsx
│       ├── ApplicantInfoStep.tsx
│       ├── ProposalStep.tsx
│       ├── RoadmapStep.tsx
│       ├── ImpactStep.tsx
│       ├── LogisticsStep.tsx
│       ├── ReviewStep.tsx
│       └── ConfirmationStep.tsx
│
├── admin/                   # Admin-specific components
│   ├── ApplicationsTable.tsx
│   ├── ApplicationDetail.tsx
│   ├── StatusBadge.tsx
│   ├── StatusDropdown.tsx
│   └── DashboardStats.tsx
│
└── providers/               # Context providers
    ├── ConvexClientProvider.tsx
    └── FormStateProvider.tsx
```

---

## Build Order

### Recommended Implementation Sequence

The build order follows dependency chains - each phase unlocks the next.

```
Phase 1: Foundation
    │
    ├── Next.js project setup
    ├── Convex integration
    ├── shadcn/ui installation
    └── Basic routing structure
         │
         ▼
Phase 2: Data Layer
    │
    ├── Convex schema definition
    ├── Basic mutations (submit)
    ├── Basic queries (list, getById)
    └── TypeScript types generated
         │
         ▼
Phase 3: Form Infrastructure
    │
    ├── React Hook Form setup
    ├── Zod schemas (per step)
    ├── Form state provider (Zustand)
    └── localStorage persistence
         │
         ▼
Phase 4: Form UI
    │
    ├── Step components (static, no animation)
    ├── Navigation logic
    ├── Progress indicator
    └── Review step (display all data)
         │
         ▼
Phase 5: Form Polish
    │
    ├── Framer Motion integration
    ├── Step transitions
    ├── Submit to Convex
    └── Confirmation step
         │
         ▼
Phase 6: Admin Auth
    │
    ├── NextAuth.js setup
    ├── Password credentials provider
    ├── Middleware protection
    └── Login page
         │
         ▼
Phase 7: Admin Dashboard
    │
    ├── Data table (TanStack Table)
    ├── Real-time updates (useQuery)
    ├── Status management
    └── Application detail view
         │
         ▼
Phase 8: Polish & Deploy
    │
    ├── Error handling
    ├── Loading states
    ├── Responsive design
    └── Production deployment
```

### Dependency Graph

```
                    ┌─────────────────┐
                    │   Foundation    │
                    │ (Next.js+Convex)│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │ Data Layer  │ │ UI Library  │ │ Auth Setup  │
       │ (schema)    │ │ (shadcn)    │ │ (NextAuth)  │
       └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
              │               │               │
              └───────┬───────┘               │
                      ▼                       │
              ┌─────────────┐                 │
              │ Form System │                 │
              │ (RHF+Zod)   │                 │
              └──────┬──────┘                 │
                     │                        │
         ┌───────────┼───────────┐            │
         ▼           ▼           ▼            │
   ┌──────────┐ ┌──────────┐ ┌──────────┐    │
   │ Steps UI │ │ Progress │ │ Submit   │    │
   └────┬─────┘ └────┬─────┘ └────┬─────┘    │
        │            │            │           │
        └────────────┼────────────┘           │
                     ▼                        │
              ┌─────────────┐                 │
              │ Animations  │                 │
              │ (Framer)    │                 │
              └──────┬──────┘                 │
                     │                        │
                     │        ┌───────────────┘
                     │        ▼
                     │  ┌─────────────┐
                     │  │ Admin Auth  │
                     │  │ (protected) │
                     │  └──────┬──────┘
                     │         │
                     └────┬────┘
                          ▼
                   ┌─────────────┐
                   │ Admin Table │
                   │ (TanStack)  │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Full System │
                   │ (complete)  │
                   └─────────────┘
```

### Build Order Rationale

1. **Foundation first** - Cannot build anything without project setup
2. **Data layer early** - TypeScript types inform all component props
3. **Form infrastructure before UI** - Validation and state management must exist before building step components
4. **Static UI before animations** - Get functionality working, then add polish
5. **Admin auth before dashboard** - Cannot build protected features without auth
6. **Dashboard last** - Depends on both data layer and auth being complete

### Risk Areas Requiring Research

| Phase | Component | Risk | Mitigation |
|-------|-----------|------|------------|
| 3 | Form state | Zustand vs Context complexity | Start simple, add Zustand if needed |
| 4 | Step validation | Per-step schema coordination | Define all schemas upfront |
| 5 | Animations | AnimatePresence edge cases | Test direction changes thoroughly |
| 6 | NextAuth.js | JWT session configuration | Follow official docs exactly |
| 7 | Real-time table | Performance with many rows | Implement pagination early |

---

## Technology Decisions Summary

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Framework | Next.js App Router | File-based routing, server components, industry standard |
| Database | Convex | Real-time, TypeScript-native, serverless |
| Form State | React Hook Form | Minimal re-renders, field-level control |
| Validation | Zod | Type-safe schemas, per-step validation |
| Step State | Zustand (or Context) | Lightweight, persists across steps |
| Persistence | localStorage | Survive page refresh, no backend needed |
| Animations | Framer Motion | AnimatePresence for exit animations |
| UI Library | shadcn/ui | Own the code, Radix primitives, Tailwind |
| Admin Auth | NextAuth.js credentials | Simple password, no user database needed |
| Data Table | TanStack Table | Sorting, filtering, pagination built-in |

---

## Sources

**HIGH Confidence (Official Documentation):**
- [Convex Next.js App Router](https://docs.convex.dev/client/nextjs/app-router/)
- [Convex Schema Documentation](https://docs.convex.dev/database/schemas)
- [Convex Quickstart](https://docs.convex.dev/quickstart/nextjs)
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table)

**MEDIUM Confidence (Verified Tutorials):**
- [LogRocket Multi-step Form Pattern](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/)
- [Build UI Framer Motion Wizard](https://buildui.com/courses/framer-motion-recipes/multistep-wizard)
- [Password Protecting Next.js Routes](https://www.alexchantastic.com/password-protecting-next)
- [Convex Relationship Patterns](https://stack.convex.dev/relationship-structures-let-s-talk-about-schemas)

**MEDIUM Confidence (Community Best Practices):**
- [React Hook Form + Zustand + Zod Pattern](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps)
- [Next.js Component Organization](https://www.getfishtank.com/insights/best-practices-for-nextjs-and-typescript-component-organization)
- [State Management in 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
