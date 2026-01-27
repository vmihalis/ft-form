# Project Research Summary

**Project:** Frontier Tower Floor Lead Application System
**Domain:** Typeform-style multi-step form application with admin dashboard
**Researched:** 2026-01-27
**Confidence:** HIGH

## Executive Summary

This project is a floor lead application system for Frontier Tower — a Typeform-style multi-step form that collects proposals from residents who want to lead community initiatives, paired with a password-protected admin dashboard for reviewing submissions. Research indicates that successful implementations in this domain prioritize **per-step validation**, **smooth animations**, and **progressive disclosure** over complex state management or feature bloat.

The recommended approach is to build on Next.js 16 App Router with Convex as the backend, using React Hook Form + Zod for form state management and Framer Motion for transitions. The architecture keeps client-side state during form completion (with localStorage persistence), then submits to Convex on final step. The admin dashboard reads directly from Convex with real-time updates. This separation of concerns — stateful client form, stateless server persistence — is the established pattern for this use case and avoids the most common pitfalls.

Key risks center on three areas: **validation timing** (validating too early frustrates users, too late wastes their time), **mobile keyboard handling** (iOS viewport issues are notorious), and **Convex security** (client-side auth checks without server validation creates vulnerabilities). Each has well-documented mitigation strategies. The research shows this project has high confidence across all domains — stack choices are verified with official docs, features match established patterns, architecture follows proven conventions, and pitfalls are well-documented with clear prevention strategies.

## Key Findings

### Recommended Stack

The stack decisions leverage modern React patterns with minimal dependencies. Next.js 16 provides App Router stability, Turbopack build performance, and React 19 integration for smooth transitions. Convex eliminates backend boilerplate while providing type-safe queries and real-time updates. The form handling layer (React Hook Form + Zod) minimizes re-renders and enables per-step validation with shared schemas between client and server.

**Core technologies:**
- **Next.js 16.1.5**: Full-stack framework with App Router, Turbopack, React 19 integration — verified stable, 10x faster Fast Refresh for development velocity
- **Convex 1.31.6**: Backend-as-a-service with type-safe queries and real-time updates — eliminates API layer boilerplate, auto-generates TypeScript types
- **React Hook Form 7.71.1**: Form state management with uncontrolled approach — minimal re-renders, built-in multi-step support via FormProvider
- **Zod 4.3.6**: Schema validation with TypeScript inference — share validation between client (RHF) and server (Convex), safer than TypeScript-only validation
- **Framer Motion 12.29.2**: Animation library with AnimatePresence — critical for Typeform-style exit animations, worth 32KB bundle for user experience
- **shadcn/ui**: Copy-paste UI components built on Radix primitives — accessibility baked in, Tailwind styling, seamless React Hook Form integration
- **NextAuth.js credentials provider**: Simple password-protected admin — no user database needed, JWT sessions, middleware route protection

### Expected Features

Research from Typeform best practices, Smashing Magazine UX patterns, and competitor analysis (Tally, Fillout) reveals clear table stakes vs differentiators. The key insight: missing any table stakes feature makes the form feel broken, while differentiators elevate perceived quality disproportionately to effort.

**Must have (table stakes):**
- One-question-at-a-time interface — core Typeform pattern, reduces abandonment from 80% to 40-50%
- Progress indicator showing steps completed AND remaining — users need to know how much is left
- Keyboard navigation with Enter to advance — Typeform signature UX, keeps hands on keyboard
- Back/Forward navigation preserving state — users must be able to review and edit previous answers
- Mobile responsiveness with 44x44px touch targets — 50%+ of form fills are mobile
- Inline validation on blur with clear error messages — real-time feedback prevents frustration
- Form submission confirmation with next steps — users need to know it worked
- Admin table view with search, filter, sort — overview of all applications at a glance
- Admin detail view with status management — read full application without leaving dashboard
- Password protection for admin dashboard — prevent unauthorized access
- CSV export for offline analysis — get data into spreadsheets

**Should have (competitive):**
- Smooth transitions between questions with Framer Motion — biggest perceived quality boost for effort (300-500ms fade/slide)
- Estimated completion time shown at start — sets expectations, reduces abandonment
- Contextual animations and microinteractions — button press feedback, field focus states
- Question-specific placeholder examples — shows expected input format/quality
- Custom branding with CSS custom properties — feels like Frontier Tower's form, not generic tool
- Smart focus management — auto-focus next input after validation

