"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { ChevronDown } from "lucide-react";

type ApplicationStatus = "new" | "under_review" | "accepted" | "rejected";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

interface StatusDropdownProps {
  applicationId: Id<"applications">;
  currentStatus: ApplicationStatus;
}

export function StatusDropdown({
  applicationId,
  currentStatus,
}: StatusDropdownProps) {
  const updateStatus = useMutation(api.applications.updateStatus);

  const handleStatusChange = async (status: ApplicationStatus) => {
    await updateStatus({ id: applicationId, status });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <StatusBadge status={currentStatus} />
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
