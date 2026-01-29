/**
 * CSV Export Utilities
 *
 * RFC 4180-compliant CSV generation with UTF-8 BOM for Excel compatibility.
 *
 * @example
 * ```typescript
 * const data = [{ name: 'John', email: 'john@example.com' }];
 * const headers = [{ key: 'name', label: 'Full Name' }, { key: 'email', label: 'Email Address' }];
 * const csv = generateCSV(data, headers);
 * downloadCSV(csv, 'export.csv');
 * ```
 */

/**
 * Escapes a value for CSV output per RFC 4180.
 * - Converts null/undefined to empty string
 * - Wraps in double quotes if value contains comma, quote, newline, or carriage return
 * - Escapes internal quotes by doubling them
 */
export function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check if the value needs quoting (contains comma, quote, newline, or carriage return)
  if (/[,"\r\n]/.test(stringValue)) {
    // Escape internal quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export interface CSVHeader {
  key: string;
  label: string;
}

/**
 * Generates a CSV string from data and headers.
 * - Prepends UTF-8 BOM for Excel compatibility
 * - Uses CRLF line endings per RFC 4180
 * - Escapes all fields properly
 */
export function generateCSV(
  data: Record<string, unknown>[],
  headers: CSVHeader[]
): string {
  // UTF-8 BOM for Excel compatibility
  const BOM = "\ufeff";

  // Build header row
  const headerRow = headers.map((h) => escapeCSVField(h.label)).join(",");

  // Build data rows
  const dataRows = data.map((record) =>
    headers.map((h) => escapeCSVField(record[h.key])).join(",")
  );

  // Combine with CRLF line endings per RFC 4180
  return BOM + [headerRow, ...dataRows].join("\r\n");
}

/**
 * Triggers a browser download of CSV content.
 * - Creates a Blob with proper MIME type
 * - Uses anchor element click for download
 * - Cleans up object URL to prevent memory leak
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create blob with UTF-8 encoding
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

  // Create object URL
  const url = URL.createObjectURL(blob);

  // Create and configure anchor element
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