**Defer (v2+):**
- Auto-save/draft recovery — high complexity, lower value for short forms (can be added if form grows)
- Conditional logic/branching — only needed if form actually branches based on answers
- Multiple admin user accounts with roles — password protection sufficient for MVP, small team
- PDF export of submissions — CSV sufficient for MVP
- Email notifications on new submission — adds email service dependency
- Analytics dashboards and charts — nice but not essential

### Architecture Approach

The architecture follows Next.js App Router patterns with server/client component separation. Form state lives client-side during completion (React Hook Form + Zustand + localStorage), submits to Convex on final step. Admin dashboard uses server components for initial render, client components for interactive tables. NextAuth.js middleware protects admin routes before requests reach pages.

**Major components:**
1. **Multi-step form (`/apply`)** — Client component with FormProvider wrapping step components, AnimatePresence for transitions, localStorage persistence, validated progression
2. **Form step components** — Self-contained steps (WelcomeStep, ApplicantInfoStep, ProposalStep, RoadmapStep, ImpactStep, LogisticsStep, ReviewStep, ConfirmationStep) with per-step Zod schemas
3. **Convex data layer** — Schema with indexes for status/email/date queries, mutations for submit/updateStatus/addNotes, queries for list/getById with pagination
4. **Admin dashboard** — Protected route with NextAuth.js middleware, server component page fetching initial data, client DataTable with TanStack Table for sorting/filtering/pagination
5. **Admin authentication** — NextAuth.js credentials provider with single password from env, JWT sessions, login page, middleware protecting `/admin/*` except login

### Critical Pitfalls

Research from Convex best practices, form UX guidelines, and animation accessibility standards reveals 5 critical pitfalls that can derail implementation:

1. **End-of-form validation only** — Users complete 5+ steps only to discover errors from step 1. Prevention: validate each step before allowing progression using Zod schema-per-step, show errors immediately at the field level.

2. **No back navigation or lost progress** — Users cannot return to previous steps, or returning wipes data. Prevention: store form state per-step in React state + localStorage, implement explicit back/forward navigation, auto-save after each step completion.

3. **Missing Convex argument validators** — Public mutations accept any arguments, allowing malicious input. Prevention: use `args: { ... }` validators on ALL public functions, enable `@convex-dev/require-argument-validators` ESLint plugin, never trust client-side validation alone.

4. **Client-side only auth checks** — Auth check in React component but not in Convex function; attacker calls mutation directly. Prevention: verify auth in EVERY admin mutation, don't trust client-side state, pass admin token/session to mutations for server-side verification.

5. **Animating layout properties** — Animating width/height/top/left instead of transform causes janky performance. Prevention: use GPU-accelerated properties only (`x`, `y`, `scale`, `rotate`, `opacity`), avoid animating `width`, `height`, `margin`, `padding`.

**Additional high-priority pitfalls:**
- **Mobile keyboard viewport issues** — Fixed-position elements float mid-screen when keyboard opens. Prevention: use Visual Viewport API, scroll-into-view on input focus, test on actual iOS/Android devices.
- **No `prefers-reduced-motion` support** — WCAG 2.3.3 compliance issue, causes dizziness for users with vestibular disorders. Prevention: detect motion preference, disable/reduce animations accordingly.
- **Using `.filter()` instead of `.withIndex()` in Convex** — Full table scan for queries, works with 100 applications, crashes with 10,000. Prevention: define indexes for common query patterns (status, email, submittedAt).

## Implications for Roadmap

Based on research, suggested phase structure follows dependency chains — each phase unlocks the next. The architecture shows form infrastructure must exist before UI, static UI before animations, and admin auth before dashboard.

### Phase 1: Foundation & Data Layer
**Rationale:** Cannot build anything without project setup and data model. TypeScript types from Convex schema inform all component props. This phase establishes the contract between form and database.

**Delivers:**
- Next.js 16 project with App Router and Tailwind CSS
- Convex integration with schema definition
- shadcn/ui installation and configuration
- Basic route structure (`/apply`, `/admin`, `/admin/login`)
- Database schema for applications with indexes
- Core Convex mutations (submit) and queries (list, getById)

**Addresses:**
- Architecture requirement: data layer before UI
- Pitfall: missing Convex validators (define schema upfront with proper types)
- Pitfall: using `.filter()` instead of indexes (define indexes now for common queries)

