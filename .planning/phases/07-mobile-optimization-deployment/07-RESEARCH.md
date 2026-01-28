# Phase 7: Mobile Optimization & Deployment - Research

**Researched:** 2026-01-28
**Domain:** Mobile Responsive Design, Touch Accessibility, Vercel Deployment
**Confidence:** HIGH

## Summary

This phase covers two distinct but related areas: ensuring the existing form and admin dashboard work excellently on mobile devices, and deploying the complete application to Vercel with Convex.

The mobile optimization work focuses on touch target sizing (44x44px minimum for WCAG AAA compliance), ensuring the mobile keyboard doesn't obscure active inputs, and verifying responsive layouts work on real iOS and Android devices. The codebase already uses Tailwind CSS 4's mobile-first approach, so work will mainly involve auditing and fixing existing components rather than building from scratch.

The deployment work is straightforward: Vercel has first-class Next.js 16 support with zero-config, and Convex provides a well-documented integration. The key tasks are configuring environment variables (CONVEX_DEPLOY_KEY, ADMIN_PASSWORD, SESSION_SECRET) and setting up the build command.

**Primary recommendation:** Audit existing UI components for touch target compliance, add scrollIntoView on input focus for keyboard handling, configure Vercel with Convex deploy key, and test on real devices via Vercel preview deployments.

## Standard Stack

No new libraries needed - the existing stack fully supports mobile optimization and deployment.

### Core (Already Installed)
| Library | Version | Purpose | Mobile Relevance |
|---------|---------|---------|------------------|
| Next.js | 16.1.5 | Framework | Zero-config Vercel deployment |
| Tailwind CSS | 4.x | Styling | Mobile-first breakpoints, responsive utilities |
| shadcn/ui | latest | Components | Pre-built accessible components |
| Framer Motion | 12.29.2 | Animations | Hardware-accelerated, GPU-optimized |
| Convex | 1.31.6 | Backend | Vercel integration with deploy keys |

### Deployment Tools (CLI)
| Tool | Purpose | Notes |
|------|---------|-------|
| Vercel CLI | Deployment | Optional - can use Git integration |
| Convex CLI | Backend deployment | Used in build command |

**No new packages required.** Mobile optimization uses CSS/Tailwind utilities. Deployment uses existing CLI tools.

## Architecture Patterns

### Mobile-First Responsive Design (Already in Place)

Tailwind CSS uses a mobile-first approach. The existing codebase correctly uses this pattern:

```typescript
// Correct pattern (already in codebase)
className="text-xl sm:text-2xl"  // Mobile first, then larger
```

### Touch Target Sizing Pattern

**WCAG Requirement:** Minimum 44x44 CSS pixels for Level AAA compliance.

Current button sizes need auditing:
```typescript
// Current shadcn button variants
size: {
  default: "h-9 px-4 py-2",     // h-9 = 36px - NEEDS REVIEW
  sm: "h-8 rounded-md px-3",    // h-8 = 32px - TOO SMALL
  lg: "h-10 rounded-md px-6",   // h-10 = 40px - CLOSE
}
```

**Recommended Pattern:**
```typescript
// Mobile-optimized button size
size: {
  default: "h-11 px-5 py-3",    // h-11 = 44px - MEETS WCAG
  // OR use min-height approach
  className="min-h-[44px] min-w-[44px]"
}
```

### Keyboard Handling Pattern

**Problem:** On iOS, the keyboard overlays content without resizing viewport. Inputs can be hidden behind keyboard.

**Solution Pattern:**
```typescript
// Add to form inputs on focus
inputElement.addEventListener('focus', () => {
  inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
});

// React implementation
const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
  e.target.scrollIntoView({ behavior: "smooth", block: "center" });
};
```

### Responsive Table-to-Card Pattern

For admin dashboard on mobile, tables with many columns become unusable. Options:

1. **Horizontal scroll** (current behavior) - acceptable for admin use
2. **Column visibility toggle** - hide less important columns on mobile
3. **Card layout** - render rows as cards on small screens

**Recommended:** Keep table with horizontal scroll for admin (power user context), but ensure the row-click-to-sheet pattern works well on mobile.

### Safe Area Handling for PWA

```typescript
// In layout.tsx viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  viewportFit: 'cover', // Enable safe-area-inset
};
```

