# Phase 19: Dashboard Enhancement - Research

**Researched:** 2026-01-29
**Domain:** Admin dashboard stats, activity feeds, and internal notes
**Confidence:** HIGH

## Summary

Phase 19 enhances the admin dashboard with three key features: stats cards showing submission counts by status, an activity feed displaying recent submissions and status changes, and internal notes on submissions. The research confirms all features can be implemented using existing project patterns and dependencies with no new libraries required.

The stats and activity feed require new Convex queries that leverage existing indexes. For the small scale of this application (likely <1000 submissions), using `.collect()` and counting in memory is the recommended approach per Convex best practices. The notes feature requires a schema change to add an optional `notes` field to the submissions table.

**Primary recommendation:** Build stats cards and activity feed as client components using existing shadcn/ui Card primitives. Use simple `.collect()` queries for aggregation given the small dataset size. Add notes as an optional field on submissions table with a Textarea UI component following existing editable field patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Convex | 1.31.6 | Backend queries, mutations | Already powers all data; `.collect()` sufficient for small datasets |
| shadcn/ui Card | Installed | Stats card containers | Existing component, matches project design |
| shadcn/ui Textarea | Installed | Notes input | Existing component, project already uses |
| lucide-react | ^0.563.0 | Icons for cards/feed | Already in project |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TanStack Table | ^8.21.3 | Existing submissions table | Activity feed can reuse table patterns |
| @tanstack/react-table | ^8.21.3 | Column definitions | Already have submissions-columns.tsx |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual count | @convex-dev/aggregate | Overkill for <1000 docs; adds complexity |
| Custom cards | Tremor charts library | Adds ~200KB bundle; not needed for simple stats |
| Activity feed | react-activity-feed | Unmaintained (4 years old); simple list is better |

**Installation:**
```bash
# No new dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/admin/
│   ├── AdminDashboard.tsx      # MODIFY: Add stats + activity above tabs
│   ├── DashboardStats.tsx      # NEW: Stats cards row
│   ├── ActivityFeed.tsx        # NEW: Recent activity list
│   ├── SubmissionSheet.tsx     # MODIFY: Add notes section
│   └── NotesEditor.tsx         # NEW: Notes textarea with save
convex/
└── submissions.ts              # MODIFY: Add stats, activity, notes queries/mutations
```

### Pattern 1: Stats Cards with Convex Query
**What:** Single query that returns counts grouped by status
**When to use:** Dashboard overview with <1000 total documents
**Example:**
```typescript
// convex/submissions.ts - Stats query
// Source: Convex best practices for small datasets
export const getStats = query({
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();

    const stats = {
      total: submissions.length,
      new: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
    };

    for (const sub of submissions) {
      stats[sub.status]++;
    }

    return stats;
  },
});
```

### Pattern 2: Activity Feed with Recent Items
**What:** Query that returns recent submissions and status changes combined
**When to use:** Showing "what happened recently" in chronological order
**Example:**
```typescript
// convex/submissions.ts - Activity feed query
// Source: Convex index ordering
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Recent submissions
    const recentSubmissions = await ctx.db
      .query("submissions")
      .withIndex("by_submitted")
      .order("desc")
      .take(limit);

    // Recent status changes (from edit history)
    const recentStatusChanges = await ctx.db
      .query("submissionEditHistory")
      .order("desc")
      .filter((q) => q.eq(q.field("fieldId"), "__status"))
      .take(limit);

    // Combine and sort by timestamp
    const activities = [
      ...recentSubmissions.map(s => ({
        type: "submission" as const,
        timestamp: s.submittedAt,
        data: s,
      })),
      ...recentStatusChanges.map(h => ({
        type: "status_change" as const,
        timestamp: h.editedAt,
        data: h,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    return activities;
  },
});
```

### Pattern 3: Notes as Optional Field
**What:** Add optional notes field to submissions schema
**When to use:** Admin-only internal notes not visible to applicants
**Example:**
```typescript
// convex/schema.ts modification
submissions: defineTable({
  formVersionId: v.id("formVersions"),
  data: v.string(),
  status: v.union(
    v.literal("new"),
    v.literal("under_review"),
    v.literal("accepted"),
    v.literal("rejected")
  ),
  submittedAt: v.number(),
  notes: v.optional(v.string()), // NEW: Admin internal notes
})
```

