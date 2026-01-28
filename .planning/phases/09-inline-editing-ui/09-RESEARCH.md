# Phase 9: Inline Editing UI - Research

**Researched:** 2026-01-28
**Domain:** React inline editing patterns, Convex mutations from React
**Confidence:** HIGH

## Summary

Phase 9 implements click-to-edit functionality for the admin detail panel (ApplicationSheet). The existing codebase provides a solid foundation: Phase 8 established the `updateField` mutation with atomic history tracking, Zod schemas define all validation rules, and UI primitives (Input, Textarea, Select) follow consistent patterns.

The implementation requires transforming the current read-only `Field` component in ApplicationSheet into an editable variant that:
1. Displays field value normally with a pencil icon on hover
2. Transforms into an input/textarea/select on click
3. Saves on blur/Enter, cancels on Escape
4. Validates before save using existing Zod schemas
5. Calls `updateField` mutation to persist changes

**Primary recommendation:** Create a single `EditableField` component that handles all field types (text, textarea, select, date) with consistent UX patterns, leveraging existing Input/Textarea/Select components and Zod validation schemas.

## Existing Components

### ApplicationSheet.tsx
The detail panel currently uses a read-only `Field` component:

```tsx
function Field({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}
```

This component will need to be replaced/enhanced with an editable version.

### StatusDropdown.tsx
Already implements an inline-edit pattern for the status field using:
- `useMutation(api.applications.updateStatus)` - demonstrates mutation pattern
- DropdownMenu from Radix UI - for select-like fields
- Optimistic updates via Convex

### UI Primitives Available
| Component | File | Use Case |
|-----------|------|----------|
| Input | `/src/components/ui/input.tsx` | Single-line text fields |
| Textarea | `/src/components/ui/textarea.tsx` | Multi-line text fields |
| Select | `/src/components/ui/select.tsx` | Dropdown selections (floor, estimatedSize) |
| FieldError | `/src/components/ui/field.tsx` | Error message display |

### Validation Schemas
All validation rules exist in `/src/lib/schemas/application.ts`:
- Email: `z.string().email()`
- URL: `z.string().url().optional().or(z.literal(""))`
- Required strings: `z.string().min(1, "...")`
- Max length: `z.string().max(100, "...")`

## Field Inventory

All 18 editable fields from the applications schema:

### Applicant Info Section (5 fields)
| Field | Type | Input Type | Validation | Required |
|-------|------|------------|------------|----------|
| `fullName` | string | Input | min(1) | Yes |
| `email` | string | Input[email] | email format | Yes |
| `linkedIn` | string | Input[url] | URL or empty | No |
| `role` | string | Input | min(1) | Yes |
| `bio` | string | Textarea | min(1) | Yes |

### Proposal Section (6 fields)
| Field | Type | Input Type | Validation | Required |
|-------|------|------------|------------|----------|
| `floor` | string | Select | from FRONTIER_TOWER_FLOORS | Yes |
| `initiativeName` | string | Input | min(1) | Yes |
| `tagline` | string | Input | min(1), max(100) | Yes |
| `values` | string | Textarea | min(1) | Yes |
| `targetCommunity` | string | Textarea | min(1) | Yes |
| `estimatedSize` | string | Select | from predefined options | Yes |

### Roadmap Section (3 fields)
| Field | Type | Input Type | Validation | Required |
|-------|------|------------|------------|----------|
| `phase1Mvp` | string | Textarea | min(1) | Yes |
| `phase2Expansion` | string | Textarea | min(1) | Yes |
| `phase3LongTerm` | string | Textarea | min(1) | Yes |

### Impact Section (1 field)
| Field | Type | Input Type | Validation | Required |
|-------|------|------------|------------|----------|
| `benefitToFT` | string | Textarea | min(1) | Yes |

### Logistics Section (4 fields)
| Field | Type | Input Type | Validation | Required |
|-------|------|------------|------------|----------|
| `existingCommunity` | string | Textarea | min(1) | Yes |
| `spaceNeeds` | string | Textarea | min(1) | Yes |
| `startDate` | string | Input[date] | min(1) | Yes |
| `additionalNotes` | string | Textarea | none | No |

### Input Type Distribution
- **Input (single-line):** 6 fields (fullName, email, linkedIn, role, initiativeName, tagline)
- **Input[date]:** 1 field (startDate)
- **Textarea (multi-line):** 9 fields (bio, values, targetCommunity, phase1-3, benefitToFT, existingCommunity, spaceNeeds, additionalNotes)
- **Select (dropdown):** 2 fields (floor, estimatedSize)

## updateField Integration

### Mutation Signature
```typescript
// convex/applications.ts
export const updateField = mutation({
  args: {
    id: v.id("applications"),
    field: v.string(),
    newValue: v.string(),
  },
  handler: async (ctx, args) => {
    // Returns { changed: true } or { changed: false }
  },
});
```