```css
/* In globals.css */
body {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Don't Hand-Roll

Problems with existing solutions - use them:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Touch target sizing | Custom size calculations | Tailwind min-h-11 / min-w-11 | Tailwind 4 has 44px = h-11 |
| Keyboard scroll | Complex viewport calculations | scrollIntoView() native API | Works across browsers, simple |
| Mobile viewport | Custom JavaScript resize handlers | CSS dvh units + viewport meta | Native browser support |
| Responsive breakpoints | Custom media queries | Tailwind breakpoints (sm, md, lg) | Already configured |
| Deploy configuration | Custom CI/CD scripts | Vercel Git integration | Zero-config for Next.js |
| Convex deployment | Manual function deployment | npx convex deploy in build | Integrated with Vercel |

## Common Pitfalls

### Pitfall 1: Assuming sm: Means "Small Screen"
**What goes wrong:** Developers add `sm:` prefix expecting it to apply to mobile phones.
**Why it happens:** Misunderstanding mobile-first approach - unprefixed IS mobile.
**How to avoid:** Always style mobile FIRST (no prefix), then add prefixes for larger screens.
**Warning signs:** Styles that work on desktop but break on mobile.

### Pitfall 2: iOS Keyboard Covering Inputs
**What goes wrong:** On iOS Safari, keyboard opens but doesn't push content up, hiding the active input.
**Why it happens:** iOS doesn't resize the layout viewport when keyboard appears.
**How to avoid:** Add scrollIntoView on input focus events.
**Warning signs:** Users report they can't see what they're typing on iPhone.

### Pitfall 3: Touch Targets Too Small
**What goes wrong:** Buttons and links are difficult to tap accurately on mobile.
**Why it happens:** Desktop-sized elements (h-9 = 36px) are below 44px minimum.
**How to avoid:** Audit all interactive elements, ensure min-height/width of 44px.
**Warning signs:** Error rates 3x higher on small targets; rage taps.

### Pitfall 4: Fixed Position + iOS Keyboard
**What goes wrong:** Elements with `position: fixed; bottom: 0` get hidden behind keyboard.
**Why it happens:** iOS anchors fixed elements to layout viewport, which doesn't resize.
**How to avoid:** Use sticky instead of fixed, or detect keyboard with visualViewport API.
**Warning signs:** Submit buttons disappear when keyboard opens.

### Pitfall 5: Missing Environment Variables in Production
**What goes wrong:** App deploys but authentication or database fails.
**Why it happens:** Forgot to add ADMIN_PASSWORD, SESSION_SECRET, or CONVEX_DEPLOY_KEY to Vercel.
**How to avoid:** Document ALL required env vars; verify in Vercel dashboard before deploy.
**Warning signs:** Login returns 500 error; Convex queries fail.

### Pitfall 6: Deploying Convex Dev to Production
**What goes wrong:** Production site connects to development Convex database.
**Why it happens:** CONVEX_DEPLOY_KEY not set, so NEXT_PUBLIC_CONVEX_URL uses dev value.
**How to avoid:** Only enable CONVEX_DEPLOY_KEY for Production environment in Vercel.
**Warning signs:** Production data appears in dev dashboard.

### Pitfall 7: Session Secret Mismatch
**What goes wrong:** Users get logged out unexpectedly or sessions don't work.
**Why it happens:** SESSION_SECRET differs between builds or is not set in production.
**How to avoid:** Generate a strong SESSION_SECRET and add to Vercel production vars.
**Warning signs:** Admin login succeeds but immediately redirects back to login.

## Code Examples

### Touch Target Compliance Check

```typescript
// Audit helper - identifies elements below 44px
// Source: WCAG 2.5.5 Target Size (Enhanced)

// CSS utility class to ensure compliance
const touchTargetClasses = "min-h-11 min-w-11"; // 44px each

// Button that meets WCAG AAA
<Button className="min-h-11 px-6">Submit</Button>
```

### Input Focus Scroll Handler

```typescript
// Source: MDN scrollIntoView API
// Add to form components

import { useCallback } from 'react';

const useMobileKeyboardHandler = () => {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Small delay allows keyboard to animate in
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  return { handleFocus };
};
```

### Vercel Environment Variables

```bash
# Required environment variables for production

