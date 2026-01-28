# Phase 6: Admin Dashboard - Research

**Researched:** 2026-01-28
**Domain:** React data tables, real-time subscriptions, admin UI patterns
**Confidence:** HIGH

## Summary

This phase builds an admin dashboard for managing floor lead applications. The core technical challenges are:

1. **Data table with TanStack Table + shadcn/ui** - Display applications in a filterable, sortable table
2. **Real-time subscriptions via Convex** - New submissions appear instantly without refresh
3. **Status management workflow** - Update application status through a defined state machine
4. **Detail view pattern** - Modal or sheet for viewing full application details
5. **Search and filter** - Client-side filtering by floor and text search by name/initiative

The project already has Convex set up with a properly indexed schema (including `status` field and indexes for `by_status`, `by_floor`). The existing shadcn/ui components provide a foundation but need additional components (Table, Sheet/Dialog, Badge, DropdownMenu).

**Primary recommendation:** Use TanStack Table with shadcn/ui Table component for the data grid, Convex `useQuery` for real-time subscriptions, and Sheet component for the detail view (better for dense application data than a modal).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | ^8.x | Headless table state management | Official shadcn/ui recommendation, handles sorting/filtering/pagination |
| convex | 1.31.6 (installed) | Real-time database | Already in project, provides automatic subscriptions |
| shadcn/ui Table | - | Table UI primitives | Consistent with existing UI, pairs with TanStack |
| shadcn/ui Sheet | - | Detail panel | Better than modal for dense form data |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Badge | - | Status indicators | Display application status (New, Under Review, etc.) |
| shadcn/ui DropdownMenu | - | Row actions | Status change dropdown in table rows |
| lucide-react | 0.563.0 (installed) | Icons | Sort indicators, action icons |

### Already Installed (No Action Needed)
- `convex` - Real-time database and subscriptions
- `@radix-ui/react-select` - For floor filter dropdown
- `lucide-react` - Icons
- `tailwindcss` v4 - Styling
- shadcn/ui primitives (Button, Input, Select, Card, Label, Separator)

### shadcn Components to Add
```bash
npx shadcn@latest add table sheet badge dropdown-menu dialog
```

**Note:** Dialog is optional but useful for confirmation dialogs (e.g., confirming status change to "Rejected").

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/admin/
│   ├── page.tsx                    # Main dashboard (server component wrapper)
│   ├── actions.ts                  # Existing logout action
│   ├── login/                      # Existing login page
│   └── layout.tsx                  # Optional: admin-specific layout
├── components/admin/
│   ├── ApplicationsTable.tsx       # "use client" - TanStack Table + Convex subscription
│   ├── columns.tsx                 # Column definitions for TanStack Table
│   ├── ApplicationSheet.tsx        # Detail view sheet
│   ├── StatusBadge.tsx             # Status display component
│   ├── StatusDropdown.tsx          # Status change dropdown
│   ├── FloorFilter.tsx             # Floor filter select
│   └── SearchInput.tsx             # Name/initiative search
└── convex/
    └── applications.ts             # Add query and updateStatus mutation
```

### Pattern 1: Real-Time Table with Convex useQuery

**What:** Subscribe to applications data and render with TanStack Table
**When to use:** Any table that needs real-time updates from Convex

```typescript
// Source: https://docs.convex.dev/client/react
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useReactTable, getCoreRowModel, getFilteredRowModel } from "@tanstack/react-table";

export function ApplicationsTable() {
  // Real-time subscription - automatically updates when data changes
  const applications = useQuery(api.applications.list);

  const table = useReactTable({
    data: applications ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // ... filtering and sorting state
  });

  // Handle loading state
  if (applications === undefined) {
    return <TableSkeleton />;
  }

  return <Table>...</Table>;
}
```

### Pattern 2: Client-Side Filtering with TanStack Table

**What:** Filter table data without server round-trips
**When to use:** When dataset is small enough for client-side filtering (< 1000 rows)

```typescript
// Source: https://tanstack.com/table/v8/docs/guide/column-filtering
import { useState } from "react";
import { ColumnFiltersState, getFilteredRowModel } from "@tanstack/react-table";

const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const [globalFilter, setGlobalFilter] = useState("");

const table = useReactTable({
  data,
  columns,
  state: {
    columnFilters,
    globalFilter,
  },
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
  getFilteredRowModel: getFilteredRowModel(),
  globalFilterFn: "includesString", // Built-in fuzzy matching
});

// Filter by floor (column filter)
table.getColumn("floor")?.setFilterValue("floor-2");

