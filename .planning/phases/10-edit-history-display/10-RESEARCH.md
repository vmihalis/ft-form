# Phase 10: Edit History Display - Research

**Researched:** 2026-01-28
**Domain:** React collapsible UI patterns, Convex queries, timeline display
**Confidence:** HIGH

## Summary

Phase 10 implements a collapsible "Edit History" section in the ApplicationSheet detail panel. The foundation is already in place: Phase 8 created the `editHistory` table and `getEditHistory` query, and Phase 9 established the EditableField component that writes to this history. This phase is purely UI display work.

The implementation requires:
1. Installing `@radix-ui/react-collapsible` (consistent with existing Radix usage)
2. Creating a Collapsible UI component following shadcn/ui patterns
3. Building an EditHistory component that queries and displays edit records
4. Creating a field label mapping for human-readable display (HIST-04)
5. Integrating the EditHistory section into ApplicationSheet

**Primary recommendation:** Create a simple `EditHistory` component using Radix Collapsible, with a field label lookup constant that maps technical field names to human-readable labels (mirroring the labels already used in form steps and EditableField).

## Existing Infrastructure

### Edit History Data (Phase 8)

The `editHistory` table already exists in `convex/schema.ts`:

```typescript
editHistory: defineTable({
  applicationId: v.id("applications"),
  field: v.string(),           // Technical field name: "fullName", "email", etc.
  oldValue: v.string(),        // Previous value as string
  newValue: v.string(),        // New value as string
  editedAt: v.number(),        // Unix timestamp (Date.now())
})
  .index("by_application", ["applicationId", "editedAt"])
  .index("by_application_field", ["applicationId", "field"])
```

### Query (Phase 8)

The `getEditHistory` query already exists in `convex/applications.ts`:

```typescript
export const getEditHistory = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("editHistory")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", args.applicationId)
      )
      .order("desc")  // Most recent first (HIST-03)
      .collect();
  },
});
```

### ApplicationSheet Integration Point

The EditHistory section should be added after the "Logistics" section, before the "Submitted on" footer in `ApplicationSheet.tsx`:

```tsx
// Current structure (line ~248):
<Section title="Logistics">
  {/* Logistics fields */}
</Section>

<Separator />

{/* ADD EDIT HISTORY HERE */}

{/* Footer */}
<p className="text-sm text-muted-foreground">
  Submitted on {/* ... */}
</p>
```

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@radix-ui/react-collapsible` | 1.1.12 | Accessible expand/collapse | Already using Radix for all other primitives |
| `lucide-react` | 0.563.0 | Icons (History, ChevronDown) | Already installed, used throughout app |

### No New Dependencies for Display
| Component | Source | Notes |
|-----------|--------|-------|
| Date formatting | Native `toLocaleDateString()` | Already used in ApplicationSheet footer |
| Query | `useQuery(api.applications.getEditHistory)` | Convex pattern already established |

**Installation:**
```bash
npm install @radix-ui/react-collapsible
```

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── admin/
│   │   └── EditHistory.tsx      # NEW - Edit history display
│   └── ui/
│       └── collapsible.tsx      # NEW - shadcn-style wrapper
├── lib/
│   └── constants/
│       └── fieldLabels.ts       # NEW - Technical name to human label mapping
```

### Pattern 1: Collapsible Section

**What:** Radix Collapsible with styled trigger showing expand/collapse state
**When to use:** Any section that should be hidden by default to reduce visual clutter
**Example:**

