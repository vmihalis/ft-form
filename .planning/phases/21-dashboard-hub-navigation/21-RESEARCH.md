# Phase 21: Dashboard Hub & Navigation - Research

**Researched:** 2026-01-29
**Domain:** React dashboard layout, collapsible sidebar navigation, glassmorphism UI
**Confidence:** HIGH

## Summary

This phase implements a dashboard hub as the landing page after login with module cards and a collapsible sidebar for navigation. The research focuses on three key areas: (1) Next.js App Router layout patterns for persistent sidebar navigation, (2) state persistence using localStorage for sidebar collapse state, and (3) animation patterns using the Motion library for smooth expand/collapse transitions.

The existing codebase already has strong foundations: glassmorphism design tokens in `globals.css`, the Motion library (v12.29.2), Radix UI Collapsible component, zustand for state management, and lucide-react for icons. The implementation should leverage these existing tools rather than introducing new dependencies.

The sidebar should use the dual-interaction pattern (click to pin, hover to peek) with localStorage persistence. Module cards use the existing `.glass-card` utility class with Motion animations for hover effects. Mobile responsiveness uses a sheet/drawer pattern that transforms the sidebar into an overlay.

**Primary recommendation:** Build custom sidebar and dashboard components using existing Motion library, zustand for state, and localStorage for persistence - avoid adding shadcn/ui sidebar component which would add unnecessary complexity.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | 12.29.2 | Animation library | Already in codebase, handles layout animations natively |
| zustand | 5.0.10 | State management | Already in codebase, simple store pattern established |
| lucide-react | 0.563.0 | Icon library | Already in codebase, comprehensive icon set |
| @radix-ui/react-collapsible | 1.1.12 | Collapsible primitive | Already installed, provides accessible expand/collapse |
| next-themes | 0.4.6 | Theme management | Already configured with dark mode |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dialog | 1.1.15 | Sheet/modal base | Mobile sidebar overlay |
| tailwind-merge | 3.4.0 | Class merging | Combining conditional classes |
| clsx | 2.1.1 | Conditional classes | Dynamic class application |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom sidebar | shadcn/ui Sidebar | shadcn adds significant complexity (SidebarProvider, multiple sub-components); custom is simpler for this use case |
| zustand + localStorage | Cookies | Cookies would enable SSR hydration but add complexity; localStorage is simpler and sidebar flash is acceptable |
| Motion layout | CSS transitions | CSS is simpler but Motion handles width animation better and is already in the project |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── admin/
│       ├── layout.tsx           # Admin layout with sidebar
│       ├── page.tsx             # Dashboard hub (redirect target)
│       └── forms/               # Forms module routes
├── components/
│   ├── admin/
│   │   ├── Sidebar.tsx          # Collapsible sidebar component
│   │   ├── SidebarNav.tsx       # Navigation items within sidebar
│   │   ├── MobileNav.tsx        # Mobile hamburger menu + sheet
│   │   └── ModuleCard.tsx       # Dashboard hub module card
│   └── ui/                      # Existing UI primitives
└── lib/
    └── stores/
        └── sidebar-store.ts     # Sidebar collapse state + localStorage sync
```

### Pattern 1: Admin Layout with Persistent Sidebar
**What:** Next.js App Router layout that wraps all admin pages with a sidebar
**When to use:** For the `/admin/*` route group
**Example:**
```typescript
// Source: Next.js App Router layout pattern
// app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### Pattern 2: Zustand Store with localStorage Persistence
**What:** State store that syncs collapse state to localStorage
**When to use:** For sidebar state that persists across sessions
**Example:**
```typescript
// Source: Zustand persist middleware pattern
import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  isHovering: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setHovering: (hovering: boolean) => void;
  toggleCollapsed: () => void;
}

const STORAGE_KEY = 'frontierios-sidebar-state';

// Initialize from localStorage (client-side only)
const getInitialState = () => {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).isCollapsed : false;
  } catch {
    return false;
  }
};

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isCollapsed: false, // Default expanded for new users
  isHovering: false,
  setCollapsed: (collapsed) => {
    set({ isCollapsed: collapsed });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isCollapsed: collapsed }));
    }
  },
  setHovering: (hovering) => set({ isHovering: hovering }),
  toggleCollapsed: () => {
    const newState = !get().isCollapsed;
    get().setCollapsed(newState);
  },
}));
```

### Pattern 3: Motion Layout Animation for Width Transitions
**What:** Using Motion's layout prop for smooth width animations
**When to use:** Sidebar expand/collapse animation
**Example:**
```typescript
// Source: motion.dev layout animation pattern
import { motion } from 'motion/react';

const sidebarVariants = {
  expanded: { width: 240 },
  collapsed: { width: 64 },
};

<motion.aside
  initial={false}
  animate={isExpanded ? 'expanded' : 'collapsed'}
  variants={sidebarVariants}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
  className="glass h-screen"
>
  {/* sidebar content */}
