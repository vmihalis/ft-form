# Pitfalls Research: Floor Lead Application System

**Domain:** Typeform-style multi-step form with admin dashboard
**Technology Stack:** Next.js App Router + Tailwind + Convex + Vercel
**Researched:** 2026-01-27
**Overall Confidence:** HIGH (Context7 + official docs verified)

---

## Multi-Step Form Pitfalls

### Critical: End-of-Form Validation Only

**What goes wrong:** Waiting until the final step to validate all fields. Users complete 5+ steps only to discover errors from step 1.

**Warning signs:**
- Single validation function that runs on submit
- No per-step validation logic
- Error messages reference fields from earlier steps

**Prevention:**
- Validate each step before allowing progression
- Show errors immediately on the step where they occurred
- Use schema-per-step approach (e.g., Zod schemas for each step)

**Phase:** Core form implementation (Phase 1)

---

### Critical: No Back Navigation or Lost Progress

**What goes wrong:** Users cannot return to previous steps, or returning wipes their data.

**Warning signs:**
- Single form state that resets on navigation
- No persistent storage of partial submissions
- Back button refreshes entire form

**Prevention:**
- Store form state per-step (React state or localStorage)
- Implement explicit back/forward navigation
- Auto-save progress after each step completion

**Phase:** Form state management (Phase 1)

---

### High: Too Many Fields Per Step

**What goes wrong:** Each step contains 8+ fields, defeating the purpose of multi-step design. Users feel overwhelmed despite the multi-step format.

**Warning signs:**
- Steps with more than 5 form fields
- Scroll needed within a single step
- Mixed unrelated questions in one step

**Prevention:**
- Maximum 5 fields per step (Typeform uses 1 question per screen)
- Group logically related fields only
- Consider conditional logic to skip irrelevant questions

**Phase:** Form design/UX planning (Phase 1)

---

### Medium: Missing Progress Indicator

**What goes wrong:** Users don't know how long the form is, leading to abandonment when they feel lost.

**Warning signs:**
- No step counter or progress bar
- Users asking "how much more?"
- High drop-off rates mid-form

**Prevention:**
- Add clear step indicator (Step 2 of 5)
- Progress bar showing percentage complete
- Consider showing remaining time estimate

**Phase:** UI implementation (Phase 1)

---

### Medium: Premature or Overly Aggressive Validation

**What goes wrong:** Showing errors while user is still typing. Email field shows "invalid email" after typing "j".

**Warning signs:**
- onChange validation for all fields
- Red error states appearing instantly
- Users reporting frustration with "jumping" errors

**Prevention:**
- Validate on blur (when field loses focus) or on step transition
- For real-time validation, wait until field looks "complete" (e.g., email has @ and domain)
- Use debounced validation (300ms delay) for sensitive fields

**Phase:** Form validation logic (Phase 1)

---

### Low: Confusing or Technical Language

**What goes wrong:** Using jargon or unclear labels that confuse applicants.

**Warning signs:**
- Labels like "Primary Contact Information" instead of "Your phone number"
- Technical terms without explanation
- Users submitting wrong information

**Prevention:**
- Use conversational, plain language
- Test labels with real users
- Provide helper text for any ambiguous fields

**Phase:** Content/copy review (Phase 1)

---

## Convex Pitfalls

### Critical: Unawaited Promises

**What goes wrong:** Not awaiting `ctx.scheduler.runAfter`, `ctx.db.patch`, or other async operations. Functions appear to work but silently fail.

**Warning signs:**
- Intermittent failures in scheduling or database operations
- "Fire and forget" patterns in code
- Missing error handling for async operations

**Prevention:**
```typescript
// BAD
ctx.scheduler.runAfter(0, internal.emails.send, { to: email });

// GOOD
await ctx.scheduler.runAfter(0, internal.emails.send, { to: email });
```
- Enable `no-floating-promises` ESLint rule
- Always await Convex context operations

**Phase:** Backend setup (Phase 1)

**Source:** [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)

---

### Critical: Using `api.*` Instead of `internal.*` for Scheduled Functions

**What goes wrong:** Scheduling public API functions instead of internal ones. Public functions can be called by anyone, creating security vulnerabilities.

**Warning signs:**
- `ctx.scheduler.runAfter(0, api.someFunction, ...)` in code
- `ctx.runMutation(api.someFunction, ...)` patterns
- Crons.ts using `api.*` references

**Prevention:**
- Search codebase for `api.` in scheduler/run calls
- Use `internal.folder.function` for all internal operations
- Mark functions as internal when only called within Convex

**Phase:** Backend security review (Phase 2)

**Source:** [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)

---

