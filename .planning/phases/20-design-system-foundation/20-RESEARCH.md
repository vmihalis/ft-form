# Phase 20: Design System Foundation - Research

**Researched:** 2026-01-29
**Domain:** Theme infrastructure, CSS custom properties, glassmorphism utilities
**Confidence:** HIGH

## Summary

Phase 20 establishes the theme infrastructure enabling light/dark mode switching and theme-aware glassmorphism utilities. The existing codebase already has a solid foundation: dark mode CSS variables are defined in `globals.css`, the `@custom-variant dark` is configured for Tailwind CSS 4, and basic glass utilities exist. However, the current implementation has critical gaps:

1. **No theme provider** - `className="dark"` is hardcoded on `<html>`, no user toggle exists
2. **Glass utilities are dark-mode-only** - `oklch(0 0 0 / 40%)` (black) is invisible on light backgrounds
3. **No persistence** - Theme preference cannot persist across sessions

The standard approach is to add `next-themes` (the shadcn/ui-recommended solution), create theme-aware CSS variables for glass effects, and add a visible toggle control. This phase does NOT change any UI components - it only establishes infrastructure that downstream phases use.

**Primary recommendation:** Install next-themes, create ThemeProvider wrapper, convert glass utilities to CSS variables, add toggle control to admin header.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next-themes` | 0.4.6 | Theme management | Recommended by shadcn/ui. Handles SSR hydration, localStorage persistence, system preference detection, and FOUC prevention. Zero runtime cost when theme is stable. |

### Already Installed (No Changes)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `tailwindcss` | ^4 | CSS framework | Already has `@custom-variant dark (&:is(.dark *));` configured |
| `tw-animate-css` | ^1.4.0 | Animation utilities | Already installed, no need for additional animation packages |
| `motion` | ^12.29.2 | Complex animations | Already installed for premium transitions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next-themes` | Manual localStorage + inline script | More code to maintain, edge cases around SSR/hydration handled by library |
| CSS variables for glass | Hardcoded dark:/light: utilities | Variables allow runtime theming, easier maintenance |

**Installation:**
```bash
npm install next-themes
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── globals.css           # Theme variables, glass utilities
│   └── layout.tsx            # ThemeProvider wrapper
├── components/
│   ├── theme-provider.tsx    # Client component wrapping next-themes
│   └── ui/
│       └── mode-toggle.tsx   # Theme toggle button component
└── lib/
    └── utils.ts              # Existing cn() utility (unchanged)
```

### Pattern 1: ThemeProvider Client Component
**What:** Wrap next-themes in a client component to use in server component layout
**When to use:** Always - required for Next.js App Router
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/dark-mode/next
"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Pattern 2: CSS Variables for Theme-Aware Values
**What:** Define glass colors as CSS custom properties that change per theme
**When to use:** Any value that differs between light and dark modes
**Example:**
```css
// Source: Tailwind CSS 4 theming documentation
:root {
  --glass-bg: oklch(1 0 0 / 60%);
  --glass-border: oklch(0 0 0 / 10%);
  --glass-shadow: 0 8px 32px oklch(0 0 0 / 10%);
}

.dark {
  --glass-bg: oklch(0.15 0 0 / 60%);
  --glass-border: oklch(1 0 0 / 12%);
  --glass-shadow: 0 8px 32px oklch(0 0 0 / 40%);
}
```

### Pattern 3: Mounted State for Theme-Dependent UI
**What:** Prevent hydration mismatch by deferring theme-aware rendering
**When to use:** Toggle buttons, icons that change based on theme
**Example:**
```typescript
// Source: next-themes README
const [mounted, setMounted] = useState(false)
const { theme, setTheme } = useTheme()

useEffect(() => setMounted(true), [])

if (!mounted) return <Skeleton className="h-9 w-9" />

return <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
  {theme === "dark" ? <Sun /> : <Moon />}
</Button>
```

### Anti-Patterns to Avoid
- **Hardcoded theme class:** Do not leave `className="dark"` on `<html>` - let next-themes manage it
- **Direct localStorage access:** Use `useTheme()` hook, not `localStorage.getItem('theme')`
- **Conditional rendering during SSR:** Avoid `typeof window !== 'undefined'` checks - use mounted pattern
- **Theme in state:** Never `const [theme, setTheme] = useState("dark")` - causes hydration mismatch

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence | Custom localStorage logic | `next-themes` | Handles SSR, system preference, cross-tab sync |
| FOUC prevention | Inline `<script>` in layout | `next-themes` | Battle-tested, handles edge cases |
| System theme detection | `prefers-color-scheme` media query | `next-themes enableSystem` | Handles listener cleanup, initial state |
| Hydration mismatch | Custom mounted checks everywhere | `next-themes` + mounted pattern | Library handles most cases automatically |

