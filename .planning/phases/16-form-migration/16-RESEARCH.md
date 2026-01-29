# Phase 16: Form Migration - Research

**Researched:** 2026-01-29
**Domain:** Next.js route migration, dynamic form configuration
**Confidence:** HIGH

## Summary

Phase 16 migrates the legacy `/apply` form to the dynamic form system built in v1.2. This is primarily a configuration task rather than a code development task - the dynamic form infrastructure is already complete and battle-tested.

The migration requires:
1. Creating a dynamic form with 19 fields matching the original application structure
2. Organizing fields into 5 steps matching the original UX (Applicant Info, Proposal, Roadmap, Impact, Logistics)
3. Updating the `/apply` route to serve the dynamic form instead of the hardcoded form

**Primary recommendation:** Create the form via admin UI with exact field configurations matching the original schema, then update `/apply/page.tsx` to redirect to or render the dynamic form.

## Standard Stack

No new libraries required. This phase uses existing infrastructure:

### Core (Already in Place)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | 16 | App Router for routes | Existing |
| Convex | Latest | Dynamic form storage | Existing |
| Zod | v4 | Dynamic validation | Existing |
| Zustand | Latest | Form state persistence | Existing |

### Existing Infrastructure
| Component | Location | Purpose |
|-----------|----------|---------|
| DynamicFormPage | `/src/components/dynamic-form/DynamicFormPage.tsx` | Container with data fetching |
| DynamicFormRenderer | `/src/components/dynamic-form/DynamicFormRenderer.tsx` | Form logic and validation |
| Form Builder | `/admin/forms/[formId]` | Admin UI for form creation |
| forms.ts | `/convex/forms.ts` | Form CRUD operations |
| submissions.ts | `/convex/submissions.ts` | Submission handling |

## Architecture Patterns

### Pattern 1: Create Form via Admin UI

**What:** Use the existing form builder to create the Floor Lead Application form rather than seeding via code.

**Why this pattern:**
- Form builder is already production-ready
- Validates all field configurations automatically
- Creates immutable version on publish
- Admin can adjust fields post-launch without code changes

**Process:**
1. Navigate to `/admin/forms/new`
2. Create form with name "Floor Lead Application" and slug "floor-lead"
3. Add 5 steps matching original structure
4. Configure each field with validation rules
5. Publish form

### Pattern 2: Route Redirection

**What:** Update `/apply/page.tsx` to redirect to the dynamic form at `/apply/floor-lead`.

**Why this pattern:**
- Preserves the clean `/apply` URL
- No code duplication
- Leverages existing dynamic form infrastructure
- Form updates automatically when admin publishes new versions

**Example:**
```typescript
// src/app/apply/page.tsx
import { redirect } from "next/navigation";

export default function ApplyPage() {
  redirect("/apply/floor-lead");
}
```

### Alternative Pattern: Inline Dynamic Form

**What:** Render DynamicFormPage directly at `/apply` with a hardcoded slug.

**Why this might be preferred:**
- Avoids redirect overhead
- URL stays as `/apply` in browser

**Example:**
```typescript
// src/app/apply/page.tsx
import { DynamicFormPage } from "@/components/dynamic-form/DynamicFormPage";

export default function ApplyPage() {
  return <DynamicFormPage slug="floor-lead" />;
}
```

### Recommended Project Structure

No new files required. Modifications only:

```
src/app/apply/
  page.tsx          # MODIFY: Replace legacy form with dynamic form
  [slug]/page.tsx   # KEEP: Existing dynamic form route
```

### Anti-Patterns to Avoid

- **Creating a seed script:** The form builder exists for this purpose - don't write code to insert form data directly into Convex
- **Duplicating validation logic:** The dynamic form system already generates Zod schemas from field config
- **Custom welcome/review components:** The dynamic form system has generic versions that auto-populate from schema

## Don't Hand-Roll

Problems that the existing system already solves:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form schema storage | Custom JSON structure | Existing FormSchema type | Already validated, versioned |
| Field validation | Custom Zod schemas | buildFormSchema() | Generates from field config |
| localStorage persistence | Custom hooks | useDynamicFormStore | Already handles draft locking |
| Step navigation | Custom state machine | DynamicFormRenderer | Already handles welcome/content/review/confirmation flow |
| Review step generation | Custom ReviewStep | DynamicReview | Auto-generates from schema |

**Key insight:** The v1.2 dynamic form system was specifically designed to replace hardcoded forms. All infrastructure exists.

