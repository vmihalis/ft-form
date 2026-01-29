# Feature Landscape: Dynamic Form Builder

**Domain:** Admin-facing form builder for application collection
**Project:** Floor Lead Application System v1.2 (Frontier Tower)
**Researched:** 2026-01-29
**Confidence:** HIGH (well-documented domain with extensive prior art)

---

## Context: Building on v1.0/v1.1

This research focuses specifically on the **dynamic form builder** milestone (v1.2). The existing system already has:
- Typeform-style 8-step public form with fixed fields
- Admin dashboard with submission table, detail panel, inline editing
- Status management, search, floor filter
- Edit history tracking

The v1.2 goal is enabling admins to **create and customize** forms rather than using the hardcoded form structure.

---

## Table Stakes

Features users expect from a form builder. Missing = product feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Drag-and-drop field placement** | Every modern form builder has this; it's the defining UX pattern | Medium | React DnD or similar library | Core differentiator between "form builder" and "code editing" |
| **Core field types (text, textarea, email, dropdown)** | Minimum viable for any form | Low | Field renderer component | These cover 80% of form needs |
| **Field configuration panel** | Users expect to set labels, placeholders, required flag | Low | React state management | Right-side panel pattern is standard |
| **Real-time preview** | Users need to see what they're building | Medium | React state | Shows form as users will see it |
| **Form save/persistence** | Forms must persist across sessions | Low | Existing Convex | Database already exists |
| **Unique form URLs** | Each form needs shareable link | Low | Next.js dynamic routing | `/apply/[slug]` pattern requested |
| **Form listing/management** | Admins need to see all forms | Low | Existing admin dashboard | List view in admin sidebar/page |
| **Field validation config (required toggle)** | Basic data quality expectations | Low | Field schema | Per-field toggle in config panel |
| **Form deletion** | Admins must manage form lifecycle | Low | Convex mutation | With confirmation dialog |
| **Submission storage with form version** | Submissions must be readable after form changes | Medium | Schema design | Critical for data integrity |

## Differentiators

Features that add value beyond minimum expectations. Set product apart.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **File upload fields** | Enables portfolio/resume collection | Medium | Convex file storage | Explicitly requested in milestone |
| **Number/date/checkbox fields** | Richer data collection beyond text | Low | Field components | Requested field types |
| **Form duplication** | Quick form creation from templates or existing forms | Low | Convex mutation | One-click to copy a form |
| **Form status (draft/published/archived)** | Control form visibility without deletion | Low | Schema addition | Standard lifecycle management |
| **Smooth drag feedback** | Visual polish during field reordering | Medium | DnD library | Better UX than basic reorder |
| **Form versioning with history access** | See past versions of a form definition | Medium | Version tracking schema | Beyond just preserving submissions |
| **Field help text/descriptions** | Guidance for complex questions | Low | Field schema | Improves form completion rate |
| **Typeform-style public rendering** | Matches existing v1.0 UX for consistency | Low | Existing step components | Reuse existing form step pattern |
| **Per-form submission filtering** | Admin sees submissions grouped by form | Low | Query filter | Filter existing table by form ID |
| **Dropdown option management** | UI to add/remove/reorder options for select fields | Low | Field config component | Essential for dropdown usability |

## Anti-Features

Features to explicitly NOT build. Either out of scope, over-engineered, or harmful.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Conditional logic / branching** | Explicitly out of scope per PROJECT.md; adds significant complexity (30%+ more work) | Keep forms linear; all respondents see same fields |
| **Rich text editor for fields** | Overkill for this use case; complicates rendering and storage | Plain text with basic formatting like line breaks |
| **Multi-page form builder** | Existing Typeform UX handles pacing via step-by-step; explicit page breaks add complexity | Each form renders as single flow, step-by-step |
| **Field templates library** | Premature optimization; teams create forms infrequently | Start fresh or duplicate existing forms |
| **Collaborative real-time editing** | Single admin team (1-3 people); no real-time conflict risk | Simple save overwrites; last write wins |
| **A/B testing** | Out of scope; adds significant complexity for form creation and analytics | One active version per form |
| **Payment collection fields** | Not a use case for floor lead applications | Omit payment fields entirely |
| **Custom CSS/themes per form** | Brand consistency is desired; per-form theming adds complexity | Use existing FT brand colors for all forms |
| **Email notifications on submission** | Explicitly user preference to omit (per PROJECT.md) | Admins check dashboard manually |
| **Form analytics (conversion funnels)** | Nice-to-have but not MVP; focus on core builder | Defer to post-v1.2 |
| **Form embedding (iframe/widget)** | All forms served from app directly; no external embed needed | Use unique URLs instead |
| **API access for form definitions** | No external consumers expected | Internal admin use only |
| **Signature fields** | Over-scoped for application collection | Use text field if signature needed |
| **Address autocomplete fields** | Requires external API; not needed for applications | Use standard text fields |
| **CAPTCHA integration** | Existing system works without it; adds UX friction | Rate limiting if needed later |