</motion.aside>
```

### Pattern 4: Dual Interaction Sidebar (Click to Pin, Hover to Peek)
**What:** Sidebar that expands on hover when collapsed, with click to toggle persistent state
**When to use:** Premium sidebar UX matching the decisions in CONTEXT.md
**Example:**
```typescript
// Combine isCollapsed (persistent) with isHovering (transient)
const effectivelyExpanded = !isCollapsed || isHovering;

<motion.aside
  animate={effectivelyExpanded ? 'expanded' : 'collapsed'}
  onMouseEnter={() => isCollapsed && setHovering(true)}
  onMouseLeave={() => setHovering(false)}
  // ...
>
```

### Anti-Patterns to Avoid
- **SSR localStorage access:** Don't read localStorage in module scope or during SSR. Use useEffect or lazy initialization.
- **Animating with CSS width:** Don't use CSS transitions for width - use Motion's layout animation which uses transforms for performance.
- **Global sidebar state in context:** Don't create a React Context for sidebar - zustand is simpler and already established.
- **Multiple nested layouts:** Don't create separate layouts for dashboard vs forms - use one admin layout with conditional rendering.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icons | Custom SVGs | lucide-react | Already installed, 1000+ icons, tree-shakable |
| Collapse animation | CSS transitions | motion layout | Transform-based animation is smoother, handles width-to-auto |
| Mobile sheet/drawer | Custom modal | Existing Sheet component | Already built with Radix Dialog, handles focus trap and a11y |
| Theme-aware glass | Hardcoded colors | `.glass-card` utility | Already defined in globals.css with theme variables |
| State persistence | Custom localStorage wrapper | zustand + localStorage | Simple pattern, already established in codebase |

**Key insight:** The codebase already has all the primitives needed. The work is composition, not creation.

## Common Pitfalls

### Pitfall 1: localStorage Hydration Mismatch
**What goes wrong:** Server renders with default state, client reads different state from localStorage, causing flash/flicker
**Why it happens:** localStorage is only available on client, SSR uses default values
**How to avoid:** Accept the flash (it's brief) OR use `useEffect` to delay render until mounted OR use CSS to hide during hydration
**Warning signs:** Console hydration warnings, visible state jump on page load

### Pitfall 2: Motion Animation Performance on Width
**What goes wrong:** Janky animation when changing actual CSS width property
**Why it happens:** Width changes cause layout reflow, expensive on every frame
**How to avoid:** Use Motion's layout prop which animates via transforms, not width
**Warning signs:** Stuttering animation, dropped frames on mobile

### Pitfall 3: Sidebar Z-Index Conflicts
**What goes wrong:** Sidebar overlaps modals/sheets incorrectly or gets overlapped
**Why it happens:** Multiple positioned elements without coordinated z-index
**How to avoid:** Define clear z-index scale: sidebar=40, sheet-overlay=50, modal=50+
**Warning signs:** Elements appearing in wrong stacking order

### Pitfall 4: Mobile Touch vs Hover Confusion
**What goes wrong:** Hover-to-peek doesn't work well on touch devices
**Why it happens:** Touch devices trigger hover on tap, creating confusing UX
**How to avoid:** Detect touch devices and disable hover-to-peek, use only tap-to-toggle
**Warning signs:** Sidebar behaves unpredictably on mobile/tablet

### Pitfall 5: Sidebar State Not Persisting
**What goes wrong:** User collapses sidebar, refreshes, sidebar is expanded again
**Why it happens:** localStorage write failed or key mismatch
**How to avoid:** Wrap localStorage access in try-catch, use consistent key, verify in DevTools
**Warning signs:** State resets on refresh

## Code Examples

Verified patterns from official sources and existing codebase:

### Glass Module Card with Hover Animation
```typescript
// Source: Existing globals.css + motion.dev hover patterns
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  disabled?: boolean;
}

export function ModuleCard({ icon: Icon, label, href, disabled }: ModuleCardProps) {
  const content = (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-8 h-[220px] flex flex-col items-center justify-center gap-4",
        "cursor-pointer transition-colors",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Icon className="h-12 w-12 text-foreground" />
      <span className="font-display text-xl text-foreground">{label}</span>
      {disabled && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          Coming Soon
        </span>
      )}
    </motion.div>
  );

  if (href && !disabled) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