### Pattern 4: Stats Card Component
**What:** Reusable card displaying single metric with label
**When to use:** Dashboard KPI display
**Example:**
```tsx
// Source: shadcn/ui Card pattern
interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Anti-Patterns to Avoid
- **Using @convex-dev/aggregate for small datasets:** Adds complexity without benefit for <1000 docs
- **Separate queries per status:** N queries instead of 1; inefficient
- **Tracking status changes separately:** Use existing submissionEditHistory table
- **Making notes a separate table:** Overkill for single text field; inline is simpler
- **Real-time activity feed with subscriptions:** useQuery already provides reactivity

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stats aggregation | Custom aggregation table | `.collect()` + count in query | Under 1000 docs, simple is better |
| Activity timestamps | Separate activity log table | submissionEditHistory + submissions | Already tracks changes |
| Card layout | Custom card styling | shadcn/ui Card components | Already styled, accessible |
| Status change tracking | New statusHistory table | Use submissionEditHistory with fieldId="__status" | Reuses existing infrastructure |
| Relative time display | Custom time formatting | JavaScript Intl.RelativeTimeFormat | Built-in, i18n-ready |

**Key insight:** All three requirements can be implemented by extending existing infrastructure - no new tables or complex patterns needed.

## Common Pitfalls

### Pitfall 1: Over-Engineering Stats Queries
**What goes wrong:** Building complex aggregation infrastructure for tiny datasets
**Why it happens:** Applying big-data patterns to small-data problems
**How to avoid:** Check dataset size first; `.collect()` is fine under 1000 docs
**Warning signs:** Adding npm dependencies for counting

### Pitfall 2: Activity Feed N+1 Queries
**What goes wrong:** Fetching submission details for each activity item separately
**Why it happens:** Not enriching data in the initial query
**How to avoid:** Enrich activity items with form names in the Convex query, not client
**Warning signs:** Multiple loading spinners in activity feed

### Pitfall 3: Notes Not Saving on Blur
**What goes wrong:** Admin loses notes when clicking away
**Why it happens:** Missing blur handler or debounce too aggressive
**How to avoid:** Follow existing DynamicEditableField pattern - save on blur
**Warning signs:** Admin complains notes disappear

### Pitfall 4: Relative Time Stale Display
**What goes wrong:** "5 minutes ago" never updates to "10 minutes ago"
**Why it happens:** Component doesn't re-render without state change
**How to avoid:** Either accept static display or add interval to refresh
**Warning signs:** Times appear frozen; better to show absolute time for admin

### Pitfall 5: Status Change Tracking Missing Old Status
**What goes wrong:** Activity feed shows "Status changed to Accepted" but not from what
**Why it happens:** Only recording new status, not transition
**How to avoid:** Existing submissionEditHistory already stores oldValue and newValue
**Warning signs:** Activity feed items lack context

## Code Examples

Verified patterns from official sources:

### Dashboard Stats Query (Convex)
```typescript
// convex/submissions.ts
// Source: Convex best practices for small datasets
export const getStats = query({
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();

    return {
      total: submissions.length,
      new: submissions.filter(s => s.status === "new").length,
      under_review: submissions.filter(s => s.status === "under_review").length,
      accepted: submissions.filter(s => s.status === "accepted").length,
      rejected: submissions.filter(s => s.status === "rejected").length,
    };
  },
});
```

### Stats Cards Row Component
```tsx
// src/components/admin/DashboardStats.tsx
// Source: shadcn/ui Card, project patterns
"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

const statConfig = [
  { key: "total", label: "Total Submissions", icon: FileText },
  { key: "new", label: "New", icon: Clock },
  { key: "accepted", label: "Accepted", icon: CheckCircle },
  { key: "rejected", label: "Rejected", icon: XCircle },
] as const;

