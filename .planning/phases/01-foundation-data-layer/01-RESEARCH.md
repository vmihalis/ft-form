# Phase 1: Foundation & Data Layer - Research

**Researched:** 2026-01-27
**Domain:** Next.js 16 + Convex + shadcn/ui project scaffolding
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for the Frontier Tower floor lead application system. The stack consists of Next.js 16 with App Router (using Turbopack), Convex as the backend-as-a-service for database and real-time functionality, Tailwind CSS 4 for styling, and shadcn/ui for accessible UI components.

The implementation follows a straightforward path: scaffold Next.js 16 project with TypeScript and Tailwind, install and configure Convex with schema definition, initialize shadcn/ui, and create the three route placeholders (/apply, /admin, /admin/login). The database schema for applications needs proper indexes for efficient querying by status and floor.

**Primary recommendation:** Use `npx create-next-app@16` with all defaults (TypeScript, Tailwind, ESLint, App Router, Turbopack), then layer in Convex and shadcn/ui sequentially. Define the full database schema upfront with all indexes to avoid migration complexity later.

## Standard Stack

The established libraries/tools for this foundation phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.5 | Full-stack React framework with App Router | Industry standard, Vercel deployment native, Turbopack default |
| Tailwind CSS | 4.1.18 | Utility-first CSS framework | Built into create-next-app, shadcn/ui dependency |
| Convex | 1.31.6 | Backend-as-a-service (database + real-time) | Real-time subscriptions, TypeScript-native, serverless |
| React | 19.2.x | UI library | Bundled with Next.js 16, React Compiler included |
| TypeScript | 5.x | Type safety | Next.js 16 default, Convex generates types |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icon library | Bundled with shadcn/ui, tree-shakeable |
| class-variance-authority | latest | Component variant styling | Installed with shadcn/ui |
| clsx | latest | Conditional class names | Installed with shadcn/ui |
| tailwind-merge | latest | Merge Tailwind classes safely | Installed with shadcn/ui |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Convex | Supabase/Firebase | Convex has better TypeScript integration and real-time is simpler |
| shadcn/ui | Radix UI directly | shadcn/ui pre-styles components, saves time |
| Tailwind | CSS Modules | Tailwind integrates better with shadcn/ui |

**Installation:**

```bash
# Step 1: Create Next.js project with all defaults
npx create-next-app@16 ft-form --typescript --tailwind --eslint --app --src-dir --import-alias="@/*" --turbopack

# Step 2: Install Convex
npm install convex

# Step 3: Initialize shadcn/ui
npx shadcn@latest init

# Step 4: Add initial shadcn components
npx shadcn@latest add button
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ConvexClientProvider
│   ├── page.tsx                # Root page (redirect to /apply)
│   ├── apply/
│   │   └── page.tsx            # Multi-step form (Phase 2+)
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (Phase 5+)
│   │   ├── page.tsx            # Admin dashboard (Phase 6+)
│   │   └── login/
│   │       └── page.tsx        # Admin login (Phase 5+)
│   └── providers.tsx           # ConvexClientProvider wrapper
├── components/
│   └── ui/                     # shadcn/ui components
│       └── button.tsx          # First test component
├── lib/
│   └── utils.ts                # cn() helper from shadcn/ui
└── convex/
    ├── _generated/             # Auto-generated types (DO NOT EDIT)
    ├── schema.ts               # Database schema definition
    └── applications.ts         # Application queries/mutations (Phase 3+)
```

### Pattern 1: ConvexClientProvider Setup

**What:** Client-side Convex provider that wraps the app
**When to use:** Required for all Convex hooks (useQuery, useMutation)
**Example:**

```typescript
// src/app/providers.tsx
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Create client outside component to avoid reconnection on re-render
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

```typescript
// src/app/layout.tsx
import { ConvexClientProvider } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

### Pattern 2: Convex Schema with Indexes