**Research flag:** SKIP RESEARCH — well-documented setup patterns in official Convex and Next.js docs.

### Phase 2: Form Infrastructure
**Rationale:** Form state management and validation must exist before building step UI. Per-step validation prevents the critical pitfall of end-of-form validation. This phase builds the invisible layer that makes steps work.

**Delivers:**
- React Hook Form setup with FormProvider for multi-step state
- Zod schemas for each step (8 steps total)
- Form state provider with Zustand for step navigation
- localStorage persistence for progress recovery
- Validation logic: validate current step before progression, no validation on back navigation

**Addresses:**
- Table stakes feature: back/forward navigation preserving state
- Critical pitfall: end-of-form validation only
- Critical pitfall: no back navigation or lost progress
- Architecture component: form state management

**Research flag:** SKIP RESEARCH — React Hook Form multi-step pattern is well-documented in official docs and LogRocket tutorial.

### Phase 3: Form UI (Static)
**Rationale:** Build functional step components before adding animations. Verify form flow and validation work correctly with instant transitions, then layer on polish. This avoids debugging animations when the problem is validation logic.

**Delivers:**
- All 8 step components (Welcome, ApplicantInfo, Proposal, Roadmap, Impact, Logistics, Review, Confirmation)
- Navigation buttons (Back/Next/Submit) with disabled states
- Progress indicator showing current step and total steps
- Form inputs using shadcn/ui components
- Review step displaying all collected data
- Submit integration with Convex mutation

**Addresses:**
- Table stakes features: one-question-at-a-time interface, progress indicator, form submission confirmation
- Architecture component: form step components
- Pitfall: too many fields per step (max 5 per step, logical grouping)

**Research flag:** SKIP RESEARCH — UI component patterns are straightforward, shadcn/ui docs sufficient.

### Phase 4: Form Polish & Animations
**Rationale:** Now that form flow works, add Typeform-style animations and UX polish. Framer Motion AnimatePresence provides the smooth transitions that differentiate this from a basic wizard. This is the phase where perceived quality jumps significantly.

**Delivers:**
- Framer Motion integration with AnimatePresence
- Step transition animations (fade + slide, 300ms duration)
- Enter key navigation with keyboard focus management
- Microinteractions (button press, field focus, validation feedback)
- Mobile responsive design with proper touch targets
- Inline validation on blur with immediate error display
- Success animation on form submission (confetti or equivalent)

**Addresses:**
- Table stakes features: keyboard navigation, mobile responsiveness, inline validation
- Should-have features: smooth transitions, microinteractions, smart focus management
- Critical pitfall: animating layout properties (use transform only)
- High pitfall: no `prefers-reduced-motion` support
- High pitfall: mobile keyboard viewport issues
- Medium pitfall: premature validation (validate on blur, not onChange)

**Research flag:** MODERATE RESEARCH — Framer Motion patterns are documented, but mobile keyboard viewport handling is complex. May need focused research on iOS Safari Visual Viewport API during implementation.

### Phase 5: Admin Authentication
**Rationale:** Must establish auth before building protected dashboard features. NextAuth.js setup is straightforward for credentials provider, but security implications require careful implementation.

**Delivers:**
- NextAuth.js setup with credentials provider
- Admin password stored as hashed env variable
- Login page at `/admin/login`
- Middleware protecting all `/admin/*` routes except login
- Session management with JWT
- Logout functionality

**Addresses:**
- Table stakes feature: password protection for admin dashboard
- Critical pitfall: client-side only auth checks (implement server-side verification)
- High pitfall: shared password for all admins (document individual credential pattern)
- High pitfall: no rate limiting on login (implement attempt tracking)

**Research flag:** MODERATE RESEARCH — NextAuth.js credentials pattern is documented, but rate limiting implementation and proper hashing may need focused research.

### Phase 6: Admin Dashboard
**Rationale:** With auth in place, build the admin interface. This phase is independent of form implementation — dashboard reads from same Convex database. Pagination and filtering are critical from day one to avoid performance issues.

**Delivers:**
- Applications table with TanStack Table (sortable columns, pagination)
- Real-time updates using Convex `useQuery` hook
- Search by name, email, proposal title
- Filter by status (pending, under_review, approved, rejected)
- Status management with dropdown and optimistic UI
- Application detail view (modal or slide-out panel)
- Dashboard stats (total applications, pending count)
- CSV export functionality