```tsx
// Source: Radix Collapsible + shadcn/ui patterns
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, History } from "lucide-react";

function EditHistorySection({ applicationId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded-md transition-colors">
        <History className="h-4 w-4" />
        <span className="font-medium">Edit History</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 ml-auto transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* Timeline content */}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### Pattern 2: Timeline Entry

**What:** Individual edit record with field name, values, and timestamp
**When to use:** Displaying each edit in the history list
**Example:**

```tsx
// Source: Codebase conventions
function EditEntry({ edit }: { edit: EditRecord }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-l-2 border-muted pl-4 ml-2">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">
          {getFieldLabel(edit.field)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatTimestamp(edit.editedAt)}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="line-through">{edit.oldValue || "(empty)"}</span>
        {" → "}
        <span className="text-foreground">{edit.newValue || "(empty)"}</span>
      </div>
    </div>
  );
}
```

### Pattern 3: Field Label Mapping

**What:** Constant object mapping technical field names to human-readable labels
**When to use:** Displaying field names in edit history (HIST-04)
**Example:**

```typescript
// Source: Labels from form steps and ApplicationSheet
export const FIELD_LABELS: Record<string, string> = {
  // Applicant Info
  fullName: "Name",
  email: "Email",
  linkedIn: "LinkedIn",
  role: "Role",
  bio: "Bio",

  // Proposal
  floor: "Floor",
  initiativeName: "Initiative Name",
  tagline: "Tagline",
  values: "Core Values",
  targetCommunity: "Target Community",
  estimatedSize: "Estimated Community Size",

  // Roadmap
  phase1Mvp: "Phase 1: MVP (First 3 months)",
  phase2Expansion: "Phase 2: Expansion (3-6 months)",
  phase3LongTerm: "Phase 3: Long-term (6+ months)",

  // Impact
  benefitToFT: "Benefit to Frontier Tower",

  // Logistics
  existingCommunity: "Existing Community",
  spaceNeeds: "Space Needs",
  startDate: "Earliest Start Date",
  additionalNotes: "Additional Notes",
};

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}
```

### Anti-Patterns to Avoid

- **Inline label mapping:** Don't use if/else or switch statements in the component for field labels. Use a lookup constant.
- **Fetching history unconditionally:** Query should only run when collapsible is expanded (or use Convex's default caching).
- **Custom collapse animation:** Don't build custom animation; use Radix's CSS variable pattern with Tailwind.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible UI | Custom show/hide with useState | Radix Collapsible | Accessibility (keyboard, ARIA), animation support |
| Icons | Custom SVGs | Lucide React (History, ChevronDown) | Consistent with codebase, tree-shakable |
| Date formatting | Custom date logic | Native `toLocaleDateString()` | Already used in codebase, handles locale |
| Query caching | Manual caching | Convex useQuery | Automatic reactivity and caching |

**Key insight:** This phase is simpler than it appears. The data layer is complete, the query exists, and the UI is just a collapsible section with a list.

## Field Label Inventory

Complete mapping from technical field names to human-readable labels, sourced from form step components and ApplicationSheet:

| Technical Name | Human-Readable Label | Source Component |
|----------------|---------------------|------------------|
| `fullName` | "Name" | ApplicationSheet.tsx:78 |
| `email` | "Email" | ApplicationSheet.tsx:85 |
| `linkedIn` | "LinkedIn" | ApplicationSheet.tsx:92 |
| `role` | "Role" | ApplicationSheet.tsx:99 |
| `bio` | "Bio" | ApplicationSheet.tsx:106 |
| `floor` | "Floor" | ApplicationSheet.tsx:122 |
| `initiativeName` | "Initiative Name" | ApplicationSheet.tsx:130 |
| `tagline` | "Tagline" | ApplicationSheet.tsx:137 |
| `values` | "Core Values" | ApplicationSheet.tsx:145 |
| `targetCommunity` | "Target Community" | ApplicationSheet.tsx:152 |
| `estimatedSize` | "Estimated Community Size" | ApplicationSheet.tsx:160 |
| `additionalNotes` | "Additional Notes" | ApplicationSheet.tsx:170 |
| `phase1Mvp` | "Phase 1: MVP (First 3 months)" | ApplicationSheet.tsx:185 |
| `phase2Expansion` | "Phase 2: Expansion (3-6 months)" | ApplicationSheet.tsx:192 |
| `phase3LongTerm` | "Phase 3: Long-term (6+ months)" | ApplicationSheet.tsx:199 |
| `benefitToFT` | "Benefit to Frontier Tower" | ApplicationSheet.tsx:212 |
| `existingCommunity` | "Existing Community" | ApplicationSheet.tsx:226 |
| `spaceNeeds` | "Space Needs" | ApplicationSheet.tsx:233 |
| `startDate` | "Earliest Start Date" | ApplicationSheet.tsx:240 |

## Common Pitfalls

### Pitfall 1: Collapsed State Query Performance
**What goes wrong:** Querying edit history even when collapsed, wasting resources
**Why it happens:** useQuery runs immediately on mount
**How to avoid:** Either:
  - Accept it (Convex caching makes this cheap)
  - Conditionally render CollapsibleContent only when open
**Warning signs:** Slow sheet opening with applications that have many edits

### Pitfall 2: Empty State Missing
**What goes wrong:** Collapsible shows "Edit History" but when expanded, nothing appears
**Why it happens:** No edits exist yet for new applications
**How to avoid:** Show "No edits yet" message when history is empty
**Warning signs:** Empty space when collapsible is expanded

### Pitfall 3: Long Values Truncation
**What goes wrong:** Old/new values span multiple lines, breaking layout
**Why it happens:** Textarea fields can have very long content
**How to avoid:** Truncate values with ellipsis, or show first N characters
**Warning signs:** Timeline entries with huge value displays

### Pitfall 4: Floor/Size Values Show Technical Names
**What goes wrong:** History shows "floor-4" instead of "Floor 4 - Robotics & Hard Tech"
**Why it happens:** Values stored as technical identifiers
**How to avoid:** Use `getFloorLabel()` and `getEstimatedSizeLabel()` for those fields
**Warning signs:** Old/new values displaying internal identifiers

### Pitfall 5: Timestamp Timezone Issues
**What goes wrong:** Timestamps show wrong time for different locales
**Why it happens:** Using UTC without locale conversion
**How to avoid:** Use `toLocaleString()` which respects user's timezone
**Warning signs:** Edits showing future or past times that don't match reality

## Code Examples

### Collapsible UI Component (shadcn-style)

```tsx
// src/components/ui/collapsible.tsx
// Source: shadcn/ui Collapsible pattern