### React Usage Pattern
```typescript
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

function EditableField({ applicationId, field, value }: Props) {
  const updateField = useMutation(api.applications.updateField);

  const handleSave = async (newValue: string) => {
    const result = await updateField({
      id: applicationId,
      field: field,
      newValue: newValue,
    });

    if (!result.changed) {
      // No actual change - no-op edit
    }
  };
}
```

### Convex Reactive Updates
Convex automatically updates the UI when data changes. The ApplicationSheet receives the application via props from the parent, which uses `useQuery(api.applications.list)`. After `updateField` mutates the database, Convex will push the update and the component will re-render with the new value.

## UI Patterns

### Recommended EditableField Component API
```typescript
interface EditableFieldProps {
  applicationId: Id<"applications">;
  field: string;                    // Technical field name
  label: string;                    // Display label
  value: string | undefined;        // Current value
  type: "input" | "textarea" | "select" | "date";
  options?: { value: string; label: string }[];  // For select
  validation?: z.ZodSchema;         // Optional per-field validation
  required?: boolean;               // Show error if empty on save
  maxLength?: number;               // For tagline
}
```

### Visual States
1. **Display Mode (default):**
   - Shows value as text
   - Pencil icon appears on hover (EDIT-05)
   - Click anywhere to enter edit mode

2. **Edit Mode:**
   - Input/textarea/select replaces text
   - Visual border/background change (EDIT-04)
   - Auto-focus input
   - Show current value pre-filled

3. **Saving State:**
   - Optionally show loading indicator
   - Disable input during save

4. **Error State:**
   - Show validation error below field
   - Keep edit mode active
   - Prevent save until valid

### Keyboard Handling (EDIT-03)
- **Enter:** Save (for Input fields; for Textarea, Enter adds newline)
- **Escape:** Cancel edit, revert to original value
- **Tab:** Save and move to next field (optional enhancement)

### Blur Handling
- Save on blur (click outside)
- Exception: Don't save if clicking cancel button (if one exists)

## Implementation Considerations

### 1. Component Architecture Decision
**Option A: Single EditableField Component**
- Pros: Consistent behavior, single source of truth
- Cons: Complex props to handle all field types

**Option B: Separate Components per Type**
- `EditableInput`, `EditableTextarea`, `EditableSelect`, `EditableDateInput`
- Pros: Simpler individual components
- Cons: Duplication of edit logic

**Recommendation:** Option A with a well-typed discriminated union for field config.

### 2. Validation Strategy
Reuse existing Zod schemas from `/src/lib/schemas/application.ts`:

```typescript
import { z } from "zod";

// Per-field validators (extracted from combined schemas)
const fieldValidators: Record<string, z.ZodSchema> = {
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  linkedIn: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  tagline: z.string().min(1, "Tagline is required").max(100, "Max 100 characters"),
  // ... etc
};
```

### 3. Special Field Handling

**Floor Field:**
- Uses FRONTIER_TOWER_FLOORS constant for options
- Display shows label but stores value (e.g., displays "Floor 4 - Robotics" but stores "floor-4")
- Use `getFloorLabel()` for display

**Estimated Size Field:**
- Predefined options: "1-10", "11-25", "26-50", "51-100", "100+"
- Store and display the same value

**Start Date Field:**
- Uses Input[type="date"]
- Value stored as ISO date string
- Display formatted with `toLocaleDateString()`

**LinkedIn Field:**
- Optional field - empty string is valid
- Should validate as URL if non-empty
- Display as clickable link when not editing

### 4. Error Handling
- Mutation errors: Show toast or inline error
- Validation errors: Show below field, prevent save
- Network errors: Retry logic or error message

### 5. Accessibility (implicit in requirements)
- Focus management when entering/exiting edit mode
- `aria-invalid` on inputs with errors
- Screen reader announcement of edit mode change

### 6. Pencil Icon (EDIT-05)
Lucide React provides the `Pencil` icon:
```typescript
import { Pencil } from "lucide-react";
```
Show on hover using Tailwind's `group-hover` pattern.

## Code Examples

### Basic EditableField Structure
```typescript
// Source: Codebase patterns + Convex React docs
"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  applicationId: Id<"applications">;
  field: string;
  label: string;
  value: string | undefined;
  validate?: (value: string) => string | null; // Returns error or null
}

export function EditableField({
  applicationId,
  field,
  label,
  value,
  validate,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateField = useMutation(api.applications.updateField);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when value changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value ?? "");
    }
  }, [value, isEditing]);

  const handleSave = async () => {
    // Validate
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);

    try {
      await updateField({
        id: applicationId,
        field,
        newValue: editValue,
      });
      setIsEditing(false);
    } catch (e) {
      setError("Failed to save");
    }
  };

  const handleCancel = () => {
    setEditValue(value ?? "");
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          aria-invalid={!!error}
          className={cn(
            "bg-accent/50", // Visual edit state indicator
            error && "border-destructive"
          )}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className="group space-y-1 cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2">
        <p className="text-sm whitespace-pre-wrap break-words flex-1">
          {value || <span className="italic text-muted-foreground">Not set</span>}
        </p>
        <Pencil
          className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        />
      </div>
    </div>
  );
}
```