**Addresses:**
- Table stakes features: table view, detail view, search, filter, sort, status management, CSV export
- Should-have feature: dashboard stats showing submission counts
- Medium pitfall: loading all applications at once (implement pagination from start)
- Medium pitfall: no action confirmation (add confirmation dialog for status changes)
- High pitfall: client-side CSV export for large datasets (use Convex action if >1000 rows)

**Research flag:** SKIP RESEARCH — TanStack Table patterns are well-documented, shadcn/ui data table component provides template.

### Phase 7: Mobile Optimization & Deployment
**Rationale:** Final phase ensures mobile experience matches desktop quality and deploys to production. Mobile-specific issues are tested and resolved before launch.

**Delivers:**
- Mobile testing on actual iOS and Android devices
- Fix iOS input zoom issues (16px minimum font size)
- Handle Safari 100vh issues (use dvh units)
- Optimize touch targets (minimum 44x44px)
- Test keyboard viewport behavior and adjust
- Vercel deployment configuration
- Environment variable setup for production
- Error monitoring integration
- Performance optimization (bundle analysis, code splitting)

**Addresses:**
- Table stakes feature: mobile responsiveness (verified on real devices)
- Critical pitfall: mobile keyboard viewport issues (tested and fixed)
- High pitfall: touch targets too small (verified)
- High pitfall: form input zoom on iOS (prevented)
- Low pitfall: 100vh issues on mobile Safari (fixed)

**Research flag:** MODERATE RESEARCH — Mobile viewport issues are device-specific. May need focused research on specific iOS Safari bugs encountered during testing.

### Phase Ordering Rationale

1. **Foundation first** — Cannot build anything without project setup, Convex schema defines data contract for all components
2. **Form infrastructure before UI** — Validation and state management must exist before step components, avoids rework
3. **Static UI before animations** — Verify functionality works with instant transitions, then layer polish, easier debugging
4. **Admin auth before dashboard** — Cannot build protected features without auth layer, security cannot be retrofitted
5. **Dashboard after form** — Independent track, can be built in parallel with form polish if needed, depends only on data layer + auth
6. **Mobile optimization last** — Requires working form to test properly, device-specific fixes easier once core flow is stable

**Dependency graph shows:**
- Foundation → Data Layer → Form Infrastructure → Form UI → Animations (sequential)
- Foundation → Data Layer → Auth → Dashboard (parallel to form after data layer)
- Mobile optimization depends on both form and dashboard being complete

**Pitfall avoidance through phase ordering:**
- Phase 1 defines indexes (prevents `.filter()` pitfall in Phase 6)
- Phase 2 implements per-step validation (prevents end-of-form validation pitfall)
- Phase 3 limits fields per step (prevents overwhelm pitfall)
- Phase 4 uses transform-only animations (prevents jank pitfall)
- Phase 5 implements server-side auth (prevents client-side only auth pitfall)
- Phase 6 implements pagination from start (prevents load-all pitfall)

### Research Flags

**Phases needing focused research during planning:**

- **Phase 4 (Animations + Mobile):** Mobile keyboard viewport handling on iOS Safari is complex. Visual Viewport API solutions need validation with target iOS versions. Consider `/gsd:research-phase` focused on "iOS Safari keyboard behavior with fixed elements."

- **Phase 5 (Admin Auth):** Rate limiting implementation and secure password hashing patterns need verification. NextAuth.js credentials provider is simple but security hardening requires careful research. Consider `/gsd:research-phase` focused on "NextAuth.js credentials security best practices."

- **Phase 7 (Deployment):** Vercel deployment with Convex requires environment variable coordination. Error monitoring integration needs tool selection. Consider focused research on "Convex + Next.js + Vercel production setup."

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Foundation):** Next.js App Router + Convex setup follows official quickstart docs exactly. No surprises expected.
- **Phase 2 (Form Infrastructure):** React Hook Form multi-step pattern is well-documented with multiple tutorials showing same approach.
- **Phase 3 (Form UI):** Standard React component patterns with shadcn/ui. No novel patterns needed.
- **Phase 6 (Admin Dashboard):** TanStack Table with shadcn/ui has established template. Convex pagination follows official docs.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry, official release blogs, and documentation. Next.js 16 features confirmed in release blog, Convex patterns verified in official docs. |
| Features | HIGH | Table stakes vs differentiators based on Smashing Magazine UX research, Typeform best practices, and competitor analysis (Tally, Fillout comparison). Clear consensus across sources. |
| Architecture | HIGH | Patterns verified against official Convex App Router docs, React Hook Form advanced usage guide, and shadcn/ui data table examples. Build order follows proven dependency chains. |
| Pitfalls | HIGH | Critical pitfalls sourced from Convex official best practices, W3C WCAG accessibility guidelines, and documented GitHub issues. Prevention strategies tested in production systems. |

