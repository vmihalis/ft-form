"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { MoreHorizontal, Pencil, Copy, Archive, ExternalLink, RotateCcw, Loader2, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FormQuickActionsProps {
  formId: Id<"forms">;
  slug: string;
  status: "draft" | "published" | "archived";
  onDuplicate?: () => void;
  isDuplicating?: boolean;
}

export function FormQuickActions({
  formId,
  slug,
  status,
  onDuplicate,
  isDuplicating,
}: FormQuickActionsProps) {
  const publish = useMutation(api.forms.publish);
  const unpublish = useMutation(api.forms.unpublish);
  const archive = useMutation(api.forms.archive);
  const unarchive = useMutation(api.forms.unarchive);

  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadQR = async () => {
    try {
      const url = `${window.location.origin}/apply/${slug}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const link = document.createElement("a");
      link.download = `${slug}-qr-code.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handleStatusAction = async (action: () => Promise<unknown>) => {
    setIsLoading(true);
    try {
      await action();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
          disabled={isLoading}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/admin/forms/${formId}`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>

        {onDuplicate && (
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            disabled={isDuplicating}
          >
            {isDuplicating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </>
            )}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); handleDownloadQR(); }}
        >
          <QrCode className="h-4 w-4 mr-2" />
          Download QR Code
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {status === "draft" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleStatusAction(() => publish({ formId }));
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Publish
          </DropdownMenuItem>
        )}

        {status === "published" && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/apply/${slug}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleStatusAction(() => unpublish({ formId }));
              }}
            >
              <Archive className="h-4 w-4 mr-2" />
              Unpublish
            </DropdownMenuItem>
          </>
        )}

        {status !== "archived" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleStatusAction(() => archive({ formId }));
            }}
            className="text-destructive focus:text-destructive"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </DropdownMenuItem>
        )}

        {status === "archived" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleStatusAction(() => unarchive({ formId }));
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
