# Phase 28: Integration & Polish - Research

**Researched:** 2026-02-03
**Domain:** Form creation from AI-generated schema, entry point integration, slug validation, mobile responsiveness
**Confidence:** HIGH

## Summary

Phase 28 completes the v2.1 AI Form Creation Assistant by bridging the gap between AI-generated schemas (Phase 27) and actual form creation in the Convex database. The phase has two primary concerns: (1) the form creation flow - collecting name/slug, validating uniqueness, saving as draft with AI schema, and offering post-creation navigation; and (2) integration polish - adding the "Create with AI" entry point to the forms page and ensuring mobile responsiveness throughout the AI wizard.

The existing codebase already has all the infrastructure needed: `forms.create` mutation handles slug validation, reserved word checking, and draft creation; the dropdown menu UI component exists; and the admin layout has established mobile patterns (hamburger menu, responsive grid). Phase 28 connects these pieces and adds the specific UI for name/slug collection before form creation.

**Primary recommendation:** Create a `CreateFormModal` component that collects name and slug with real-time validation (debounced query for uniqueness), calls `forms.create` with the AI-generated schema, and offers "Edit in Builder" or "Back to Forms" choices. Replace the "New Form" button on `/admin/forms` with a dropdown offering both manual and AI creation paths.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `convex/react` | already installed | `useMutation`, `useQuery` for form creation and slug checking | Existing Convex integration |
| `@radix-ui/react-dropdown-menu` | already installed | Entry point dropdown for "New Form" | Used by existing `FormQuickActions` |
| `react-hook-form` | ^7.x | Form validation for name/slug inputs | Used throughout codebase |
| `zod` | ^4.3.6 | Schema validation for slug format | Already integrated with react-hook-form |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | already installed | Icons (Sparkles for AI, Plus for Manual) | Consistent with existing UI |
| `use-debounce` | already installed | Debounce slug uniqueness check | Avoid query spam on typing |
| Tailwind CSS v4 | already installed | Responsive utilities (sm:, md:, lg:) | Mobile responsiveness |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DropdownMenu for entry point | Split button | Dropdown is established pattern in this codebase |
| Modal for name/slug | New wizard step | Modal keeps wizard flow intact, separate concerns |
| Client-side slug check | Mutation-only validation | Real-time feedback improves UX |

**Installation:**
No new packages required - all dependencies already installed.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── ai-wizard/
│   │   └── CreateFormModal.tsx        # NEW: Name/slug collection modal
│   └── form-builder/
│       └── NewFormDropdown.tsx        # NEW: Replace simple Link with dropdown
├── app/
│   └── admin/
│       └── forms/
│           ├── page.tsx               # MODIFIED: Use NewFormDropdown
│           └── new/
│               └── ai/
│                   └── page.tsx       # MODIFIED: Add CreateFormModal integration
convex/
└── forms.ts                           # MODIFIED: Add isSlugAvailable query
```

### Pattern 1: Create Form Modal After Schema Acceptance

**What:** Modal collects form name and slug when user accepts AI-generated schema.
**When to use:** When `onComplete` is called from AIFormWizard with a valid schema.

**Example:**
```typescript
// src/components/ai-wizard/CreateFormModal.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import type { AIFormSchemaOutput } from '@/lib/ai/schemas';

interface CreateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: AIFormSchemaOutput;
}

