# Pitfalls Research: FrontierOS Dashboard v2.0 Glassmorphism Overhaul

**Domain:** Design system migration with glassmorphism visual overhaul
**Researched:** 2026-01-29
**Project:** FrontierOS Dashboard v2.0
**Confidence:** HIGH (verified with multiple authoritative sources)

---

## Summary

Glassmorphism design systems have three critical failure modes: contrast/readability issues that fail WCAG requirements, performance degradation from backdrop-filter abuse, and dark mode implementations that cause FOUC (Flash of Unstyled Content). The FrontierOS codebase already has `glass` and `glass-card` utilities hardcoded for dark mode only, and the `className="dark"` is statically set without a theme provider. These foundations will need careful refactoring to support the full visual overhaul without breaking existing functionality.

**Key findings from codebase analysis:**
- Dark mode is hardcoded (`className="dark"` in layout.tsx)
- No theme provider infrastructure exists
- Glass utilities use fixed dark-mode colors (`oklch(0 0 0 / 40%)`)
- NeuralBackground is conditionally hidden on admin routes (no background for glass to blur)
- shadcn/ui components use OKLCH color system (ready for theming)

---

## Critical Pitfalls (Address in Phase 1)

### CRIT-1: No Theme Provider Infrastructure

**What goes wrong:** The current codebase has `className="dark"` hardcoded in `layout.tsx`. Adding light mode support without proper infrastructure causes hydration mismatches and FOUC (Flash of Unstyled Content).

**Why it happens:** Next.js SSR renders HTML before client-side JavaScript runs. Without a theme script in the document head, the server cannot know the user's preference.

**Current state in codebase:**
```tsx
// src/app/layout.tsx line 41
<html lang="en" className="dark">
```

**Warning signs:**
- Flash of light theme before dark theme loads
- React hydration warnings in console: "Text content does not match server-rendered HTML"
- Theme state inconsistency between server and client
- Layout shifts after hydration

**Prevention:**
1. Install `next-themes` early in the migration
2. Add ThemeProvider wrapper in layout.tsx
3. Add `suppressHydrationWarning` on the `<html>` element
4. Use `next-themes` script that runs before React hydrates
5. Never initialize theme state with `useState` directly - let the provider handle it

**Implementation pattern (from shadcn/ui docs):**
```tsx
// components/theme-provider.tsx
"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
```

**Phase:** Must be Phase 1 (before any theme-aware components)

**Sources:**
- [shadcn/ui Dark Mode for Next.js](https://ui.shadcn.com/docs/dark-mode/next)
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering)

---

### CRIT-2: Glass Utilities Are Dark-Mode-Only

**What goes wrong:** Current `glass` and `glass-card` utilities use `oklch(0 0 0 / 40%)` (black with 40% opacity). These will be nearly invisible on light backgrounds.

**Why it happens:** Glassmorphism was implemented for dark mode only without considering light mode variants.

**Current state in codebase:**
```css
/* src/app/globals.css lines 134-145 */
@utility glass {
  background: oklch(0 0 0 / 40%);  /* BLACK - invisible on light */
  backdrop-filter: blur(16px);
  border: 1px solid oklch(1 0 0 / 10%);
}

@utility glass-card {
  background: oklch(0 0 0 / 50%);  /* BLACK - invisible on light */
  backdrop-filter: blur(12px);
  border: 1px solid oklch(1 0 0 / 10%);
  box-shadow: 0 25px 50px -12px oklch(0 0 0 / 25%);
}
```

**Warning signs:**
- Glass panels disappear when switching to light mode
- Text becomes unreadable on light backgrounds
- Contrast ratios fail WCAG
- Components using glass utilities look broken in light mode

**Prevention:**
1. Create CSS custom properties for glass colors:
```css
:root {
  --glass-bg: oklch(1 0 0 / 60%);  /* Light mode: white-ish */
  --glass-border: oklch(0 0 0 / 10%);
  --glass-shadow: oklch(0 0 0 / 10%);
}

.dark {
  --glass-bg: oklch(0 0 0 / 40%);  /* Dark mode: black-ish */
  --glass-border: oklch(1 0 0 / 10%);
  --glass-shadow: oklch(0 0 0 / 25%);
}

@utility glass {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}
```
2. Test glass panels on both white and black backgrounds
3. Verify 4.5:1 contrast ratio for text in both modes
4. Update all 5 components currently using `glass-card`:
   - `src/components/dynamic-form/DynamicFormPage.tsx` (4 usages)
   - `src/app/apply/[slug]/page.tsx` (1 usage)

