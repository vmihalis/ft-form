# Frontier Tower Floor Lead Application System

## What This Is

A web application for Frontier Tower to collect and manage proposals from people who want to lead community initiatives on different floors. Features a Typeform-style public application form with smooth animations, a drag-and-drop form builder for admins to create custom forms, and a password-protected admin dashboard for the FT team to review and manage submissions.

## Core Value

**Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.**

If everything else fails, the form must collect complete proposals and store them reliably for admin review.

## Current Milestone: v1.3 Unification & Admin Productivity

**Goal:** Unify the legacy applications system with the dynamic submissions system, and add admin productivity features.

**Target features:**
- Migrate legacy /apply form to dynamic form system (create matching form, no data migration)
- Delete legacy applications table and code
- CSV export for submissions with filtering
- Dashboard stats and activity feed
- Admin notes on submissions (internal comments)

## Current State

**Latest Release:** v1.2 Dynamic Form Builder (shipped 2026-01-29)

Admins can now create custom application forms with a drag-and-drop builder. Forms support 8 field types (text, textarea, email, dropdown, number, date, checkbox, file upload), each with configurable validation. Published forms get unique URLs (/apply/[slug]) and use immutable versioning to preserve form structure at submission time. The admin panel dynamically renders submissions based on each form's schema.

**Production URL:** https://ft-form.vercel.app
**Convex backend:** https://usable-bobcat-946.convex.cloud
**Total codebase:** ~11,900 lines TypeScript

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

### Active

- [ ] **MIGRATE-01**: Create dynamic form matching original 19-field application structure
- [ ] **MIGRATE-02**: Update /apply route to use dynamic form system
- [ ] **MIGRATE-03**: Delete legacy applications table, mutations, queries, and components
- [ ] **EXPORT-01**: CSV export button to download all submissions for a form
- [ ] **EXPORT-02**: Filter submissions before export (by status, date range)
- [ ] **STATS-01**: Stats cards showing total submissions and counts by status
- [ ] **STATS-02**: Activity feed showing recent submissions and status changes
- [ ] **NOTES-01**: Admin notes on submissions (internal comments, not visible to applicants)

### Future (v1.4+)

- **COND-01**: Conditional logic — show/hide fields based on other field values
- **COND-02**: Field branching — skip to different steps based on answers
- **MULTI-01**: Multi-column field layouts
- **TEMPL-01**: Field templates library for common field patterns
- **COLLAB-01**: Collaborative form editing with conflict resolution
- **ANAL-01**: Form analytics (completion rates, drop-off points)
- **UX-V2-01**: Keyboard navigation (Enter to advance, arrow keys)
- **UX-V2-02**: Estimated completion time shown at start
- **UX-V2-03**: Microinteractions and button press feedback
- **UX-V2-04**: Success animation on form submission
- **ADMIN-V2-04**: Individual admin accounts with audit trail
- **ADMIN-V2-05**: Email notifications on new submissions

### Out of Scope

- Application editing after submission — applicants submit once, keeps data clean
- Public application status tracking — applicants wait for direct contact from FT team
- Conditional form branching — explicitly deferred to v1.3+
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

---
*Last updated: 2026-01-29 after v1.3 milestone started*