### Critical: Missing Argument Validators on Public Functions

**What goes wrong:** Public mutations accept any arguments, allowing malicious input or type mismatches.

**Warning signs:**
- Functions without `args: { ... }` validators
- TypeScript-only validation (not runtime)
- Direct database writes from unvalidated input

**Prevention:**
```typescript
// BAD
export const submitApplication = mutation({
  handler: async (ctx, args) => { ... }
});

// GOOD
export const submitApplication = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => { ... }
});
```
- Use `@convex-dev/require-argument-validators` ESLint plugin

**Phase:** Backend implementation (Phase 1)

**Source:** [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)

---

### High: Circular Imports in Schema

**What goes wrong:** Validators become `undefined` due to import cycles, causing cryptic runtime errors.

**Warning signs:**
- "Validator is undefined" errors
- schema.ts importing from files that import from schema.ts
- Complex cross-file validator dependencies

**Prevention:**
- Define validators in "pure" files with minimal dependencies
- Keep schema.ts as the single source of truth
- Avoid re-exporting validators through schema.ts

**Phase:** Database schema design (Phase 1)

---

### High: Using `.filter()` Instead of `.withIndex()`

**What goes wrong:** Querying all documents then filtering in memory. Works fine with 100 applications, crashes with 10,000.

**Warning signs:**
- `.filter()` calls on queries
- Full table scans for common lookups
- Increasing query times as data grows

**Prevention:**
```typescript
// BAD - loads all applications, filters in memory
const pending = await ctx.db
  .query("applications")
  .filter(q => q.eq(q.field("status"), "pending"))
  .collect();

// GOOD - uses index for efficient lookup
const pending = await ctx.db
  .query("applications")
  .withIndex("by_status", q => q.eq("status", "pending"))
  .collect();
```
- Define indexes for common query patterns upfront
- Review queries for `.filter()` usage

**Phase:** Database schema design (Phase 1)

**Source:** [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)

---

### Medium: Using `Date.now()` in Queries

**What goes wrong:** Time-based queries don't re-run when time changes, causing stale data.

**Warning signs:**
- `Date.now()` calls inside query functions
- "Show applications from last 24 hours" not updating
- Inconsistent results based on cache timing

**Prevention:**
- Store timestamps in database, update via scheduled functions
- Pass time as argument from client (where appropriate)
- Use Convex's built-in `_creationTime` for creation-based filtering

**Phase:** Dashboard queries (Phase 2)

---

### Medium: Unbounded `.collect()` Calls

**What goes wrong:** Collecting all documents without limits. Works with 50 applications, times out with 5,000.

**Warning signs:**
- `.collect()` without `.take()` or pagination
- "All applications" queries without limits
- Query timeouts as data grows

**Prevention:**
- Use pagination for lists: `usePaginatedQuery`
- Add `.take(100)` for safety on development queries
- Implement cursor-based pagination for admin views

**Phase:** Admin dashboard (Phase 2)

---

### Low: Overusing `ctx.runQuery/ctx.runMutation`

**What goes wrong:** Using Convex context methods where plain TypeScript functions would work. Adds unnecessary overhead.

**Warning signs:**
- Chained `ctx.runQuery` calls in actions
- Helper logic wrapped in query/mutation definitions
- Slow action performance

**Prevention:**
- Extract shared logic to plain TypeScript helpers
- Use `ctx.run*` only when transaction boundaries matter
- Keep Convex functions as thin wrappers

**Phase:** Code organization (Phase 2)

---

## Animation/Transition Pitfalls

### Critical: AnimatePresence Memory Leaks

**What goes wrong:** Memory leaks when containers unmount mid-animation. Common in rapid navigation scenarios.

**Warning signs:**
- Memory growth during form testing
- "setState on unmounted component" warnings
- Performance degradation over time

**Prevention:**
- Avoid unmounting AnimatePresence containers mid-animation
- Use cleanup in useEffect for custom animations
- Test rapid navigation scenarios
- Consider using `key` prop correctly on animated elements

**Phase:** Animation implementation (Phase 1)

