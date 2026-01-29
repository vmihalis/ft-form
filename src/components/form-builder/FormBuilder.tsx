"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, PenSquare } from "lucide-react";
import { StepTabs } from "./StepTabs";
import { FormMetadataForm } from "./FormMetadataForm";
import { FieldPalette } from "./FieldPalette";
import { FormCanvas } from "./FormCanvas";
import { PropertyPanel } from "./PropertyPanel";
import { PreviewPanel } from "./PreviewPanel";
import { FormStatusActions } from "./FormStatusActions";

interface FormBuilderProps {
  formId: string;
  formName: string;
  formStatus: "draft" | "published" | "archived";
}

/**
 * FormBuilder
 *
 * Three-panel form builder layout:
 * - Left: Field palette with 10 field types (hidden in preview mode)
 * - Center: Step tabs + sortable form canvas (or preview panel in preview mode)
 * - Right: Property panel (when field selected) or form metadata editor
 */
export function FormBuilder({ formId, formName }: FormBuilderProps) {
  const { selectedFieldId } = useFormBuilderStore();
  const [previewMode, setPreviewMode] = useState(false);

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
        </div>
        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <PenSquare className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>

          {/* Status actions (badge, save, publish, archive) */}
          <FormStatusActions formId={formId} />
        </div>
      </header>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Field Palette (hidden in preview mode) */}
        {!previewMode && (
          <aside className="w-64 border-r p-4 bg-muted/30 overflow-y-auto">
            <FieldPalette />
          </aside>
        )}

        {/* Center: Step Tabs + Canvas OR Preview Panel */}
        <main className="flex-1 p-6 bg-background overflow-y-auto">
          {previewMode ? (
            <PreviewPanel />
          ) : (
            <>
              <StepTabs />
              <div className="mt-6">
                <FormCanvas />
              </div>
            </>
          )}
        </main>

        {/* Right: Property Panel or Form Metadata (hidden in preview mode) */}
        {!previewMode && (
          <aside className="w-80 border-l p-4 bg-muted/30 overflow-y-auto">
            {selectedFieldId ? (
              <PropertyPanel fieldId={selectedFieldId} />
            ) : (
              <FormMetadataForm formId={formId} />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