**What:** Type-safe database schema with query-optimized indexes
**When to use:** Define upfront before any data is inserted
**Example:**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  applications: defineTable({
    // Applicant Info
    fullName: v.string(),
    email: v.string(),
    linkedIn: v.optional(v.string()),
    role: v.string(),
    bio: v.string(),

    // Proposal
    floor: v.string(),
    floorOther: v.optional(v.string()), // When floor is "Other"
    initiativeName: v.string(),
    tagline: v.string(),
    values: v.string(),
    targetCommunity: v.string(),
    estimatedSize: v.string(),

    // Roadmap
    phase1Mvp: v.string(),
    phase2Expansion: v.string(),
    phase3LongTerm: v.string(),

    // Impact
    benefitToFT: v.string(),

    // Logistics
    existingCommunity: v.string(),
    spaceNeeds: v.string(),
    startDate: v.string(),
    additionalNotes: v.optional(v.string()),

    // Meta
    status: v.union(
      v.literal("new"),
      v.literal("under_review"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    submittedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_floor", ["floor"])
    .index("by_email", ["email"])
    .index("by_submitted", ["submittedAt"]),
});
```

### Pattern 3: Placeholder Page Components

**What:** Minimal page.tsx files that render correctly
**When to use:** All routes in Phase 1 (fleshed out in later phases)
**Example:**

```typescript
// src/app/apply/page.tsx
export default function ApplyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Floor Lead Application</h1>
      <p className="mt-4 text-muted-foreground">Coming soon...</p>
    </main>
  );
}
```

### Anti-Patterns to Avoid

- **Creating ConvexReactClient inside component:** Causes WebSocket reconnection on every re-render
- **Skipping indexes:** Leads to full table scans; define indexes with schema
- **Using Pages Router patterns:** App Router uses different conventions (no _app.tsx)
- **Importing server code in client components:** "use client" boundary must be respected

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Component class merging | Manual string concatenation | `cn()` from shadcn/ui utils | Handles Tailwind conflicts properly |
| Database client | Raw WebSocket connection | ConvexReactClient | Handles reconnection, caching, subscriptions |
| Environment variables | Manual process.env | Next.js built-in env handling | Automatic NEXT_PUBLIC_ prefix handling |
| Project scaffolding | Manual file creation | create-next-app@16 | Correct config for Turbopack, React Compiler |
| TypeScript types for Convex | Manual interface definitions | Generated from schema | `npx convex dev` auto-generates |

**Key insight:** The tooling for this stack is mature. Fighting it by hand-rolling solutions adds bugs without adding value. Use the CLI tools and generated code.

## Common Pitfalls

### Pitfall 1: Missing NEXT_PUBLIC_ Prefix for Convex URL

**What goes wrong:** Convex client fails silently because environment variable is undefined in browser
**Why it happens:** Next.js only exposes env vars with NEXT_PUBLIC_ prefix to client-side code
**How to avoid:** Ensure `.env.local` has `NEXT_PUBLIC_CONVEX_URL` (auto-generated by `npx convex dev`)
**Warning signs:** "Cannot read properties of undefined" errors, blank page, network tab shows no WebSocket

### Pitfall 2: ConvexReactClient Inside Component

**What goes wrong:** WebSocket connection thrashing, memory leaks, slow performance
**Why it happens:** Creating client inside component causes new connection per render
**How to avoid:** Create `ConvexReactClient` outside the component function (module scope)
**Warning signs:** Multiple WebSocket connections in network tab, increasing memory usage

### Pitfall 3: Forgetting "use client" Directive

**What goes wrong:** "useState/useEffect is not a function" errors
**Why it happens:** App Router defaults to Server Components; Convex hooks require client
**How to avoid:** Add `"use client"` at top of any file using Convex hooks or React state
**Warning signs:** Hydration errors, "React Context" errors in server components

### Pitfall 4: Schema Changes Without Convex Dev Running

**What goes wrong:** Schema changes not deployed, types outdated, queries fail
**Why it happens:** Convex dev process syncs schema to cloud; if stopped, schema is stale
**How to avoid:** Keep `npx convex dev` running during development
**Warning signs:** Schema validation errors, TypeScript errors about missing fields

### Pitfall 5: Missing Index for Common Queries

**What goes wrong:** Slow queries that scan entire table
**Why it happens:** Convex requires explicit `.withIndex()` usage
**How to avoid:** Define indexes for every field you'll filter by (status, floor, email)
**Warning signs:** Query timeout warnings, slow dashboard loading with many records

## Code Examples

Verified patterns from official sources:

### Next.js 16 Create Command

```bash
# Source: https://nextjs.org/docs/app/api-reference/cli/create-next-app
npx create-next-app@16 my-app --typescript --tailwind --eslint --app --src-dir --import-alias="@/*" --turbopack
```

### Convex Development Setup

```bash
# Source: https://docs.convex.dev/quickstart/nextjs