**Key insight:** Theme management looks trivial (toggle a class!) but has many edge cases around SSR, hydration timing, system preference changes, and cross-tab sync that next-themes handles correctly.

## Common Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC)
**What goes wrong:** User sees light theme flash before dark theme loads
**Why it happens:** Server renders without knowing user preference; React hydration applies theme too late
**How to avoid:**
1. Use `next-themes` which injects blocking script in `<head>`
2. Add `suppressHydrationWarning` to `<html>` element
3. Set `defaultTheme="dark"` to match current behavior during migration
**Warning signs:** Brief flash of white/light screen on page load, theme "snapping" after render

### Pitfall 2: Hydration Mismatch Errors
**What goes wrong:** Console warnings about text content not matching server-rendered HTML
**Why it happens:** Server defaults to one theme while client reads different preference
**How to avoid:**
1. Use mounted state pattern for theme-dependent UI (toggle buttons)
2. Most UI should use CSS variables which work without JS conditions
3. Add `suppressHydrationWarning` to `<html>`
**Warning signs:** React hydration warnings in console, layout shifts after hydration

### Pitfall 3: Glass Utilities Invisible in Light Mode
**What goes wrong:** Current `glass` and `glass-card` use black backgrounds (`oklch(0 0 0 / 40%)`) - invisible on light backgrounds
**Why it happens:** Original implementation only considered dark mode
**How to avoid:**
1. Convert hardcoded colors to CSS variables
2. Define light mode variants (white-based with subtle shadow)
3. Test glass panels on both white and black backgrounds
**Warning signs:** Glass panels disappear when switching to light mode, contrast failures

### Pitfall 4: Glass Effect Has No Depth on Solid Background
**What goes wrong:** Glass panels look flat/muddy because there's nothing to blur
**Why it happens:** `NeuralBackground` is hidden on admin routes (returns null)
**How to avoid:**
1. Admin routes need some background texture/gradient for glass to work
2. Consider enabling subtle background on admin or adding gradient
3. This is a Phase 21 concern, but awareness matters now
**Warning signs:** Glass effect just looks like semi-transparent box, no frosted effect

### Pitfall 5: Incomplete CSS Variable Coverage
**What goes wrong:** Some components don't change when theme toggles
**Why it happens:** Components using hardcoded colors instead of variables
**How to avoid:**
1. Audit all custom CSS for hardcoded colors before starting
2. Current glass utilities need conversion to variables
3. shadcn/ui components already use variables - they work automatically
**Warning signs:** Elements that don't respond to theme change

## Code Examples

Verified patterns from official sources:

### ThemeProvider Setup
```typescript
// Source: https://ui.shadcn.com/docs/dark-mode/next
// src/components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Layout Integration
```typescript
// Source: https://ui.shadcn.com/docs/dark-mode/next
// src/app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={/* fonts */}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <BackgroundWrapper />
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Mode Toggle Component
```typescript
// Source: https://ui.shadcn.com/docs/dark-mode/next (adapted)
// src/components/ui/mode-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="h-9 w-9" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Theme-Aware Glass Utilities
```css
/* Source: Existing globals.css + STACK-v2.0-glassmorphism.md recommendations */
/* src/app/globals.css - Replace existing glass utilities */

:root {
  /* Existing theme variables... */

  /* Glass variables - light mode */
  --glass-bg: oklch(1 0 0 / 60%);
  --glass-bg-heavy: oklch(1 0 0 / 70%);
  --glass-border: oklch(0 0 0 / 8%);
  --glass-shadow: 0 8px 32px oklch(0 0 0 / 8%);
  --glass-shadow-heavy: 0 25px 50px -12px oklch(0 0 0 / 15%);
}

.dark {
  /* Existing dark theme variables... */

  /* Glass variables - dark mode */
  --glass-bg: oklch(0.15 0 0 / 60%);
  --glass-bg-heavy: oklch(0 0 0 / 50%);
  --glass-border: oklch(1 0 0 / 12%);
  --glass-shadow: 0 8px 32px oklch(0 0 0 / 40%);
  --glass-shadow-heavy: 0 25px 50px -12px oklch(0 0 0 / 25%);
}

/* Updated glass utilities using variables */
@utility glass {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}

