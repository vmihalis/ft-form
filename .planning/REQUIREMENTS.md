# Requirements: Frontier Tower Floor Lead Application System

**Defined:** 2026-01-28
**Core Value:** Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.

## v1.1 Requirements

Requirements for admin inline editing milestone. Each maps to roadmap phases.

### Inline Editing

- [x] **EDIT-01**: Admin can click any field in detail view to edit inline
- [x] **EDIT-02**: All form fields are editable (name, email, floor, proposal, roadmap, impact, logistics — 19 fields total)
- [x] **EDIT-03**: Save on blur or Enter key, cancel on Escape key
- [x] **EDIT-04**: Visual edit state shows field is being edited (border, background change)
- [x] **EDIT-05**: Pencil icon appears on hover to indicate field is editable
- [x] **EDIT-06**: Validation before save (email format, required fields)

### Edit History

- [ ] **HIST-01**: Edit history tracked in database (field, old value, new value, timestamp)
- [ ] **HIST-02**: Edit history viewable in detail panel as collapsible timeline
- [ ] **HIST-03**: Timeline shows most recent changes first
- [ ] **HIST-04**: Field names displayed as human-readable labels (not technical names)

## Future Requirements (v1.2+)

Deferred to future release. Tracked but not in current roadmap.

### Enhanced UX

- **UX-V2-01**: Keyboard navigation (Enter to advance, arrow keys)
- **UX-V2-02**: Estimated completion time shown at start
- **UX-V2-03**: Microinteractions and button press feedback
- **UX-V2-04**: Success animation on form submission

### Advanced Editing

- **EDIT-V2-01**: Field-level history view (click field to see its specific changes)
- **EDIT-V2-02**: Undo last edit button
- **EDIT-V2-03**: Keyboard Tab navigation between editable fields
- **EDIT-V2-04**: Compare current values vs original submission

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
| Full-form edit mode toggle | Field-level inline is simpler and matches research |
| Modal for each field edit | Breaks context, adds friction |
| Auto-save with debounce | Confusing state, prefer explicit save on blur |
| Required comments on every edit | Friction that discourages corrections |
| Real-time collaborative editing | Overkill for 1-3 admin team |
| Editor identity tracking | Single shared password auth, all edits are "admin" |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-01 | Phase 9 | Complete |
| EDIT-02 | Phase 9 | Complete |
| EDIT-03 | Phase 9 | Complete |
| EDIT-04 | Phase 9 | Complete |
| EDIT-05 | Phase 9 | Complete |
| EDIT-06 | Phase 9 | Complete |
| HIST-01 | Phase 8 | Complete |
| HIST-02 | Phase 10 | Pending |
| HIST-03 | Phase 10 | Pending |
| HIST-04 | Phase 10 | Pending |

**Coverage:**
- v1.1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 — Roadmap created for v1.1*
