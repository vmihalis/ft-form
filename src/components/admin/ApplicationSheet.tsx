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
import { EditableField } from "./EditableField";
import { getFloorLabel, FRONTIER_TOWER_FLOORS } from "@/lib/constants/floors";
import { getEstimatedSizeLabel, ESTIMATED_SIZES } from "@/lib/constants/estimatedSizes";

interface ApplicationSheetProps {
  application: Doc<"applications"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[540px] sm:max-w-[calc(100vw-2rem)] overflow-y-auto">
        {/* Header - displays reactively, not editable here */}
        <SheetHeader>
          <SheetTitle className="break-words pr-8">{application.initiativeName}</SheetTitle>
          <SheetDescription className="break-words">{application.tagline}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 py-4">
          {/* Status */}
          <Section title="Status">
            <StatusDropdown
              applicationId={application._id}
              currentStatus={application.status}
            />
          </Section>

          <Separator />

          {/* Applicant Information (5 fields) */}
          <Section title="Applicant Information">
            <div className="space-y-3">
              <EditableField
                applicationId={application._id}
                field="fullName"
                label="Name"
                value={application.fullName}
                type="text"
              />
              <EditableField
                applicationId={application._id}
                field="email"
                label="Email"
                value={application.email}
                type="email"
              />
              <EditableField
                applicationId={application._id}
                field="linkedIn"
                label="LinkedIn"
                value={application.linkedIn}
                type="url"
                required={false}
              />
              <EditableField
                applicationId={application._id}
                field="role"
                label="Role"
                value={application.role}
                type="text"
              />
              <EditableField
                applicationId={application._id}
                field="bio"
                label="Bio"
                value={application.bio}
                type="textarea"
              />
            </div>
          </Section>

          <Separator />

          {/* Proposal (7 fields) */}
          <Section title="Proposal">
            <div className="space-y-3">
              <EditableField
                applicationId={application._id}
                field="floor"
                label="Floor"
                value={application.floor}
                type="select"
                options={FRONTIER_TOWER_FLOORS.map(f => ({ value: f.value, label: f.label }))}
                displayValue={getFloorLabel(application.floor)}
              />
              <EditableField
                applicationId={application._id}
                field="initiativeName"
                label="Initiative Name"
                value={application.initiativeName}
                type="text"
              />
              <EditableField
                applicationId={application._id}
                field="tagline"
                label="Tagline"
                value={application.tagline}
                type="text"
                maxLength={100}
              />
              <EditableField
                applicationId={application._id}
                field="values"
                label="Core Values"
                value={application.values}
                type="textarea"
              />
              <EditableField
                applicationId={application._id}
                field="targetCommunity"
                label="Target Community"
                value={application.targetCommunity}
                type="textarea"
              />
              <EditableField
                applicationId={application._id}
                field="estimatedSize"
                label="Estimated Community Size"
                value={application.estimatedSize}
                type="select"
                options={ESTIMATED_SIZES.map(s => ({ value: s.value, label: s.label }))}
                displayValue={getEstimatedSizeLabel(application.estimatedSize)}
              />
              <EditableField
                applicationId={application._id}
                field="additionalNotes"
                label="Additional Notes"
                value={application.additionalNotes}
                type="textarea"
                required={false}
              />
            </div>
          </Section>

          <Separator />

          {/* Roadmap (3 fields) */}
          <Section title="Roadmap">
            <div className="space-y-3">
              <EditableField
                applicationId={application._id}
                field="phase1Mvp"
                label="Phase 1: MVP (First 3 months)"
                value={application.phase1Mvp}
                type="textarea"
              />
              <EditableField
                applicationId={application._id}
                field="phase2Expansion"
                label="Phase 2: Expansion (3-6 months)"
                value={application.phase2Expansion}
                type="textarea"
              />
              <EditableField
                applicationId={application._id}
                field="phase3LongTerm"
                label="Phase 3: Long-term (6+ months)"
                value={application.phase3LongTerm}
                type="textarea"
              />
            </div>
          </Section>

          <Separator />

          {/* Impact (1 field) */}
          <Section title="Impact">
            <div className="space-y-3">
              <EditableField
                applicationId={application._id}
                field="benefitToFT"
                label="Benefit to Frontier Tower"
                value={application.benefitToFT}
                type="textarea"
              />
            </div>
          </Section>

          <Separator />

          {/* Logistics (3 fields) */}
          <Section title="Logistics">
            <div className="space-y-3">
              <EditableField
                applicationId={application._id}
                field="existingCommunity"
                label="Existing Community"
                value={application.existingCommunity}
                type="textarea"
              />
              <EditableField
                applicationId={application._id}
                field="spaceNeeds"
                label="Space Needs"
                value={application.spaceNeeds}
                type="textarea"
              />
              <EditableField
                applicationId={application._id}
                field="startDate"
                label="Earliest Start Date"
                value={application.startDate}
                type="date"
              />
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
