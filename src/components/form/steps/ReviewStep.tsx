"use client";

import { useFormContext } from "react-hook-form";
import { useFormStore } from "@/lib/stores/form-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getFloorLabel } from "@/lib/constants/floors";
import type { ApplicationFormData } from "@/types/form";

interface ReviewSectionProps {
  title: string;
  stepIndex: number;
  children: React.ReactNode;
}

/**
 * ReviewSection - Card wrapper with title and edit button
 */
function ReviewSection({ title, stepIndex, children }: ReviewSectionProps) {
  const setCurrentStep = useFormStore((state) => state.setCurrentStep);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep(stepIndex)}
        >
          Edit
        </Button>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

interface ReviewItemProps {
  label: string;
  value?: string;
}

/**
 * ReviewItem - Single data display row
 */
function ReviewItem({ label, value }: ReviewItemProps) {
  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm whitespace-pre-wrap">
        {value || <span className="italic text-muted-foreground">Not provided</span>}
      </dd>
    </div>
  );
}

/**
 * ReviewStep - FORM-07
 *
 * Displays all form data for review before submission.
 * Uses getValues() for live data (not stored snapshot).
 * Edit buttons jump to relevant step via setCurrentStep.
 */
export function ReviewStep() {
  const { getValues } = useFormContext<ApplicationFormData>();
  const data = getValues();

  // Format floor display - use label for known floors, or custom description for "other"
  const floorDisplay = data.floor === "other"
    ? `Other: ${data.floorOther || "(no description)"}`
    : getFloorLabel(data.floor);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Review Your Application</h2>
        <p className="text-muted-foreground mt-2">
          Please review your information before submitting
        </p>
      </div>

      {/* Section 1: About You (Step 1) */}
      <ReviewSection title="About You" stepIndex={1}>
        <dl className="divide-y divide-border">
          <ReviewItem label="Full Name" value={data.fullName} />
          <ReviewItem label="Email" value={data.email} />
          <ReviewItem label="LinkedIn" value={data.linkedIn} />
          <ReviewItem label="Current Role" value={data.role} />
          <ReviewItem label="Bio" value={data.bio} />
        </dl>
      </ReviewSection>

      {/* Section 2: Your Proposal (Step 2) */}
      <ReviewSection title="Your Proposal" stepIndex={2}>
        <dl className="divide-y divide-border">
          <ReviewItem label="Floor" value={floorDisplay} />
          <ReviewItem label="Initiative Name" value={data.initiativeName} />
          <ReviewItem label="Tagline" value={data.tagline} />
          <ReviewItem label="Core Values" value={data.values} />
          <ReviewItem label="Target Community" value={data.targetCommunity} />
          <ReviewItem label="Estimated Size" value={data.estimatedSize} />
        </dl>
      </ReviewSection>

      {/* Section 3: Roadmap (Step 3) */}
      <ReviewSection title="Your Roadmap" stepIndex={3}>
        <dl className="space-y-4">
          <ReviewItem label="Phase 1: MVP (First 3 months)" value={data.phase1Mvp} />
          <Separator />
          <ReviewItem label="Phase 2: Expansion (3-6 months)" value={data.phase2Expansion} />
          <Separator />
          <ReviewItem label="Phase 3: Long-term Vision (6+ months)" value={data.phase3LongTerm} />
        </dl>
      </ReviewSection>

      {/* Section 4: Impact (Step 4) */}
      <ReviewSection title="Impact" stepIndex={4}>
        <dl>
          <ReviewItem label="Benefit to Frontier Tower Members" value={data.benefitToFT} />
        </dl>
      </ReviewSection>

      {/* Section 5: Logistics (Step 5) */}
      <ReviewSection title="Logistics" stepIndex={5}>
        <dl className="divide-y divide-border">
          <ReviewItem label="Existing Community" value={data.existingCommunity} />
          <ReviewItem label="Space Requirements" value={data.spaceNeeds} />
          <ReviewItem label="Preferred Start Date" value={data.startDate} />
          <ReviewItem label="Additional Notes" value={data.additionalNotes} />
        </dl>
      </ReviewSection>

      {/* Submission guidance */}
      <p className="text-sm text-muted-foreground text-center pt-4">
        Click &quot;Submit Application&quot; below to finalize your submission.
      </p>
    </div>
  );
}
