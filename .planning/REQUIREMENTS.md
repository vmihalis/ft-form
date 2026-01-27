# Requirements: Frontier Tower Floor Lead Application

**Defined:** 2026-01-27
**Core Value:** Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Next.js 16 project with App Router and Tailwind CSS
- [x] **FOUND-02**: Convex backend integration with schema
- [x] **FOUND-03**: shadcn/ui component library setup
- [x] **FOUND-04**: Route structure (/apply, /admin, /admin/login)
- [x] **FOUND-05**: Database schema for applications with indexes

### Form Sections

- [ ] **FORM-01**: Welcome/hero step with FT logo, headline, CTA to begin
- [ ] **FORM-02**: Applicant info step (name, email, LinkedIn, role, bio)
- [ ] **FORM-03**: Proposal step (floor dropdown, initiative name, tagline, values, target community, estimated size)
- [ ] **FORM-04**: Roadmap step (Phase 1 MVP, Phase 2 expansion, Phase 3 long-term)
- [ ] **FORM-05**: Impact step (benefit to FT members)
- [ ] **FORM-06**: Logistics step (existing community, space needs, start date, additional notes)
- [ ] **FORM-07**: Review step showing all collected data before submission
- [ ] **FORM-08**: Confirmation step with thank you message and next steps

### Form UX

- [ ] **UX-01**: One-section-at-a-time Typeform-style flow
- [ ] **UX-02**: Progress indicator showing current step and total steps
- [ ] **UX-03**: Smooth Framer Motion transitions between steps (fade/slide)
- [ ] **UX-04**: Per-step validation before allowing progression
- [ ] **UX-05**: Back navigation preserving entered data
- [ ] **UX-06**: Auto-save drafts to localStorage for resume capability
- [ ] **UX-07**: Floor dropdown with all Frontier Tower floors + "Other" option
- [ ] **UX-08**: "Other" floor shows text field for custom floor proposal
- [ ] **UX-09**: Inline validation with clear error messages
- [ ] **UX-10**: Form submission to Convex database

### Admin Authentication

- [ ] **AUTH-01**: Password-protected admin login page
- [ ] **AUTH-02**: Single shared password via environment variable
- [ ] **AUTH-03**: Protected routes middleware for /admin/*
- [ ] **AUTH-04**: Session management with JWT
- [ ] **AUTH-05**: Logout functionality

### Admin Dashboard

- [ ] **ADMIN-01**: Table view of all submissions (name, email, floor, initiative, date)
- [ ] **ADMIN-02**: Click row to view full submission details (modal or panel)
- [ ] **ADMIN-03**: Status management (New, Under Review, Accepted, Rejected)
- [ ] **ADMIN-04**: Filter submissions by floor
- [ ] **ADMIN-05**: Search by name or initiative name
- [ ] **ADMIN-06**: Real-time updates when new submissions arrive

### Design & Branding

- [ ] **BRAND-01**: Brand colors (#7b42e7 purple, white)
- [ ] **BRAND-02**: FT logo in hero and admin header
- [ ] **BRAND-03**: Minimal, modern, premium aesthetic
- [ ] **BRAND-04**: Mobile responsive design (44x44px touch targets)
- [ ] **BRAND-05**: Consistent design language across form and admin

### Deployment

- [ ] **DEPLOY-01**: Vercel deployment configuration
- [ ] **DEPLOY-02**: Environment variables for production (admin password, Convex keys)
- [ ] **DEPLOY-03**: Mobile testing on iOS and Android

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Form Enhancements

- **UX-V2-01**: Keyboard navigation (Enter to advance, arrow keys)
- **UX-V2-02**: Estimated completion time shown at start
- **UX-V2-03**: Microinteractions and button press feedback
- **UX-V2-04**: Success animation on form submission

### Admin Enhancements

- **ADMIN-V2-01**: CSV export of all submissions
- **ADMIN-V2-02**: Dashboard stats (total applications, pending count)
- **ADMIN-V2-03**: Admin notes on submissions
- **ADMIN-V2-04**: Individual admin accounts with audit trail
- **ADMIN-V2-05**: Email notifications on new submissions

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Application editing after submission | Applicants submit once, keeps data clean |
| Public application status tracking | Applicants wait for direct contact from FT team |
| Conditional form branching | All floors use same form structure |
| Rich text editing in form fields | Plain text is sufficient |
| PDF export | CSV covers analytics needs |
| Multi-language support | English only for v1 |
| Applicant accounts/login | Anonymous submissions, contact via email |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| UX-01 | Phase 2 | Pending |
| UX-02 | Phase 2 | Pending |
| UX-04 | Phase 2 | Pending |
| UX-05 | Phase 2 | Pending |
| UX-06 | Phase 2 | Pending |
| FORM-01 | Phase 3 | Pending |
| FORM-02 | Phase 3 | Pending |
| FORM-03 | Phase 3 | Pending |
| FORM-04 | Phase 3 | Pending |
| FORM-05 | Phase 3 | Pending |
| FORM-06 | Phase 3 | Pending |
| FORM-07 | Phase 3 | Pending |
| FORM-08 | Phase 3 | Pending |
| UX-07 | Phase 3 | Pending |
| UX-08 | Phase 3 | Pending |
| UX-09 | Phase 3 | Pending |
| UX-10 | Phase 3 | Pending |
| BRAND-02 | Phase 3 | Pending |
| UX-03 | Phase 4 | Pending |
| BRAND-01 | Phase 4 | Pending |
| BRAND-03 | Phase 4 | Pending |
| BRAND-05 | Phase 4 | Pending |
| AUTH-01 | Phase 5 | Pending |
| AUTH-02 | Phase 5 | Pending |
| AUTH-03 | Phase 5 | Pending |
| AUTH-04 | Phase 5 | Pending |
| AUTH-05 | Phase 5 | Pending |
| ADMIN-01 | Phase 6 | Pending |
| ADMIN-02 | Phase 6 | Pending |
| ADMIN-03 | Phase 6 | Pending |
| ADMIN-04 | Phase 6 | Pending |
| ADMIN-05 | Phase 6 | Pending |
| ADMIN-06 | Phase 6 | Pending |
| BRAND-04 | Phase 7 | Pending |
| DEPLOY-01 | Phase 7 | Pending |
| DEPLOY-02 | Phase 7 | Pending |
| DEPLOY-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

**Requirements per Phase:**
| Phase | Count | Requirements |
|-------|-------|--------------|
| Phase 1 | 5 | FOUND-01 to FOUND-05 |
| Phase 2 | 5 | UX-01, UX-02, UX-04, UX-05, UX-06 |
| Phase 3 | 13 | FORM-01 to FORM-08, UX-07 to UX-10, BRAND-02 |
| Phase 4 | 4 | UX-03, BRAND-01, BRAND-03, BRAND-05 |
| Phase 5 | 5 | AUTH-01 to AUTH-05 |
| Phase 6 | 6 | ADMIN-01 to ADMIN-06 |
| Phase 7 | 4 | BRAND-04, DEPLOY-01 to DEPLOY-03 |

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 (Phase 1 complete)*