## Field Mapping Reference

The legacy form has 19 fields across 5 steps. Here is the exact mapping to dynamic form configuration:

### Step 1: Applicant Info (5 fields)

| Legacy Field | Type | Label | Required | Validation |
|-------------|------|-------|----------|------------|
| fullName | text | Full Name | Yes | - |
| email | email | Email | Yes | Email validation |
| linkedIn | url | LinkedIn Profile | No | URL validation |
| role | text | Current Role | Yes | - |
| bio | textarea | Bio | Yes | - |

### Step 2: Proposal (6 fields)

| Legacy Field | Type | Label | Required | Validation | Options |
|-------------|------|-------|----------|------------|---------|
| floor | select | Which floor? | Yes | - | 10 floor options |
| initiativeName | text | Initiative Name | Yes | - | - |
| tagline | text | Tagline | Yes | maxLength: 100 | - |
| values | textarea | Core Values | Yes | - | - |
| targetCommunity | textarea | Target Community | Yes | - | - |
| estimatedSize | select | Estimated Community Size | Yes | - | 5 size options |

**Floor Options (from `/lib/constants/floors.ts`):**
1. Floor 4 - Robotics & Hard Tech
2. Floor 5 - Movement Floor & Fitness Center
3. Floor 6 - Arts & Music
4. Floor 7 - Frontier Maker Space
5. Floor 8 - Neuro & Biotech
6. Floor 9 - AI & Autonomous Systems
7. Floor 10 - Frontier @ Accelerate
8. Floor 11 - Health & Longevity
9. Floor 12 - Ethereum & Decentralized Tech
10. Floor 13 - Ethereum & Decentralized Tech

**Estimated Size Options:**
1. 1-10 members
2. 11-25 members
3. 26-50 members
4. 51-100 members
5. 100+ members

### Step 3: Roadmap (3 fields)

| Legacy Field | Type | Label | Required | Validation |
|-------------|------|-------|----------|------------|
| phase1Mvp | textarea | Phase 1: MVP (First 3 months) | Yes | - |
| phase2Expansion | textarea | Phase 2: Expansion (3-6 months) | Yes | - |
| phase3LongTerm | textarea | Phase 3: Long-term Vision (6+ months) | Yes | - |

### Step 4: Impact (1 field)

| Legacy Field | Type | Label | Required | Validation |
|-------------|------|-------|----------|------------|
| benefitToFT | textarea | Benefit to Frontier Tower Members | Yes | - |

### Step 5: Logistics (4 fields)

| Legacy Field | Type | Label | Required | Validation |
|-------------|------|-------|----------|------------|
| existingCommunity | textarea | Existing Community | Yes | - |
| spaceNeeds | textarea | Space Requirements | Yes | - |
| startDate | date | Preferred Start Date | Yes | - |
| additionalNotes | textarea | Additional Notes | No | - |

## Common Pitfalls

### Pitfall 1: Missing Field Descriptions

**What goes wrong:** Fields created without help text lose the UX polish of the original form.
**Why it happens:** Rushing through form creation in the builder.
**How to avoid:** Reference original step components for exact placeholder text and descriptions.
**Warning signs:** Dynamic form feels less polished than legacy form.

**Original descriptions to preserve:**
- Email: "We'll use this to contact you about your application"
- Role: "Your current professional role or title"
- Bio: "Tell us what makes you uniquely qualified"
- Floor: "Select the floor for your initiative"
- Initiative Name: "A memorable name for your floor community"
- Tagline: "Maximum 100 characters"
- etc.

### Pitfall 2: Wrong Slug Choice

**What goes wrong:** Using a slug that conflicts with reserved routes or is hard to type.
**Why it happens:** Not checking the reserved slugs list in `convex/forms.ts`.
**How to avoid:** Use "floor-lead" or similar descriptive, short slug.
**Warning signs:** 404 errors, confusion with other routes.

**Reserved slugs (cannot be used):**
- admin, api, apply, login, logout, auth, _next

### Pitfall 3: Forgetting to Publish

**What goes wrong:** Form created but stays in draft status, `/apply` shows "Form Not Found".
**Why it happens:** Creating form but not clicking Publish in admin UI.
**How to avoid:** Always publish form after creation. Verify form is accessible at `/apply/[slug]` before updating route.
**Warning signs:** Form shows in admin list but "Form Not Found" on public page.

### Pitfall 4: localStorage Conflict

