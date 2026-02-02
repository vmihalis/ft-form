# FrontierOS — Frontier Tower Management Platform

## What This Is

A premium command center for managing Frontier Tower — the 16-story "vertical village" at 995 Market St, San Francisco. FrontierOS is the central dashboard where the FT team oversees all building operations: forms/applications, member management, events, space booking, and communications. Features a glassmorphism design system with translucent panels and layered depth, a dashboard hub with module cards, and light/dark mode toggle.

## Core Value

**The FT team can efficiently manage all aspects of Frontier Tower from a single, premium dashboard that feels as cutting-edge as the building itself.**

If everything else fails, the dashboard must provide clear navigation to each management module and feel polished.

## Current State

**Latest Release:** v2.0 FrontierOS Dashboard (shipped 2026-01-29)

FrontierOS is now a premium command center with:
- **Glassmorphism design system** — Light/dark mode, theme toggle, glass utilities (backdrop-blur, translucent panels), CSS variable tokens
- **Dashboard hub** — Module cards landing (Forms + 4 placeholders), collapsible sidebar (240px/64px), mobile hamburger menu
- **WYSIWYG form builder** — Live preview editing, floating toolbar, plus buttons for insertion, drag-and-drop reorder
- **Redesigned forms/submissions** — Glass card styling, submission counts, quick actions, animated transitions
- **Premium UX** — Microinteractions (200ms), EmptyState/ErrorState components, loading states throughout

**Production URL:** https://ft-form.vercel.app
**Convex backend:** https://usable-bobcat-946.convex.cloud
**Total codebase:** ~681,000 lines TypeScript (including dependencies)

## Requirements

### Validated

- ✓ **FOUND-01 to FOUND-05** — v1.0: Next.js 16, Convex backend, shadcn/ui, route structure, database schema
- ✓ **FORM-01 to FORM-08** — v1.0: All 8 form steps (Welcome, Applicant Info, Proposal, Roadmap, Impact, Logistics, Review, Confirmation)
- ✓ **UX-01 to UX-10** — v1.0: Typeform-style flow, progress indicator, animations, validation, back navigation, localStorage persistence, floor dropdown with Other
- ✓ **AUTH-01 to AUTH-05** — v1.0: Password login, env var password, middleware protection, JWT sessions, logout
- ✓ **ADMIN-01 to ADMIN-06** — v1.0: Table view, detail panel, status management, floor filter, search, real-time updates
- ✓ **BRAND-01 to BRAND-05** — v1.0: Brand colors, FT logo, modern aesthetic, mobile responsive, consistent design
- ✓ **DEPLOY-01 to DEPLOY-03** — v1.0: Vercel deployment, production env vars, mobile testing
- ✓ **EDIT-01 to EDIT-06** — v1.1: Inline editing for all 19 fields with validation, visual states, pencil icon
- ✓ **HIST-01 to HIST-04** — v1.1: Edit history tracking with collapsible timeline, human-readable labels
- ✓ **SCHEMA-01 to SCHEMA-05** — v1.2: Forms stored with unique slugs, immutable version snapshots, submissions reference version, JSON storage, legacy coexistence
- ✓ **FIELD-01 to FIELD-08** — v1.2: Text, textarea, email, dropdown, number, date, checkbox, file upload field types
- ✓ **BUILD-01 to BUILD-08** — v1.2: Form creation, field adding, drag-and-drop reorder, property config, field removal, real-time preview, status lifecycle, immutable versions
- ✓ **PUBLIC-01 to PUBLIC-06** — v1.2: Unique URLs, dynamic rendering, Typeform-style UX, field validation, immediate file uploads, formVersionId submission
- ✓ **ADMIN-01 to ADMIN-05** — v1.2: Forms tab, submission filtering by form, form duplication, schema-driven detail panel, dynamic edit history labels
- ✓ **MIGRATE-01 to MIGRATE-03** — v1.3: Legacy /apply migrated to dynamic form, all legacy code deleted
- ✓ **EXPORT-01 to EXPORT-02** — v1.3: CSV export with status and date range filtering
- ✓ **STATS-01 to STATS-02** — v1.3: Dashboard stats cards and activity feed
- ✓ **NOTES-01** — v1.3: Internal notes on submissions
- ✓ **DS-01 to DS-07** — v2.0: Theme toggle, localStorage persistence, glass utilities, CSS variables, glassmorphism floating elements, microinteractions, documented tokens
- ✓ **NAV-01 to NAV-08** — v2.0: Dashboard hub landing, module cards, navigation, collapsible sidebar, collapse persistence, responsive mobile
- ✓ **BUILD-01 to BUILD-09** — v2.0: WYSIWYG form builder, floating toolbar, plus buttons, field type picker, inline editing, drag-and-drop, all field types, validation feedback, no preview mode
- ✓ **FORM-01 to FORM-04** — v2.0: Glassmorphism forms list, status/count/updated, quick actions, animated transitions
- ✓ **SUB-01 to SUB-04** — v2.0: Glassmorphism submissions table, glass detail panel, information density, animated transitions
- ✓ **PLACE-01 to PLACE-05** — v2.0: Members, Events, Spaces/Booking, Wellness placeholders with Coming Soon state
- ✓ **UX-01 to UX-06** — v2.0: 2-click access, no redundancy, visual hierarchy, loading states, empty states, error states

