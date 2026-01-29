"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText } from "lucide-react";
import { FormsGrid } from "./FormsGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Loading skeleton for forms grid
 */
function FormsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-6 min-h-[180px] flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex-1" />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no forms exist
 */
function FormsListEmpty() {
  return (
    <EmptyState
      icon={FileText}
      title="No forms yet"
      description="Create your first form to get started collecting submissions."
      action={{
        label: "Create Form",
        href: "/admin/forms/new",
      }}
    />
  );
}

/**
 * Forms list component using glassmorphism card grid
 *
 * Displays all forms with status, submission count, and last updated.
 * Each card links to the form editor with quick actions dropdown.
 */
export function FormsList() {
  const router = useRouter();
  const forms = useQuery(api.forms.list);
  const duplicate = useMutation(api.forms.duplicate);

  const [duplicatingId, setDuplicatingId] = useState<Id<"forms"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form duplication
  const handleDuplicate = async (formId: Id<"forms">) => {
    setDuplicatingId(formId);
    setError(null);
    try {
      const newFormId = await duplicate({ formId });
      router.push(`/admin/forms/${newFormId}`);
    } catch (err) {
      console.error("Failed to duplicate form:", err);
      setError("Failed to duplicate form. Please try again.");
      setDuplicatingId(null);
    }
  };

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load forms"
        message={error}
        action={{
          label: "Retry",
          onClick: () => setError(null),
        }}
      />
    );
  }

  // Loading state
  if (forms === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div />
          <Button asChild>
            <Link href="/admin/forms/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Link>
          </Button>
        </div>
        <FormsGridSkeleton />
      </div>
    );
  }

  // Empty state
  if (forms.length === 0) {
    return <FormsListEmpty />;
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {forms.length} {forms.length === 1 ? "form" : "forms"}
        </p>
        <Button asChild>
          <Link href="/admin/forms/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </Button>
      </div>

      {/* Forms grid */}
      <FormsGrid forms={forms} onDuplicate={handleDuplicate} />
    </div>
  );
}
