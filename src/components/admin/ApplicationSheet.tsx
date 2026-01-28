"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { StatusDropdown } from "./StatusDropdown";
import { getFloorLabel } from "@/lib/constants/floors";

interface ApplicationSheetProps {
  application: Doc<"applications"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{title}</h3>
      {children}
    </div>
  );
}

export function ApplicationSheet({
  application,
  open,
  onOpenChange,
}: ApplicationSheetProps) {
  if (!application) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto" />
      </Sheet>
    );
  }

  const floorDisplay =
    application.floor === "other" && application.floorOther
      ? `Other: ${application.floorOther}`
      : getFloorLabel(application.floor);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        {/* Header */}
        <SheetHeader>
          <SheetTitle>{application.initiativeName}</SheetTitle>
          <SheetDescription>{application.tagline}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <Section title="Status">
            <StatusDropdown
              applicationId={application._id}
              currentStatus={application.status}
            />
          </Section>

          <Separator />

          {/* Applicant Info */}
          <Section title="Applicant Information">
            <div className="space-y-3">
              <Field label="Name" value={application.fullName} />
              <Field label="Email" value={application.email} />
              {application.linkedIn && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    LinkedIn
                  </p>
                  <a
                    href={application.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {application.linkedIn}
                  </a>
                </div>
              )}
              <Field label="Role" value={application.role} />
              <Field label="Bio" value={application.bio} />
            </div>
          </Section>

          <Separator />

          {/* Proposal */}
          <Section title="Proposal">
            <div className="space-y-3">
              <Field label="Floor" value={floorDisplay} />
              <Field label="Initiative Name" value={application.initiativeName} />
              <Field label="Core Values" value={application.values} />
              <Field label="Target Community" value={application.targetCommunity} />
              <Field label="Estimated Community Size" value={application.estimatedSize} />
            </div>
          </Section>

          <Separator />

          {/* Roadmap */}
          <Section title="Roadmap">
            <div className="space-y-3">
              <Field
                label="Phase 1: MVP (First 3 months)"
                value={application.phase1Mvp}
              />
              <Field
                label="Phase 2: Expansion (3-6 months)"
                value={application.phase2Expansion}
              />
              <Field
                label="Phase 3: Long-term (6+ months)"
                value={application.phase3LongTerm}
              />
            </div>
          </Section>

          <Separator />

          {/* Impact */}
          <Section title="Impact">
            <Field
              label="Benefit to Frontier Tower"
              value={application.benefitToFT}
            />
          </Section>

          <Separator />

          {/* Logistics */}
          <Section title="Logistics">
            <div className="space-y-3">
              <Field
                label="Existing Community"
                value={application.existingCommunity}
              />
              <Field label="Space Needs" value={application.spaceNeeds} />
              <Field
                label="Earliest Start Date"
                value={new Date(application.startDate).toLocaleDateString()}
              />
              {application.additionalNotes && (
                <Field
                  label="Additional Notes"
                  value={application.additionalNotes}
                />
              )}
            </div>
          </Section>

          <Separator />

          {/* Footer */}
          <p className="text-sm text-muted-foreground">
            Submitted on{" "}
            {new Date(application.submittedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
