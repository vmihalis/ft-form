# Frontier Tower Floor Lead Application System

## What This Is

A web application for Frontier Tower to collect and manage proposals from people who want to lead community initiatives on different floors. It has two parts: a public application form for prospective floor leads, and a password-protected admin dashboard for the Frontier Tower team to review and manage submissions.

## Core Value

**Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.**

If everything else fails, the form must collect complete proposals and store them reliably for admin review.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Public Application Form:**
- [ ] Welcome/hero screen with FT logo, headline, and CTA to begin
- [ ] Typeform-style multi-step flow (one section per screen)
- [ ] Applicant info section (name, email, LinkedIn, role, bio)
- [ ] Proposal section (floor, initiative name, tagline, values, target community, estimated size)
- [ ] Roadmap section (Phase 1 MVP, Phase 2 expansion, Phase 3 long-term)
- [ ] Impact section (benefit to FT members)
- [ ] Logistics section (existing community, space needs, start date, additional notes)
- [ ] Floor dropdown with all Frontier Tower floors + Other option
- [ ] Progress indicator showing current step
- [ ] Smooth transitions between steps
- [ ] Keyboard navigation (Enter to continue, arrow keys)
- [ ] Form validation with inline error messages
- [ ] Review screen before final submission
- [ ] Submission confirmation screen
- [ ] Mobile responsive design

**Admin Dashboard:**
- [ ] Password-protected login (single shared password)
- [ ] Table view of all submissions
- [ ] Click row to view full submission details
- [ ] Filter submissions by floor
- [ ] Search by name or initiative name
- [ ] Status management (New, Under Review, Accepted, Rejected)
- [ ] Export all submissions to CSV
- [ ] Mobile responsive design

**Design & Branding:**
- [ ] Brand colors: #7b42e7 (purple) and white
- [ ] FT logo integrated
- [ ] Minimal, modern, premium aesthetic
- [ ] Consistent design language across form and admin

### Out of Scope

- Email notifications — admin checks dashboard manually
- Multi-user admin auth — single shared password is sufficient for small team
- Application editing after submission — applicants submit once
- Public application status tracking — applicants wait for direct contact
- Rich text editing in form fields — plain text is fine

## Context

**About Frontier Tower:**
- 16-story "vertical village" at 995 Market St, San Francisco
- Each floor is dedicated to a different frontier tech domain
- Community-led model: floor leads propose and run initiatives on their floor
- Current floors include: AI & Autonomous Systems, Robotics & Hard Tech, Neuro & Biotech, Health & Longevity, Ethereum & Decentralized Tech, Fitness, Arts & Music, and more
- Examples: Ultimate Fighting Bots founders lead the Robotics floor, Muse Bio on the Biotech floor

**Floor Options for Dropdown:**
1. AI & Autonomous Systems
2. Robotics & Hard Tech
3. Neuro & Biotech
4. Health & Longevity
5. Ethereum & Decentralized Tech
6. Fitness
7. Arts & Music
8. Accelerator
9. Other (with text field)

**Target Users:**
- Public form: Entrepreneurs, community builders, and domain experts who want to lead a floor initiative
- Admin dashboard: Small Frontier Tower team (1-3 people) reviewing applications

## Constraints

- **Tech stack**: Next.js + Tailwind CSS + Convex — specified by user
- **Hosting**: Vercel deployment
- **Auth**: Single shared password via environment variable (ADMIN_PASSWORD)
- **Brand**: Must use exact colors (#7b42e7, white) and provided logo
- **Design**: Typeform-style UX — one question/section at a time, full-screen focused, smooth transitions, progress indicator, keyboard navigation friendly. Minimal, modern, premium aesthetic.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Typeform-style UX | Original request mentioned Typeform; one-question-at-a-time reduces cognitive load, feels premium | — Pending |
| Next.js over Vite | Seamless Vercel deployment, good Convex support, clean route structure for /admin | — Pending |
| Single password auth | Small team (1-3), no need for individual accounts or audit trail | — Pending |
| Convex for database | User requirement, good DX, real-time sync | — Pending |
| All FT floors in dropdown | Aligns with actual Frontier Tower floor structure | — Pending |
| No email notifications | User preference, admins check dashboard manually | — Pending |

---
*Last updated: 2026-01-27 after initialization*