// Search by name or initiative (global filter)
setGlobalFilter("John");
```

### Pattern 3: Sheet for Detail View

**What:** Slide-in panel showing full application details
**When to use:** Viewing dense, multi-section data (like a full application form)

```typescript
// Source: https://ui.shadcn.com/docs/components/sheet
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function ApplicationSheet({
  application,
  open,
  onOpenChange
}: {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{application?.initiativeName}</SheetTitle>
        </SheetHeader>
        {/* Application details organized by section */}
      </SheetContent>
    </Sheet>
  );
}
```

### Pattern 4: Status Badge with Variants

**What:** Color-coded status indicators
**When to use:** Displaying application status in table and detail view

```typescript
// Source: https://ui.shadcn.com/docs/components/badge
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS = {
  new: "default",           // Blue/primary
  under_review: "secondary", // Gray
  accepted: "success",       // Green (custom variant or use outline)
  rejected: "destructive",   // Red
} as const;

const STATUS_LABELS = {
  new: "New",
  under_review: "Under Review",
  accepted: "Accepted",
  rejected: "Rejected",
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS_LABELS }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
```

### Pattern 5: Convex Mutation for Status Update

**What:** Update application status with proper validation
**When to use:** Changing status from dropdown or button

```typescript
// convex/applications.ts
// Source: https://docs.convex.dev/functions/mutation-functions
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const updateStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.union(
      v.literal("new"),
      v.literal("under_review"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Return all applications, ordered by submission date (newest first)
    return await ctx.db
      .query("applications")
      .withIndex("by_submitted")
      .order("desc")
      .collect();
  },
});
```

### Anti-Patterns to Avoid
- **Server-side filtering for small datasets:** The applications table will likely have < 1000 rows. Client-side filtering with TanStack Table is simpler and faster than creating multiple Convex queries.
- **Polling for updates:** Convex subscriptions are automatic. Never use `setInterval` to refetch data.
- **Separate page for details:** A modal or sheet keeps context better than navigating away.
- **Complex status state machines:** For 4 statuses with no transition rules, a simple dropdown is sufficient. Don't over-engineer with state machines.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table sorting/filtering | Custom sort/filter logic | TanStack Table | Handles edge cases, keyboard nav, performance |
| Real-time updates | Polling or manual refetch | Convex useQuery | Automatic WebSocket subscriptions |
| Modal/Sheet state | useState with portal logic | shadcn Sheet | Handles focus trap, animations, accessibility |
| Status dropdown | Custom dropdown implementation | shadcn DropdownMenu | Keyboard navigation, accessibility |
| Date formatting | Manual date string manipulation | Native `Intl.DateTimeFormat` or `date-fns` | Locale handling, edge cases |

**Key insight:** TanStack Table + shadcn/ui + Convex handle 90% of admin dashboard complexity. The remaining work is composition and styling.

## Common Pitfalls

### Pitfall 1: Loading State Flash
**What goes wrong:** Table shows empty state briefly before data loads
**Why it happens:** `useQuery` returns `undefined` while loading
**How to avoid:** Check for `undefined` and show skeleton, not empty state
**Warning signs:** Brief "No applications" message on page load

```typescript
// WRONG
if (!applications || applications.length === 0) {
  return <div>No applications</div>;
}

// RIGHT
if (applications === undefined) {
  return <TableSkeleton />;
}
if (applications.length === 0) {
  return <EmptyState />;
}
```

### Pitfall 2: Filter State Not Syncing
**What goes wrong:** Filter dropdown shows one value but table shows different data
**Why it happens:** TanStack Table state and UI state get out of sync
**How to avoid:** Use controlled state from TanStack Table, not separate useState
**Warning signs:** Filters "don't work" or show wrong values

```typescript
// Get filter value from table, not separate state
const floorFilter = table.getColumn("floor")?.getFilterValue() as string | undefined;
```

### Pitfall 3: Sheet Closing on Click Inside
**What goes wrong:** Detail sheet closes when clicking inside it
**Why it happens:** Missing `onInteractOutside` handler or wrong event propagation
**How to avoid:** Use shadcn Sheet defaults, they handle this correctly
**Warning signs:** Can't interact with sheet content

### Pitfall 4: Mutation Without Feedback
**What goes wrong:** User changes status but doesn't know if it worked
**Why it happens:** No loading state or confirmation
**How to avoid:** Use `useMutation` with pending state, show toast on completion
**Warning signs:** Users clicking status dropdown multiple times

```typescript
import { useMutation } from "convex/react";

