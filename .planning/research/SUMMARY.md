# Project Research Summary

**Project:** Frontier Tower Floor Lead Application System - v1.2 Dynamic Form Builder
**Domain:** Admin-facing form builder with dynamic form creation and public form rendering
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

The v1.2 Dynamic Form Builder milestone adds form creation capabilities to the existing Frontier Tower application system. Research shows this is a well-documented domain with established patterns. The existing stack (Next.js 16, React 19, Tailwind 4, Convex, shadcn/ui) is well-suited for this feature. Only two new dependencies are required: @dnd-kit for drag-and-drop field reordering and nanoid for unique field ID generation. All other functionality (date pickers, file uploads, checkboxes) can be achieved with existing libraries or Convex built-ins.

The recommended approach is to introduce a form schema layer that decouples form structure from code while preserving the existing Typeform-style user experience. Store form schemas in Convex as JSON strings (avoiding nesting limits), use immutable form versioning to maintain data integrity across schema changes, and generate Zod validators at runtime from stored schemas. The architecture integrates cleanly with existing components through schema prop injection, maintaining backward compatibility with the hardcoded v1.0/v1.1 form.

The most critical risk is form version drift causing submissions to reference non-existent or changed form structures. This is mitigated through immutable formVersions table and schema snapshots stored with each submission. Other key risks include breaking existing submissions (handle via versioning), file upload URL expiration (immediate upload to Convex storage), and Typeform UX degradation (preserve step-based grouping with dynamic field counts). With careful schema design upfront and adherence to established patterns, this is a high-confidence build.

## Key Findings

### Recommended Stack

The existing stack handles 95% of requirements. Only minimal additions needed. The @dnd-kit packages (core + sortable) provide production-ready drag-and-drop with React 19 support, chosen over alternatives like pragmatic-drag-and-drop (React 19 issues) and react-beautiful-dnd (deprecated). Nanoid generates unique, URL-safe field IDs at 118 bytes versus uuid's 423 bytes. Convex's built-in file storage eliminates the need for react-dropzone or similar libraries. Shadcn/ui components (Calendar, Popover, Checkbox) are confirmed React 19 compatible and already in use.

**Core technologies:**
- **@dnd-kit/core + @dnd-kit/sortable** (v6.3.1 + v10.0.0): Drag-and-drop field reordering — lightweight, accessible, React 19 compatible with 2039+ dependents
- **nanoid** (v5.0.9): Unique field ID generation — 118 bytes, URL-safe, more compact than uuid
- **Convex file storage** (built-in): File upload fields — native upload URL method, no size limits beyond HTTP action constraints
- **Zustand** (existing 5.0.10): Form builder state — extend existing store for builder state, draft persistence
- **React Hook Form + Zod** (existing): Dynamic form rendering and validation — generate Zod schemas at runtime from stored form definitions
- **shadcn/ui Calendar, Checkbox** (add components): Date and checkbox field types — React 19 compatible per official docs

### Expected Features

Research identified a clear feature hierarchy based on industry standards and user expectations for form builders.

**Must have (table stakes):**
- Drag-and-drop field placement — defining UX pattern for form builders
- Core field types (text, textarea, email, dropdown) — covers 80% of form needs
- Field configuration panel — label, placeholder, required flag, help text
- Real-time preview — users need to see what they're building
- Form save/persistence — forms must persist across sessions
- Unique form URLs — each form needs shareable link at /apply/[slug]
- Form listing/management — admins need CRUD operations
- Field validation config — basic required toggles and format rules
- Submission storage with form version — critical for data integrity after schema changes

**Should have (competitive):**
- File upload fields — enables portfolio/resume collection (explicitly requested)
- Extended field types (number, date, checkbox) — richer data collection beyond text
- Form duplication — quick form creation from templates
- Form status (draft/published/archived) — lifecycle management without deletion
- Smooth drag feedback — visual polish during reordering
- Form versioning with history access — see past versions of form definitions
- Field help text/descriptions — improves form completion rate
- Typeform-style public rendering — matches existing v1.0 UX for consistency
- Per-form submission filtering — admin sees submissions grouped by form
- Dropdown option management UI — add/remove/reorder options

**Defer (v2+):**
- Conditional logic/branching — explicitly out of scope per PROJECT.md, adds 30%+ complexity
- Rich text editor for fields — overkill, complicates rendering/storage
- Multi-page form builder — existing step-by-step UX handles pacing
- Field templates library — premature optimization for infrequent form creation
- Collaborative real-time editing — single admin team (1-3 people)
- A/B testing — adds significant complexity for minimal value
- Form analytics (conversion funnels) — nice-to-have but not MVP
- Form embedding (iframe/widget) — use unique URLs instead

### Architecture Approach