### Textarea Variant
```typescript
// For multi-line fields, Enter should not save
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape") {
    handleCancel();
  }
  // Enter adds newline (default behavior), blur saves
};
```

### Select Field Pattern
```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// For select fields, onChange immediately saves
<Select
  value={editValue}
  onValueChange={async (newValue) => {
    setEditValue(newValue);
    await updateField({ id, field, newValue });
    setIsEditing(false);
  }}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {options.map((opt) => (
      <SelectItem key={opt.value} value={opt.value}>
        {opt.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom regex/validation | Zod schemas (already exist) | Existing schemas cover all fields |
| Dropdown UI | Custom select | Radix Select (already in codebase) | Accessible, styled, works |
| Icon library | Custom SVGs | Lucide React | Already used throughout app |
| State persistence | LocalStorage sync | Convex reactive updates | Automatic UI updates on mutation |

## Common Pitfalls

### Pitfall 1: Losing Edit on Re-render
**What goes wrong:** Convex reactive updates cause component re-render, losing edit state
**Why it happens:** Edit value gets reset when new data arrives
**How to avoid:** Only sync external value to edit value when NOT in editing mode
**Warning signs:** Typed text disappears mid-edit

### Pitfall 2: Blur vs Click Race Condition
**What goes wrong:** Clicking outside triggers blur (save) but user might have clicked a cancel button
**Why it happens:** Blur fires before click
**How to avoid:** Use `relatedTarget` in blur event to check if clicking cancel, or use small timeout
**Warning signs:** Cancel button doesn't work

### Pitfall 3: Empty Optional Fields
**What goes wrong:** Empty string saved for optional fields shows as "Not set" but value is ""
**Why it happens:** Convex stores empty string, UI shows it as empty
**How to avoid:** Normalize empty strings to undefined for optional fields, or handle display consistently
**Warning signs:** "Not set" toggling unexpectedly

### Pitfall 4: Select Immediate Save Failure
**What goes wrong:** Select onChange fires but save fails, UI shows new value but DB has old
**Why it happens:** No error handling on immediate save pattern
**How to avoid:** Show loading state, revert on error, or use optimistic updates carefully
**Warning signs:** Select shows value that doesn't persist on page refresh

## State of the Art

This is a standard pattern in React applications. Key considerations:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Controlled modals for editing | Inline contentEditable or controlled inputs | Standard practice | Better UX, less modal fatigue |
| Form libraries for all edits | Simple useState for inline edits | Depends on complexity | Simpler for single-field edits |
| Debounced auto-save | Explicit save on blur/Enter | Both valid | Explicit save is clearer for users |

## Open Questions

1. **Should there be a visual "saving" indicator?**
   - What we know: Convex mutations are usually fast
   - What's unclear: UX preference for save feedback
   - Recommendation: Start without, add if needed

2. **Should linked fields (floor) affect other displayed data?**
   - What we know: Floor change doesn't cascade to other fields
   - What's unclear: Whether changing floor should trigger any warnings
   - Recommendation: Treat each field independently

3. **Multi-field edit mode - one at a time or multiple?**
   - What we know: Requirements say click "any field" to edit
   - What's unclear: Whether multiple fields can be edited simultaneously
   - Recommendation: One field at a time (simpler, clearer UX)

## Sources

### Primary (HIGH confidence)
- `/home/memehalis/ft-form/convex/applications.ts` - updateField mutation implementation
- `/home/memehalis/ft-form/convex/schema.ts` - All 18 editable fields and types
- `/home/memehalis/ft-form/src/lib/schemas/application.ts` - Validation rules
- `/home/memehalis/ft-form/src/components/admin/ApplicationSheet.tsx` - Current detail panel
- `/home/memehalis/ft-form/src/components/ui/*` - Available UI components

### Secondary (MEDIUM confidence)
- Convex React documentation - useMutation pattern
- Lucide React icons - Pencil icon availability

## Metadata

**Confidence breakdown:**
- Field inventory: HIGH - directly from schema
- updateField integration: HIGH - mutation exists and tested
- UI patterns: HIGH - based on existing codebase conventions
- Validation: HIGH - Zod schemas already defined

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (stable domain, no external dependencies)
