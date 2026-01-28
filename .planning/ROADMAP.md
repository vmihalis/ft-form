# Roadmap: Frontier Tower Floor Lead Application System

## Overview

This roadmap delivers a Typeform-style floor lead application system for Frontier Tower in 7 phases. We build foundation and data layer first (Phase 1), then form infrastructure for state management (Phase 2), followed by form UI components (Phase 3), and animation polish (Phase 4). Admin authentication (Phase 5) unlocks the admin dashboard (Phase 6). Mobile optimization and deployment (Phase 7) completes the system. Each phase delivers a coherent, verifiable capability that unlocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & Data Layer** - Project setup with Next.js, Convex, and database schema
- [x] **Phase 2: Form Infrastructure** - Multi-step form state management and validation framework
- [x] **Phase 3: Form UI (Static)** - All form step components with functional navigation
- [x] **Phase 4: Form Polish & Animations** - Framer Motion transitions and UX refinements
- [x] **Phase 5: Admin Authentication** - Password-protected login with session management
- [x] **Phase 6: Admin Dashboard** - Submission management interface with filtering and search
- [ ] **Phase 7: Mobile Optimization & Deployment** - Mobile testing and Vercel production deployment

## Phase Details

### Phase 1: Foundation & Data Layer
**Goal**: Establish the technical foundation with working project scaffolding and database schema
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` starts the Next.js development server without errors
  2. Navigating to /apply, /admin, and /admin/login shows placeholder pages
  3. Convex dashboard shows the applications table with defined schema
  4. shadcn/ui Button component renders correctly on a test page
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md - Scaffold Next.js 16 project with Convex backend and applications schema
- [x] 01-02-PLAN.md - Initialize shadcn/ui and create placeholder routes

### Phase 2: Form Infrastructure
**Goal**: Build the invisible layer that makes multi-step form navigation and validation work
**Depends on**: Phase 1
**Requirements**: UX-01, UX-02, UX-04, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. Form state persists when navigating back and forward between steps
  2. User cannot advance to next step until current step validates successfully
  3. Refreshing the browser restores form progress from localStorage
  4. Progress indicator shows correct step number out of total steps
  5. Back navigation works without triggering validation
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md - Install packages, create Zod schemas and Zustand store
- [x] 02-02-PLAN.md - Create MultiStepForm container with navigation and progress indicator

### Phase 3: Form UI (Static)
**Goal**: Complete all form step components with functional data collection and submission
**Depends on**: Phase 2
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08, UX-07, UX-08, UX-09, UX-10, BRAND-02
**Success Criteria** (what must be TRUE):
  1. User can complete entire form flow from welcome screen to confirmation
  2. Floor dropdown shows all Frontier Tower floors with "Other" option that reveals text field
  3. Review step displays all entered data accurately before submission
  4. Submitting form creates a new record visible in Convex dashboard
  5. Confirmation screen appears with thank you message after successful submission
**Plans**: 5 plans

Plans:
- [x] 03-01-PLAN.md - Install shadcn/ui form components and create floors constant
- [x] 03-02-PLAN.md - Create Welcome, ApplicantInfo, and Proposal step components
- [x] 03-03-PLAN.md - Create Roadmap, Impact, and Logistics step components
- [x] 03-04-PLAN.md - Create Review, Confirmation steps and Convex submit mutation
- [x] 03-05-PLAN.md - Update StepContent router and verify complete form flow

### Phase 4: Form Polish & Animations
**Goal**: Add Typeform-style animations and visual polish that elevate perceived quality
**Depends on**: Phase 3
**Requirements**: UX-03, BRAND-01, BRAND-03, BRAND-05
**Success Criteria** (what must be TRUE):
  1. Step transitions animate smoothly with fade and slide effects
  2. Form uses brand colors (#7b42e7 purple and white) throughout
  3. Users with prefers-reduced-motion see instant transitions instead of animations
  4. Visual design feels minimal, modern, and premium
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md - Install motion package and apply brand colors to CSS
- [x] 04-02-PLAN.md - Add MotionConfig provider and direction-aware step transitions
- [x] 04-03-PLAN.md - Human verification of animations and visual polish

### Phase 5: Admin Authentication
**Goal**: Protect admin routes with password authentication and session management
**Depends on**: Phase 1 (data layer), independent of form phases
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. Navigating to /admin without login redirects to /admin/login
  2. Entering correct password grants access to admin dashboard
  3. Session persists across browser refresh (user stays logged in)
  4. Logout button clears session and redirects to login page
  5. Invalid password shows error message without granting access
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md - Install jose and create JWT session utilities
- [x] 05-02-PLAN.md - Create login page, middleware, and logout functionality

### Phase 6: Admin Dashboard
**Goal**: Build the submission management interface for reviewing and deciding on applications
**Depends on**: Phase 5 (authentication)
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06
**Success Criteria** (what must be TRUE):
  1. Admin sees table of all submissions with name, email, floor, initiative, and date
  2. Clicking a row opens detailed view of the full application
  3. Admin can change submission status (New, Under Review, Accepted, Rejected)
  4. Filter dropdown limits table to selected floor
  5. Search box filters by applicant name or initiative name
  6. New submissions appear in real-time without page refresh
**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md - Install TanStack Table and shadcn components, add Convex list/updateStatus
- [x] 06-02-PLAN.md - Create ApplicationsTable with real-time data, filters, and search
- [x] 06-03-PLAN.md - Create ApplicationSheet, StatusDropdown, and integrate into admin page

### Phase 7: Mobile Optimization & Deployment
**Goal**: Ensure mobile experience matches desktop quality and deploy to production
**Depends on**: Phase 4 (form complete), Phase 6 (admin complete)
**Requirements**: BRAND-04, DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. Form is fully usable on iPhone and Android devices with proper touch targets
  2. Mobile keyboard does not obscure active input fields
  3. Application is deployed and accessible at production URL
  4. Environment variables are properly configured for production (admin password, Convex keys)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

Note: Phase 5-6 (Admin) can execute in parallel with Phase 3-4 (Form) after Phase 1-2 complete, if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Data Layer | 2/2 | Complete | 2026-01-27 |
| 2. Form Infrastructure | 2/2 | Complete | 2026-01-27 |
| 3. Form UI (Static) | 5/5 | Complete | 2026-01-28 |
| 4. Form Polish & Animations | 3/3 | Complete | 2026-01-28 |
| 5. Admin Authentication | 2/2 | Complete | 2026-01-28 |
| 6. Admin Dashboard | 3/3 | Complete | 2026-01-28 |
| 7. Mobile Optimization & Deployment | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-27*
*Last updated: 2026-01-28 (Phase 6 complete)*
