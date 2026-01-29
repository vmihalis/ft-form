# Design Tokens Reference

**Version:** 1.0
**Last Updated:** 2026-01-29
**Source:** `src/app/globals.css`

This document provides a complete reference for all design tokens used in the FrontierOS design system. All tokens are theme-aware and automatically adjust between light and dark modes.

---

## Overview

The FrontierOS design system uses CSS custom properties (variables) for all design tokens. This approach provides:

- **Theme awareness:** Tokens automatically switch between light and dark values
- **Consistency:** Single source of truth for all visual properties
- **Flexibility:** Easy to update values globally
- **Performance:** Native CSS with no runtime overhead

**Color Format:** All colors use OKLCH (Oklab Cylindrical) for perceptually uniform color manipulation.

---

## Color Tokens

### Core Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Page background |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text color |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Card backgrounds |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Card text color |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Popover backgrounds |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Popover text color |

### Brand Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | `oklch(0.53 0.24 291)` | `oklch(0.53 0.24 291)` | Primary actions, links, focus |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | Text on primary backgrounds |

**Note:** Primary color is consistent across themes (purple hue at 291 degrees).

### UI Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Secondary buttons, subtle backgrounds |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on secondary backgrounds |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Muted backgrounds, disabled states |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Subdued text, placeholders |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Accent highlights, hover states |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent backgrounds |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error states, delete actions |

### Border & Input Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Default borders |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input field borders |
| `--ring` | `oklch(0.53 0.24 291)` | `oklch(0.53 0.24 291)` | Focus rings |

---

## Glass Tokens

The glassmorphism effect is central to the FrontierOS premium aesthetic. These tokens create the frosted glass appearance.

### Glass Variables

| Token | Light Mode | Dark Mode | Purpose |
|-------|------------|-----------|---------|
| `--glass-bg` | `oklch(1 0 0 / 60%)` | `oklch(0.15 0 0 / 60%)` | Standard glass background |
| `--glass-bg-heavy` | `oklch(1 0 0 / 70%)` | `oklch(0 0 0 / 50%)` | Heavier glass for cards with more content |
| `--glass-border` | `oklch(0 0 0 / 8%)` | `oklch(1 0 0 / 12%)` | Subtle glass border |
| `--glass-shadow` | `0 8px 32px oklch(0 0 0 / 8%)` | `0 8px 32px oklch(0 0 0 / 40%)` | Standard glass shadow |
| `--glass-shadow-heavy` | `0 25px 50px -12px oklch(0 0 0 / 15%)` | `0 25px 50px -12px oklch(0 0 0 / 25%)` | Heavy shadow for elevated cards |

### Glass Utility Classes

| Class | Properties | Use Case |
|-------|------------|----------|
| `.glass` | `background: var(--glass-bg);`<br>`backdrop-filter: blur(16px);`<br>`border: 1px solid var(--glass-border);` | Navigation bars, floating panels, overlays |
| `.glass-card` | `background: var(--glass-bg-heavy);`<br>`backdrop-filter: blur(12px);`<br>`border: 1px solid var(--glass-border);`<br>`box-shadow: var(--glass-shadow-heavy);` | Module cards, content containers |

### Glass Usage Guidelines

**When to use `.glass`:**
- Navigation elements
- Floating action buttons
- Modal overlays
- Dropdown menus
- Toast notifications

**When to use `.glass-card`:**
- Dashboard module cards
- Content panels
- Form containers
- Stat cards

**Best practices:**
1. Always ensure sufficient contrast between glass surfaces and their background
2. Use heavier glass (`--glass-bg-heavy`) when content readability is critical
3. Layer glass elements carefully - avoid more than 2 overlapping glass layers
4. Test glassmorphism against various background content

---

## Sidebar Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Sidebar background |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Sidebar text |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.488 0.243 264.376)` | Active sidebar item |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Active item text |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover state |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Hover state text |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Sidebar dividers |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Sidebar focus ring |

---

## Chart Tokens