**What goes wrong:** Users with legacy localStorage drafts may have issues.
**Why it happens:** Legacy form uses `ft-form-draft` key, dynamic forms use `ft-dynamic-form-drafts`.
**How to avoid:** This is actually fine - they use different storage keys. No action needed.
**Note:** Legacy drafts will be orphaned but won't interfere with new system.

## Code Examples

### Route Update (Redirect Pattern)

```typescript
// src/app/apply/page.tsx
import { redirect } from "next/navigation";

/**
 * Legacy /apply route - redirects to dynamic form
 *
 * The Floor Lead Application form is now served as a dynamic form
 * at /apply/floor-lead. This redirect preserves the /apply URL
 * for users who have it bookmarked.
 */
export default function ApplyPage() {
  redirect("/apply/floor-lead");
}
```

### Route Update (Inline Pattern)

```typescript
// src/app/apply/page.tsx
import { DynamicFormPage } from "@/components/dynamic-form/DynamicFormPage";

/**
 * Floor Lead Application - served via dynamic form system
 *
 * Uses the existing DynamicFormPage component with hardcoded slug.
 * Form configuration is managed via admin form builder.
 */
export default function ApplyPage() {
  return <DynamicFormPage slug="floor-lead" />;
}
```

### Form Schema Reference (for manual creation if needed)

The form schema should look like this when created via admin UI:

```json
{
  "steps": [
    {
      "id": "step_1",
      "title": "Applicant Info",
      "description": "Tell us about yourself",
      "fields": [
        { "id": "fullName", "type": "text", "label": "Full Name", "required": true },
        { "id": "email", "type": "email", "label": "Email", "required": true },
        { "id": "linkedIn", "type": "url", "label": "LinkedIn Profile", "required": false },
        { "id": "role", "type": "text", "label": "Current Role", "required": true },
        { "id": "bio", "type": "textarea", "label": "Bio", "required": true }
      ]
    },
    // ... additional steps
  ],
  "settings": {
    "submitButtonText": "Submit Application",
    "successMessage": "Thank you for your application! We'll be in touch soon."
  }
}
```

## State of the Art

| Old Approach (Legacy) | Current Approach (v1.2+) | Changed In | Impact |
|----------------------|--------------------------|------------|--------|
| Hardcoded form components | Schema-driven rendering | v1.2 | Forms configurable without code |
| Zod schema files | Dynamic Zod from field config | v1.2 | Validation matches schema |
| Single localStorage key | Per-form drafts with version lock | v1.2 | Better draft isolation |
| Fixed 8 steps | Dynamic step count | v1.2 | Steps configurable per form |

**Current best practice:** All new forms should use the dynamic form system. Legacy hardcoded forms should be migrated.

## Open Questions

1. **Welcome screen customization**
   - What we know: DynamicWelcome shows form name and generic text
   - What's unclear: Should Floor Lead Application have custom welcome text matching original?
   - Recommendation: The generic text is fine for MVP. Custom welcome text could be added to FormSettings if needed in future.

2. **Form slug choice**
   - What we know: Slug must be unique and not reserved
   - Options: "floor-lead", "floor-lead-application", "apply-floor-lead"
   - Recommendation: Use "floor-lead" - short, descriptive, memorable

3. **Redirect vs Inline**
   - What we know: Both patterns work correctly
   - Tradeoff: Redirect adds HTTP round-trip but is more explicit; Inline is faster but couples route to specific slug
   - Recommendation: Inline pattern - cleaner UX, no redirect in browser history

## Sources

### Primary (HIGH confidence)
- `/convex/schema.ts` - Legacy applications table with 19 fields
- `/convex/forms.ts` - Dynamic form CRUD and reserved slugs
- `/src/lib/schemas/application.ts` - Legacy Zod schemas with field definitions
- `/src/components/form/steps/*.tsx` - Original field labels, descriptions, placeholders
- `/src/types/form-schema.ts` - FormSchema type definition
- `/src/lib/schemas/dynamic-form.ts` - Dynamic Zod schema builder

### Secondary (MEDIUM confidence)
- `/src/lib/constants/floors.ts` - Floor dropdown options

## Metadata

**Confidence breakdown:**
- Field mapping: HIGH - Direct code inspection of legacy schema and components
- Route patterns: HIGH - Standard Next.js redirect/component patterns
- Form builder usage: HIGH - Existing admin UI documentation in codebase
- UX parity: MEDIUM - May need testing to verify feel matches original

**Research date:** 2026-01-29
**Valid until:** Indefinite - this is migration documentation for stable existing code
