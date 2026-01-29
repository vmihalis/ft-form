"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Formats a timestamp as relative time (e.g., "5m ago", "2h ago")
 */
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Maps submission status to badge variant
 */
function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "new":
      return "default";
    case "under_review":
      return "secondary";
    case "accepted":
      return "outline";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

/**
 * Formats status for display (e.g., "under_review" -> "Under Review")
 */
function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Loading skeleton for activity feed
 */
function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * ActivityFeed displays recent submissions in a compact list format.
 * Shows submitter name, form name, relative timestamp, and status badge.
 * Updates in real-time via Convex reactive queries.
 */
export function ActivityFeed() {
  const activity = useQuery(api.submissions.getRecentActivity, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity === undefined ? (
          <ActivityFeedSkeleton />
        ) : activity.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {activity.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.submitterName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    submitted to {item.formName} &middot;{" "}
                    {getRelativeTime(item.submittedAt)}
                  </p>
                </div>
                <Badge variant={getStatusVariant(item.status)}>
                  {formatStatus(item.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
