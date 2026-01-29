# Architecture Research: FrontierOS Dashboard Design System

**Domain:** Glassmorphism design system + dark mode for Next.js admin dashboard
**Researched:** 2026-01-29
**Confidence:** HIGH (verified with official docs and existing codebase)

## Summary

The existing codebase already has strong foundations for the redesign: Tailwind CSS 4 with `@custom-variant dark` is configured, shadcn/ui uses CSS variables via oklch colors, and basic glassmorphism utilities (`glass`, `glass-card`) exist. The integration path is straightforward: extend the existing CSS variable system, add next-themes for user-controlled dark mode with persistence, and expand glassmorphism utilities into a complete token system. The hard-coded `className="dark"` on `<html>` should be replaced with next-themes dynamic control.

## Current State Analysis

### What Already Exists

**Tailwind CSS 4 Dark Mode (globals.css:4):**
```css
@custom-variant dark (&:is(.dark *));
```
This is already the correct Tailwind v4 approach for class-based dark mode.

**CSS Variables with oklch (globals.css:50-117):**
Both `:root` (light) and `.dark` blocks exist with all shadcn/ui tokens using modern oklch color space.

**Basic Glassmorphism Utilities (globals.css:133-145):**
```css
@utility glass { ... }
@utility glass-card { ... }
```

**Hard-coded Dark Mode (layout.tsx:41):**
```tsx
<html lang="en" className="dark">
```
This needs to change to dynamic control via next-themes.

**Background Conditional (background-wrapper.tsx):**
NeuralBackground is hidden on admin routes. May want to reconsider for glass effect backgrounds.

## Tailwind 4 Integration

### Extending Glassmorphism Utilities

Expand the existing glass utilities into a complete system in `globals.css`:

```css
/* ===== GLASSMORPHISM DESIGN TOKENS ===== */

/* Base glass utilities (existing - keep and enhance) */
@utility glass {
  background: oklch(0 0 0 / 40%);
  backdrop-filter: blur(16px);
  border: 1px solid oklch(1 0 0 / 10%);
}

@utility glass-card {
  background: oklch(0 0 0 / 50%);
  backdrop-filter: blur(12px);
  border: 1px solid oklch(1 0 0 / 10%);
  box-shadow: 0 25px 50px -12px oklch(0 0 0 / 25%);
}

/* NEW: Glass intensity variants */
@utility glass-subtle {
  background: oklch(0 0 0 / 20%);
  backdrop-filter: blur(8px);
  border: 1px solid oklch(1 0 0 / 5%);
}

@utility glass-heavy {
  background: oklch(0 0 0 / 70%);
  backdrop-filter: blur(24px);
  border: 1px solid oklch(1 0 0 / 15%);
}

/* NEW: Light mode glass variants (for dual-theme support) */
@utility glass-light {
  background: oklch(1 0 0 / 60%);
  backdrop-filter: blur(16px);
  border: 1px solid oklch(0 0 0 / 10%);
}

/* NEW: Interactive glass states */
@utility glass-interactive {
  transition: background-color 150ms, backdrop-filter 150ms, box-shadow 150ms;
}

@utility glass-interactive:hover {
  background: oklch(0 0 0 / 55%);
  box-shadow: 0 30px 60px -15px oklch(0 0 0 / 35%);
}

@utility glass-interactive:focus-visible {
  outline: 2px solid oklch(0.53 0.24 291);
  outline-offset: 2px;
}
```

### CSS Variable Strategy for Theming

Extend the existing `:root` and `.dark` blocks with glassmorphism tokens:

```css
:root {
  /* Existing color tokens (keep all)... */

  /* NEW: Glassmorphism tokens */
  --glass-bg: oklch(1 0 0 / 60%);
  --glass-border: oklch(0 0 0 / 10%);
  --glass-blur: 16px;
  --glass-shadow: 0 25px 50px -12px oklch(0 0 0 / 15%);

  /* NEW: Surface hierarchy for light mode */
  --surface-0: oklch(1 0 0);           /* Base background */
  --surface-1: oklch(0.98 0 0);        /* Elevated */
  --surface-2: oklch(0.96 0 0);        /* Floating */
  --surface-glass: var(--glass-bg);    /* Glass overlay */
}

.dark {
  /* Existing dark tokens (keep all)... */

  /* Glassmorphism tokens (dark) */
  --glass-bg: oklch(0 0 0 / 40%);
  --glass-border: oklch(1 0 0 / 10%);
  --glass-blur: 16px;
  --glass-shadow: 0 25px 50px -12px oklch(0 0 0 / 50%);

  /* Surface hierarchy (dark) */
  --surface-0: oklch(0.12 0 0);
  --surface-1: oklch(0.16 0 0);
  --surface-2: oklch(0.20 0 0);
  --surface-glass: var(--glass-bg);
}
```

