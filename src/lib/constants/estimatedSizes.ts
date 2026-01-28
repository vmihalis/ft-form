/**
 * Estimated community size options for the floor lead application.
 * Used in ProposalStep dropdown and EditableField select variant.
 */
export const ESTIMATED_SIZES = [
  { value: "1-10", label: "1-10 members" },
  { value: "11-25", label: "11-25 members" },
  { value: "26-50", label: "26-50 members" },
  { value: "51-100", label: "51-100 members" },
  { value: "100+", label: "100+ members" },
] as const;

// Type for estimated size values
export type EstimatedSizeValue = (typeof ESTIMATED_SIZES)[number]["value"];

/**
 * Helper to get estimated size label from value
 */
export function getEstimatedSizeLabel(value: string): string {
  const size = ESTIMATED_SIZES.find((s) => s.value === value);
  return size?.label ?? value;
}