"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

export const Collapsible = CollapsiblePrimitive.Root;
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
export const CollapsibleContent = CollapsiblePrimitive.Content;
```

### EditHistory Component

```tsx
// src/components/admin/EditHistory.tsx
// Source: Codebase patterns + Convex React docs

"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { History, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFieldLabel } from "@/lib/constants/fieldLabels";
import { getFloorLabel } from "@/lib/constants/floors";
import { getEstimatedSizeLabel } from "@/lib/constants/estimatedSizes";

interface EditHistoryProps {
  applicationId: Id<"applications">;
}

function formatValue(field: string, value: string): string {
  if (!value) return "(empty)";

  // Special handling for select fields
  if (field === "floor") return getFloorLabel(value);
  if (field === "estimatedSize") return getEstimatedSizeLabel(value);

  // Truncate long values
  if (value.length > 100) {
    return value.substring(0, 100) + "...";
  }

  return value;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EditHistory({ applicationId }: EditHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const history = useQuery(api.applications.getEditHistory, { applicationId });

  const hasHistory = history && history.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-2 -mx-2 hover:bg-muted/50 rounded-md transition-colors">
        <History className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Edit History</span>
        {hasHistory && (
          <span className="text-xs text-muted-foreground">
            ({history.length})
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 ml-auto text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-2">
        {!hasHistory ? (
          <p className="text-sm text-muted-foreground italic py-2">
            No edits yet
          </p>
        ) : (
          <div className="space-y-0">
            {history.map((edit) => (
              <div
                key={edit._id}
                className="flex flex-col gap-1 py-3 border-l-2 border-muted pl-4 ml-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {getFieldLabel(edit.field)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(edit.editedAt)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground line-through">
                    {formatValue(edit.field, edit.oldValue)}
                  </span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <span>{formatValue(edit.field, edit.newValue)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### ApplicationSheet Integration

```tsx
// In ApplicationSheet.tsx, after Logistics section:

<Separator />

{/* Edit History */}
<EditHistory applicationId={application._id} />

<Separator />

{/* Footer */}
<p className="text-sm text-muted-foreground">
  Submitted on {/* ... */}
</p>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom accordion with useState | Radix Collapsible | 2023+ | Better a11y, animation support |
| Moment.js for dates | Native Intl APIs | 2020+ | No bundle bloat, better i18n |
| Manual ARIA management | Radix primitives | 2022+ | Automatic keyboard and screen reader support |

**Deprecated/outdated:**
- `react-collapse`: Use Radix Collapsible instead (better maintained, TypeScript support)
- Custom CSS transitions for height: Use Radix CSS variables (`--radix-collapsible-content-height`)

## Open Questions

1. **Should the collapsible be open by default?**
   - What we know: Requirements say "collapsible" but not default state
   - What's unclear: Whether admins want to see history immediately or on demand
   - Recommendation: Start collapsed (reduces visual clutter), can change based on feedback

2. **Should value truncation be expandable?**
   - What we know: Long textarea values need truncation
   - What's unclear: Whether admins need to see full old/new values
   - Recommendation: Show first 100 chars with "..." - if admins need full values, can iterate

3. **Count badge on trigger?**
   - What we know: Showing "(3)" next to "Edit History" indicates history exists
   - What's unclear: Whether this is helpful or noisy
   - Recommendation: Include count - helps admin know there's something to see

## Sources

### Primary (HIGH confidence)
- `/home/memehalis/ft-form/convex/schema.ts` - editHistory table definition
- `/home/memehalis/ft-form/convex/applications.ts` - getEditHistory query (lines 140-153)
- `/home/memehalis/ft-form/src/components/admin/ApplicationSheet.tsx` - Integration point, field labels
- [Radix Collapsible Docs](https://www.radix-ui.com/primitives/docs/components/collapsible) - Component API
- [shadcn/ui Collapsible](https://ui.shadcn.com/docs/components/collapsible) - Component wrapper pattern

### Secondary (MEDIUM confidence)
- `/home/memehalis/ft-form/src/components/form/steps/*.tsx` - Field labels from form steps
- [Lucide Icons](https://lucide.dev/icons/) - History, ChevronDown icon availability

## Metadata

**Confidence breakdown:**
- Data layer: HIGH - Query and table already exist and tested
- UI patterns: HIGH - Following established Radix/shadcn patterns
- Field labels: HIGH - Directly from existing codebase
- Pitfalls: MEDIUM - Based on common React patterns, not battle-tested

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (stable domain, minimal external dependencies)