export function DashboardStats() {
  const stats = useQuery(api.submissions.getStats);

  if (stats === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statConfig.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Activity Feed Query (Convex)
```typescript
// convex/submissions.ts
// Source: Convex query patterns
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Get recent submissions with form info
    const recentSubmissions = await ctx.db
      .query("submissions")
      .withIndex("by_submitted")
      .order("desc")
      .take(limit);

    // Enrich with form names
    const enrichedSubmissions = await Promise.all(
      recentSubmissions.map(async (sub) => {
        const version = await ctx.db.get(sub.formVersionId);
        const form = version ? await ctx.db.get(version.formId) : null;
        return {
          type: "submission" as const,
          timestamp: sub.submittedAt,
          submissionId: sub._id,
          formName: form?.name ?? "Unknown Form",
          status: sub.status,
        };
      })
    );

    return enrichedSubmissions;
  },
});
```

### Notes Editor Component
```tsx
// src/components/admin/NotesEditor.tsx
// Source: Project DynamicEditableField pattern, shadcn/ui Textarea
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface NotesEditorProps {
  submissionId: Id<"submissions">;
  initialNotes: string | undefined;
}

export function NotesEditor({ submissionId, initialNotes }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const updateNotes = useMutation(api.submissions.updateNotes);

  const handleSave = async () => {
    if (notes === initialNotes) return;
    setIsSaving(true);
    try {
      await updateNotes({ submissionId, notes });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Add internal notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleSave}
        rows={3}
      />
      {notes !== initialNotes && (
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Notes"}
        </Button>
      )}
    </div>
  );
}
```

### Notes Mutation (Convex)
```typescript
// convex/submissions.ts
// Source: Project mutation patterns
export const updateNotes = mutation({
  args: {
    submissionId: v.id("submissions"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");

    await ctx.db.patch(args.submissionId, {
      notes: args.notes || undefined, // Store undefined if empty to save space
    });

    return args.submissionId;
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side dashboard aggregation | Client queries with Convex reactivity | 2023+ | Real-time updates without refresh |
| Activity log table | Reuse edit history table | Project pattern | Less schema complexity |
| Complex chart libraries | Simple cards with icons | UX trend | Faster load, cleaner UI |

**Deprecated/outdated:**
- @convex-dev/aggregate for small datasets: Overkill, adds complexity
- Separate activity tracking table: Redundant with edit history
- Server-rendered stats: Loses Convex real-time benefits

## Open Questions

Things that couldn't be fully resolved:

1. **Status change tracking in activity feed**
   - What we know: submissionEditHistory tracks field changes
   - What's unclear: Currently no status changes are recorded in edit history (status is updated via updateStatus mutation which doesn't create history)
   - Recommendation: Modify updateStatus to optionally log to submissionEditHistory with fieldId="__status" for tracking, OR create simpler activity feed showing only new submissions

2. **Activity feed item count**
   - What we know: Requirements say "recent submissions and status changes"
   - What's unclear: How many items to show (5? 10? 20?)
   - Recommendation: Default to 10, make configurable via query arg

3. **Notes persistence timing**
   - What we know: Similar to DynamicEditableField pattern
   - What's unclear: Save on blur vs explicit save button
   - Recommendation: Save on blur with visual feedback (following project pattern)

## Sources

### Primary (HIGH confidence)
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/) - Small dataset patterns
- [Convex Why No COUNT](https://stack.convex.dev/why-doesn-t-convex-have-select-or-count) - Aggregation strategy
- [shadcn/ui Card](https://ui.shadcn.com/docs/components/card) - Stats card component
- [shadcn/ui Textarea](https://ui.shadcn.com/docs/components/textarea) - Notes input component
- Project codebase - Existing patterns (DynamicEditableField, SubmissionSheet)

### Secondary (MEDIUM confidence)
- [Convex Queries That Scale](https://stack.convex.dev/queries-that-scale) - Performance patterns
- [Tremor Dashboard Components](https://www.tremor.so/) - Stats card design patterns

### Tertiary (LOW confidence)
- N/A - All findings verified with authoritative sources or project code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using only existing project dependencies
- Architecture: HIGH - Follows established project patterns
- Stats queries: HIGH - Convex best practices for small datasets confirmed
- Activity feed: MEDIUM - Status tracking needs decision (see Open Questions)
- Notes feature: HIGH - Simple schema extension + existing UI patterns

**Research date:** 2026-01-29
**Valid until:** 90 days (stable domain, no fast-moving dependencies)