The existing architecture has a well-structured but hardcoded form system. Adding dynamic forms requires introducing a form schema layer that decouples form structure from code. Store form schemas as JSON strings in Convex (avoids 16-level nesting limit), create immutable formVersions snapshots on publish, and reference formVersionId with each submission. Generate Zod validators at runtime from stored schemas to maintain validation consistency.

**Major components:**
1. **Schema Foundation** — New Convex tables (forms, formVersions, submissions, submissionFiles) with JSON string schema storage to avoid nesting limits
2. **Dynamic Renderer** — DynamicStep and DynamicField components that read schema and route to field type registry, preserving Typeform-style one-question-at-a-time UX
3. **Form Builder** — Admin-only drag-and-drop editor with FieldPalette, StepEditor, FieldEditor using @dnd-kit sortable with keyboard alternatives
4. **File Upload System** — FileField component using Convex storage upload URLs (handles files >20MB), immediate persistence on selection to avoid expiration issues
5. **Submission Pipeline** — Dynamic /apply/[slug] routes fetch published form versions, render with DynamicMultiStepForm, store responses with formVersionId and schema snapshot
6. **Admin Integration** — Modify ApplicationSheet to read sections from schema, extend EditHistory to store field labels, add form selector to dashboard

### Critical Pitfalls

Research identified 15 pitfalls; top 5 require phase 1 attention:

1. **Breaking Existing Submissions When Schema Changes** — Existing applications table has 19 hardcoded fields; migration strategy needed. Treat existing submissions as "v0" schema, backfill formVersion field, design queries to handle both legacy and dynamic submissions. Address in Phase 1 (Foundation).

2. **Form Version Drift - Submissions Reference Deleted/Changed Forms** — User fills form v1, admin edits to v2, submission references non-existent structure. Implement immutable formVersions table, store full schema snapshot with each submission, never allow in-place mutation. Address in Phase 1 (Schema Design).

3. **File Upload URL Expiration During Long Forms** — Convex upload URLs expire in 1 hour; long forms risk losing files. Implement immediate file persistence on selection (not on final submit), store storageId in localStorage draft, validate file exists before submission. Address in Phase 2 (File Upload).

4. **Typeform UX Degradation with Dynamic Fields** — Beautiful one-question-at-a-time flow breaks with varying field counts. Preserve step-based grouping, calculate progress from total fields, test animations with various counts, limit 3-5 fields per step. Address in Phase 3 (Form Renderer).

5. **Form Slug Collision and URL Breakage** — Admin creates duplicate slugs, URLs break or wrong form loads. Implement database-level unique constraint on slug, case-insensitive normalization, reserve system paths, validate on create and update. Address in Phase 1 (Forms Table Schema).

## Implications for Roadmap

Based on research, the build order should prioritize schema foundation and file infrastructure before UI/builder work. The architecture analysis shows clear dependencies: schema design blocks everything, file upload is independent, builder and renderer can develop in parallel after schema is stable.

### Phase 1: Schema Foundation and Legacy Migration
**Rationale:** Form schema design is the foundation that blocks all other work. Getting versioning right upfront prevents painful rewrites. Legacy migration must happen early to avoid breaking existing admin dashboard.
**Delivers:** Convex tables (forms, formVersions, submissions, submissionFiles), TypeScript types (FormSchema, FormField), schema-to-zod generator, legacy data migration (formVersion: "v0" backfill)
**Addresses:** Table stakes features (form persistence, unique URLs), must establish data model
**Avoids:** Pitfall #1 (breaking existing submissions), Pitfall #2 (version drift), Pitfall #5 (slug collision), Pitfall #11 (performance with large schemas)
**Research flag:** Standard patterns, well-documented. Skip /gsd:research-phase.

### Phase 2: File Upload Infrastructure
**Rationale:** File uploads are independent of builder UI and required for form rendering. Complex enough to warrant dedicated phase. Upload URL method and immediate persistence pattern need careful implementation.
**Delivers:** FileField component, Convex file mutations (generateUploadUrl, saveFile), upload validation (size, type), storage with formVersionId reference
**Uses:** Convex storage (built-in), existing Zustand store for draft persistence
**Implements:** File upload component from architecture, immediate persistence pattern to avoid URL expiration
**Avoids:** Pitfall #3 (URL expiration), Pitfall #9 (HTTP action limit >20MB)
**Research flag:** Well-documented via Convex official docs. Skip /gsd:research-phase.