### Active

*No active requirements — ready for next milestone planning*

### Future (v2.1+)

- **CMD-01**: Cmd+K opens command palette for quick navigation
- **CMD-02**: Search across forms, submissions, and actions
- **CMD-03**: Keyboard shortcuts for common actions
- **BG-01**: NeuralBackground enabled on admin routes with reduced animation
- **BG-02**: Glass panels blur background for depth effect
- **MEM-01**: Full member management functionality (TBD after stakeholder meeting)
- **EVT-01**: Full event management functionality (TBD after stakeholder meeting)
- **SPC-01**: Full space booking functionality (TBD after stakeholder meeting)
- **COM-01**: Full communications functionality (TBD after stakeholder meeting)
- **COND-01**: Conditional logic — show/hide fields based on other field values
- **COND-02**: Field branching — skip to different steps based on answers
- **MULTI-01**: Multi-column field layouts
- **TEMPL-01**: Field templates library for common field patterns
- **COLLAB-01**: Collaborative form editing with conflict resolution
- **ANAL-01**: Form analytics (completion rates, drop-off points)
- **UX-V2-01**: Keyboard navigation (Enter to advance, arrow keys)
- **UX-V2-02**: Estimated completion time shown at start
- **UX-V2-04**: Success animation on form submission
- **ADMIN-V2-04**: Individual admin accounts with audit trail
- **ADMIN-V2-05**: Email notifications on new submissions

### Out of Scope

- Application editing after submission — applicants submit once, keeps data clean
- Public application status tracking — applicants wait for direct contact from FT team
- Rich text editing in form fields — plain text is sufficient
- PDF export — CSV covers analytics needs
- Multi-language support — English only for v1
- Applicant accounts/login — anonymous submissions, contact via email

## Context

**Tech Stack:**
- Next.js 16 with App Router
- Tailwind CSS 4
- Convex (real-time database)
- shadcn/ui + Radix primitives
- Framer Motion (animations)
- jose (JWT sessions)
- TanStack Table (admin tables)
- dnd-kit (drag-and-drop)
- react-dropzone (file uploads)
- Zod (validation)
- Zustand (form state)

**About Frontier Tower:**
- 16-story "vertical village" at 995 Market St, San Francisco
- Each floor is dedicated to a different frontier tech domain
- Community-led model: floor leads propose and run initiatives on their floor
- Current floors include: AI & Autonomous Systems, Robotics & Hard Tech, Neuro & Biotech, Health & Longevity, Ethereum & Decentralized Tech, Fitness, Arts & Music, and more

**Floor Options (11 total):**
1. AI & Autonomous Systems
2. Robotics & Hard Tech
3. Neuro & Biotech
4. Health & Longevity
5. Ethereum & Decentralized Tech
6. Fitness
7. Arts & Music
8. Accelerator
9. Energy & Climate Tech
10. Space & Defense Tech
11. Other (with text field)

