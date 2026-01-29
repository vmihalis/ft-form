# Phase 18: Export - Research

**Researched:** 2026-01-29
**Domain:** CSV export for form submissions with filtering
**Confidence:** HIGH

## Summary

Phase 18 implements CSV export functionality for the admin submissions view. The research reveals that client-side CSV generation is the standard approach for this use case, using the Blob API to create downloadable files directly in the browser without server roundtrips.

The project already has all required infrastructure: TanStack Table (provides filtered row access via `getFilteredRowModel()`), shadcn/ui Select components (for status filtering), and native HTML date inputs (for date range filtering). No new dependencies are required.

**Primary recommendation:** Implement pure JavaScript CSV export using Blob API, leveraging TanStack Table's built-in filtering. Add status and date range filter UI above the submissions table, then export respects whatever filters are active.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | ^8.21.3 | Table state with filtering | Already in project; `getFilteredRowModel()` provides filtered rows |
| Native Blob API | Browser built-in | CSV file generation | No dependencies, RFC 4180 compliant with proper escaping |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Select | Installed | Status filter dropdown | Use existing FormFilter pattern |
| shadcn/ui Input | Installed | Date range inputs | Native type="date" already used in project |
| lucide-react | ^0.563.0 | Download icon | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native Blob | PapaParse/react-papaparse | Overkill for simple export; adds ~50KB bundle |
| Native Blob | export-to-csv library | Unnecessary abstraction; native API is sufficient |
| Native date input | react-day-picker + Calendar | Requires new deps; native input sufficient for date range |

**Installation:**
```bash
# No new dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/admin/
│   ├── SubmissionsTable.tsx       # Add filter controls + export button
│   ├── SubmissionsFilters.tsx     # NEW: Status + date range filters
│   ├── ExportButton.tsx           # NEW: CSV export trigger
│   └── submissions-columns.tsx    # Existing column definitions
├── lib/
│   └── csv-export.ts              # NEW: CSV generation utilities
convex/
└── submissions.ts                 # Add listForExport query
```

