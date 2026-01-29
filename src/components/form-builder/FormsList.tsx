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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

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
          <TableHead className="w-[280px]">Actions</TableHead>
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
      <Button asChild>
        <Link href="/admin/forms/new">
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Link>
      </Button>
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
  const publish = useMutation(api.forms.publish);
  const unpublish = useMutation(api.forms.unpublish);
  const remove = useMutation(api.forms.remove);

  const [duplicatingId, setDuplicatingId] = useState<Id<"forms"> | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<Id<"forms"> | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<Id<"forms"> | null>(null);

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

  // Handle status toggle (draft <-> published)
  const handleToggleStatus = async (
    formId: Id<"forms">,
    currentStatus: string
  ) => {
    setTogglingStatusId(formId);
    try {
      if (currentStatus === "published") {
        await unpublish({ formId });
      } else {
        await publish({ formId });
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Handle form deletion
  const handleDelete = async (formId: Id<"forms">) => {
    setDeletingId(formId);
    try {
      await remove({ formId });
    } catch (error) {
      console.error("Failed to delete form:", error);
    } finally {
      setDeletingId(null);
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/forms/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </Button>
      </div>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[280px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forms.map((form) => {
          const status = statusConfig[form.status];
          const createdDate = new Date(form.createdAt).toLocaleDateString();
          const formUrl = `/apply/${form.slug}`;
          const isDuplicating = duplicatingId === form._id;
          const isTogglingStatus = togglingStatusId === form._id;
          const isDeleting = deletingId === form._id;

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
                <div className="flex items-center gap-1">
                  {/* Edit */}
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 px-2"
                  >
                    <Link href={`/admin/forms/${form._id}`}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>

                  {/* Duplicate */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(form._id)}
                    disabled={isDuplicating}
                    className="h-8 px-2"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>

                  {/* Status Toggle */}
                  {form.status !== "archived" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(form._id, form.status)}
                      disabled={isTogglingStatus}
                      className="h-8 px-2"
                    >
                      {form.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                  )}

                  {/* View Live (only for published) */}
                  {form.status === "published" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 px-2"
                    >
                      <Link href={formUrl} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Form</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{form.name}
                          &quot;? This will permanently delete the form and all
                          its submissions. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(form._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    </div>
  );
}
