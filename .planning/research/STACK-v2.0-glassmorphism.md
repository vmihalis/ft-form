# Stack Research: FrontierOS Dashboard v2.0

**Domain:** Premium dashboard UI with glassmorphism design system
**Researched:** 2026-01-29
**Confidence:** HIGH

## Summary

The existing stack is well-suited for glassmorphism UI and dark mode. **Only one new dependency is needed: `next-themes` for dark mode toggling.** All glassmorphism effects can be achieved with pure Tailwind CSS 4 utilities (backdrop-blur, transparent backgrounds, borders) that the project already has the foundation for. The existing `motion` library (v12.29.2) handles all premium animations. No component library replacements or major changes required.

## Recommended Additions

### Required: next-themes

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `next-themes` | ^0.4.6 | Theme management | The standard for Next.js dark mode. Handles class toggling on `<html>`, system preference detection, localStorage persistence, and SSR hydration issues. Recommended by shadcn/ui official docs. |

```bash
npm install next-themes
```

**Integration notes:**
- Create `ThemeProvider` wrapper component
- Add to root layout with `attribute="class"` to match existing Tailwind 4 `@custom-variant dark`
- Works seamlessly with existing shadcn/ui components
- Zero runtime cost when theme is stable

### Optional: tailwindcss-animate (NOT RECOMMENDED)

The project already has `tw-animate-css` which provides animation utilities. No need for additional animation packages.

## CSS/Tailwind Techniques for Glassmorphism

The project already has a solid foundation in `globals.css`:

```css
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
```

### Recommended Extensions for Theme-Aware Glassmorphism

Add these utilities to `globals.css` for light/dark mode support:

```css
/* Light mode glassmorphism */
@utility glass-light {
  background: oklch(1 0 0 / 70%);
  backdrop-filter: blur(16px);
  border: 1px solid oklch(0 0 0 / 8%);
  box-shadow: 0 8px 32px oklch(0 0 0 / 8%);
}

/* Dark mode glassmorphism */
@utility glass-dark {
  background: oklch(0.15 0 0 / 60%);
  backdrop-filter: blur(16px);
  border: 1px solid oklch(1 0 0 / 12%);
  box-shadow: 0 8px 32px oklch(0 0 0 / 40%);
}

/* Theme-aware glass (auto-switches) */
@utility glass-panel {
  @apply glass-light dark:glass-dark;
}

/* Glass with glow effect for accent elements */
@utility glass-glow {
  background: oklch(0.53 0.24 291 / 15%);
  backdrop-filter: blur(12px);
  border: 1px solid oklch(0.53 0.24 291 / 30%);
  box-shadow: 0 0 30px oklch(0.53 0.24 291 / 20%);
}

/* Subtle glass for nested elements */
@utility glass-subtle {
  background: oklch(1 0 0 / 5%);
  backdrop-filter: blur(8px);
}
```

### Tailwind 4 Native Utilities to Use

| Utility | Purpose | Example |
|---------|---------|---------|
| `backdrop-blur-sm/md/lg/xl` | Frosted glass blur | `backdrop-blur-md` = 12px blur |
| `bg-white/10` | Semi-transparent backgrounds | `bg-white/20 dark:bg-black/30` |
| `border-white/10` | Glass borders | `border border-white/10` |
| `shadow-2xl` | Depth/layering | Creates floating effect |
| `ring-1 ring-white/10` | Inner glow | Subtle highlight |

### Premium Animation Patterns (motion library)

The existing `motion` library (v12.29.2) is already installed. Use for:

```tsx
// Glass panel entrance
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
  className="glass-panel rounded-xl p-6"
>

// Hover lift effect
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="glass-card cursor-pointer"
>

// Staggered card entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

## Dark Mode Approach

### Implementation with next-themes + Tailwind 4

The project already has the CSS foundation:

```css
/* Already in globals.css */
@custom-variant dark (&:is(.dark *));