Register new tokens in `@theme inline` block:

```css
@theme inline {
  /* Existing registrations (keep all)... */

  /* NEW: Glass tokens */
  --color-glass-bg: var(--glass-bg);
  --color-glass-border: var(--glass-border);
  --color-surface-0: var(--surface-0);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
}
```

## shadcn/ui Theming

### Current Setup (components.json)

```json
{
  "style": "new-york",
  "rsc": true,
  "tailwind": {
    "cssVariables": true,
    "baseColor": "neutral"
  }
}
```

shadcn/ui already supports dark mode through CSS variables. Components use semantic tokens like `bg-card`, `text-foreground` which automatically adapt when the `.dark` class is present.

### Strategy: Extend Components with Glass Variants

**Do not create parallel component hierarchies.** Extend existing shadcn/ui components with variants via CVA:

**Example: Card with glass variant (src/components/ui/card.tsx):**

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-xl text-card-foreground flex flex-col gap-6 py-6",
  {
    variants: {
      variant: {
        default: "bg-card border shadow-sm",
        glass: "glass-card",
        "glass-subtle": "glass-subtle",
        elevated: "bg-surface-1 shadow-lg border-0",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}
```

### Components to Extend with Glass Variants

| Component | Recommended Variants | Notes |
|-----------|---------------------|-------|
| Card | `default`, `glass`, `glass-subtle`, `elevated` | Primary glass carrier |
| Sheet | `default`, `glass` | SheetContent background |
| Tabs/TabsList | `default`, `glass` | Navigation styling |
| DropdownMenuContent | `default`, `glass` | Popovers |
| DialogContent | `default`, `glass` | Modal overlays |

### Components to Leave Unchanged

| Component | Reason |
|-----------|--------|
| Button | Solid colors for clarity, accessibility |
| Input/Textarea | Form usability requires solid backgrounds |
| Table | Data density requires readability |
| Badge | Status visibility requires solid colors |
| Checkbox/Select | Form clarity |

## Theme Provider Pattern

### Installation

```bash
pnpm add next-themes
```

### Implementation

**1. Create Theme Provider (src/components/theme-provider.tsx):**

```typescript
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

**2. Update Root Layout (src/app/layout.tsx):**

```typescript
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fonts} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"        // Keep dark as default for FrontierOS aesthetic
          enableSystem={false}       // Explicit choice, not system preference
          disableTransitionOnChange  // Prevent FOUC
        >
          <BackgroundWrapper />
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key changes from current:**
- Remove hard-coded `className="dark"` from `<html>`
- Add `suppressHydrationWarning` to prevent next-themes warnings
- Wrap children in `ThemeProvider`

**3. Create Mode Toggle (src/components/ui/mode-toggle.tsx):**

```typescript
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Hydration Considerations

next-themes stores theme preference in localStorage. On first render, the server doesn't know the theme.

**How next-themes handles this:**
- `suppressHydrationWarning` on `<html>` prevents React warnings
- `disableTransitionOnChange` prevents flash of wrong theme
- Injects script before React hydrates to set theme immediately

**For this admin dashboard:** localStorage-based approach is sufficient. Cookie-based approach only needed if theme-dependent content must render correctly on server for SEO (not applicable here).

## Component Strategy

### Modification Approach

**Recommendation: Modify existing components in place with backward-compatible variants.**

The default variant stays unchanged, so all existing usage continues to work. Glass variants are opt-in.

### Design Token File (src/lib/design-tokens.ts)

Create centralized tokens for programmatic access:

```typescript
/**
 * Design tokens for FrontierOS glassmorphism design system
 * Use these when composing custom glass effects
 */
export const glassTokens = {
  blur: {
    subtle: "backdrop-blur-sm",   // 4px
    default: "backdrop-blur",      // 8px
    medium: "backdrop-blur-md",    // 12px
    heavy: "backdrop-blur-lg",     // 16px
    intense: "backdrop-blur-xl",   // 24px
  },
  opacity: {
    subtle: "bg-black/20",
    default: "bg-black/40",
    medium: "bg-black/50",
    heavy: "bg-black/60",
    solid: "bg-black/80",
  },
  border: {
    none: "border-0",
    subtle: "border-white/5",
    default: "border-white/10",
    strong: "border-white/20",
  },
  shadow: {
    none: "shadow-none",
    subtle: "shadow-lg",
    default: "shadow-xl",
    heavy: "shadow-2xl",
  }
} as const;

/** Utility to compose glass classes */
export function glassClasses(config: {
  blur?: keyof typeof glassTokens.blur;
  opacity?: keyof typeof glassTokens.opacity;
  border?: keyof typeof glassTokens.border;
  shadow?: keyof typeof glassTokens.shadow;
} = {}) {
  const {
    blur = "default",
    opacity = "default",
    border = "default",
    shadow = "default"
  } = config;

  return [
    glassTokens.blur[blur],
    glassTokens.opacity[opacity],
    glassTokens.border[border],
    glassTokens.shadow[shadow],
  ].join(" ");
}
```

### Component Update Priority

Based on visual impact and usage frequency:

1. **Card** - Used throughout dashboard for stats, content sections
2. **Sheet** - Submission detail view, prominent glass opportunity
3. **Tabs/TabsList** - Navigation, glass nav bar is signature aesthetic
4. **DropdownMenu** - Popovers, subtle glass
5. **Dialog/AlertDialog** - Modals, glass background

## Build Order

### Phase 1: Design System Foundation
**Goal:** Establish theming infrastructure without breaking existing UI

1. Install next-themes: `pnpm add next-themes`
2. Create `src/components/theme-provider.tsx`
3. Update `src/app/layout.tsx`:
   - Remove hard-coded `className="dark"`
   - Add `suppressHydrationWarning`
   - Add ThemeProvider wrapper
4. Add glassmorphism CSS tokens to `globals.css`
5. Create `src/components/ui/mode-toggle.tsx`
6. Add ModeToggle to admin header

**Checkpoint:** Dark mode toggle works, no visual regressions

### Phase 2: Design Tokens & Utilities
**Goal:** Complete glass utility system

1. Expand `@utility` classes in globals.css:
   - `glass-subtle`, `glass-heavy`
   - `glass-interactive` with hover/focus states
   - Light mode glass variants
2. Add CSS variables for glass tokens
3. Create `src/lib/design-tokens.ts`
4. Document tokens in code comments

**Checkpoint:** Utility classes available, documented

### Phase 3: Core Component Updates
**Goal:** Update shadcn/ui components with glass variants

1. Card - add `variant: "glass" | "glass-subtle" | "elevated"`
2. Sheet - add glass option for SheetContent
3. Tabs - add glass TabsList variant
4. DropdownMenu - subtle glass for DropdownMenuContent
5. Dialog - glass overlay option

**Checkpoint:** Components accept glass variants, default unchanged

### Phase 4: Admin Layout Redesign
**Goal:** Apply glass design to admin dashboard structure

1. Update admin header (`src/app/admin/page.tsx`):
   - Glass header background
   - Add ModeToggle
2. Create navigation hub component (if needed)
3. Update DashboardStats to use glass Card variant
4. Style AdminTabs with glass TabsList

**Checkpoint:** Dashboard has glass aesthetic

### Phase 5: Page-by-Page Refinement
**Goal:** Polish individual admin pages

1. Forms list page (`/admin/forms`)
2. Form builder page (`/admin/forms/[formId]`)
3. Submissions table (SubmissionsTable component)
4. Submission detail sheet (SubmissionSheet component)

**Checkpoint:** All admin pages visually consistent

### Phase 6: Polish & Animation
**Goal:** Add motion and refinements

1. Glass hover/focus states with motion
2. Transition animations between states
3. Consider NeuralBackground for admin (modify BackgroundWrapper)
4. Accessibility review:
   - Contrast ratios on glass surfaces
   - Focus indicators visible
   - Test with Windows High Contrast Mode

**Checkpoint:** Complete visual overhaul, accessible

## File Structure

### Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | Add glass tokens, expand utilities |
| `src/app/layout.tsx` | ThemeProvider, remove hard-coded dark |
| `src/components/ui/card.tsx` | Add glass variant via CVA |
| `src/components/ui/tabs.tsx` | Add glass TabsList variant |
| `src/components/ui/sheet.tsx` | Add glass variant for SheetContent |
| `src/components/ui/dropdown-menu.tsx` | Add glass variant |
| `src/components/admin/AdminDashboard.tsx` | Apply glass styling |
| `src/components/admin/DashboardStats.tsx` | Use glass Card variant |
| `src/app/admin/page.tsx` | Glass header, add ModeToggle |
| `src/components/ui/background-wrapper.tsx` | Consider enabling for admin |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/theme-provider.tsx` | next-themes wrapper |
| `src/components/ui/mode-toggle.tsx` | Theme toggle UI |
| `src/lib/design-tokens.ts` | Centralized design tokens |

### Final File Structure

```
src/
  app/
    globals.css           # Extended with glass tokens, utilities
    layout.tsx            # ThemeProvider, suppressHydrationWarning
    providers.tsx         # Convex provider (unchanged)
    admin/
      page.tsx            # Glass header, ModeToggle
      ...
  components/
    theme-provider.tsx    # NEW: next-themes wrapper
    ui/
      mode-toggle.tsx     # NEW: theme toggle component
      card.tsx            # MODIFIED: glass variant
      sheet.tsx           # MODIFIED: glass option
      tabs.tsx            # MODIFIED: glass TabsList
      dropdown-menu.tsx   # MODIFIED: glass option
      background-wrapper.tsx  # MODIFIED: admin support
      ...
    admin/
      DashboardStats.tsx  # MODIFIED: glass cards
      AdminDashboard.tsx  # MODIFIED: glass styling
      ...
  lib/
    design-tokens.ts      # NEW: centralized tokens
    utils.ts              # Keep cn() here (unchanged)
```

## Technical Considerations

### Browser Support

`backdrop-filter` support is excellent for modern browsers:
- Chrome 76+ (2019)
- Safari 9+ (2015)
- Firefox 103+ (2022)
- Edge 79+ (2020)

**Recommendation:** No fallback needed for admin dashboard (authenticated users on modern browsers). For public forms, consider:

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: oklch(0 0 0 / 80%); /* Solid fallback */
  }
}
```

### Performance

Glassmorphism with `backdrop-filter` can cause performance issues if overused:

**Guidelines:**
- Limit to ~5-10 glass elements visible simultaneously
- Avoid glass on frequently-updating elements (real-time counters, etc.)
- Use `will-change: backdrop-filter` sparingly (only for animated glass)
- Consider reducing blur radius on mobile (16px -> 8px)
- Glass should not be applied to scrolling content areas

### Accessibility

Glass effects must maintain WCAG contrast ratios:

**Requirements:**
- Light text on dark glass: minimum 4.5:1 contrast (AA)
- Increase glass opacity if contrast insufficient
- Ensure focus indicators visible on glass surfaces (use outline, not ring)
- Test with Windows High Contrast Mode
- Glass borders help define boundaries for users with vision impairments

**Implementation notes:**
- The existing oklch colors maintain good contrast
- Focus states should use solid outlines (`outline: 2px solid`) not blurred rings
- Provide high-contrast mode overrides if needed

## Sources

**HIGH Confidence (Official Documentation):**
- [shadcn/ui Dark Mode - Next.js](https://ui.shadcn.com/docs/dark-mode/next) - Official next-themes integration guide
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode) - Official v4 dark mode documentation with @custom-variant syntax
- [next-themes npm](https://www.npmjs.com/package/next-themes) - Theme switching library

**MEDIUM Confidence (Verified Sources):**
- [Tailwind CSS v4 @custom-variant discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15083) - CSS variable theming patterns
- [Glassmorphism CSS Generator](https://ui.glass/generator/) - Reference for glass effect properties
- [next-themes GitHub issue #152](https://github.com/pacocoursey/next-themes/issues/152) - App Router compatibility

**Design Context:**
- [Dark Glassmorphism UI Trends 2026](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)
- [Glassmorphism 2026 Guide](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026)

**Existing Codebase Analysis:**
- `src/app/globals.css` - Current Tailwind 4 setup with dark mode and basic glass utilities
- `src/app/layout.tsx` - Current layout with hard-coded dark class
- `src/components/ui/card.tsx` - shadcn/ui Card component structure
- `components.json` - shadcn/ui configuration
