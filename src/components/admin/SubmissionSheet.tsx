"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { DynamicEditableField } from "./DynamicEditableField";
import { SubmissionEditHistory } from "./SubmissionEditHistory";
import { NotesEditor } from "./NotesEditor";
import type { FormSchema } from "@/types/form-schema";

type SubmissionStatus = "new" | "under_review" | "accepted" | "rejected";

const STATUS_OPTIONS: { value: SubmissionStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const statusConfig = {
  new: { label: "New", className: "bg-blue-100/90 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800" },
  under_review: {
    label: "Under Review",
    className: "bg-yellow-100/90 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-800",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100/90 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100/90 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800",
  },
};

interface SubmissionSheetProps {
  submissionId: Id<"submissions"> | null;
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
      <h3 className="font-medium text-foreground">{title}</h3>
      {children}
    </div>
  );
}

interface StatusDropdownProps {
  submissionId: Id<"submissions">;
  currentStatus: SubmissionStatus;
}

function SubmissionStatusDropdown({
  submissionId,
  currentStatus,
}: StatusDropdownProps) {
  const updateStatus = useMutation(api.submissions.updateStatus);

  const handleStatusChange = async (status: SubmissionStatus) => {
    await updateStatus({ submissionId, status });
  };

  const config = statusConfig[currentStatus];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={option.value === currentStatus}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * SubmissionSheet - Detail sheet for dynamic form submissions
 *
 * Displays submission data with schema-driven field layout:
 * - Header: Form name, version, submitted date
 * - Status section with dropdown
 * - Fields grouped by step from schema
 * - Edit history at bottom
 *
 * Uses getWithSchema to get both submission data and schema together.
 */
export function SubmissionSheet({
  submissionId,
  open,
  onOpenChange,
}: SubmissionSheetProps) {
  const result = useQuery(
    api.submissions.getWithSchema,
    submissionId ? { submissionId } : "skip"
  );

  // Empty state - no submission selected
  if (!submissionId) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="glass overflow-y-auto" />
      </Sheet>
    );
  }

  // Loading state
  if (result === undefined) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="glass w-full sm:w-[540px] sm:max-w-[calc(100vw-2rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Loading...</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  // Not found state
  if (result === null) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="glass w-full sm:w-[540px] sm:max-w-[calc(100vw-2rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Submission Not Found</SheetTitle>
            <SheetDescription>
              This submission may have been deleted.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const { submission, schema, formName, version } = result;
  const parsedSchema = schema as FormSchema;
  const data = submission.data as Record<string, unknown>;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass w-full sm:w-[540px] sm:max-w-[calc(100vw-2rem)] overflow-y-auto">
        {/* Header */}
        <SheetHeader>
          <SheetTitle className="break-words pr-8">{formName}</SheetTitle>
          <SheetDescription>
            Version {version} - Submitted{" "}
            {new Date(submission.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 py-4">
          {/* Status Section */}
          <Section title="Status">
            <SubmissionStatusDropdown
              submissionId={submission._id}
              currentStatus={submission.status}
            />
          </Section>

          <Separator />

          {/* Fields grouped by step */}
          {parsedSchema.steps.map((step, stepIndex) => (
            <div key={step.id}>
              <Section title={step.title}>
                <div className="space-y-3">
                  {step.fields.map((field) => (
                    <DynamicEditableField
                      key={field.id}
                      submissionId={submission._id}
                      field={field}
                      value={data[field.id]}
                    />
                  ))}
                </div>
              </Section>
              {stepIndex < parsedSchema.steps.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}

          <Separator />

          {/* Edit History */}
          <SubmissionEditHistory submissionId={submission._id} />

          <Separator />

          {/* Internal Notes */}
          <Section title="Internal Notes">
            <NotesEditor
              submissionId={submission._id}
              initialNotes={submission.notes}
            />
          </Section>

          <Separator />

          {/* Footer */}
          <p className="text-sm text-muted-foreground">
            Submitted on{" "}
            {new Date(submission.submittedAt).toLocaleDateString("en-US", {
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
