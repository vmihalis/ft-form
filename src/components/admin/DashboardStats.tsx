"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  colorClass: string;
}

function StatCard({ title, count, icon: Icon, colorClass }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const stats = useQuery(api.submissions.getStats);

  if (!stats) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Submissions",
      count: stats.total,
      icon: FileText,
      colorClass: "text-muted-foreground",
    },
    {
      title: "New",
      count: stats.new,
      icon: Clock,
      colorClass: "text-blue-500",
    },
    {
      title: "Under Review",
      count: stats.under_review,
      icon: Eye,
      colorClass: "text-yellow-500",
    },
    {
      title: "Accepted",
      count: stats.accepted,
      icon: CheckCircle,
      colorClass: "text-green-500",
    },
    {
      title: "Rejected",
      count: stats.rejected,
      icon: XCircle,
      colorClass: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {statCards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          count={card.count}
          icon={card.icon}
          colorClass={card.colorClass}
        />
      ))}
    </div>
  );
}