---

## Field Type Matrix

Requested field types with implementation details.

| Field Type | Input Component | Validation Options | Storage Type | Complexity | Notes |
|------------|-----------------|-------------------|--------------|------------|-------|
| **Text** | `<Input>` (shadcn) | Required, min/max length | string | Low | Single line short answer |
| **Textarea** | `<Textarea>` (shadcn) | Required, min/max length | string | Low | Multi-line long answer |
| **Email** | `<Input type="email">` | Required, email format regex | string | Low | Standard email validation built-in |
| **Dropdown** | `<Select>` (shadcn) | Required, valid option | string | Low | Options configured in builder UI |
| **File Upload** | Custom component | Required, file types, max size | Convex file ID (string) | Medium | Convex storage integration required |
| **Date** | Date picker or native | Required, min/max date | string (ISO 8601) | Low | Consider native `<input type="date">` for simplicity |
| **Number** | `<Input type="number">` | Required, min/max value, integer only | number | Low | Numeric validation |
| **Checkbox** | `<Checkbox>` (shadcn) | Required (must be checked) | boolean | Low | Single checkbox, not checkbox group |

### Field Schema Design

Each field should store:
```typescript
interface FormField {
  id: string;           // Unique identifier
  type: FieldType;      // "text" | "textarea" | "email" | "dropdown" | "file" | "date" | "number" | "checkbox"
  label: string;        // Question text
  placeholder?: string; // Hint text
  helpText?: string;    // Additional guidance
  required: boolean;    // Validation flag
  order: number;        // Position in form
  config: FieldConfig;  // Type-specific config (options for dropdown, etc.)
}
```

---

## Feature Dependencies

```
                    Form Schema Design
                           |
              +------------+------------+
              |                         |
       Field Types              Form Versioning
              |                         |
    +---------+---------+              |
    |         |         |              |
 Text   Dropdown   File Upload    Snapshot on Submit
  |         |         |                 |
  +----+----+         |                 |
       |              |                 |
  Field Config   Convex Storage         |
       |              |                 |
       +------+-------+-----------------+
              |
         Form Builder UI
              |
    +---------+---------+
    |         |         |
 DnD Panel  Preview  Config Panel
              |
         Form Save/Load
              |
    +---------+---------+
    |                   |
Form Management      Unique URLs
    |                   |
Admin Dashboard     Public Rendering
```

### Critical Path

1. **Form schema design** (what is a form, what is a field) - blocks everything
2. **Basic field types** (text, textarea, email, dropdown) - minimum viable
3. **Form builder UI with DnD** - core functionality
4. **Form save/persistence** - usable forms
5. **Public form rendering at unique URLs** - complete loop
6. **Submission storage with version reference** - data integrity
7. **Extended field types** (file, date, number, checkbox) - full feature set

---

## MVP Recommendation

### Must Have (Core v1.2)

| Priority | Feature | Rationale |
|----------|---------|-----------|
| 1 | Form schema (forms table, fields as JSON array) | Foundation for everything |
| 2 | Form builder page in admin dashboard | Where admins create forms |
| 3 | Drag-and-drop field placement | Expected UX pattern |
| 4 | Core field types: text, textarea, email, dropdown | Covers most use cases |
| 5 | Field configuration: label, placeholder, required, help text | Essential field options |
| 6 | Real-time preview while building | See what you're creating |
| 7 | Form save with slug generation | Persistence and URLs |
| 8 | Unique public URLs (`/apply/[slug]`) | Share forms |
| 9 | Public form rendering (Typeform-style) | User-facing forms |
| 10 | Form versioning on submission | Data integrity |
| 11 | Form management in admin (list, edit, delete) | CRUD operations |

### Should Have (Complete v1.2)

| Priority | Feature | Rationale |
|----------|---------|-----------|
| 12 | Extended field types: number, date, checkbox | Requested types |
| 13 | File upload with Convex storage | Explicitly requested |
| 14 | Form status (draft/published/archived) | Lifecycle management |
| 15 | Form duplication | Quick form creation |
| 16 | Per-form submission filtering in admin | Organized data view |
| 17 | Dropdown option management UI | Usable dropdown config |

### Defer to Post-v1.2

| Feature | Reason to Defer |
|---------|-----------------|
| Form version history UI | Core versioning works; viewing history is nice-to-have |
| Advanced validation (regex, custom messages) | Basic required/type validation is sufficient |
| Field grouping/sections in builder | Linear field list is simpler |
| Form analytics | Focus on builder, not metrics |
| Bulk form operations | Unlikely many forms at once |

---

## Complexity Estimates

