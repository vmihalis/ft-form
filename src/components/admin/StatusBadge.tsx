"use client";

import { Badge } from "@/components/ui/badge";

type ApplicationStatus = "new" | "under_review" | "accepted" | "rejected";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }
> = {
  new: { label: "New", variant: "default" },
  under_review: { label: "Under Review", variant: "secondary" },
  accepted: { label: "Accepted", variant: "outline", className: "border-green-500 text-green-600" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