**Phase:** Must be Phase 1 (foundation layer)

---

### CRIT-3: Background Layer Assumptions

**What goes wrong:** `NeuralBackground` component is conditionally rendered only for non-admin routes. Glassmorphism requires "something behind the glass" to distort - solid backgrounds make the effect invisible.

**Why it happens:** The background wrapper assumes admin routes don't need the neural background, but glassmorphism panels on solid colors look like "just a semi-transparent box."

**Current state in codebase:**
```tsx
// src/components/ui/background-wrapper.tsx
export function BackgroundWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;  // No background for admin routes!
  }

  return <NeuralBackground />;
}
```

**Warning signs:**
- Glass effect looks flat/muddy on admin pages
- Dark Glassmorphism is practically invisible on solid black (`oklch(0.145 0 0)`)
- Light glassmorphism loses depth on solid white
- Admin dashboard looks dramatically different from user-facing pages

**Prevention:**
1. **For dashboard hub (new design):** Ensure appropriate backgrounds for glass effect
2. **For admin routes:** Use subtle gradient or pattern backgrounds instead of solid colors
3. Add dark gradient overlays behind glass panels in dark mode
4. Never place glass directly on pure black (`#000`) or pure white (`#fff`)
5. Consider making NeuralBackground always render, but with reduced/simplified version for admin

**Alternative approaches:**
```css
/* Fallback gradient for admin routes */
.admin-background {
  background: linear-gradient(
    135deg,
    oklch(0.18 0.02 280) 0%,
    oklch(0.12 0.01 260) 100%
  );
}
```

**Phase:** Phase 1 (background system)

---

## Glassmorphism Pitfalls

### GLASS-1: Contrast Ratio Failures (WCAG Compliance)

**What goes wrong:** Text placed on semi-transparent backgrounds fails WCAG 2.2 contrast requirements. WCAG requires 4.5:1 for body text and 3:1 for large text/UI components.

**Why it happens:** Designers prioritize aesthetics over accessibility. The blur effect creates visual noise that varies as content scrolls behind it.

**Warning signs:**
- Text appears "washed out" or hard to read
- Contrast checker tools fail the panel
- Users squinting or complaining about readability
- Accessibility audit failures

**Prevention:**
1. Never rely solely on blur for text separation
2. Add semi-opaque solid overlay behind text: `background: oklch(0 0 0 / 60%)` minimum for dark mode
3. Test contrast with worst-case background behind the glass
4. Use tools like WebAIM Contrast Checker during design
5. Consider `text-shadow` or `drop-shadow` for additional separation
6. Use the `muted-foreground` color token (currently `oklch(0.708 0 0)` in dark mode) carefully - verify contrast

**Testing checklist:**
- [ ] Body text meets 4.5:1 contrast ratio
- [ ] Large text (18px+) meets 3:1 ratio
- [ ] UI components (buttons, inputs) meet 3:1 ratio
- [ ] Test with colorful/busy backgrounds behind glass

**Phase:** Phase 1-2 (every glass component)