| Feature Area | Complexity | Rationale |
|--------------|------------|-----------|
| Form schema design | Low | Well-understood pattern; Convex makes this straightforward |
| Drag-and-drop UI | Medium | Library handles heavy lifting; integration and polish take effort |
| Field configuration panel | Low | Standard form/state management |
| File upload | Medium | Convex storage is documented but new integration for this project |
| Form versioning | Medium | Requires careful schema design upfront; snapshot on submit |
| Public form rendering | Low | Reuse existing Typeform-style components |
| Admin integration | Low | Existing dashboard patterns to follow; add sidebar link |
| Dropdown option management | Low | Array manipulation in config panel |

---

## Integration with Existing Features

| Existing Feature | How Form Builder Integrates |
|------------------|------------------------------|
| **Typeform-style form UX** | Public forms reuse existing step-by-step pattern; new renderer reads field config |
| **Admin dashboard** | Form builder is new page in admin; forms list in sidebar or tab |
| **Submission table** | Add form name column; filter by form; show form version in detail |
| **Detail panel** | Shows submission data labeled by form field labels at time of submission |
| **Inline editing** | Works with dynamic fields; uses field type for appropriate input |
| **Edit history** | Extends to track form definition changes (optional enhancement) |
| **Convex backend** | New tables: `forms`, maybe `formVersions`; extends `applications` with form reference |

---

## Form Builder UI Patterns

Based on industry research, the standard layout:

```
+--------------------------------------------------+
|  Form Builder: [Form Title]           [Preview] [Save] |
+--------------------------------------------------+
|                    |                              |
|   Field Palette    |      Form Canvas            |  Field Config
|                    |                              |
|   [Text]           |   [Field 1: Email]          |  Label: ___
|   [Textarea]       |   [Field 2: Name]           |  Placeholder: ___
|   [Email]          |   [Field 3: Floor Choice]   |  Required: [x]
|   [Dropdown]       |   [Field 4: Description]    |  Help text: ___
|   [File]           |                              |
|   [Date]           |   + Add Field               |  (shown when field
|   [Number]         |                              |   selected)
|   [Checkbox]       |                              |
|                    |                              |
+--------------------------------------------------+
```

**Key interactions:**
1. Drag field type from palette to canvas (or click to append)
2. Click field on canvas to select and show config panel
3. Drag fields on canvas to reorder
4. Real-time preview updates as changes are made
5. Save button persists to database

---

## Sources

### Form Builder Patterns
- [Buildform - Types of Form Fields](https://buildform.ai/blog/types-of-form-fields/) - Comprehensive field type overview
- [Elementor - Advanced Form Fields](https://elementor.com/blog/advanced-form-fields/) - File upload, date picker patterns
- [Jotform - Quick Overview of Form Fields](https://www.jotform.com/help/46-quick-overview-of-form-fields/) - Field type reference
- [Fillout - Field Types](https://www.fillout.com/help/question-types) - Modern field type catalog

### Drag-and-Drop UX
- [Formester - Drag and Drop Form Builder](https://formester.com/features/drag-and-drop-form-builder/) - UI patterns
- [FormEngine - Open-Source Form Builder](https://formengine.io/) - React implementation patterns
- [Seven Square Tech - Drag Drop Form Builder ReactJS](https://www.sevensquaretech.com/dynamic-drag-drop-form-builder-reactjs-github-code/) - Technical reference

### Schema Versioning
- [MongoDB - Schema Versioning Pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-schema-versioning-pattern) - Version field approach
- [Enterprise Craftsmanship - Database Versioning](https://enterprisecraftsmanship.com/posts/database-versioning-best-practices/) - Best practices
- [Cosmos DB - Schema Versioning](https://devblogs.microsoft.com/cosmosdb/azure-cosmos-db-design-patterns-part-9-schema-versioning/) - Document versioning patterns

### Anti-Patterns and Mistakes
- [Formsort - 10 Common Form Building Mistakes](https://formsort.com/article/10-common-form-building-mistakes/) - What to avoid
- [Cursor - Avoiding Anti-Patterns in Forms](https://cursor.co.uk/blog/avoiding-anti-patterns-in-forms/) - Design anti-patterns
- [FormAssembly - Form Building Mistakes](https://www.formassembly.com/blog/form-building-mistakes/) - Common errors

### Conditional Logic (Reference for Anti-Feature Decision)
- [SurveyJS - Conditional Logic and Branching](https://surveyjs.io/form-library/examples/conditional-logic-and-branching-in-surveys/reactjs) - Complexity example
- [Wufoo - Conditional Logic and Branching](https://www.wufoo.com/guides/conditional-logic-and-branching/) - Feature scope example
- [involve.me - Form Builders with Conditional Logic 2026](https://www.involve.me/blog/best-form-builders-with-conditional-logic) - Market reference

### Competitor Analysis
- [Typeform vs Google Forms 2026](https://www-cdn.involve.me/blog/typeform-vs-google-forms) - Feature comparison
- [Fillout - Form Builder Comparison 2026](https://www.fillout.com/form-builder-comparison) - Market landscape
- [Best Form Builders 2026](https://www.inkl.com/news/best-form-builders-in-2026) - Current market