**Source:** [Framer Motion GitHub Issues](https://github.com/framer/motion/issues/625)

---

### High: Animating Layout Properties

**What goes wrong:** Animating `width`, `height`, `top`, `left` instead of `transform`. Causes layout recalculation and janky performance.

**Warning signs:**
- Choppy animations, especially on mobile
- High CPU usage during transitions
- Visible "jank" on step changes

**Prevention:**
```typescript
// BAD - triggers layout recalculation
animate={{ width: isExpanded ? 400 : 200 }}

// GOOD - GPU accelerated
animate={{ scale: isExpanded ? 1 : 0.5 }}
// or
animate={{ x: 100 }}
```
- Use `transform` properties: `x`, `y`, `scale`, `rotate`
- Use `opacity` for fade effects
- Avoid animating `width`, `height`, `margin`, `padding`

**Phase:** Animation implementation (Phase 1)

---

### High: No `prefers-reduced-motion` Support

**What goes wrong:** Users with vestibular disorders experience dizziness or nausea from animations. WCAG 2.3.3 compliance issue.

**Warning signs:**
- No motion preference detection in code
- Animations that can't be disabled
- Accessibility audit failures

**Prevention:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Or in Framer Motion:
```typescript
const prefersReducedMotion = usePrefersReducedMotion();
const variants = prefersReducedMotion ? {} : animationVariants;
```
- Test with browser reduced motion emulation
- Provide skip/instant option for all transitions

**Phase:** Animation implementation (Phase 1)

**Source:** [W3C WCAG 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

---

### Medium: Large Framer Motion Bundle

**What goes wrong:** Full `motion` component adds ~34kb to bundle. Unnecessary for simple transitions.

**Warning signs:**
- Large initial JavaScript bundle
- Slow Time to Interactive on mobile
- Using full `motion` for simple fades

**Prevention:**
- Use `m` + `LazyMotion` for reduced bundle (~4.6kb)
- Use `useAnimate` mini (2.3kb) for simple cases
- Consider CSS transitions for basic step animations

**Phase:** Performance optimization (Phase 2)

**Source:** [Motion Bundle Size Docs](https://motion.dev/docs/react-reduce-bundle-size)

---

### Low: Flash of Unstyled Content on Transition

**What goes wrong:** Next step renders before animation completes, showing content flash.

**Warning signs:**
- Content "jumping" during step transitions
- Visible layout shift
- AnimatePresence `mode` not configured

**Prevention:**
```typescript
<AnimatePresence mode="wait">
  <motion.div key={currentStep}>
    {/* step content */}
  </motion.div>
</AnimatePresence>
```
- Use `mode="wait"` for sequential exit/enter
- Ensure unique `key` per step

**Phase:** Animation implementation (Phase 1)

---

## Admin Dashboard Pitfalls

### Critical: Shared Password for All Admins

**What goes wrong:** Single password used by everyone. No audit trail, no revocation, compromised credential affects all access.

**Warning signs:**
- One password in environment variable
- No user differentiation in admin actions
- Cannot revoke access for specific person

**Prevention:**
- Even for "simple" auth, create individual credentials per admin
- Log which credential performed which action
- Enable password rotation without breaking all access

**For this project (simple password auth):**
- Store hashed passwords in Convex, not env vars
- Consider multiple admin accounts even if passwords are simple
- Add `actorId` to mutation logs

**Phase:** Admin auth implementation (Phase 2)

---

### High: Client-Side Only Auth Checks

**What goes wrong:** Auth check in React component but not in Convex function. Attacker calls mutation directly.

**Warning signs:**
- `isAdmin` check only in component
- Convex mutations don't verify auth
- Direct API calls bypass admin UI

**Prevention:**
```typescript
// Every admin mutation must verify
export const deleteApplication = mutation({
  args: { id: v.id("applications"), adminToken: v.string() },
  handler: async (ctx, args) => {
    const isValid = await verifyAdminToken(ctx, args.adminToken);
    if (!isValid) throw new Error("Unauthorized");
    // proceed with deletion
  },
});
```
- Auth check in EVERY admin mutation
- Don't trust client-side state

**Phase:** Admin auth implementation (Phase 2)

**Source:** [Convex Auth Best Practices](https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs)

---

### High: No Rate Limiting on Admin Login

**What goes wrong:** Simple password auth with unlimited attempts. Brute force attacks succeed quickly.

**Warning signs:**
- No failed attempt tracking
- No lockout after failures
- Password is short or common

**Prevention:**
- Track failed attempts per IP/session
- Implement exponential backoff (1s, 2s, 4s, 8s...)
- Lock account after 5 failed attempts for 15 minutes
- Consider CAPTCHA after 3 failures

**Phase:** Admin auth hardening (Phase 2)

---

### Medium: Loading All Applications at Once

**What goes wrong:** Admin dashboard fetches all 5,000 applications on load. Slow initial render, high bandwidth.

**Warning signs:**
- Long loading time on dashboard
- Memory pressure on client
- Single "getAllApplications" query

**Prevention:**
- Implement pagination from day one
- Use `usePaginatedQuery` with reasonable page size (25-50)
- Add filters (status, date) that reduce result set
- Consider server-side search for large datasets

**Phase:** Admin dashboard implementation (Phase 2)

---

### Medium: No Action Confirmation for Destructive Operations

**What goes wrong:** Single click deletes application or changes status with no undo.

**Warning signs:**
- Delete button with no confirmation
- Accidental status changes reported
- No audit log of changes

**Prevention:**
- Confirmation modal for destructive actions
- Soft delete (mark as deleted, don't remove)
- Audit log with timestamps and actor

**Phase:** Admin dashboard UX (Phase 2)

---

### Low: Poor Table Performance with Large Datasets

**What goes wrong:** Rendering 1,000 rows in a table. Browser becomes unresponsive.

**Warning signs:**
- Scroll lag in application list
- High memory usage
- Slow filter/search

**Prevention:**
- Virtual scrolling for large lists (react-virtual, tanstack-virtual)
- Pagination is usually sufficient for admin tools
- Keep rendered row count under 100

**Phase:** Admin dashboard optimization (Phase 2)

---

## Mobile Pitfalls

### Critical: Keyboard Viewport Issues

**What goes wrong:** Mobile keyboard opens, pushes form off screen, or covers submit button. Fixed-position elements float mid-screen.

**Warning signs:**
- Users can't see input they're typing in
- Submit button hidden behind keyboard
- Layout "jumps" when keyboard opens

**Prevention:**
- Use `position: sticky` instead of `position: fixed`
- Implement scroll-into-view on input focus
- Test on actual iOS and Android devices
- Use Visual Viewport API for precise positioning:
```javascript
window.visualViewport.addEventListener('resize', () => {
  // Adjust layout based on keyboard height
});
```

**Phase:** Mobile responsive design (Phase 1)

**Source:** [Vercel Next.js Discussion](https://github.com/vercel/next.js/discussions/63724)

---

### High: Touch Targets Too Small

**What goes wrong:** Buttons and inputs smaller than 44x44 pixels. Users can't tap accurately on mobile.

**Warning signs:**
- Multiple taps needed to select input
- Accidental taps on wrong element
- Font sizes below 16px for inputs

**Prevention:**
- Minimum 44x44px touch targets (Apple HIG guideline)
- Adequate spacing between interactive elements
- Test with thumb, not precise cursor
- Use Tailwind: `min-h-[44px] min-w-[44px]`

**Phase:** Mobile responsive design (Phase 1)

---

### High: Form Input Zoom on iOS

**What goes wrong:** Input fields with font-size below 16px trigger iOS zoom on focus, breaking layout.

**Warning signs:**
- Page zooms when tapping input on iPhone
- User has to pinch-zoom back out
- Layout broken after zoom

**Prevention:**
```css
input, select, textarea {
  font-size: 16px; /* Prevents iOS zoom */
}
```
- Never use font-size below 16px for form inputs
- Tailwind: `text-base` (16px) or larger for inputs

**Phase:** Form styling (Phase 1)

---

### Medium: Tailwind Mobile-First Confusion

**What goes wrong:** Using `sm:` prefix thinking it means "small screens". It actually means "small breakpoint and up".

**Warning signs:**
- Mobile styles applied at wrong breakpoints
- `sm:hidden` hiding things on desktop, not mobile
- Responsive utilities behaving unexpectedly

**Prevention:**
```typescript
// BAD - this hides on tablets and up, shows on mobile
className="sm:hidden"

// GOOD - unprefixed is mobile, prefixed is breakpoint+
className="hidden md:block"  // Hidden on mobile, visible on md+
className="block md:hidden"  // Visible on mobile, hidden on md+
```
- Unprefixed = mobile default
- Prefixed = that breakpoint and larger

**Phase:** Responsive implementation (Phase 1)

**Source:** [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)

---

### Low: 100vh Issues on Mobile Safari

**What goes wrong:** `height: 100vh` doesn't account for Safari's dynamic toolbar. Content is cut off.

**Warning signs:**
- Bottom of form cut off on iPhone Safari
- Submit button partially visible
- Works on desktop, breaks on mobile

**Prevention:**
```css
/* Use dynamic viewport height */
min-height: 100dvh;

/* Or fallback approach */
min-height: 100vh;
min-height: -webkit-fill-available;
```
- Use `dvh` (dynamic viewport height) units
- Test on actual Safari mobile

**Phase:** Layout implementation (Phase 1)

---

## CSV Export Pitfalls

### High: Client-Side Export for Large Datasets

**What goes wrong:** Generating CSV in browser with 10,000 rows. Browser freezes, users think app crashed.

**Warning signs:**
- UI freeze during export
- Export button becomes unresponsive
- Memory errors in console

**Prevention:**
- For >1,000 rows, generate CSV server-side (Convex action)
- Use Web Workers for client-side generation
- Show progress indicator during export
- Consider streaming for very large exports

**Phase:** Export feature (Phase 2)

---

### Medium: react-csv Limitations

**What goes wrong:** react-csv library fails silently with large datasets (2000+ rows can produce empty files).

**Warning signs:**
- Empty CSV file downloads
- No error messages
- Works for small exports, fails for large

**Prevention:**
- Use react-papaparse (better large file support)
- Test export with realistic data volume
- Implement server-side export for production data

**Phase:** Export feature implementation (Phase 2)

**Source:** [react-csv Issue #32](https://github.com/react-csv/react-csv/issues/32)

---

### Low: Special Characters Breaking CSV

**What goes wrong:** User input containing commas, quotes, or newlines breaks CSV structure.

**Warning signs:**
- Excel shows misaligned columns
- Data appears in wrong fields
- Quote characters cause parsing errors

**Prevention:**
- Use proper CSV library (not manual string concatenation)
- Libraries like PapaParse handle escaping automatically
- Test with edge case data: `"Hello, World"`, `Line 1\nLine 2`

**Phase:** Export feature implementation (Phase 2)

---

## Prevention Strategies Summary

### Phase 1: Core Form Implementation

| Pitfall | Prevention Strategy |
|---------|---------------------|
| End-of-form validation | Per-step Zod schemas, validate before progression |
| Lost progress | localStorage persistence, explicit state management |
| Too many fields | Max 5 fields per step, logical grouping |
| Premature validation | Validate on blur or step transition |
| AnimatePresence leaks | Proper cleanup, avoid unmounting mid-animation |
| Layout animations | Use transform/opacity only |
| No reduced motion | Implement `prefers-reduced-motion` |
| Keyboard viewport | Visual Viewport API, scroll-into-view |
| Touch targets | Min 44x44px, adequate spacing |
| iOS zoom | 16px minimum font on inputs |
| Tailwind mobile-first | Unprefixed = mobile, prefixed = breakpoint+ |
| 100vh Safari | Use dvh units |

### Phase 2: Backend & Admin Dashboard

| Pitfall | Prevention Strategy |
|---------|---------------------|
| Unawaited promises | Enable `no-floating-promises` ESLint |
| Public scheduled functions | Use `internal.*` only |
| Missing validators | Require argument validators on all public functions |
| Circular imports | Pure validator files |
| `.filter()` instead of index | Define indexes for common queries |
| Date.now() in queries | Store timestamps in DB |
| Unbounded .collect() | Pagination from day one |
| Shared admin password | Individual credentials, audit logging |
| Client-side only auth | Auth check in every Convex mutation |
| No rate limiting | Track failed attempts, exponential backoff |
| Load all applications | Pagination, filters |
| No confirmation | Confirmation modal, soft delete |
| Client-side large CSV | Server-side generation or Web Workers |

---

## Research Gaps

- **Specific Vercel deployment pitfalls:** Not researched deeply (standard Next.js deployment)
- **Form abandonment recovery:** Could implement auto-save + recovery email, but may be overkill for this use case
- **Advanced Convex patterns:** Did not cover real-time subscriptions, file storage (not needed for this project)

---

## Sources

### Multi-Step Forms
- [Growform UX Best Practices](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/)
- [Smashing Magazine Multi-Step Forms](https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/)
- [Zuko Form UX Tips](https://www.zuko.io/blog/form-ux-design-tips-best-practice-examples)
- [NN/G Error Design Guidelines](https://www.nngroup.com/articles/errors-forms-design-guidelines/)

### Convex
- [Convex Best Practices (Official)](https://docs.convex.dev/understanding/best-practices/)
- [Convex Auth Best Practices](https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs)
- [Convex Pagination](https://docs.convex.dev/database/pagination)
- [Convex Queries That Scale](https://stack.convex.dev/queries-that-scale)

### Animations
- [Framer Motion AnimatePresence Issue](https://github.com/framer/motion/issues/625)
- [Motion Bundle Size](https://motion.dev/docs/react-reduce-bundle-size)
- [W3C WCAG 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [MDN Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries_for_accessibility)

### Mobile
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Visual Viewport API Solution](https://dev.to/franciscomoretti/fix-mobile-keyboard-overlap-with-visualviewport-3a4a)
- [Next.js Viewport Discussion](https://github.com/vercel/next.js/discussions/63724)

### CSV Export
- [react-csv Issues](https://github.com/react-csv/react-csv/issues/32)
- [React PapaParse Guide](https://blog.logrocket.com/working-csv-files-react-papaparse/)
