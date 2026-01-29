# Requirements: Frontier Tower Floor Lead Application System

**Defined:** 2026-01-29
**Core Value:** Prospective floor leads can submit compelling proposals, and the FT team can efficiently review and decide on them.

## v1.2 Requirements

Requirements for Dynamic Form Builder milestone. Each maps to roadmap phases.

### Schema Foundation

- [x] **SCHEMA-01**: Forms stored in database with unique slug for URL routing
- [x] **SCHEMA-02**: Form versions are immutable snapshots preserving structure at publish time
- [x] **SCHEMA-03**: Submissions reference the form version they were submitted against
- [x] **SCHEMA-04**: Dynamic submissions table stores responses as flexible JSON with formVersionId
- [x] **SCHEMA-05**: Legacy applications coexist with new dynamic submissions

### Field Types

- [ ] **FIELD-01**: Text field type with label, placeholder, required flag, and help text
- [ ] **FIELD-02**: Textarea field type for multi-line text input
- [ ] **FIELD-03**: Email field type with format validation
- [ ] **FIELD-04**: Dropdown field type with configurable options
- [ ] **FIELD-05**: Number field type with optional min/max validation
- [ ] **FIELD-06**: Date field type with calendar picker
- [ ] **FIELD-07**: Checkbox field type for boolean/agreement inputs
- [ ] **FIELD-08**: File upload field type with Convex storage integration

### Form Builder

- [ ] **BUILD-01**: Admin can create new form with name and URL slug
- [ ] **BUILD-02**: Admin can add fields to form from field type palette
- [ ] **BUILD-03**: Admin can drag-and-drop to reorder fields within form
- [ ] **BUILD-04**: Admin can configure field properties (label, placeholder, required, help text)
- [ ] **BUILD-05**: Admin can remove fields from form
- [ ] **BUILD-06**: Real-time preview shows form as users will see it
- [ ] **BUILD-07**: Form has status lifecycle: draft, published, archived
- [ ] **BUILD-08**: Publishing creates immutable form version snapshot

### Public Form

- [ ] **PUBLIC-01**: Each form accessible at unique URL /apply/[slug]
- [ ] **PUBLIC-02**: Dynamic form renderer displays fields based on form schema
- [ ] **PUBLIC-03**: Typeform-style step-by-step UX preserved for dynamic forms
- [ ] **PUBLIC-04**: Form validation based on field configuration (required, format)
- [ ] **PUBLIC-05**: File uploads persist immediately on selection (before final submit)
- [ ] **PUBLIC-06**: Submission stores response data with formVersionId reference

### Admin Integration

- [ ] **ADMIN-01**: Forms tab in admin dashboard lists all forms
- [ ] **ADMIN-02**: Admin can filter submissions by which form they came from
- [ ] **ADMIN-03**: Admin can duplicate existing form as starting point for new form
- [ ] **ADMIN-04**: Submission detail panel renders based on form schema (not hardcoded fields)
- [ ] **ADMIN-05**: Edit history works with dynamic field labels

## Future Requirements (v1.3+)

### Deferred from v1.2

- **COND-01**: Conditional logic — show/hide fields based on other field values
- **COND-02**: Field branching — skip to different steps based on answers
- **MULTI-01**: Multi-column field layouts
- **TEMPL-01**: Field templates library for common field patterns
- **COLLAB-01**: Collaborative form editing with conflict resolution
- **ANAL-01**: Form analytics (completion rates, drop-off points)

## Out of Scope

Explicitly excluded from v1.2. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Conditional logic/branching | Adds 30%+ complexity, explicitly deferred per PROJECT.md |
| Rich text editor for fields | Overkill, complicates storage and rendering |
| Form embedding (iframe/widget) | Unique URLs sufficient for current needs |
| A/B testing | Significant complexity for minimal value |
| Payment fields | Not needed for floor lead applications |
| Multi-language forms | English only, consistent with v1.0 decision |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHEMA-01 | Phase 11 | Complete |
| SCHEMA-02 | Phase 11 | Complete |
| SCHEMA-03 | Phase 11 | Complete |
| SCHEMA-04 | Phase 11 | Complete |
| SCHEMA-05 | Phase 11 | Complete |
| FIELD-01 | Phase 13 | Pending |
| FIELD-02 | Phase 13 | Pending |
| FIELD-03 | Phase 13 | Pending |
| FIELD-04 | Phase 13 | Pending |
| FIELD-05 | Phase 13 | Pending |
| FIELD-06 | Phase 13 | Pending |
| FIELD-07 | Phase 13 | Pending |
| FIELD-08 | Phase 12 | Pending |
| BUILD-01 | Phase 14 | Pending |
| BUILD-02 | Phase 14 | Pending |
| BUILD-03 | Phase 14 | Pending |
| BUILD-04 | Phase 14 | Pending |
| BUILD-05 | Phase 14 | Pending |
| BUILD-06 | Phase 14 | Pending |
| BUILD-07 | Phase 14 | Pending |
| BUILD-08 | Phase 14 | Pending |
| PUBLIC-01 | Phase 13 | Pending |
| PUBLIC-02 | Phase 13 | Pending |
| PUBLIC-03 | Phase 13 | Pending |
| PUBLIC-04 | Phase 13 | Pending |
| PUBLIC-05 | Phase 13 | Pending |
| PUBLIC-06 | Phase 13 | Pending |
| ADMIN-01 | Phase 15 | Pending |
| ADMIN-02 | Phase 15 | Pending |
| ADMIN-03 | Phase 15 | Pending |
| ADMIN-04 | Phase 15 | Pending |
| ADMIN-05 | Phase 15 | Pending |

**Coverage:**
- v1.2 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after roadmap creation - all requirements mapped to phases*
