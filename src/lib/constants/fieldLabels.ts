/**
 * Maps technical field names to human-readable labels.
 * Used in EditHistory timeline display (HIST-04).
 * Labels sourced from ApplicationSheet EditableField labels.
 */
export const FIELD_LABELS: Record<string, string> = {
  // Applicant Info
  fullName: "Name",
  email: "Email",
  linkedIn: "LinkedIn",
  role: "Role",
  bio: "Bio",
  // Proposal
  floor: "Floor",
  initiativeName: "Initiative Name",
  tagline: "Tagline",
  values: "Core Values",
  targetCommunity: "Target Community",
  estimatedSize: "Estimated Community Size",
  additionalNotes: "Additional Notes",
  // Roadmap
  phase1Mvp: "Phase 1: MVP (First 3 months)",
  phase2Expansion: "Phase 2: Expansion (3-6 months)",
  phase3LongTerm: "Phase 3: Long-term (6+ months)",
  // Impact
  benefitToFT: "Benefit to Frontier Tower",
  // Logistics
  existingCommunity: "Existing Community",
  spaceNeeds: "Space Needs",
  startDate: "Earliest Start Date",
};

/**
 * Get human-readable label for a field name.
 * Falls back to field name if not found.
 */
export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}