**Target Users:**
- Public form: Entrepreneurs, community builders, and domain experts who want to lead a floor initiative
- Admin dashboard: Small Frontier Tower team (1-3 people) reviewing applications

## Constraints

- **Tech stack**: Next.js + Tailwind CSS + Convex — specified by user
- **Hosting**: Vercel deployment
- **Auth**: Single shared password via environment variable (ADMIN_PASSWORD)
- **Brand**: Must use exact colors (#7b42e7, white) and provided logo
- **Design**: Typeform-style UX — one question/section at a time, full-screen focused, smooth transitions, progress indicator. Minimal, modern, premium aesthetic.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Typeform-style UX | Original request; one-question-at-a-time reduces cognitive load, feels premium | ✓ Good |
| Next.js over Vite | Seamless Vercel deployment, good Convex support, clean route structure for /admin | ✓ Good |
| Single password auth | Small team (1-3), no need for individual accounts or audit trail | ✓ Good |
| Convex for database | User requirement, good DX, real-time sync | ✓ Good |
| All FT floors in dropdown | Aligns with actual Frontier Tower floor structure | ✓ Good |
| No email notifications | User preference, admins check dashboard manually | ✓ Good |
| jose for JWT sessions | Official Next.js docs recommend, Edge-compatible, zero deps | ✓ Good |
| Framer Motion animations | Smooth Typeform-style transitions, respects prefers-reduced-motion | ✓ Good |
| TanStack Table for admin | Headless state management, pairs with shadcn, sorting/filtering built-in | ✓ Good |
| Defense-in-depth auth | Both middleware AND page verify session | ✓ Good |
| localStorage for drafts | Resume capability without user accounts | ✓ Good |
| Single EditableField component | One component handles all field types via type prop, reduces duplication | ✓ Good |
| String storage for edit history | All values stored as strings for simplicity, avoids polymorphic storage | ✓ Good |
| No-op detection | Skip history creation when value unchanged, prevents clutter | ✓ Good |
| Collapsible starts collapsed | Keeps detail panel clean, history expandable on demand | ✓ Good |
| JSON string for form schemas | Avoids Convex 16-level nesting limit, flexible structure | ✓ Good |
| Immutable form versions | Submissions always reference exact schema they were submitted against | ✓ Good |
| Separate submissions table | Dynamic forms use new table, legacy applications untouched | ✓ Good |
| Reserved slugs list | Prevents form URLs from conflicting with app routes | ✓ Good |
| Immediate file persistence | Files upload on selection, not form submit (avoids URL expiration) | ✓ Good |
| XMLHttpRequest for uploads | Provides progress tracking (fetch lacks onprogress) | ✓ Good |
| dnd-kit for drag-and-drop | Modern React DnD library, works well with Zustand state | ✓ Good |
| Zod v4 for validation | Dynamic schema generation from form config, good error messages | ✓ Good |
| Draft locking via versionId | Detects form schema changes, resets draft when outdated | ✓ Good |
| Schema-driven admin panel | Submission display adapts to form schema instead of hardcoded fields | ✓ Good |
| Stored fieldLabel in history | Edit history captures label at edit time, immune to schema changes | ✓ Good |
| Glassmorphism design system | Premium aesthetic matching Frontier Tower's cutting-edge identity | ✓ Good |
| Dashboard hub navigation | Module cards expand/navigate, replaces tab-based nav | ✓ Good |
| Light/dark mode toggle | User choice over system preference for control | ✓ Good |
| next-themes with attribute="class" | Tailwind CSS dark mode compatibility | ✓ Good |
| Glass CSS variables pattern | Theme-aware components use var(--glass-*) tokens | ✓ Good |
| Manual localStorage sync for sidebar | Simpler than zustand persist middleware, explicit control | ✓ Good |
| WYSIWYG builder (no preview mode) | Builder IS preview, reduces complexity (BUILD-09) | ✓ Good |
| AnimatedPage client component | Enables animation while preserving server auth | ✓ Good |
| Semi-transparent loading overlay | bg-background/50 maintains visibility during operations | ✓ Good |

---
*Last updated: 2026-02-02 after v2.0 milestone completion*