# Install Convex
npm install convex

# Initialize Convex (prompts for GitHub auth, creates project)
npx convex dev
```

### shadcn/ui Initialization

```bash
# Source: https://ui.shadcn.com/docs/installation/next

# Initialize shadcn/ui (interactive prompts for style, color, etc.)
npx shadcn@latest init

# Add specific components
npx shadcn@latest add button input textarea select
```

### Root Layout with Providers

```typescript
// Source: https://docs.convex.dev/client/nextjs/app-router/

// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frontier Tower Floor Lead Application",
  description: "Apply to lead a floor at Frontier Tower",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

### Convex Query in Page Component

```typescript
// Source: https://docs.convex.dev/client/nextjs/app-router/

"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ApplicationsPage() {
  // This subscribes to real-time updates automatically
  const applications = useQuery(api.applications.list);

  if (applications === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {applications.map((app) => (
        <div key={app._id}>{app.fullName}</div>
      ))}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13+ (2023) | File-based routing, server components |
| Webpack | Turbopack | Next.js 16 (2025) | 2-5x faster builds, default in Next.js 16 |
| Manual memoization | React Compiler | Next.js 16 (2025) | Auto-optimization, no useMemo/useCallback needed |
| middleware.ts | proxy.ts | Next.js 16 (2025) | Explicit network boundary, Node.js runtime |
| Tailwind CSS 3 | Tailwind CSS 4 | 2025 | New engine, faster builds, CSS-first config |

**Deprecated/outdated:**

- `pages/` directory: Use `app/` directory with App Router
- `middleware.ts`: Renamed to `proxy.ts` in Next.js 16
- Manual ESLint runs during build: `next build` no longer runs linter by default in Next.js 16
- Webpack in dev: Turbopack is now default

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Frontier Tower floor list**
   - What we know: Form needs floor dropdown with all FT floors + "Other" option
   - What's unclear: The actual floor names/numbers for Frontier Tower
   - Recommendation: Use placeholder array in schema, update when floor list provided

2. **Brand colors application**
   - What we know: Primary purple #7b42e7 and white
   - What's unclear: Whether these are only colors or if grays/accents needed
   - Recommendation: Configure in Tailwind config, extend as needed in Phase 4

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Documentation](https://nextjs.org/docs/app/getting-started/installation) - project setup, file conventions
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) - Turbopack default, proxy.ts, React Compiler
- [Convex Next.js Quickstart](https://docs.convex.dev/quickstart/nextjs) - installation, provider setup
- [Convex Schemas Documentation](https://docs.convex.dev/database/schemas) - defineTable, validators
- [Convex Indexes Documentation](https://docs.convex.dev/database/reading-data/indexes/) - index definition, withIndex
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - CLI init, component adding

### Secondary (MEDIUM confidence)
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - file conventions
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/) - coding patterns
- npm registry - verified exact versions (Next.js 16.1.5, Convex 1.31.6, Tailwind 4.1.18)

### Tertiary (LOW confidence)
- None for this phase - all claims verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified via npm, setup verified via official docs
- Architecture: HIGH - patterns directly from Convex and Next.js documentation
- Pitfalls: HIGH - documented in official best practices and GitHub issues

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (stable stack, 30-day validity)
