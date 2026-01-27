import { z } from "zod";

// Step 1: Applicant Info
export const applicantInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  linkedIn: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  role: z.string().min(1, "Role is required"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
});

// Step 2: Proposal
export const proposalSchema = z.object({
  floor: z.string().min(1, "Please select a floor"),
  floorOther: z.string().optional(),
  initiativeName: z.string().min(1, "Initiative name is required"),
  tagline: z.string().min(1, "Tagline is required").max(100, "Tagline must be 100 characters or less"),
  values: z.string().min(20, "Values must be at least 20 characters"),
  targetCommunity: z.string().min(20, "Target community must be at least 20 characters"),
  estimatedSize: z.string().min(1, "Estimated size is required"),
});

// Step 3: Roadmap
export const roadmapSchema = z.object({
  phase1Mvp: z.string().min(50, "Phase 1 MVP must be at least 50 characters"),
  phase2Expansion: z.string().min(50, "Phase 2 Expansion must be at least 50 characters"),
  phase3LongTerm: z.string().min(50, "Phase 3 Long-term must be at least 50 characters"),
});

// Step 4: Impact
export const impactSchema = z.object({
  benefitToFT: z.string().min(50, "Benefit to FT must be at least 50 characters"),
});

// Step 5: Logistics
export const logisticsSchema = z.object({
  existingCommunity: z.string().min(1, "Please describe your existing community"),
  spaceNeeds: z.string().min(1, "Please describe your space needs"),
  startDate: z.string().min(1, "Start date is required"),
  additionalNotes: z.string().optional(),
});

// Combined schema for full form validation
export const combinedApplicationSchema = applicantInfoSchema
  .merge(proposalSchema)
  .merge(roadmapSchema)
  .merge(impactSchema)
  .merge(logisticsSchema);

// Step schemas array (index matches step number)
// null for steps without form validation (Welcome=0, Review=6, Confirmation=7)
export const stepSchemas: (z.ZodSchema | null)[] = [
  null, // 0: Welcome
  applicantInfoSchema, // 1: Applicant Info
  proposalSchema, // 2: Proposal
  roadmapSchema, // 3: Roadmap
  impactSchema, // 4: Impact
  logisticsSchema, // 5: Logistics
  null, // 6: Review
  null, // 7: Confirmation
];

// Field names for each step (for trigger() validation)
export const stepFields: (string[] | null)[] = [
  null, // 0: Welcome
  ["fullName", "email", "linkedIn", "role", "bio"], // 1: Applicant Info
  ["floor", "floorOther", "initiativeName", "tagline", "values", "targetCommunity", "estimatedSize"], // 2: Proposal
  ["phase1Mvp", "phase2Expansion", "phase3LongTerm"], // 3: Roadmap
  ["benefitToFT"], // 4: Impact
  ["existingCommunity", "spaceNeeds", "startDate", "additionalNotes"], // 5: Logistics
  null, // 6: Review
  null, // 7: Confirmation
];

// Type exports
export type ApplicantInfoData = z.infer<typeof applicantInfoSchema>;
export type ProposalData = z.infer<typeof proposalSchema>;
export type RoadmapData = z.infer<typeof roadmapSchema>;
export type ImpactData = z.infer<typeof impactSchema>;
export type LogisticsData = z.infer<typeof logisticsSchema>;