**Sources:**
- [WCAG 2.1 Understanding Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [Axess Lab: Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)

---

### GLASS-2: Alpha Channel Mistakes

**What goes wrong:** Using solid grey with opacity (e.g., `background: grey; opacity: 0.5`) instead of RGBA/OKLCH alpha channels. This looks washed out and affects children.

**Why it happens:** CSS shorthand confusion - `opacity` affects the entire element including children.

**Warning signs:**
- Text inside glass panels also becomes transparent
- Overall muddy appearance
- Children elements unexpectedly faded
- Using `opacity` property instead of alpha channel

**Prevention:**
1. Always use alpha channel in color function: `oklch(0 0 0 / 40%)` not `opacity: 0.4`
2. Use alpha-channel gradients for sophisticated effects
3. Review any component using `opacity` property
4. The current codebase correctly uses OKLCH alpha channels - maintain this pattern

**Correct (current codebase):**
```css
background: oklch(0 0 0 / 40%);  /* Only background is transparent */
```

**Incorrect:**
```css
background: oklch(0.5 0 0);
opacity: 0.4;  /* Makes EVERYTHING 40% transparent including text! */
```

**Phase:** Phase 2 (component implementation)

---

### GLASS-3: Blur Radius Too High

**What goes wrong:** High blur values (20px+) are more GPU-intensive without proportional visual improvement.

**Why it happens:** Designers increase blur to "look more glassy" without understanding performance costs.

**Current state (appropriate values):**
- `glass` utility: `blur(16px)` - good
- `glass-card` utility: `blur(12px)` - good

**Warning signs:**
- Frame rate drops during scroll
- Mobile devices become laggy
- Battery drain on laptops
- Blur values exceeding 20px

**Prevention:**
1. Keep blur between 8-16px for most elements (current values are good)
2. Use 4-8px for smaller elements
3. Profile on low-end devices before finalizing
4. Do not exceed current blur values without performance testing

**Phase:** Phase 2-3 (ongoing monitoring)

---

### GLASS-4: Too Many Layered Glass Elements

**What goes wrong:** Stacking multiple glass elements creates compound blur calculations, exponentially increasing GPU load.

**Why it happens:** Enthusiasm for the effect leads to overuse. Dashboard hub design might encourage glass-on-glass nesting.

**Warning signs:**
- Nested glass panels (glass card inside glass container)
- More than 3-5 glass elements visible simultaneously
- Performance degradation on scroll
- Z-index conflicts

**Prevention:**
1. Limit glass elements to primary UI surfaces only (main cards, nav, modals)
2. Use solid backgrounds for nested elements inside glass panels
3. Reserve glassmorphism for top-level cards and navigation
4. Audit for unintentional glass stacking
5. Consider: Navigation (glass) + Content cards (solid with subtle border)

**Phase:** Phase 2-3 (component hierarchy)

**Sources:**
- [shadcn/ui Issue #327: CSS Backdrop filter causing performance issues](https://github.com/shadcn-ui/ui/issues/327)
- [Mozilla Bug 1718471: backdrop-filter blur lag](https://bugzilla.mozilla.org/show_bug.cgi?id=1718471)

---

## Dark Mode Pitfalls

### DARK-1: Flash of Unstyled Content (FOUC)

**What goes wrong:** User sees light theme flash before dark theme loads, creating jarring experience.

**Why it happens:** Theme preference stored in localStorage is not accessible to server. React hydration applies theme too late in the render cycle.

**Warning signs:**
- Brief flash of white/light screen on page load
- Theme "snapping" into place after page renders
- Flicker on navigation between pages
- Users complaining about "blinding" flash

**Prevention (via next-themes):**
1. `next-themes` automatically injects a blocking script in `<head>` that runs before React
2. The script reads localStorage and `prefers-color-scheme` media query
3. Applies theme class to `<html>` before first paint
4. Set `suppressHydrationWarning` on `<html>` element
5. Use `defaultTheme="dark"` to match current behavior

**Manual alternative (if not using next-themes):**
```html
<script>
  (function() {
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  })();
</script>
```

**Phase:** Phase 1 (theme infrastructure)

**Sources:**
- [How to Prevent Theme Flash in React - DEV Community](https://dev.to/gaisdav/how-to-prevent-theme-flash-in-a-react-instant-dark-mode-switching-o20)
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering)

---

### DARK-2: Hydration Mismatch Errors

**What goes wrong:** Server renders one theme, client hydrates with another, causing React warnings and potential layout shifts.

**Why it happens:** Server cannot access localStorage. Server defaults to one theme while client reads a different preference.

**Warning signs:**
- Console warnings: "Text content does not match server-rendered HTML"
- Layout shifts after hydration
- Styles "popping" into place
- Components re-rendering unnecessarily on mount

**Prevention:**
1. Use `mounted` state pattern for theme-dependent UI that must be different between server/client:
```tsx
const [mounted, setMounted] = useState(false);
const { theme } = useTheme();

useEffect(() => setMounted(true), []);

// For theme toggle buttons, show skeleton until mounted
if (!mounted) return <Skeleton className="h-9 w-9" />;

return <ThemeToggle theme={theme} />;
```
2. For most UI, CSS variables handle theme without JS conditions
3. Avoid conditional rendering based on theme during SSR
4. `next-themes` provides `mounted` state via hook

**Phase:** Phase 1 (theme infrastructure)

---

### DARK-3: Incomplete Theme Variable Coverage

**What goes wrong:** Some components have theme variables, others don't. Switching themes exposes components with hardcoded colors.

**Why it happens:** Incremental development - new components added without theme awareness. Or utilities like `glass` use hardcoded colors.

**Current state (areas to audit):**
```css
/* Already using theme variables - GOOD */
--background, --foreground, --card, --primary, etc.

/* Hardcoded - NEEDS UPDATE */
@utility glass {
  background: oklch(0 0 0 / 40%);  /* Hardcoded black */
}
```

**Warning signs:**
- Some elements don't change when theme toggles
- Hardcoded hex/rgb values in components
- Inconsistent appearance across screens
- Custom utilities not respecting theme

**Prevention:**
1. Audit all color usage before migration starts
2. Create checklist of all components needing theme variables
3. Grep for hardcoded color values: `#[0-9a-f]{3,6}`, `rgb(`, `hsl(`, `oklch(` without `var(--`
4. Enforce semantic color tokens via code review
5. Update custom utilities to use CSS variables

**Audit command:**
```bash
grep -rn "oklch\|rgb\|hsl\|#[0-9a-f]" src/ --include="*.tsx" --include="*.css" | grep -v "var(--"
```

**Phase:** Phase 1 (audit), Phase 2-4 (implementation)

---

### DARK-4: Glass Effect Disappears in Dark Mode

**What goes wrong:** Translucent layers fade into inky backgrounds, making panels nearly invisible.

**Why it happens:** Dark glassmorphism needs different parameters than light mode - higher opacity, visible borders, stronger shadows.

**Warning signs:**
- Glass panels hard to distinguish from background
- Content appears to float without container
- Loss of visual hierarchy
- "Where does this card end?"

**Prevention:**
1. Boost panel opacity for dark mode: 50-60% instead of 30-40%
2. Add visible borders: `1px solid oklch(1 0 0 / 15%)` (already in codebase)
3. Use subtle inner glow/shadow for depth
4. Test on pure dark backgrounds
5. Consider slightly lighter dark background (current `oklch(0.145 0 0)` is quite dark)
6. Add gradient or noise texture to background for glass to "catch"

**Enhanced dark mode glass:**
```css
.dark {
  --glass-bg: oklch(0.15 0 0 / 60%);  /* Slightly lighter, more opaque */
  --glass-border: oklch(1 0 0 / 15%);
  --glass-shadow: 0 8px 32px oklch(0 0 0 / 40%);
  --glass-glow: inset 0 1px 0 oklch(1 0 0 / 10%);  /* Subtle top highlight */
}
```

**Phase:** Phase 2 (glass component variants)

---

## Migration Pitfalls

### MIG-1: Big Bang Refactor

**What goes wrong:** Attempting to overhaul entire UI at once leads to:
- Compatibility issues between old and new components
- Extended period of broken UI
- Difficulty isolating bugs
- Team burnout
- Inability to ship incrementally

**Why it happens:** Desire to "just get it done" or underestimating scope.

**Warning signs:**
- PRs touching 50+ files
- "Let's just rewrite the whole thing"
- Weeks without deployable state
- Main branch blocked for extended periods

**Prevention:**
1. Refactor in phases tied to feature areas
2. Maintain deployable state at each phase boundary
3. Create parallel components during transition if needed
4. Use feature flags to gradually roll out new design
5. Never freeze the codebase

**Recommended phase order:**
1. Theme infrastructure (doesn't change any UI yet)
2. Global styles and glass utilities
3. Dashboard hub (new component, doesn't break existing)
4. Forms list (migrate existing)
5. Form builder (migrate existing)
6. Submissions (migrate existing)

**Phase:** All phases (methodology)

---

### MIG-2: Breaking Existing Functionality

**What goes wrong:** Visual changes inadvertently break form submissions, navigation, or data flow.

**Why it happens:** Focus on styling causes overlooking behavioral testing.

**Warning signs:**
- "It looks right" without functional testing
- Skipping form submission tests
- No regression testing plan
- Only testing in one theme

**Prevention:**
1. Test every changed component functionally, not just visually
2. Keep a regression checklist:
   - [ ] Form submission works (all field types)
   - [ ] File upload still functions
   - [ ] Navigation between admin sections works
   - [ ] Draft persistence functions
   - [ ] Inline editing works
3. Run through user flows after each phase
4. Test in BOTH light and dark modes

**Phase:** All phases (testing discipline)

---

### MIG-3: Component API Breakage

**What goes wrong:** Changing component props or structure breaks consuming code.

**Why it happens:** Design changes ripple into interface changes without backward compatibility.

**Warning signs:**
- TypeScript errors after component updates
- Missing props in calling code
- Runtime errors from undefined props
- Having to update many files for one component change

**Prevention:**
1. Maintain backward compatibility where possible
2. Use TypeScript to catch breaking changes at compile time
3. Deprecate old props rather than removing immediately
4. Document API changes in migration notes
5. shadcn/ui components should largely maintain their APIs

**Phase:** Phase 2-4 (component work)

---

### MIG-4: Styling Specificity Conflicts

**What goes wrong:** New glass styles conflict with existing shadcn/ui component styles, causing unpredictable appearance.

**Why it happens:** Tailwind utility order, CSS specificity, and component library styles interact unexpectedly.

**Current consideration:** Tailwind CSS 4 uses `@custom-variant dark (&:is(.dark *));` which has specific specificity implications.

**Warning signs:**
- Styles not applying as expected
- `!important` being added
- Inconsistent appearance between similar components
- Dark mode styles not overriding light mode

**Prevention:**
1. Understand Tailwind CSS 4's `@custom-variant` specificity (dark mode utilities have higher specificity)
2. Use `@layer` correctly to control specificity
3. Avoid `!important` - fix the root cause
4. Test shadcn components after each globals.css change
5. Keep custom utilities outside of `@layer base` when needed

**Reference from current codebase:**
```css
@custom-variant dark (&:is(.dark *));  /* Dark variants have higher specificity */
```

**Phase:** Phase 1-2 (CSS architecture)

---

## Accessibility Pitfalls

### A11Y-1: Motion Sensitivity Ignored

**What goes wrong:** Parallax, wave effects, and animated backgrounds (like NeuralBackground) trigger vestibular conditions (dizziness, nausea).

**Why it happens:** Designers don't consider motion sensitivity a priority.

**Warning signs:**
- User complaints about dizziness
- No `prefers-reduced-motion` checks
- Continuous animations on screen
- NeuralBackground runs constantly

**Prevention:**
1. Check `prefers-reduced-motion` in NeuralBackground and all animations:
```css
@media (prefers-reduced-motion: reduce) {
  .neural-background {
    animation: none;
  }
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```
2. Provide static alternatives to animated backgrounds
3. Use fade/dissolve instead of motion-based transitions when reduced motion is preferred
4. Test with system "Reduce Motion" enabled

**Phase:** Phase 1 (foundation), Phase 2-4 (each animated component)

**Sources:**
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)

---

### A11Y-2: Transparency Preferences Ignored

**What goes wrong:** Users with visual impairments who reduce transparency in OS settings still get glassmorphism.

**Why it happens:** Developers don't know about `prefers-reduced-transparency` media query.

**Warning signs:**
- No reduced-transparency alternative
- Users with visual conditions struggling to read
- Ignoring OS accessibility settings

**Prevention:**
1. Respect `prefers-reduced-transparency`:
```css
@media (prefers-reduced-transparency: reduce) {
  .glass, .glass-card {
    backdrop-filter: none;
    background: oklch(0.2 0 0 / 95%);  /* Nearly opaque */
  }
}
```
2. Provide high-contrast alternative to glass panels
3. Test with system transparency settings enabled (Windows 11, macOS, iOS all have this)

**Browser support:** Most major browsers support this in 2025-2026.

**Phase:** Phase 1-2 (glass utilities)

**Sources:**
- [MDN: prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency)
- [Hall.me: Enhancing Accessibility with CSS prefers-reduced-transparency](https://www.hallme.com/blog/enhancing-accessibility-with-css-prefers-reduced-transparency/)

---

### A11Y-3: Focus States Lost in Glass Design

**What goes wrong:** Focus rings become invisible on glass backgrounds, breaking keyboard navigation.

**Why it happens:** Default focus rings designed for solid backgrounds don't contrast with translucent ones.

**Warning signs:**
- Can't see which element is focused
- Tab navigation feels "lost"
- Keyboard users unable to navigate
- Focus ring blends into blur

**Prevention:**
1. Design explicit focus states for glass contexts:
```css
.glass button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px oklch(0 0 0 / 20%);  /* Additional visibility */
}
```
2. Use multiple visual indicators: outline + background change
3. Test keyboard navigation on every glass component
4. Ensure focus rings have sufficient contrast (3:1 minimum against all backgrounds)

**Phase:** Phase 2-3 (interactive components)

---

### A11Y-4: Color Alone Conveying Information

**What goes wrong:** Error states, status indicators rely only on color which fails for colorblind users.

**Why it happens:** Glassmorphism's muted aesthetic leads to subtle color-only indicators.

**Warning signs:**
- Errors shown only with red tint
- Status shown only with colored badges
- No icons or text accompanying colors
- Relying on primary color alone for emphasis

**Prevention:**
1. Always pair color with icon, text, or pattern
2. Test with colorblindness simulators (Chrome DevTools has this)
3. Use semantic markup (aria-invalid, etc.)
4. Add icons to status badges: checkmark for success, X for error, etc.

**Phase:** Phase 2-4 (component design)

---

## Performance Pitfalls

### PERF-1: Backdrop-Filter on Large Areas

**What goes wrong:** Applying `backdrop-filter: blur()` to large elements (full-screen overlays, page backgrounds) causes severe frame drops.

**Why it happens:** GPU must calculate blur for entire visible area every frame during scroll/animation.

**Warning signs:**
- Scroll jank on glass overlays
- Low FPS in browser DevTools (< 60fps)
- Mobile devices become unresponsive
- Fans spinning up on laptops

**Prevention:**
1. Never use backdrop-filter on elements larger than ~50% of viewport
2. For large glass areas, use pre-blurred background image instead
3. Limit backdrop-filter to card-sized elements
4. Profile with Chrome DevTools Performance tab
5. Dashboard hub navigation can use glass; full-page overlays should not

**Phase:** Phase 2 (component sizing)

---

### PERF-2: Animating Backdrop-Filter

**What goes wrong:** Animating blur radius or opacity on glass elements causes severe performance issues.

**Why it happens:** Backdrop-filter cannot be GPU-accelerated efficiently during animation.

**Warning signs:**
- Jank during glass panel open/close
- Animation feels sluggish
- Mobile performance degradation
- FPS drops during transitions

**Prevention:**
1. Never animate backdrop-filter directly
2. Use opacity fade on the entire glass panel instead
3. If animation needed, use `will-change: backdrop-filter` temporarily (remove after)
4. Prefer transform animations over filter animations
5. For modals: fade entire modal, don't animate blur

**Good pattern:**
```css
.glass-modal {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.2s, transform 0.2s;
}
.glass-modal.open {
  opacity: 1;
  transform: scale(1);
}
```

**Bad pattern:**
```css
.glass-modal {
  backdrop-filter: blur(0px);
  transition: backdrop-filter 0.3s;  /* EXPENSIVE */
}
.glass-modal.open {
  backdrop-filter: blur(16px);
}
```

**Phase:** Phase 2-3 (animations)

---

### PERF-3: Stacking Context Explosion

**What goes wrong:** Backdrop-filter creates new stacking contexts, interacting poorly with positioned elements and z-index.

**Why it happens:** CSS backdrop-filter forces new stacking context, affecting all positioned descendants.

**Warning signs:**
- Z-index not working as expected
- Dropdowns appearing behind glass panels
- Modal layering issues
- Select menus hidden behind cards

**Prevention:**
1. Plan z-index system before implementation:
```css
:root {
  --z-background: 0;
  --z-content: 10;
  --z-nav: 100;
  --z-dropdown: 200;
  --z-modal: 300;
  --z-toast: 400;
}
```
2. Document stacking context boundaries
3. Test all overlay/modal/dropdown combinations
4. shadcn/ui uses portals for dropdowns - ensure they work with glass

**Phase:** Phase 1 (architecture), ongoing

---

### PERF-4: Mobile Performance Blind Spot

**What goes wrong:** Design tested only on desktop; mobile devices struggle with multiple glass elements.

**Why it happens:** Development machines are powerful; mobile testing skipped.

**Warning signs:**
- Laggy scroll on phones
- High battery drain
- Heat generation on mobile
- Touch interactions feeling delayed

**Prevention:**
1. Test on low-end Android device (not just iPhone)
2. Use Chrome DevTools mobile throttling (4x CPU slowdown)
3. Monitor frame rate during scroll: target 60fps
4. Have fallback for devices that can't handle glass:
```css
@supports not (backdrop-filter: blur(1px)) {
  .glass, .glass-card {
    background: oklch(0.2 0 0 / 90%);
  }
}
```
5. Limit glass elements on mobile (consider removing from smaller cards)

**Phase:** All phases (continuous testing)

---

## Phase-Specific Warning Summary

| Phase | Topic | Primary Pitfall | Secondary Pitfalls |
|-------|-------|-----------------|-------------------|
| 1 | Foundation | CRIT-1: No theme provider, DARK-1: FOUC | CRIT-2: Glass utilities dark-only, MIG-4: Specificity |
| 2 | Dashboard Hub | CRIT-3: Background assumptions | GLASS-4: Layered glass, PERF-3: Stacking context |
| 3 | Forms/Builder | MIG-2: Breaking functionality | A11Y-3: Focus states, GLASS-1: Contrast |
| 4 | Polish | PERF-4: Mobile performance | A11Y-1: Motion, A11Y-2: Transparency preferences |

---

## Pre-Migration Checklist

Before starting the migration, verify:

- [ ] `next-themes` installed and ThemeProvider set up
- [ ] `suppressHydrationWarning` on `<html>`
- [ ] Glass utilities converted to CSS variables
- [ ] Hardcoded colors audited in codebase
- [ ] NeuralBackground renders on admin routes (or alternative background exists)
- [ ] z-index system documented
- [ ] `prefers-reduced-motion` media query in place
- [ ] `prefers-reduced-transparency` media query in place
- [ ] Contrast ratios verified for glass text (4.5:1 body, 3:1 large)
- [ ] Mobile testing device identified
- [ ] Feature flags in place for gradual rollout (optional but recommended)

---

## Sources

### Glassmorphism Design
- [NN/G Glassmorphism Definition and Best Practices](https://www.nngroup.com/articles/glassmorphism/)
- [Axess Lab: Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [UX Pilot: 12 Glassmorphism UI Features and Best Practices](https://uxpilot.ai/blogs/glassmorphism-ui)
- [Dark Glassmorphism: UI Aesthetic in 2026 - Medium](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)

### Dark Mode Implementation
- [shadcn/ui Dark Mode for Next.js](https://ui.shadcn.com/docs/dark-mode/next)
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering)
- [How to Prevent Theme Flash in React - DEV Community](https://dev.to/gaisdav/how-to-prevent-theme-flash-in-a-react-instant-dark-mode-switching-o20)
- [Tailwind CSS Dark Mode Documentation](https://v2.tailwindcss.com/docs/dark-mode)
- [Tailwind CSS v4 Dark Mode Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/13863)

### Performance
- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [shadcn/ui Issue #327: CSS Backdrop filter causing performance issues](https://github.com/shadcn-ui/ui/issues/327)
- [Mozilla Bug 1718471: backdrop-filter blur lag with many elements](https://bugzilla.mozilla.org/show_bug.cgi?id=1718471)

### Accessibility
- [WCAG 2.1 Understanding Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [MDN: Using media queries for accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [MDN: prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency)
- [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)

### Migration Strategy
- [24 ways: Refactoring Your Way to a Design System](https://24ways.org/2017/refactoring-your-way-to-a-design-system/)
- [vFunction: 7 Pitfalls to Avoid in Refactoring Projects](https://vfunction.com/blog/7-pitfalls-to-avoid-in-application-refactoring-projects/)
