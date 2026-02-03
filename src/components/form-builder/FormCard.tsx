"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormQuickActions } from "./FormQuickActions";
import { Id } from "@/../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-yellow-100/80 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  },
  published: {
    label: "Published",
    className: "bg-green-100/80 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-border",
  },
} as const;

interface FormCardProps {
  form: {
    _id: Id<"forms">;
    name: string;
    slug: string;
    status: "draft" | "published" | "archived";
    submissionCount: number;
    updatedAt: number;
  };
  onDuplicate: () => void;
  isLoading?: boolean;
}

export function FormCard({ form, onDuplicate, isLoading }: FormCardProps) {
  const status = statusConfig[form.status];
  const lastUpdated = new Date(form.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-6 min-h-[180px] flex flex-col relative group",
        isLoading && "pointer-events-none"
      )}
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Full card clickable link overlay with purple hover ring */}
      <Link
        href={`/admin/forms/${form._id}`}
        className="absolute inset-0 z-0 rounded-2xl ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all duration-200"
        aria-label={`Edit ${form.name}`}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 rounded-2xl flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Header with status and actions */}
      <div className={cn("flex items-start justify-between mb-4 relative z-[1]", isLoading && "opacity-50")}>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
        <FormQuickActions
          formId={form._id}
          slug={form.slug}
          status={form.status}
          onDuplicate={onDuplicate}
          isDuplicating={isLoading}
        />
      </div>

      {/* Main content */}
      <div className={cn("flex-1", isLoading && "opacity-50")}>
        <h3 className="font-display text-lg font-semibold text-foreground truncate mb-2">
          {form.name}
        </h3>
        <p className="text-sm text-muted-foreground truncate">/apply/{form.slug}</p>
      </div>

      {/* Footer stats */}
      <div
        className={cn(
          "flex items-center justify-between mt-4 pt-4 text-sm text-muted-foreground",
          isLoading && "opacity-50"
        )}
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        <span>
          {form.submissionCount} {form.submissionCount === 1 ? "submission" : "submissions"}
        </span>
        <span>Updated {lastUpdated}</span>
      </div>
    </motion.div>
  );
}