@utility glass-card {
  background: var(--glass-bg-heavy);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow-heavy);
}
```

### Accessibility: Reduced Motion/Transparency Support
```css
/* Source: MDN prefers-reduced-motion, prefers-reduced-transparency */
/* Add to globals.css */

@media (prefers-reduced-transparency: reduce) {
  :root, .dark {
    --glass-bg: oklch(0.97 0 0 / 95%);
    --glass-bg-heavy: oklch(0.95 0 0 / 98%);
  }

  .dark {
    --glass-bg: oklch(0.15 0 0 / 95%);
    --glass-bg-heavy: oklch(0.12 0 0 / 98%);
  }

  .glass, .glass-card {
    backdrop-filter: none;
  }
}

@supports not (backdrop-filter: blur(1px)) {
  .glass, .glass-card {
    background: var(--card);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind CSS 3 `darkMode: 'class'` in config | Tailwind CSS 4 `@custom-variant dark` in CSS | Tailwind v4 (2024) | Config-based to CSS-based, already configured in project |
| Manual theme scripts | next-themes library | Ongoing | Handles edge cases, recommended by shadcn/ui |
| Hardcoded dark: utilities everywhere | CSS custom properties | Best practice | Single source of truth, runtime themeable |

**Deprecated/outdated:**
- `darkMode` in `tailwind.config.js` - Tailwind CSS 4 uses `@custom-variant` in CSS instead (already configured)
- Manual FOUC prevention scripts - next-themes handles this automatically

## Open Questions

Things that couldn't be fully resolved:

1. **Admin route background for glass effect**
   - What we know: `NeuralBackground` is hidden on admin routes, glass needs something behind it to blur
   - What's unclear: Should we enable NeuralBackground on admin, or use a simpler gradient?
   - Recommendation: Phase 21 should address this with dashboard hub design. For now, ensure glass works technically.

2. **Toggle placement in admin UI**
   - What we know: Need a visible toggle control for requirements DS-01
   - What's unclear: Exact placement in current admin header design
   - Recommendation: Place in top-right of admin header area during Phase 20, adjust in Phase 21 when dashboard hub is built

3. **System theme as option**
   - What we know: next-themes supports `enableSystem` for OS preference detection
   - What's unclear: Should toggle be 2-state (light/dark) or 3-state (light/dark/system)?
   - Recommendation: Start with 2-state for simplicity, system can be added later if needed

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Dark Mode - Next.js](https://ui.shadcn.com/docs/dark-mode/next) - Official implementation guide
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) - v0.4.6 latest stable, API documentation
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) - @custom-variant syntax, class strategy

### Secondary (MEDIUM confidence)
- Existing codebase `globals.css` - Already has dark mode variables and @custom-variant configured
- Existing research files - STACK-v2.0-glassmorphism.md, PITFALLS-v2.0-glassmorphism.md

### Tertiary (LOW confidence)
- [Glassmorphism Best Practices 2026](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f) - Performance guidance

## Design Tokens Reference

Document all theme-aware values for DS-07 (Design tokens documented):

### Color Tokens (existing)
| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Page background |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Card backgrounds |
| `--primary` | `oklch(0.53 0.24 291)` | `oklch(0.53 0.24 291)` | Brand/accent |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary text |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Borders |

### Glass Tokens (new - to be added)
| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--glass-bg` | `oklch(1 0 0 / 60%)` | `oklch(0.15 0 0 / 60%)` | Glass panel background |
| `--glass-bg-heavy` | `oklch(1 0 0 / 70%)` | `oklch(0 0 0 / 50%)` | Glass card background |
| `--glass-border` | `oklch(0 0 0 / 8%)` | `oklch(1 0 0 / 12%)` | Glass borders |
| `--glass-shadow` | `0 8px 32px oklch(0 0 0 / 8%)` | `0 8px 32px oklch(0 0 0 / 40%)` | Glass shadow |
| `--glass-shadow-heavy` | `0 25px 50px -12px oklch(0 0 0 / 15%)` | `0 25px 50px -12px oklch(0 0 0 / 25%)` | Deep shadow |

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - next-themes is the official shadcn/ui recommendation, verified with official docs
- Architecture: HIGH - Standard patterns from official sources, existing codebase already follows conventions
- Pitfalls: HIGH - Existing research already catalogued pitfalls comprehensively, cross-verified

**Research date:** 2026-01-29
**Valid until:** 60 days (theme infrastructure is stable, Tailwind CSS 4 and next-themes are mature)
