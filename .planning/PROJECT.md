# Frontier Tower Floor Lead Application System

## What This Is

A web application for Frontier Tower to collect and manage proposals from people who want to lead community initiatives on different floors. Features a Typeform-style public application form with smooth animations and a password-protected admin dashboard for the FT team to review and manage submissions.

## Core Value

**Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.**

If everything else fails, the form must collect complete proposals and store them reliably for admin review.

## Current Milestone: v1.1 Admin Inline Editing

**Goal:** Enable admins to edit any field of a submitted application directly from the detail view, with full edit history tracking.

**Target features:**
- Inline editing for all form fields (click to edit in detail panel)
- Edit history tracking (what changed, when, who edited)
- Clean inline editing UX (save on blur/Enter, cancel on Escape)

## Requirements

### Validated

- ✓ **FOUND-01 to FOUND-05** — v1.0: Next.js 16, Convex backend, shadcn/ui, route structure, database schema
- ✓ **FORM-01 to FORM-08** — v1.0: All 8 form steps (Welcome, Applicant Info, Proposal, Roadmap, Impact, Logistics, Review, Confirmation)
- ✓ **UX-01 to UX-10** — v1.0: Typeform-style flow, progress indicator, animations, validation, back navigation, localStorage persistence, floor dropdown with Other
- ✓ **AUTH-01 to AUTH-05** — v1.0: Password login, env var password, middleware protection, JWT sessions, logout
- ✓ **ADMIN-01 to ADMIN-06** — v1.0: Table view, detail panel, status management, floor filter, search, real-time updates
- ✓ **BRAND-01 to BRAND-05** — v1.0: Brand colors, FT logo, modern aesthetic, mobile responsive, consistent design
- ✓ **DEPLOY-01 to DEPLOY-03** — v1.0: Vercel deployment, production env vars, mobile testing

### Active

- [ ] **EDIT-01**: Admin can click any field in detail view to edit inline
- [ ] **EDIT-02**: All form fields are editable (name, email, floor, proposal, roadmap, impact, logistics)
- [ ] **EDIT-03**: Edit history tracked (field, old value, new value, timestamp)
- [ ] **EDIT-04**: Inline editing UX (save on blur/Enter, cancel on Escape)
- [ ] **EDIT-05**: Edit history viewable in detail panel

### Future (v1.2+)

- **UX-V2-01**: Keyboard navigation (Enter to advance, arrow keys)
- **UX-V2-02**: Estimated completion time shown at start
- **UX-V2-03**: Microinteractions and button press feedback
- **UX-V2-04**: Success animation on form submission
- **ADMIN-V2-01**: CSV export of all submissions
- **ADMIN-V2-02**: Dashboard stats (total applications, pending count)
- **ADMIN-V2-03**: Admin notes on submissions
- **ADMIN-V2-04**: Individual admin accounts with audit trail
- **ADMIN-V2-05**: Email notifications on new submissions

### Out of Scope

- Application editing after submission — applicants submit once, keeps data clean
- Public application status tracking — applicants wait for direct contact from FT team
- Conditional form branching — all floors use same form structure
- Rich text editing in form fields — plain text is sufficient
- PDF export — CSV covers analytics needs
- Multi-language support — English only for v1
- Applicant accounts/login — anonymous submissions, contact via email

## Context

**Current State (v1.0 shipped 2026-01-28):**
- Production URL: https://ft-form.vercel.app
- Convex backend: https://usable-bobcat-946.convex.cloud
- 4,204 lines TypeScript
- Tech stack: Next.js 16, Tailwind CSS 4, Convex, shadcn/ui, Framer Motion, jose (JWT)

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

---
*Last updated: 2026-01-28 after v1.1 milestone started*
