import { z } from "zod";
import { combinedApplicationSchema } from "@/lib/schemas/application";

// Inferred type from combined Zod schema
export type ApplicationFormData = z.infer<typeof combinedApplicationSchema>;

// Form step identifiers (0-7)
export type FormStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Total number of steps
export const TOTAL_STEPS = 8;

// Step metadata for navigation and display
export interface StepInfo {
  id: FormStep;
  label: string;
  hasValidation: boolean;
}

export const FORM_STEPS: StepInfo[] = [
  { id: 0, label: "Welcome", hasValidation: false },
  { id: 1, label: "Applicant Info", hasValidation: true },
  { id: 2, label: "Proposal", hasValidation: true },
  { id: 3, label: "Roadmap", hasValidation: true },
  { id: 4, label: "Impact", hasValidation: true },
  { id: 5, label: "Logistics", hasValidation: true },
  { id: 6, label: "Review", hasValidation: false },
  { id: 7, label: "Confirmation", hasValidation: false },
];