/* Already has dark mode color variables */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  /* ... etc */
}
```

**Steps to complete:**

1. **Install next-themes:**
```bash
npm install next-themes
```

2. **Create ThemeProvider:**
```tsx
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

3. **Update root layout:**
```tsx
// src/app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  </body>
</html>
```

4. **Create mode toggle:**
```tsx
// src/components/ui/mode-toggle.tsx
"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="glass-subtle"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## Not Recommended

### Libraries to AVOID

| Library | Why Not |
|---------|---------|
| `glasscn-ui` | Requires Tailwind config changes, not compatible with Tailwind CSS 4's CSS-first approach. Project already has glass utilities. Would add complexity without benefit. |
| `shadcn-glass-ui` | Designed for separate installation, would conflict with existing shadcn/ui components. Not needed when CSS utilities can achieve same effect. |
| Any theme library except next-themes | next-themes is the standard, shadcn-ui recommended, battle-tested with Next.js |
| `tailwindcss-animate` | Already have `tw-animate-css` installed |
| Additional animation library | `motion` (v12.29.2) already installed and excellent |

### Patterns to AVOID

| Anti-pattern | Why | Instead |
|--------------|-----|---------|
| Stacking multiple blur elements | Performance killer on mobile | Use single blur layer per viewport |
| Animating backdrop-filter | GPU-expensive, causes jank | Animate opacity/transform instead |
| blur > 20px | Loses color vibrancy, accessibility issues | 10-16px is sweet spot |
| Glass text on glass | Unreadable | Solid background or higher contrast |
| Over-using glassmorphism | Loses impact, performance issues | 2-3 glass elements per viewport |

## Integration Notes

### With Existing shadcn/ui Components

Extend existing components with glass variants:

```tsx
// Card with glass variant
<Card className="glass-panel border-0">
  <CardContent>...</CardContent>
</Card>

// Button with glass style
<Button variant="ghost" className="glass-subtle hover:glass">
```

The existing shadcn/ui components use CSS variables (`--card`, `--border`, etc.) that already have dark mode values defined. They will work immediately with next-themes.

### With Existing Neural Background

The `NeuralBackground` component currently only renders on non-admin routes. For the admin glassmorphism design:

1. Enable neural background on admin routes (or create admin-specific variant)
2. Glass panels will naturally overlay the animated background
3. The dark purple (#8b5cf6) particle color already matches brand

### Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Mobile backdrop-filter | Reduce blur to 8px on mobile, use solid fallbacks |
| Multiple glass panels | Limit to 3-4 per viewport |
| Scroll performance | Avoid glass on scrollable list items |
| Battery drain | Consider `prefers-reduced-motion` for canvas background |

### Browser Support

`backdrop-filter` is supported in:
- Chrome 76+ (2019)
- Safari 9+ (2015)
- Firefox 103+ (2022)
- Edge 79+ (2020)

**Fallback for older browsers:**
```css
@supports not (backdrop-filter: blur(16px)) {
  .glass-panel {
    background: oklch(0.2 0 0 / 95%);
  }
}
```

## Sources

- [shadcn/ui Dark Mode - Next.js](https://ui.shadcn.com/docs/dark-mode/next) — Official implementation guide
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) — CSS-first dark mode configuration
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) — v0.4.6 latest stable
- [Glassmorphism Best Practices 2026](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f) — Performance and accessibility guidance
- [CSS Glassmorphism Techniques](https://blog.openreplay.com/create-glassmorphic-ui-css/) — Pure CSS implementation patterns
- [Motion Library](https://motion.dev/) — v12.27.0+ animation patterns

## Summary Checklist

- [x] Only one new dependency needed: `next-themes ^0.4.6`
- [x] Glassmorphism achieved with pure CSS (already has foundation)
- [x] Dark mode CSS variables already defined in `globals.css`
- [x] Tailwind 4 `@custom-variant dark` already configured
- [x] `motion` library (v12.29.2) handles all animations
- [x] shadcn/ui components already theme-aware via CSS variables
- [x] Neural background provides ideal glassmorphism backdrop
- [x] No component library changes needed