# Convex - generate from Convex Dashboard > Project Settings
CONVEX_DEPLOY_KEY=prod:tall-lion-123|abc123...  # Production only

# Admin Auth - set secure password
ADMIN_PASSWORD=secure-random-password-here      # All environments
SESSION_SECRET=base64-encoded-32-byte-secret    # All environments
```

### Build Command Configuration

```json
// vercel.json (optional - can use Vercel dashboard)
{
  "buildCommand": "npx convex deploy --cmd 'npm run build'"
}
```

### Responsive Viewport Meta

```typescript
// src/app/layout.tsx
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};
```

### Tailwind Mobile Breakpoints Reference

```typescript
// Tailwind 4 default breakpoints (rem-based)
// Source: https://tailwindcss.com/docs/responsive-design

// sm: 40rem (640px)  - Tablets
// md: 48rem (768px)  - Small laptops
// lg: 64rem (1024px) - Laptops
// xl: 80rem (1280px) - Desktops
// 2xl: 96rem (1536px) - Large screens

// Mobile-first pattern:
// "base" (no prefix) = mobile
// "sm:" = tablet and up
// "md:" = laptop and up
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| vh units for full height | dvh/svh/lvh dynamic units | 2023 | Handles mobile browser chrome properly |
| Manual keyboard detection | visualViewport API + scrollIntoView | 2022 | More reliable cross-platform |
| Custom Vercel build scripts | Build adapters (Next.js 16) | 2025 | Simplified deployment |
| Manual Convex deployment | npx convex deploy --cmd | 2024 | Integrated CI/CD |
| apple-mobile-web-app-capable meta | Web App Manifest | 2024 | Deprecated meta tag |

**Deprecated/outdated:**
- `apple-mobile-web-app-capable` meta tag - use manifest.json instead
- `vh` for mobile full-height - use `dvh` (dynamic viewport height)
- Manual convex deploy then npm build - use integrated `--cmd` flag

## Open Questions

All key questions resolved through research. No blocking open questions.

1. **Admin table on mobile** - Horizontal scroll is acceptable for admin power users. No need to implement card view unless specifically requested.

2. **PWA manifest** - Not required for basic deployment. Can be added later if home screen install is desired.

## Sources

### Primary (HIGH confidence)
- Convex Vercel Hosting Documentation - https://docs.convex.dev/production/hosting/vercel
- Tailwind CSS Responsive Design - https://tailwindcss.com/docs/responsive-design
- WCAG 2.5.5 Target Size Understanding - https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- Next.js 16 Release Notes - https://nextjs.org/blog/next-16
- Vercel Next.js Documentation - https://vercel.com/docs/frameworks/full-stack/nextjs

### Secondary (MEDIUM confidence)
- Smashing Magazine Touch Target Sizes - https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/
- DEV Community Mobile Form Inputs - https://dev.to/swhabitation/how-to-fix-mobile-form-inputs-breaking-layout-on-sites-1b5d
- Motion Performance Updates - https://www.framer.com/updates/animation-performance
- TanStack Table Responsive Patterns - https://github.com/TanStack/table/discussions/3259

### Tertiary (LOW confidence)
- Medium articles on iOS keyboard handling - general patterns, verify with testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no changes needed, existing stack handles everything
- Architecture patterns: HIGH - well-documented browser APIs and Tailwind patterns
- Deployment: HIGH - official Convex + Vercel documentation, verified patterns
- Pitfalls: HIGH - well-documented issues with known solutions

**Research date:** 2026-01-28
**Valid until:** 2026-03-28 (60 days - stable domain)

## Environment Variables Checklist

Required for production deployment:

| Variable | Purpose | Where to Get | Vercel Environment |
|----------|---------|--------------|-------------------|
| `CONVEX_DEPLOY_KEY` | Convex production deployment | Convex Dashboard > Project Settings > Generate Production Deploy Key | Production only |
| `ADMIN_PASSWORD` | Admin dashboard authentication | Generate secure password | All environments |
| `SESSION_SECRET` | JWT session signing | `openssl rand -base64 32` | All environments |

Note: `NEXT_PUBLIC_CONVEX_URL` is automatically set by `npx convex deploy` when `CONVEX_DEPLOY_KEY` is present.
