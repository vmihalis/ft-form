"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ExternalLink } from "lucide-react";

/**
 * Status badge colors for form status
 */
const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  published: {
    label: "Published",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  archived: {
    label: "Archived",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
} as const;

/**
 * Loading skeleton for forms table
 */
function FormsListSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-12" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Empty state when no forms exist
 */
function FormsListEmpty() {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-foreground mb-2">No forms yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first form to get started collecting submissions.
      </p>
    </div>
  );
}

/**
 * Forms list table component
 *
 * Displays all forms with their status, URL slug, and creation date.
 * Each row links to the form editor. Includes Duplicate action.
 */
export function FormsList() {
  const router = useRouter();
  const forms = useQuery(api.forms.list);
  const duplicate = useMutation(api.forms.duplicate);
  const [duplicatingId, setDuplicatingId] = useState<Id<"forms"> | null>(null);

  // Handle form duplication
  const handleDuplicate = async (formId: Id<"forms">) => {
    setDuplicatingId(formId);
    try {
      const newFormId = await duplicate({ formId });
      router.push(`/admin/forms/${newFormId}`);
    } catch (error) {
      console.error("Failed to duplicate form:", error);
      setDuplicatingId(null);
    }
  };

  // Loading state
  if (forms === undefined) {
    return <FormsListSkeleton />;
  }

  // Empty state
  if (forms.length === 0) {
    return <FormsListEmpty />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forms.map((form) => {
          const status = statusConfig[form.status];
          const createdDate = new Date(form.createdAt).toLocaleDateString();
          const formUrl = `/apply/${form.slug}`;
          const isDuplicating = duplicatingId === form._id;

          return (
            <TableRow key={form._id}>
              <TableCell className="font-medium">
                <Link
                  href={`/admin/forms/${form._id}`}
                  className="hover:underline"
                >
                  {form.name}
                </Link>
              </TableCell>
              <TableCell>
                <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                  {formUrl}
                </code>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {createdDate}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(form._id);
                    }}
                    disabled={isDuplicating}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                    title="Duplicate form"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {form.status === "published" && (
                    <Link
                      href={formUrl}
                      target="_blank"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                      title="View live form"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