**Overall confidence:** HIGH

All research areas have high confidence based on official documentation and authoritative sources. The stack choices are current and stable (not bleeding-edge), feature patterns match established UX guidelines, architecture follows framework conventions, and pitfalls have documented solutions.

### Gaps to Address

**Minor gaps that may need validation during implementation:**

- **Form length decision:** Research shows Typeform uses 1 question per screen for maximum conversion, but Frontier Tower form has 6 logical sections. Need to decide: break into 1 field per step (better UX, more steps) or 3-5 fields per step (fewer steps, slightly worse UX). Defer to Phase 3 based on actual questions list.

- **Auto-save necessity:** Research shows auto-save reduces abandonment for long forms, but adds localStorage complexity. Decision depends on form length (time to complete). If form is <5 minutes, defer to v2. If >5 minutes, implement in Phase 2. Test with realistic data entry during Phase 3.

- **Admin credential model:** Simple password vs individual accounts trade-off. Research recommends individual accounts for audit trail, but MVP may not need it. Decision point: Phase 5. If team is 1-2 people, shared password acceptable. If 3+, implement individual credentials.

- **CSV export scale:** Client-side generation works for <1000 rows, server-side needed for larger. Decision depends on expected submission volume. Phase 6 can implement client-side first, switch to Convex action if performance issues emerge.

**No critical gaps identified.** All core technical decisions have clear answers from research. Remaining decisions are product/UX choices that should be made during requirements definition (next step after research).

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) — verified Next.js 16 features, Turbopack, React 19 integration
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/) — pitfall prevention strategies, query patterns
- [Convex Next.js App Router Integration](https://docs.convex.dev/client/nextjs/app-router/) — architecture patterns
- [Convex Schema Documentation](https://docs.convex.dev/database/schemas) — data modeling best practices
- [React Hook Form Advanced Usage](https://react-hook-form.com/advanced-usage) — multi-step form patterns
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table) — admin dashboard component
- [W3C WCAG 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) — reduced motion requirements
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design) — mobile-first approach

**Verified Tutorials:**
- [LogRocket: Multi-Step Form with RHF + Zod](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/) — implementation pattern
- [Build UI: Framer Motion Wizard](https://buildui.com/courses/framer-motion-recipes/multistep-wizard) — animation patterns

### Secondary (MEDIUM confidence)

**UX Research:**
- [Smashing Magazine: Creating Effective Multistep Forms](https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/) — form UX patterns
- [FormAssembly: Multi-Step Form Best Practices](https://www.formassembly.com/blog/multi-step-form-best-practices/) — conversion optimization
- [Typeform: Mobile Form Design Best Practices](https://www.typeform.com/blog/mobile-form-design-best-practices) — mobile patterns
- [NN/g: Error Design Guidelines](https://www.nngroup.com/articles/errors-forms-design-guidelines/) — validation UX

**Comparisons & Analysis:**
- [WorkOS: Radix vs shadcn/ui](https://workos.com/blog/what-is-the-difference-between-radix-and-shadcn-ui) — UI library decision
- [Motion Blog: Framer Motion vs Motion One](https://motion.dev/blog/should-i-use-framer-motion-or-motion-one) — animation library choice
- [Tally: Typeform Alternatives Comparison](https://tally.so/help/best-alternatives-to-typeform-comparison-2025) — competitor analysis

**Community Patterns:**
- [Convex: Zod Validation Wrappers](https://stack.convex.dev/wrappers-as-middleware-zod-validation) — validation patterns
- [Convex: Authentication Best Practices](https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs) — security patterns

### Tertiary (LOW confidence, needs validation)

- [Visual Viewport API for Keyboard](https://dev.to/franciscomoretti/fix-mobile-keyboard-overlap-with-visualviewport-3a4a) — iOS keyboard fix (community post, needs testing)
- [react-csv Issue #32](https://github.com/react-csv/react-csv/issues/32) — CSV export limitation (reported issue, needs verification with current version)

---
*Research completed: 2026-01-27*
*Ready for roadmap: yes*
