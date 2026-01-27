# Phase 4: Form Polish & Animations - Research

**Researched:** 2026-01-28
**Domain:** Animation library (Motion), CSS theming (Tailwind CSS 4), accessibility (reduced motion)
**Confidence:** HIGH

## Summary

This phase adds Typeform-style animations to the existing multi-step form. The primary technology is **Motion for React** (formerly Framer Motion), the industry-standard React animation library with 12+ million monthly npm downloads. The form already has a solid structure with `StepContent` routing between 8 step components - the animation layer wraps this with `AnimatePresence` for smooth enter/exit transitions.

Key findings:
1. Use `motion` npm package (v12.x) with imports from `"motion/react"`
2. `AnimatePresence` with `mode="wait"` enables smooth step transitions
3. Direction-aware animations require the `custom` prop pattern for proper exit handling
4. `MotionConfig` with `reducedMotion="user"` provides automatic accessibility compliance
5. Brand colors should be added via CSS variables in `@theme` block using OKLCH format

**Primary recommendation:** Wrap `StepContent` output in `AnimatePresence` with direction-aware variants, update `--primary` CSS variable to brand purple (#7b42e7 / oklch(0.53 0.24 291)), and wrap the app in `MotionConfig` with `reducedMotion="user"` for accessibility.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | ^12.29.2 | React animation library | Industry standard, 12M+ monthly downloads, best DX for declarative animations |
| Tailwind CSS 4 | ^4 | Already installed | CSS-first theming with `@theme` directive for brand colors |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tw-animate-css | ^1.4.0 | Already installed | Basic CSS animations (already present, used for loading spinner) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Motion | CSS-only transitions | CSS cannot animate exit/unmount; Motion required for Typeform-style step transitions |
| Motion | React Spring | Similar capability but Motion has better React 19 support and simpler API |
| Motion | GSAP | Overkill for form transitions; GSAP better for complex SVG/timeline animations |

**Installation:**
```bash
npm install motion
```

## Architecture Patterns

### Recommended Approach: Animated StepContent Wrapper

The cleanest pattern is wrapping step rendering in `AnimatePresence` at the `StepContent` level:

```
src/components/form/
├── MultiStepForm.tsx      # No changes needed
├── StepContent.tsx        # Add AnimatePresence wrapper
├── AnimatedStep.tsx       # NEW: motion wrapper with direction variants
└── steps/                 # Individual steps unchanged
```

### Pattern 1: Direction-Aware Step Transitions
**What:** Slides animate left-to-right on "Next", right-to-left on "Back"
**When to use:** Multi-step forms requiring visual continuity
**Example:**
```typescript
// Source: https://sinja.io/blog/direction-aware-animations-in-framer-motion
import { motion, AnimatePresence, MotionConfig } from "motion/react";

type Direction = "forward" | "back";

const variants = {
  initial: (direction: Direction) => ({
    x: direction === "forward" ? "100%" : "-100%",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: Direction) => ({
    x: direction === "forward" ? "-100%" : "100%",
    opacity: 0,
  }),
};

// AnimatePresence MUST receive `custom` prop to pass direction to exiting children
<AnimatePresence mode="wait" custom={direction} initial={false}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
  >
    {stepContent}
  </motion.div>
</AnimatePresence>
```

### Pattern 2: MotionConfig for Global Settings
**What:** Configure animation defaults and accessibility at app level
**When to use:** Apply consistent transitions and reduced motion support
**Example:**
```typescript
// Source: https://motion.dev/docs/react-motion-config
import { MotionConfig } from "motion/react";

// In layout or providers
<MotionConfig reducedMotion="user" transition={{ duration: 0.3 }}>
  {children}
</MotionConfig>
```

### Pattern 3: Brand Color via CSS Variables
**What:** Define brand purple using OKLCH in Tailwind CSS 4 @theme
**When to use:** Consistent brand theming across all components
**Example:**
```css
/* In globals.css - update :root variables */
:root {
  /* Brand purple #7b42e7 converted to OKLCH */
  --primary: oklch(0.53 0.24 291);
  --primary-foreground: oklch(1 0 0); /* white */
}
```

### Anti-Patterns to Avoid
- **Animating route changes in Next.js App Router:** Exit animations on route changes are problematic; this phase animates within a single page which works reliably
- **Using `exitBeforeEnter`:** Deprecated prop, use `mode="wait"` instead
- **Passing direction via React props to exiting components:** Unmounted components don't receive prop updates; use `custom` prop on AnimatePresence
- **Hardcoding animation durations:** Use CSS variables or MotionConfig for consistency and easier reduced-motion handling

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exit animations | CSS transitions with state delays | Motion AnimatePresence | React unmounts immediately; AnimatePresence keeps DOM element until animation completes |
| Reduced motion | Custom `prefers-reduced-motion` hook | `MotionConfig reducedMotion="user"` | Motion automatically disables transform animations while preserving opacity |
| Direction tracking | Manual previous state comparison | Store previous step in ref + compare | Simple pattern but easy to get wrong with React's render cycle |
| Spring physics | Custom easing functions | Motion's `type: "spring"` | Well-tuned spring presets with stiffness/damping parameters |

**Key insight:** Animation exit timing is the hardest problem. React unmounts components immediately, so you cannot use CSS transitions for exit animations. Motion's AnimatePresence is the only reliable solution for React.

## Common Pitfalls

### Pitfall 1: Exit Animations Not Working
**What goes wrong:** Step changes instantly, no exit animation
**Why it happens:**
1. Component not a direct child of AnimatePresence
2. Missing `key` prop on animated element
3. Using `mode="sync"` (default) instead of `mode="wait"`
**How to avoid:**
- Ensure animated component is immediate child of AnimatePresence
- Always provide unique `key` (use step number)
- Use `mode="wait"` for sequential transitions
**Warning signs:** Content flashes or overlaps during transition

### Pitfall 2: Direction Wrong on Exit
**What goes wrong:** Slide exits in wrong direction
**Why it happens:** Exiting component receives stale direction from when it mounted, not current direction
**How to avoid:** Pass `custom={direction}` to BOTH AnimatePresence AND motion component
**Warning signs:** "Back" button slides content left instead of right

### Pitfall 3: Layout Shift During Animation
**What goes wrong:** Page jumps or content reflows during transitions
**Why it happens:** Exiting element removed from document flow
**How to avoid:**
- Use `position: absolute` on animated elements during transition
- Or use `mode="wait"` which removes old content before adding new
- Wrap in container with fixed/min height
**Warning signs:** Navigation buttons or other elements jump during transition

### Pitfall 4: Reduced Motion Ignored
**What goes wrong:** Users with motion sensitivity still see animations
**Why it happens:** Forgot to check or honor `prefers-reduced-motion`
**How to avoid:** Wrap app in `<MotionConfig reducedMotion="user">` at provider level
**Warning signs:** Accessibility audit failure, user complaints

### Pitfall 5: Form State Lost During Animation
**What goes wrong:** Input values cleared when navigating steps
**Why it happens:** React Hook Form loses context when component unmounts
**How to avoid:**
- FormProvider wraps AnimatePresence (already done in codebase)
- Form state syncs to Zustand before step change (already done)
**Warning signs:** N/A - current implementation already handles this correctly

## Code Examples

Verified patterns from official sources:

### AnimatePresence with mode="wait"
```typescript
// Source: https://motion.dev/docs/react-animate-presence
import { motion, AnimatePresence } from "motion/react";

export function StepContent({ step, direction }: { step: number; direction: "forward" | "back" }) {
  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={step}
        custom={direction}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={{
          initial: (dir) => ({
            x: dir === "forward" ? 50 : -50,
            opacity: 0
          }),
          animate: { x: 0, opacity: 1 },
          exit: (dir) => ({
            x: dir === "forward" ? -50 : 50,
            opacity: 0
          }),
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Step component here */}
      </motion.div>
    </AnimatePresence>
  );
}
```

### useReducedMotion Hook (for custom behavior)
```typescript
// Source: https://motion.dev/docs/react-use-reduced-motion
import { useReducedMotion } from "motion/react";

function AnimatedStep({ children }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Tracking Direction with Previous Step
```typescript
// Source: https://sinja.io/blog/direction-aware-animations-in-framer-motion
import { useRef, useEffect } from "react";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Usage in component
const currentStep = useFormStore((state) => state.currentStep);
const previousStep = usePrevious(currentStep);
const direction = (previousStep ?? 0) < currentStep ? "forward" : "back";
```

### Brand Color OKLCH Conversion
```css
/*
 * #7b42e7 (brand purple) converted to OKLCH
 * L: 0.53 (53% lightness)
 * C: 0.24 (high chroma for vibrant purple)
 * H: 291 (purple hue angle)
 */
:root {
  --primary: oklch(0.53 0.24 291);
  --primary-foreground: oklch(1 0 0);

  /* For focus rings and accents */
  --ring: oklch(0.53 0.24 291);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package | Nov 2024 | Import from `"motion/react"` not `"framer-motion"` |
| `exitBeforeEnter` prop | `mode="wait"` | Framer Motion v5 (2022) | Same behavior, cleaner API |
| Manual reduced motion hooks | `MotionConfig reducedMotion` | Motion v10+ | Automatic transform animation disabling |
| RGB/HSL colors | OKLCH colors | Tailwind CSS 4 (2024) | Better perceptual uniformity, wider gamut |

**Deprecated/outdated:**
- `exitBeforeEnter`: Replaced by `mode="wait"` - do not use
- `framer-motion` import: Still works but `motion/react` is canonical
- `positionTransition`: Now use `layout` prop
- `AnimateSharedLayout`: Replaced by `LayoutGroup`

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal animation duration for form steps**
   - What we know: Typeform uses ~300-400ms transitions
   - What's unclear: Whether this feels right with slide + fade combo
   - Recommendation: Start with 300ms, test with users, adjust

2. **Progress indicator animations**
   - What we know: Can animate checkmark SVG with `pathLength`
   - What's unclear: Whether animating progress adds value or is distracting
   - Recommendation: Add subtle scale animation on completion, skip elaborate SVG animations unless explicitly requested

## Sources

### Primary (HIGH confidence)
- [Motion for React Official Docs](https://motion.dev/docs/react) - Installation, API reference
- [AnimatePresence Documentation](https://motion.dev/docs/react-animate-presence) - Exit animation patterns
- [MotionConfig Documentation](https://motion.dev/docs/react-motion-config) - Global configuration, reducedMotion
- [Direction-Aware Animations Guide](https://sinja.io/blog/direction-aware-animations-in-framer-motion) - Custom prop pattern for direction
- [Tailwind CSS 4 Theme Variables](https://tailwindcss.com/docs/theme) - @theme directive for custom colors

### Secondary (MEDIUM confidence)
- [BuildUI Multistep Wizard Course](https://buildui.com/courses/framer-motion-recipes/multistep-wizard) - Verified patterns
- [Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) - Migration from framer-motion

### Tertiary (LOW confidence)
- npm version checks (motion v12.29.2 current as of research date)
- OKLCH color conversion (recommend verifying with oklch.com tool)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Motion is undisputed standard, official docs verified
- Architecture: HIGH - Patterns verified with multiple authoritative sources
- Pitfalls: HIGH - Common issues well-documented in GitHub issues and official guides
- Brand colors: MEDIUM - OKLCH conversion should be verified with color tool

**Research date:** 2026-01-28
**Valid until:** 2026-03-28 (60 days - Motion is stable, major changes unlikely)