### Phase 3: Dynamic Form Renderer
**Rationale:** Must work before builder is useful (can't test forms without rendering). Can develop with hardcoded schema matching existing form before builder exists.
**Delivers:** DynamicStep component, DynamicField component, field type registry, /apply/[slug] route, schema-to-zod validation, preserve Typeform-style step transitions
**Addresses:** Table stakes features (field types, validation, public rendering), differentiators (Typeform-style UX)
**Implements:** Dynamic renderer architecture, preserves existing MultiStepForm for legacy /apply route
**Avoids:** Pitfall #4 (Typeform UX degradation), Pitfall #6 (validation sync), Pitfall #13 (draft breakage with field ID changes)
**Research flag:** Standard patterns for dynamic forms. Skip /gsd:research-phase.

### Phase 4: Form Builder UI
**Rationale:** Depends on schema (Phase 1) being stable. Builder is useless without renderer (Phase 3) to test created forms. Admin-only feature with lower urgency than public-facing renderer.
**Delivers:** FormBuilder container, FieldPalette (draggable types), StepEditor (@dnd-kit sortable), FieldEditor (property panel), PreviewPane (live preview), /admin/forms routes
**Uses:** @dnd-kit/core + sortable (new dependency), nanoid (new dependency), Zustand builder-store (new)
**Implements:** Form builder architecture with drag-and-drop, keyboard alternatives for accessibility
**Avoids:** Pitfall #8 (drag-drop accessibility), Pitfall #12 (no preview mode), Pitfall #14 (no version history)
**Research flag:** Drag-and-drop accessibility needs attention. Consider /gsd:research-phase for a11y patterns.

### Phase 5: Admin Integration and Submission Management
**Rationale:** Requires renderer (Phase 3) to display submissions correctly. Extends existing admin components rather than building from scratch. Final integration phase.
**Delivers:** SubmissionSheet (dynamic version of ApplicationSheet), form selector in admin dashboard, per-form submission filtering, edit history with field labels, form management (list/edit/delete)
**Addresses:** Table stakes (form management, submission viewing), differentiators (per-form filtering)
**Implements:** ApplicationSheet dynamic sections from architecture, handles both legacy and dynamic submissions
**Avoids:** Pitfall #7 (edit history breaks), Pitfall #10 (responses without type context)
**Research flag:** Extends existing patterns. Skip /gsd:research-phase.

### Phase Ordering Rationale

- **Foundation first (Phase 1):** Schema design discovered to be critical. Changing schema after renderer/builder are built causes rewrites. Immutable versioning must be designed upfront to avoid data integrity issues (Pitfalls #1, #2).
- **File upload independent (Phase 2):** Can develop in parallel with renderer. Convex storage upload URL pattern is self-contained. Getting immediate persistence right early prevents later refactoring.
- **Renderer before builder (Phase 3 → 4):** Builder creates forms that renderer displays. Can't validate builder output without renderer. Renderer can be tested with hardcoded schemas during development.
- **Admin integration last (Phase 5):** Requires both schema and renderer to be stable. Extends existing components rather than building new patterns. Least critical for launch (admin can view raw data if needed).
- **Parallel opportunities:** Phase 2 (file upload) can develop alongside Phase 3 (renderer) since they share minimal code. Phase 4 (builder) and Phase 5 (admin) must be sequential due to dependencies.

### Research Flags

**Needs deeper research:**
- **Phase 4 (Form Builder):** Drag-and-drop accessibility patterns — Research shows most DnD UIs fail accessibility. @dnd-kit has better a11y than alternatives, but keyboard navigation, screen reader announcements, and ARIA implementation need careful attention. Consider /gsd:research-phase for a11y patterns.

**Standard patterns (skip research):**
- **Phase 1 (Schema Foundation):** Convex schema design, versioning patterns — well-documented in official docs and MongoDB patterns
- **Phase 2 (File Upload):** Convex storage upload URLs — official documentation is comprehensive
- **Phase 3 (Dynamic Renderer):** React Hook Form + Zod, schema-to-validator generation — established pattern
- **Phase 5 (Admin Integration):** Extending existing components — follows patterns already in codebase

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All dependencies verified via npm registry and official docs. @dnd-kit v6.3.1 stable with 2039 dependents, React 19 compatible. Convex file storage officially documented. Shadcn/ui React 19 compatibility confirmed. |
| Features | HIGH | Form builder domain is well-documented with extensive prior art. Feature hierarchy clear from industry analysis (Typeform, Google Forms, Fillout). TABLE_STAKES vs DIFFERENTIATORS vs ANTI-FEATURES well-defined. |
| Architecture | HIGH | Existing codebase analysis shows clean structure. Integration points identified (StepContent, ApplicationSheet). Convex schema patterns documented. Dynamic form rendering is established pattern. |
| Pitfalls | HIGH | Critical pitfalls verified against Convex docs (nesting limits, file upload URLs). Schema versioning patterns from MongoDB/Cosmos DB. Accessibility issues documented by Salesforce and WCAG 2.2. |

**Overall confidence:** HIGH

The research is based on official documentation (Convex, dnd-kit, shadcn/ui), verified package versions from npm registry, and industry-standard patterns for form builders. The existing codebase provides strong architectural guidance. All critical pitfalls have documented prevention strategies.

### Gaps to Address

Minor gaps that need attention during implementation:

- **File size limits:** Research shows Convex HTTP actions limited to 20MB, upload URLs have no documented limit. Need to confirm acceptable file size range for typical form uploads (resumes, portfolios) and set client-side validation accordingly. Recommend 50MB limit.

- **Form version pruning strategy:** Research shows strong consensus on immutable versioning, but no guidance on whether to keep all versions forever or implement cleanup. Decision needed during Phase 1: keep all (simpler) or prune old versions (disk space optimization). Recommend keeping all initially.

- **Conditional logic deferral:** Explicitly marked as anti-feature per PROJECT.md, but field schema includes conditionalLogic interface from architecture research. Clarify during Phase 1 whether to include schema support (for future) or omit entirely (cleaner v1.2).

- **Draft restoration with dynamic schemas:** Pitfall #13 identified but solution ambiguous. Need to decide: (1) clear draft if form version changed, (2) attempt field ID migration, or (3) version-aware draft storage. Recommend option 1 (clear with warning) for simplicity.

- **Edit history storage format:** Pitfall #7 shows need for field labels in history, but implementation pattern unclear. Need to decide: store label snapshot in each history record (simpler, redundant) or resolve from schema at display time (complex, accurate). Recommend snapshot approach.

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Convex Schema Philosophy](https://docs.convex.dev/database/advanced/schema-philosophy) — 16-level nesting limit, document size constraints
- [Convex File Storage](https://docs.convex.dev/file-storage/upload-files) — Upload URL method, 20MB HTTP action limit
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/) — Schema design patterns
- [dnd-kit Documentation](https://docs.dndkit.com) — Sortable preset, accessibility features
- [shadcn/ui React 19 Compatibility](https://ui.shadcn.com/docs/react-19) — Component compatibility confirmed
- [nanoid GitHub](https://github.com/ai/nanoid) — 118 bytes, URL-safe, secure

**npm Registry (verified versions):**
- [@dnd-kit/core](https://www.npmjs.com/package/@dnd-kit/core) v6.3.1 — 2039 dependents, active maintenance
- [@dnd-kit/sortable](https://www.npmjs.com/package/@dnd-kit/sortable) v10.0.0 — Stable release
- [nanoid](https://www.npmjs.com/package/nanoid) v5.0.9 — Latest stable

### Secondary (MEDIUM confidence)

**Schema Versioning Patterns:**
- [MongoDB Document Versioning](https://www.mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/) — Immutable version pattern
- [Azure Cosmos DB Schema Versioning](https://devblogs.microsoft.com/cosmosdb/azure-cosmos-db-design-patterns-part-9-schema-versioning/) — Document versioning best practices
- [Schema Evolution in Data Pipelines](https://dataengineeracademy.com/module/best-practices-for-managing-schema-evolution-in-data-pipelines/) — Migration strategies

**Form Builder Patterns:**
- [Buildform - Types of Form Fields](https://buildform.ai/blog/types-of-form-fields/) — Comprehensive field type overview
- [Jotform - Form Fields Overview](https://www.jotform.com/help/46-quick-overview-of-form-fields/) — Industry standard field types
- [FormEngine - Open-Source Form Builder](https://formengine.io/) — React implementation patterns
- [Schema-Driven Dynamic Forms](https://medium.com/hike-medical/scaling-clinical-workflows-with-schema-driven-dynamic-forms-091f89cc730f) — Enterprise implementation

**Accessibility:**
- [Salesforce: 4 Patterns for Accessible Drag and Drop](https://medium.com/salesforce-ux/4-major-patterns-for-accessible-drag-and-drop-1d43f64ebf09) — Industry a11y patterns
- [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements) — Accessibility requirements
- [Drag-and-Drop UX Best Practices](https://smart-interface-design-patterns.com/articles/drag-and-drop-ux/) — Keyboard alternatives

### Tertiary (LOW confidence)

**Market Research:**
- [Top 5 DnD Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) — @dnd-kit recommended over alternatives
- [Typeform vs Google Forms 2026](https://www-cdn.involve.me/blog/typeform-vs-google-forms) — Feature comparison for competitive analysis
- [Fillout - Typeform Alternatives](https://www.fillout.com/blog/8-typeform-alternatives) — Market landscape

**Anti-Patterns:**
- [Formsort - 10 Common Form Building Mistakes](https://formsort.com/article/10-common-form-building-mistakes/) — What to avoid
- [Form.io Migration Guide](https://help.form.io/deployments/maintenance-and-migration) — Migration pitfalls

---
*Research completed: 2026-01-29*
*Ready for roadmap: yes*
