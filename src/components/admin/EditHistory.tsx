"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getFieldLabel } from "@/lib/constants/fieldLabels";
import { getFloorLabel } from "@/lib/constants/floors";
import { getEstimatedSizeLabel } from "@/lib/constants/estimatedSizes";
import { cn } from "@/lib/utils";

interface EditHistoryProps {
  applicationId: Id<"applications">;
}

function truncateValue(value: string, maxLength = 100): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + "...";
}

function formatValue(field: string, value: string): string {
  if (field === "floor") return getFloorLabel(value);
  if (field === "estimatedSize") return getEstimatedSizeLabel(value);
  return truncateValue(value);
}

export function EditHistory({ applicationId }: EditHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const history = useQuery(api.applications.getEditHistory, { applicationId });

  if (history === undefined) {
    return null; // Loading
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-medium hover:text-foreground/80 transition-colors">
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-90"
          )}
        />
        Edit History
        {history.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({history.length})
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No edits yet</p>
        ) : (
          <div className="space-y-3 border-l-2 border-muted pl-4">
            {history.map((edit) => (
              <div key={edit._id} className="text-sm">
                <p className="font-medium">{getFieldLabel(edit.field)}</p>
                <p className="text-muted-foreground">
                  <span className="line-through">
                    {formatValue(edit.field, edit.oldValue) || "(empty)"}
                  </span>
                  {" → "}
                  <span>{formatValue(edit.field, edit.newValue) || "(empty)"}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(edit.editedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
