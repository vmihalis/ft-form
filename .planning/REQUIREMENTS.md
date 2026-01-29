# Requirements: Frontier Tower Floor Lead Application System

**Defined:** 2026-01-29
**Core Value:** Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.

## v1.3 Requirements

Requirements for milestone v1.3 Unification & Admin Productivity. Each maps to roadmap phases.

### Migration

- [x] **MIGRATE-01**: Admin can create dynamic form matching original 19-field application structure
- [x] **MIGRATE-02**: /apply route serves dynamic form instead of hardcoded form
- [x] **MIGRATE-03**: Legacy applications table, mutations, queries, and components deleted from codebase

### Export

- [ ] **EXPORT-01**: Admin can download all submissions for a form as CSV file
- [ ] **EXPORT-02**: Admin can filter submissions by status and date range before exporting

### Dashboard

- [ ] **STATS-01**: Admin dashboard shows stats cards with total submissions and counts by status
- [ ] **STATS-02**: Admin dashboard shows activity feed with recent submissions and status changes
- [ ] **NOTES-01**: Admin can add internal notes to submissions (not visible to applicants)

## Future Requirements (v1.4+)

Deferred to future releases. Tracked but not in current roadmap.

### Conditional Logic

- **COND-01**: Conditional logic — show/hide fields based on other field values
- **COND-02**: Field branching — skip to different steps based on answers

### UX Enhancements

- **UX-V2-01**: Keyboard navigation (Enter to advance, arrow keys)
- **UX-V2-02**: Estimated completion time shown at start
- **UX-V2-03**: Microinteractions and button press feedback
- **UX-V2-04**: Success animation on form submission

### Admin Enhancements

- **ADMIN-V2-04**: Individual admin accounts with audit trail
- **ADMIN-V2-05**: Email notifications on new submissions

### Form Builder Enhancements

- **MULTI-01**: Multi-column field layouts
- **TEMPL-01**: Field templates library for common field patterns
- **COLLAB-01**: Collaborative form editing with conflict resolution
- **ANAL-01**: Form analytics (completion rates, drop-off points)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Data migration from legacy applications | Old applications are disposable, clean start with dynamic system |
| Application editing after submission | Applicants submit once, keeps data clean |
| Public application status tracking | Applicants wait for direct contact from FT team |
| Rich text editing in form fields | Plain text is sufficient |
| PDF export | CSV covers analytics needs |
| Multi-language support | English only for v1 |
| Applicant accounts/login | Anonymous submissions, contact via email |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MIGRATE-01 | Phase 16 | Complete |
| MIGRATE-02 | Phase 16 | Complete |
| MIGRATE-03 | Phase 17 | Complete |
| EXPORT-01 | Phase 18 | Pending |
| EXPORT-02 | Phase 18 | Pending |
| STATS-01 | Phase 19 | Pending |
| STATS-02 | Phase 19 | Pending |
| NOTES-01 | Phase 19 | Pending |

**Coverage:**
- v1.3 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after Phase 17 complete*