### Pattern 1: Client-Side CSV Generation with Blob API
**What:** Generate CSV string from JavaScript array, create Blob, trigger download
**When to use:** Exporting tabular data under ~50,000 rows
**Example:**
```typescript
// Source: RFC 4180, MDN Blob documentation
function downloadCSV(data: Record<string, unknown>[], filename: string, headers: string[]) {
  // Build CSV with proper escaping
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => escapeCSVField(row[header])).join(',')
    )
  ];

  const csvString = '\ufeff' + csvRows.join('\r\n'); // BOM for Excel UTF-8
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Pattern 2: TanStack Table Filtered Row Access
**What:** Use table instance to get currently filtered rows
**When to use:** When export should respect active table filters
**Example:**
```typescript
// Source: TanStack Table documentation, GitHub discussion #4684
function handleExport(table: Table<SubmissionRow>) {
  // Gets rows after all filters applied, before pagination
  const filteredRows = table.getPrePaginationRowModel().rows;

  // Or get current page only
  const currentPageRows = table.getRowModel().rows;

  // Access original data
  const data = filteredRows.map(row => row.original);
}
```

### Pattern 3: RFC 4180 CSV Field Escaping
**What:** Properly escape fields containing commas, quotes, or newlines
**When to use:** Any CSV export with user-generated content
**Example:**
```typescript
// Source: RFC 4180 specification
function escapeCSVField(value: unknown): string {
  const stringValue = value == null ? '' : String(value);

  // Check if escaping needed
  const needsEscaping =
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r');

  if (needsEscaping) {
    // Double quotes inside quoted string
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringValue;
}
```

### Anti-Patterns to Avoid
- **Manual string concatenation without escaping:** User content may contain commas, breaking CSV structure
- **Forgetting UTF-8 BOM:** Excel may not display special characters correctly
- **Not revoking Object URL:** Memory leak when creating many downloads
- **Server-side CSV generation for small datasets:** Unnecessary complexity and latency

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV field escaping | Simple `.join(',')` | RFC 4180 escaping function | User data with commas breaks CSV |
| Filtered rows | Custom filtering logic | `table.getFilteredRowModel()` | TanStack Table already tracks filter state |
| File download | Server endpoint | Blob + createObjectURL | Client-side is simpler, no server load |
| Status filtering | New backend query | Column filter on existing query | Already works with current data flow |

**Key insight:** The project's existing TanStack Table implementation already handles filtering - export just needs to access the filtered rows and format as CSV.

## Common Pitfalls

### Pitfall 1: Forgetting RFC 4180 Escaping
**What goes wrong:** CSV breaks when submission data contains commas or quotes
**Why it happens:** Developers use simple `.join(',')` without considering field content
**How to avoid:** Always wrap field values with escapeCSVField() before joining
**Warning signs:** Exported CSV has wrong column alignment when opened in Excel

### Pitfall 2: Excel UTF-8 Encoding Issues
**What goes wrong:** Special characters (accents, emojis) display as garbage in Excel
**Why it happens:** Excel doesn't auto-detect UTF-8 encoding
**How to avoid:** Prepend UTF-8 BOM ('\ufeff') to CSV string
**Warning signs:** Opening CSV in Excel shows "?" or garbled characters

### Pitfall 3: Memory Leak from Object URLs
**What goes wrong:** Browser memory grows with each export
**Why it happens:** Object URLs hold references until explicitly revoked
**How to avoid:** Call `URL.revokeObjectURL(url)` after download starts
**Warning signs:** Browser tab memory increases after multiple exports

### Pitfall 4: Date Range Filter Logic Errors
**What goes wrong:** Filtering by "after January 15" excludes January 15 submissions
**Why it happens:** Off-by-one errors with date comparisons, timezone issues
**How to avoid:**
- Use `>=` for "after" date (inclusive)
- Use `<=` for "before" date with end-of-day time
- Compare timestamps, not date strings
**Warning signs:** Edge-case dates sometimes included, sometimes excluded

### Pitfall 5: Dynamic Schema Column Headers
**What goes wrong:** CSV headers are field IDs instead of human-readable labels
**Why it happens:** Submission data uses fieldId as keys, not labels
**How to avoid:** Join submission data with form schema to get field labels for headers
**Warning signs:** CSV headers like "field_abc123" instead of "Full Name"

## Code Examples

Verified patterns from official sources:

### Complete CSV Export Utility
```typescript
// lib/csv-export.ts
// Source: RFC 4180 specification, MDN Blob API

type SubmissionExportData = {
  id: string;
  formName: string;
  status: string;
  submittedAt: Date;
  [fieldLabel: string]: unknown;
};

export function escapeCSVField(value: unknown): string {
  const stringValue = value == null ? '' : String(value);

  const needsEscaping =
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r');

  if (needsEscaping) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function generateCSV(
  data: SubmissionExportData[],
  headers: { key: string; label: string }[]
): string {
  const headerRow = headers.map(h => escapeCSVField(h.label)).join(',');

  const dataRows = data.map(row =>
    headers.map(h => escapeCSVField(row[h.key])).join(',')
  );

  // UTF-8 BOM + CRLF line endings (RFC 4180)
  return '\ufeff' + [headerRow, ...dataRows].join('\r\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up to prevent memory leak
  URL.revokeObjectURL(url);
}
```

### Status Filter Component (Pattern Match)
```typescript
// Source: Existing FormFilter.tsx pattern in project
interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

export function StatusFilter({ value, onValueChange }: StatusFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Date Range Filter Component
```typescript
// Source: Native HTML date input, project pattern
interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="w-[150px]"
        aria-label="Start date"
      />
      <span className="text-muted-foreground">to</span>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="w-[150px]"
        aria-label="End date"
      />
    </div>
  );
}
```

### Export with Schema-Driven Headers
```typescript
// Source: Project pattern from SubmissionSheet.tsx
async function prepareExportData(
  submissions: SubmissionRow[],
  getSubmissionWithSchema: (id: string) => Promise<SubmissionWithSchema | null>
) {
  // Get first submission to determine schema/headers
  const firstWithSchema = await getSubmissionWithSchema(submissions[0]._id);
  if (!firstWithSchema) return { data: [], headers: [] };

  const { schema } = firstWithSchema;

  // Build headers from schema fields
  const fieldHeaders = schema.steps.flatMap(step =>
    step.fields.map(field => ({
      key: field.id,
      label: field.label,
    }))
  );

  const headers = [
    { key: 'status', label: 'Status' },
    { key: 'submittedAt', label: 'Submitted Date' },
    ...fieldHeaders,
  ];

  // Fetch full data for each submission
  const data = await Promise.all(
    submissions.map(async (sub) => {
      const full = await getSubmissionWithSchema(sub._id);
      return {
        status: sub.status,
        submittedAt: new Date(sub.submittedAt).toISOString(),
        ...(full?.submission.data || {}),
      };
    })
  );

  return { data, headers };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side CSV generation | Client-side Blob API | ~2020 | No server load, instant download |
| FileSaver.js library | Native Blob + anchor download | 2018+ | No dependency needed |
| Manual CSV escaping | Library (PapaParse) or proper RFC 4180 | Always | Prevents data corruption |

**Deprecated/outdated:**
- `execCommand('SaveAs')` - Deprecated, use Blob API
- `encodeURI` for data URLs - Has 1MB limit in Chrome, use createObjectURL

## Open Questions

Things that couldn't be fully resolved:

1. **Large dataset performance**
   - What we know: Blob API handles datasets under 50K rows well; project likely has < 1000 submissions
   - What's unclear: Exact performance ceiling for this specific use case
   - Recommendation: Implement basic approach; add pagination/streaming only if performance issues arise

2. **Form-specific vs all-forms export**
   - What we know: Requirements say "all submissions for a form" (EXPORT-01)
   - What's unclear: Should export button be form-scoped or table-scoped?
   - Recommendation: Filter by form first, then export. Use existing FormFilter to scope.

## Sources

### Primary (HIGH confidence)
- RFC 4180 specification - CSV format rules, escaping
- MDN Blob API documentation - File download pattern
- TanStack Table documentation - getFilteredRowModel(), getPrePaginationRowModel()
- Project codebase - Existing patterns (FormFilter, SubmissionsTable, TanStack Table usage)

### Secondary (MEDIUM confidence)
- [TanStack Table GitHub Discussion #4684](https://github.com/TanStack/table/discussions/4684) - Filtered data export patterns
- [GeeksforGeeks CSV export guide](https://www.geeksforgeeks.org/javascript/how-to-create-and-download-csv-file-in-javascript/) - Implementation examples
- [DEV article on React CSV export](https://dev.to/graciesharma/implementing-csv-data-export-in-react-without-external-libraries-3030) - No-dependency pattern

### Tertiary (LOW confidence)
- N/A - All findings verified with authoritative sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project dependencies
- Architecture: HIGH - Follows established project patterns
- Pitfalls: HIGH - RFC 4180 is well-documented standard

**Research date:** 2026-01-29
**Valid until:** 90 days (stable domain, no fast-moving dependencies)