For data visualization components. Each theme has distinct colors optimized for its background.

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` |

---

## Spacing & Radius Tokens

### Border Radius

| Token | Value | Computed (--radius = 0.625rem) |
|-------|-------|-------------------------------|
| `--radius` | `0.625rem` | 10px |
| `--radius-sm` | `calc(var(--radius) - 4px)` | 6px |
| `--radius-md` | `calc(var(--radius) - 2px)` | 8px |
| `--radius-lg` | `var(--radius)` | 10px |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 14px |
| `--radius-2xl` | `calc(var(--radius) + 8px)` | 18px |
| `--radius-3xl` | `calc(var(--radius) + 12px)` | 22px |
| `--radius-4xl` | `calc(var(--radius) + 16px)` | 26px |

### Tailwind Radius Classes

| Class | Token |
|-------|-------|
| `rounded-sm` | `--radius-sm` |
| `rounded-md` | `--radius-md` |
| `rounded-lg` | `--radius-lg` |
| `rounded-xl` | `--radius-xl` |
| `rounded-2xl` | `--radius-2xl` |
| `rounded-3xl` | `--radius-3xl` |
| `rounded-4xl` | `--radius-4xl` |

---

## Typography Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `var(--font-geist-sans)` | Body text, UI elements |
| `--font-mono` | `var(--font-geist-mono)` | Code, technical data |
| `--font-display` | `var(--font-outfit)` | Headlines, branding |

---

## Accessibility

### Reduced Transparency

For users with `prefers-reduced-transparency: reduce`, glass effects are modified:

| Token | Standard | Reduced Transparency (Light) | Reduced Transparency (Dark) |
|-------|----------|------------------------------|----------------------------|
| `--glass-bg` | 60% opacity | `oklch(0.97 0 0 / 95%)` | `oklch(0.15 0 0 / 95%)` |
| `--glass-bg-heavy` | 70%/50% opacity | `oklch(0.95 0 0 / 98%)` | `oklch(0.12 0 0 / 98%)` |

Additionally, `backdrop-filter: blur()` is disabled for these users.

### Fallback Support

For browsers without `backdrop-filter` support:
```css
@supports not (backdrop-filter: blur(1px)) {
  .glass, .glass-card {
    background: var(--card);
  }
}
```

---

## Usage Examples

### Basic Glass Panel

```tsx
<div className="glass rounded-xl p-6">
  <h2 className="text-foreground">Panel Title</h2>
  <p className="text-muted-foreground">Content here</p>
</div>
```

### Glass Card with Shadow

```tsx
<div className="glass-card rounded-2xl p-8">
  <h2 className="text-foreground font-display text-2xl">Module Title</h2>
  <div className="text-muted-foreground">
    Card content with heavier glass and shadow
  </div>
</div>
```

### Using Token Variables Directly

```tsx
<div
  style={{
    background: 'var(--glass-bg)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--glass-border)'
  }}
>
  Custom glass element
</div>
```

### Combining with Tailwind Colors

```tsx
<button className="glass rounded-lg px-4 py-2 text-primary hover:bg-accent">
  Glass Button
</button>
```

---

## Token Mapping

The following shows how CSS tokens map to Tailwind CSS theme colors:

| CSS Token | Tailwind Class |
|-----------|---------------|
| `--background` | `bg-background` |
| `--foreground` | `text-foreground` |
| `--primary` | `bg-primary`, `text-primary` |
| `--secondary` | `bg-secondary` |
| `--muted` | `bg-muted` |
| `--muted-foreground` | `text-muted-foreground` |
| `--accent` | `bg-accent` |
| `--destructive` | `bg-destructive` |
| `--border` | `border-border` |
| `--ring` | `ring-ring` |

---

## Related Files

- **Source:** `src/app/globals.css` - Token definitions
- **Theme Provider:** `src/providers/theme-provider.tsx` - next-themes configuration
- **Components:** Use tokens via Tailwind classes or CSS variables