```

### Sidebar Navigation Item
```typescript
// Source: motion.dev gesture patterns + existing codebase patterns
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isCollapsed: boolean;
}

export function SidebarNavItem({ icon: Icon, label, href, isCollapsed }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href}>
      <motion.div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-sidebar-accent",
          isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
        )}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.15 }}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <motion.span
          initial={false}
          animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium overflow-hidden whitespace-nowrap"
        >
          {label}
        </motion.span>
      </motion.div>
    </Link>
  );
}
```

### Mobile Navigation with Sheet
```typescript
// Source: Existing Sheet component + Next.js App Router patterns
'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from './SidebarNav';

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="glass w-64 p-0">
        <SidebarNav isCollapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
```

### Dashboard Grid Layout
```typescript
// Source: CSS Grid best practices + CONTEXT.md decisions
// 2-3 columns based on viewport, equal-sized cards

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  <ModuleCard icon={FileText} label="Forms" href="/admin/forms" />
  <ModuleCard icon={Users} label="Members" disabled />
  <ModuleCard icon={Calendar} label="Events" disabled />
  <ModuleCard icon={DoorOpen} label="Spaces" disabled />
  <ModuleCard icon={Heart} label="Wellness" disabled />
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion package | motion package | 2024 | Same API, rebrand to motion.dev |
| CSS transitions for layout | Motion layout prop | 2023+ | Transform-based animation, better perf |
| React Context for UI state | Zustand stores | 2022+ | Simpler, less boilerplate, no provider nesting |
| Custom localStorage hooks | Direct zustand persist | Current | Built-in persist middleware available |

**Deprecated/outdated:**
- `framer-motion` package name: Now `motion` (import from `motion/react`)
- `@radix-ui/react-navigation-menu`: Overkill for simple sidebar navigation

## Open Questions

Things that couldn't be fully resolved:

1. **Exact mobile breakpoint**
   - What we know: Tailwind's `lg:` breakpoint (1024px) is common for desktop sidebar
   - What's unclear: Whether 768px (`md:`) would be better for this specific design
   - Recommendation: Start with `lg:` (1024px), adjust if needed during implementation

2. **Sidebar width on hover**
   - What we know: Decision says ~240px expanded, ~64px collapsed
   - What's unclear: Whether hover preview should be same width as fully expanded
   - Recommendation: Use same 240px for both; consistent UX

3. **Keyboard shortcut for sidebar toggle**
   - What we know: shadcn sidebar uses Cmd/Ctrl+B
   - What's unclear: Whether to add keyboard shortcut in this phase
   - Recommendation: Defer to future enhancement; focus on core functionality

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/app/globals.css` - Glass tokens, sidebar tokens
- Existing codebase: `src/components/ui/sheet.tsx` - Sheet pattern
- Existing codebase: `src/lib/stores/form-builder-store.ts` - Zustand pattern
- [Next.js Layouts Documentation](https://nextjs.org/docs/app/getting-started/layouts-and-pages)

### Secondary (MEDIUM confidence)
- [Motion.dev Layout Animations](https://motion.dev/docs/react-layout-animations) - Layout animation patterns
- [Motion.dev Gestures](https://motion.dev/docs/react-gestures) - whileHover, whileTap
- [Lucide Icons](https://lucide.dev/icons/) - Icon selection
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) - State persistence patterns (cookie-based)

### Tertiary (LOW confidence)
- [Josh Comeau localStorage React](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/) - localStorage hydration patterns
- [FreeCodeCamp Animated Sidebar](https://www.freecodecamp.org/news/create-a-fully-animated-sidebar/) - Animation structure

## Recommended Icons

Based on Frontier Tower context and lucide-react availability:

| Module | Primary Icon | Alternative | Rationale |
|--------|-------------|-------------|-----------|
| Forms | `FileText` | `ClipboardList` | Document/form representation |
| Members | `Users` | `UserRound` | Multiple people/community |
| Events | `Calendar` | `CalendarDays` | Event scheduling |
| Spaces | `DoorOpen` | `Building` | Room/space booking |
| Wellness | `Heart` | `Activity` | Health/wellness theme |

Additional icons needed:
- Sidebar toggle: `PanelLeftClose`, `PanelLeft`
- Dashboard: `LayoutDashboard`
- Menu (mobile): `Menu`
- Logout: `LogOut`
- Theme toggle: Already using `Sun`, `Moon`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and patterns established in codebase
- Architecture: HIGH - Next.js App Router layouts well documented, patterns verified
- Pitfalls: MEDIUM - Based on common React/Next.js issues, some project-specific

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (30 days - stable technologies)
