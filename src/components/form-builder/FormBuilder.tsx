"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { StepTabs } from "./StepTabs";
import { FormMetadataForm } from "./FormMetadataForm";
import { FieldPalette } from "./FieldPalette";
import { FormCanvas } from "./FormCanvas";

interface FormBuilderProps {
  formId: string;
  formName: string;
  formStatus: "draft" | "published" | "archived";
}

/**
 * Status badge styling
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
 * FormBuilder
 *
 * Three-panel form builder layout:
 * - Left: Field palette with 10 field types
 * - Center: Step tabs + sortable form canvas with dnd-kit
 * - Right: Property panel (when field selected) or form metadata editor
 */
export function FormBuilder({ formId, formName, formStatus }: FormBuilderProps) {
  const updateForm = useMutation(api.forms.update);
  const { schema, isDirty, markClean, selectedFieldId } = useFormBuilderStore();
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const status = statusConfig[formStatus];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateForm({
        formId: formId as Id<"forms">,
        draftSchema: JSON.stringify(schema),
      });
      markClean();
    } catch (error) {
      console.error("Failed to save form:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/forms"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{formName}</h1>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : isDirty ? "Save" : "Saved"}
          </Button>
        </div>
      </header>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Field Palette */}
        <aside className="w-64 border-r p-4 bg-muted/30 overflow-y-auto">
          <FieldPalette />
        </aside>

        {/* Center: Step Tabs + Canvas */}
        <main className="flex-1 p-6 bg-background overflow-y-auto">
          <StepTabs />
          <div className="mt-6">
            <FormCanvas />
          </div>
        </main>

        {/* Right: Property Panel or Form Metadata */}
        <aside className="w-80 border-l p-4 bg-muted/30 overflow-y-auto">
          {selectedFieldId ? (
            <div>
              <h3 className="font-semibold mb-4">Field Properties</h3>
              <p className="text-sm text-muted-foreground">
                Select a field to edit its properties
              </p>
            </div>
          ) : (
            <FormMetadataForm formId={formId} />
          )}
        </aside>
      </div>
    </div>
  );
}
