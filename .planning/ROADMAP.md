# Roadmap: Frontier Tower Floor Lead Application System

## Milestones

- **v1.0 MVP** — Phases 1-7 (shipped 2026-01-28)
- **v1.1 Admin Inline Editing** — Phases 8-10 (shipped 2026-01-29)
- **v1.2 Dynamic Form Builder** — Phases 11-15 (shipped 2026-01-29)
- **v1.3 Unification & Admin Productivity** — Phases 16-19 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-7) - SHIPPED 2026-01-28</summary>

See `.planning/milestones/` for v1.0 details or git history.

</details>

<details>
<summary>v1.1 Admin Inline Editing (Phases 8-10) - SHIPPED 2026-01-29</summary>

See `.planning/milestones/` for v1.1 details or git history.

</details>

<details>
<summary>v1.2 Dynamic Form Builder (Phases 11-15) - SHIPPED 2026-01-29</summary>

- [x] Phase 11: Schema Foundation (2/2 plans) — completed 2026-01-29
- [x] Phase 12: File Upload Infrastructure (2/2 plans) — completed 2026-01-29
- [x] Phase 13: Dynamic Form Renderer (3/3 plans) — completed 2026-01-29
- [x] Phase 14: Form Builder UI (5/5 plans) — completed 2026-01-29
- [x] Phase 15: Admin Integration (3/3 plans) — completed 2026-01-29

See `.planning/milestones/v1.2-ROADMAP.md` for full details.

</details>

---

### Phase 16: Form Migration

**Goal:** Legacy /apply form is replaced by an equivalent dynamic form.

**Dependencies:** None (uses existing dynamic form infrastructure from v1.2)

**Requirements:**
- MIGRATE-01: Admin can create dynamic form matching original 19-field application structure
- MIGRATE-02: /apply route serves dynamic form instead of hardcoded form

**Plans:** 1 plan

Plans:
- [x] 16-01-PLAN.md — Create Floor Lead Application form and update /apply route

**Success Criteria:**
1. Admin can create a new form with all 19 original application fields (applicant info, proposal details, roadmap, impact, logistics)
2. User visiting /apply sees and can complete the dynamic form with identical UX to the original
3. Submissions from /apply appear in admin panel under the new form
4. Original field validation rules (required fields, email format) are preserved

---

### Phase 17: Legacy Cleanup

**Goal:** Codebase is unified under the dynamic form system with no legacy application code.

**Dependencies:** Phase 16 (migration must complete first)

**Requirements:**
- MIGRATE-03: Legacy applications table, mutations, queries, and components deleted from codebase

**Plans:** 2 plans

Plans:
- [x] 17-01-PLAN.md — Remove Applications tab from admin dashboard
- [x] 17-02-PLAN.md — Delete all legacy application code and Convex tables

**Success Criteria:**
1. Legacy `applications` table is deleted from Convex schema
2. Legacy application mutations (`submitApplication`) and queries (`getApplications`, `getApplicationById`) are removed
3. Hardcoded form components (`/app/apply/` original implementation) are deleted
4. Admin panel no longer references legacy applications (only submissions exist)
5. Build passes with no broken imports or dead code

---

### Phase 18: Export

**Goal:** Admins can export submission data for external analysis.

**Dependencies:** None (works on existing submissions table)

**Requirements:**
- EXPORT-01: Admin can download all submissions for a form as CSV file
- EXPORT-02: Admin can filter submissions by status and date range before exporting

**Success Criteria:**
1. Admin can click export button on submissions view and download CSV
2. CSV contains all submission fields with human-readable column headers
3. Admin can filter by status (Pending, Reviewed, Accepted, Rejected) before exporting
4. Admin can filter by date range (submitted after/before) before exporting
5. Export respects active filters (only filtered submissions are exported)

---

### Phase 19: Dashboard Enhancement

**Goal:** Admin dashboard provides at-a-glance insights and collaboration tools.

**Dependencies:** None (enhances existing admin views)

**Requirements:**
- STATS-01: Admin dashboard shows stats cards with total submissions and counts by status
- STATS-02: Admin dashboard shows activity feed with recent submissions and status changes
- NOTES-01: Admin can add internal notes to submissions (not visible to applicants)

**Success Criteria:**
1. Dashboard displays stats cards showing total submissions and breakdown by status (Pending, Reviewed, Accepted, Rejected)
2. Dashboard shows activity feed with recent submissions (name, form, timestamp)
3. Activity feed shows recent status changes (who changed, old status, new status)
4. Admin can add, view, and edit internal notes on any submission
5. Notes are stored per-submission and persist across sessions

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-7 | v1.0 | 16/16 | Complete | 2026-01-28 |
| 8-10 | v1.1 | 4/4 | Complete | 2026-01-29 |
| 11-15 | v1.2 | 15/15 | Complete | 2026-01-29 |
| 16 | v1.3 | 1/1 | Complete | 2026-01-29 |
| 17 | v1.3 | 2/2 | Complete | 2026-01-29 |
| 18 | v1.3 | 0/? | Pending | — |
| 19 | v1.3 | 0/? | Pending | — |

---
*Roadmap created: 2026-01-28*
*Last updated: 2026-01-29 after Phase 17 complete*