const updateStatus = useMutation(api.applications.updateStatus);

// In handler
await updateStatus({ id, status: newStatus });
// Show toast or optimistic update
```

### Pitfall 5: Search Filtering All Columns
**What goes wrong:** Search matches fields user doesn't expect (like email, bio)
**Why it happens:** Global filter searches all columns by default
**How to avoid:** Use column-specific filter or configure `globalFilterFn`
**Warning signs:** Search for "john" returns applications with "john" in bio text

## Code Examples

Verified patterns from official sources:

### Column Definitions with Click Handler
```typescript
// Source: https://ui.shadcn.com/docs/components/data-table
import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/convex/_generated/dataModel";

export const columns: ColumnDef<Doc<"applications">>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "floor",
    header: "Floor",
    cell: ({ row }) => getFloorLabel(row.getValue("floor")),
    filterFn: "equals", // Exact match for floor filter
  },
  {
    accessorKey: "initiativeName",
    header: "Initiative",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "submittedAt",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("submittedAt")).toLocaleDateString(),
  },
];
```

### Table Row with Click Handler
```typescript
// Source: https://ui.shadcn.com/docs/components/data-table
<TableBody>
  {table.getRowModel().rows.map((row) => (
    <TableRow
      key={row.id}
      onClick={() => setSelectedApplication(row.original)}
      className="cursor-pointer"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ))}
</TableBody>
```

### Complete Convex Query with Index
```typescript
// convex/applications.ts
// Source: https://docs.convex.dev/database/reading-data/indexes/
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Uses by_submitted index for efficient ordering
    return await ctx.db
      .query("applications")
      .withIndex("by_submitted")
      .order("desc")
      .collect();
  },
});

// Optional: Get single application by ID
export const get = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-table v7 | TanStack Table v8 | 2022 | Headless, better TS support |
| Polling for updates | Convex subscriptions | N/A (Convex default) | Zero-config real-time |
| Custom modals | shadcn/ui Sheet | N/A (shadcn pattern) | Accessible, animated |
| Redux for table state | TanStack Table internal state | 2022 | Simpler, less boilerplate |

**Deprecated/outdated:**
- `react-table` v7: Use `@tanstack/react-table` instead
- Manual WebSocket subscriptions with Convex: Use `useQuery` instead, it handles subscriptions automatically

## Open Questions

Things that couldn't be fully resolved:

1. **Global search across multiple columns**
   - What we know: TanStack Table supports `globalFilter` for searching all columns
   - What's unclear: Requirement says "name or initiative name" - should we limit to those columns?
   - Recommendation: Configure `globalFilterFn` to only search `fullName` and `initiativeName` columns

2. **Confirmation on status change to "Rejected"**
   - What we know: Changing to rejected is destructive action
   - What's unclear: Should there be confirmation dialog?
   - Recommendation: Add Alert Dialog for destructive actions (Rejected), immediate update for others

3. **Row actions column**
   - What we know: Requirements mention clicking row for details, status change
   - What's unclear: Should there be explicit action buttons or just row click + inline status?
   - Recommendation: Row click for details, status dropdown directly in status cell

## Sources

### Primary (HIGH confidence)
- [Convex React Client](https://docs.convex.dev/client/react) - useQuery, useMutation patterns
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table) - TanStack Table integration
- [shadcn/ui Sheet](https://ui.shadcn.com/docs/components/sheet) - Detail panel pattern
- [TanStack Table Column Filtering](https://tanstack.com/table/v8/docs/api/features/column-filtering) - Filter APIs
- [Convex Indexes](https://docs.convex.dev/database/reading-data/indexes/) - Query optimization

### Secondary (MEDIUM confidence)
- [shadcn/ui Badge](https://ui.shadcn.com/docs/components/badge) - Status indicators
- [shadcn/ui DropdownMenu](https://ui.shadcn.com/docs/components/dropdown-menu) - Action menus
- [Convex Full Text Search](https://docs.convex.dev/search/text-search) - Alternative for larger datasets

### Tertiary (LOW confidence)
- Community patterns for admin dashboards (multiple sources)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shadcn/ui + TanStack Table is the documented pattern
- Architecture: HIGH - Convex real-time subscriptions are well-documented
- Pitfalls: MEDIUM - Based on common patterns, not project-specific testing
- UI patterns: HIGH - shadcn/ui official documentation

**Research date:** 2026-01-28
**Valid until:** 30 days (stable libraries, patterns unlikely to change)