// Normalize slug: lowercase, alphanumeric + hyphens
function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CreateFormModal({ open, onOpenChange, schema }: CreateFormModalProps) {
  const router = useRouter();
  const createForm = useMutation(api.forms.createWithSchema);

  const [name, setName] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce slug for availability check
  const slug = normalizeSlug(slugInput);
  const [debouncedSlug] = useDebounce(slug, 300);

  // Check slug availability
  const slugAvailable = useQuery(
    api.forms.isSlugAvailable,
    debouncedSlug.length >= 2 ? { slug: debouncedSlug } : 'skip'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug || slugAvailable === false) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formId = await createForm({
        name: name.trim(),
        slug,
        draftSchema: JSON.stringify(schema),
      });

      // Show choice dialog or redirect directly
      router.push(`/admin/forms/${formId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSlugValid = slug.length >= 2;
  const showSlugError = slugInput && !isSlugValid;
  const showSlugTaken = isSlugValid && slugAvailable === false;
  const showSlugAvailable = isSlugValid && slugAvailable === true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Form</DialogTitle>
          <DialogDescription>
            Give your AI-generated form a name and URL.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Form Name</FieldLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Floor Lead Application"
              autoFocus
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="slug">URL Slug</FieldLabel>
            <div className="flex items-center gap-0">
              <span className="text-muted-foreground text-sm bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input h-10 flex items-center">
                /apply/
              </span>
              <Input
                id="slug"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="floor-lead-2024"
                className="rounded-l-none"
              />
            </div>
            {showSlugError && (
              <FieldError>Slug must be at least 2 characters</FieldError>
            )}
            {showSlugTaken && (
              <FieldError>This slug is already in use</FieldError>
            )}
            {showSlugAvailable && (
              <FieldDescription className="text-green-600">
                Available!
              </FieldDescription>
            )}
          </Field>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !isSlugValid || slugAvailable !== true}
            >
              {isSubmitting ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Pattern 2: New Form Dropdown Entry Point

**What:** Replace simple "New Form" link with dropdown offering Manual and AI creation.
**When to use:** On the `/admin/forms` page header.

**Example:**
```typescript
// src/components/form-builder/NewFormDropdown.tsx
'use client';

import Link from 'next/link';
import { Plus, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NewFormDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/admin/forms/new">
            <FileText className="h-4 w-4 mr-2" />
            Create Manually
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/forms/new/ai">
            <Sparkles className="h-4 w-4 mr-2" />
            Create with AI
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Pattern 3: Slug Availability Query

**What:** Convex query to check if slug is available without creating the form.
**When to use:** Real-time validation in CreateFormModal.

**Example:**
```typescript
// convex/forms.ts - Add this query

/**
 * Check if a slug is available
 * Returns true if slug is valid and not in use
 */
export const isSlugAvailable = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = normalizeSlug(args.slug);

    // Check reserved words
    if (RESERVED_SLUGS.includes(slug)) {
      return false;
    }

    // Check existing forms
    const existing = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    return existing === null;
  },
});

/**
 * Create form with pre-populated schema (for AI-generated forms)
 */
export const createWithSchema = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    draftSchema: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = normalizeSlug(args.slug);

    if (!slug) {
      throw new Error("Slug cannot be empty");
    }

    if (RESERVED_SLUGS.includes(slug)) {
      throw new Error(`"${slug}" is a reserved path`);
    }

    // Validate JSON
    try {
      JSON.parse(args.draftSchema);
    } catch {
      throw new Error("Invalid schema JSON");
    }

    // Check uniqueness
    const existing = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      throw new Error(`A form with slug "${slug}" already exists`);
    }

    const now = Date.now();
    return await ctx.db.insert("forms", {
      name: args.name,
      slug,
      description: args.description,
      status: "draft",  // Always draft for AI forms
      draftSchema: args.draftSchema,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

### Pattern 4: Post-Creation Navigation Choice

**What:** After form creation, user chooses between editing or returning to list.
**When to use:** Modal success state or separate confirmation.

**Example:**
```typescript
// Pattern A: Success state within same modal
const [createdFormId, setCreatedFormId] = useState<string | null>(null);

if (createdFormId) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle>Form Created!</DialogTitle>
          <DialogDescription>
            Your form has been saved as a draft.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" asChild className="flex-1">
            <Link href="/admin/forms">View All Forms</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/admin/forms/${createdFormId}`}>Edit in Builder</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Pattern 5: Mobile Responsive AI Wizard

**What:** Ensure AI wizard works well on mobile screens.
**When to use:** All AI wizard components.

**Key Tailwind patterns for mobile:**
```tsx
// Responsive padding
<div className="p-4 sm:p-6">

// Stack on mobile, row on desktop
<div className="flex flex-col gap-2 sm:flex-row sm:gap-4">

// Full width on mobile
<Button className="w-full sm:w-auto">

// Hide non-essential on mobile
<span className="hidden sm:inline">Full text here</span>
<span className="sm:hidden">Short</span>

// Responsive max-width for cards
<Card className="max-w-2xl mx-auto">

// Touch-friendly targets (min 44px)
<Button className="h-11 px-4">
```

### Anti-Patterns to Avoid

- **Creating form without slug validation:** Always validate uniqueness before creation, not just on error.
- **Auto-generating slugs without user review:** CRT-05 requirement states AI never auto-generates slugs; user must provide.
- **Auto-publishing AI forms:** Forms must always be saved as draft (CRT-03).
- **Modifying existing published forms:** AI creates new forms only, never modifies existing.
- **Blocking UI during slug check:** Use debounced async query, not synchronous validation.
- **Fixed-width modals on mobile:** Use responsive max-width with margin.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slug normalization | Custom regex | `normalizeSlug()` in `convex/forms.ts` | Already handles edge cases, used by existing create mutation |
| Reserved words check | Hardcoded list | `RESERVED_SLUGS` constant in `convex/forms.ts` | Centralized, already maintained |
| Dropdown menu | Custom dropdown | `@radix-ui/react-dropdown-menu` via shadcn | Accessible, already styled, used elsewhere |
| Modal dialog | Custom modal | `@radix-ui/react-dialog` via shadcn | Accessible, trap focus, escape to close |
| Debounced input | setTimeout | `use-debounce` hook | Proper cleanup, consistent timing |

**Key insight:** The form creation flow already exists in `/admin/forms/new/page.tsx`. Phase 28 creates a parallel path that pre-populates the schema from AI, not a new flow.

## Common Pitfalls

### Pitfall 1: Slug Validation Race Condition

**What goes wrong:** User types quickly, availability check returns for old value, shows "available" for already-taken slug.

**Why it happens:** Query returns are not guaranteed to be in order; debounce helps but doesn't eliminate.

**How to avoid:**
1. Use debounced slug value for query, not raw input
2. Disable submit until query returns for current value
3. Server-side validation is the true authority (mutation will fail if taken)

**Warning signs:**
- "Available" showing briefly then changing
- Form creation fails with "slug exists" after showing green checkmark

### Pitfall 2: Modal Closing Loses Form Data

**What goes wrong:** User accidentally closes modal, loses name/slug input, has to start over.

**Why it happens:** Modal `onOpenChange` fires on backdrop click, escape key.

**How to avoid:**
1. Warn before closing if form has data
2. Or: Keep modal state minimal, re-entering name/slug is quick
3. Consider disabling backdrop click during form creation

**Warning signs:**
- User frustration at losing input
- Need to re-enter data multiple times

### Pitfall 3: AI Schema Not Matching Convex Schema

**What goes wrong:** AI-generated schema structure doesn't match what `draftSchema` expects.

**Why it happens:** `AIFormSchemaOutput` and `FormSchema` (from `types/form-schema.ts`) should be identical but might drift.

**How to avoid:**
1. Phase 25 already defined `AIFormSchemaOutputSchema` to match `FormSchema`
2. Always validate before saving to database
3. JSON.stringify the schema, don't pass object directly

**Warning signs:**
- Form builder fails to render AI-generated form
- "Invalid JSON" errors from mutation

### Pitfall 4: Mobile Touch Targets Too Small

**What goes wrong:** Users can't tap buttons accurately on mobile.

**Why it happens:** Default button sizes optimized for mouse, not touch.

**How to avoid:**
1. Minimum 44x44px touch targets (Apple/Google guidelines)
2. Use `h-11` (44px) for primary actions on mobile
3. Adequate spacing between interactive elements

**Warning signs:**
- Users tapping wrong button
- Frustration on mobile testing

### Pitfall 5: Navigation After Creation Not Working

**What goes wrong:** `router.push` doesn't navigate, user stuck on success screen.

**Why it happens:** Next.js App Router navigation issues, or modal preventing navigation.

**How to avoid:**
1. Close modal before or during navigation
2. Use `Link` component instead of programmatic navigation where possible
3. Test navigation flow end-to-end

**Warning signs:**
- Click "Edit in Builder" but nothing happens
- URL changes but page doesn't render

## Code Examples

Verified patterns from official sources:

### Dialog with Form (shadcn pattern)

```typescript
// Source: shadcn/ui Dialog documentation
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <DialogFooter>
        <Button type="submit">Submit</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### Debounced Query Pattern

```typescript
// Source: use-debounce + Convex patterns
import { useDebounce } from 'use-debounce';
import { useQuery } from 'convex/react';

const [input, setInput] = useState('');
const [debouncedInput] = useDebounce(input, 300);

// Skip query if input too short
const result = useQuery(
  api.forms.isSlugAvailable,
  debouncedInput.length >= 2 ? { slug: debouncedInput } : 'skip'
);
```

### Responsive Button Layout

```typescript
// Source: Tailwind responsive patterns
<DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
  <Button type="button" variant="outline" className="w-full sm:w-auto">
    Cancel
  </Button>
  <Button type="submit" className="w-full sm:w-auto">
    Create
  </Button>
</DialogFooter>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct Link to /new | Dropdown with Manual/AI options | Phase 28 | Discoverable AI entry point |
| Single-purpose create mutation | `createWithSchema` for AI pre-population | Phase 28 | Clean separation of concerns |
| Post-creation auto-redirect | User choice modal | Phase 28 | Better UX, user controls flow |

**Deprecated/outdated:**
- None for this phase - building on established patterns

## Open Questions

Things that couldn't be fully resolved:

1. **Auto-suggest slug from name?**
   - What we know: Current manual flow doesn't auto-suggest
   - What's unclear: Would auto-suggest be helpful or annoying?
   - Recommendation: Do NOT auto-suggest for v2.1. User must explicitly set slug (aligns with CRT-05 "AI never auto-generates slugs").

2. **Slug character minimum/maximum?**
   - What we know: `normalizeSlug` handles formatting, but no length validation
   - What's unclear: What's the minimum useful slug length?
   - Recommendation: Minimum 2 characters, maximum 50. Match URL path best practices.

3. **What if user wants to modify schema before creation?**
   - What we know: Preview allows regenerate/modify via chat
   - What's unclear: Should there be an "Edit before create" option?
   - Recommendation: Defer to v2.2 ITER requirements. For v2.1, use schema as-is or regenerate.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `convex/forms.ts` - Form creation mutation with slug validation
- Existing codebase: `src/components/ui/dropdown-menu.tsx` - Dropdown component
- Existing codebase: `src/components/ui/dialog.tsx` - Dialog/Modal component
- Existing codebase: `src/app/admin/forms/new/page.tsx` - Manual form creation flow
- Phase 27 RESEARCH.md - AI schema structure and wizard integration

### Secondary (MEDIUM confidence)
- shadcn/ui documentation - Dialog and DropdownMenu patterns
- Tailwind CSS responsive design utilities
- Next.js App Router navigation patterns

### Tertiary (LOW confidence)
- None - all patterns verified with existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used in codebase
- Architecture: HIGH - Follows existing form creation pattern, proven patterns
- Pitfalls: HIGH - Derived from existing v2.1 PITFALLS document + codebase analysis

**Research date:** 2026-02-03
**Valid until:** 30 days (stable patterns, existing infrastructure)
