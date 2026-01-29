"use client";

import Link from "next/link";
import { useFormBuilderStore } from "@/lib/stores/form-builder-store";
import { ArrowLeft } from "lucide-react";
import { StepTabs } from "./StepTabs";
import { FormMetadataForm } from "./FormMetadataForm";
import { FieldPalette } from "./FieldPalette";
import { WysiwygCanvas } from "./WysiwygCanvas";
import { PropertyPanel } from "./PropertyPanel";
import { FormStatusActions } from "./FormStatusActions";

interface FormBuilderProps {
  formId: string;
  formName: string;
  formStatus: "draft" | "published" | "archived";
}

/**
 * FormBuilder - WYSIWYG Form Builder
 *
 * Three-panel layout:
 * - Left: Field palette (reference for field types)
 * - Center: Step tabs + WYSIWYG canvas (forms render as users see them)
 * - Right: Property panel (when field selected) or form metadata editor
 *
 * No preview mode needed - builder IS the preview (WYSIWYG).
 */
export function FormBuilder({ formId, formName }: FormBuilderProps) {
  const { selectedFieldId } = useFormBuilderStore();

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
          {/* Status actions (badge, save, publish, archive) */}
          <FormStatusActions formId={formId} />
        </div>
      </header>

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Field Palette */}
        <aside className="w-64 border-r p-4 bg-muted/30 overflow-y-auto">
          <FieldPalette />
        </aside>

        {/* Center: Step Tabs + WYSIWYG Canvas */}
        <main className="flex-1 p-6 bg-background overflow-y-auto">
          <StepTabs />
          <div className="mt-6">
            <WysiwygCanvas />
          </div>
        </main>

        {/* Right: Property Panel or Form Metadata */}
        <aside className="w-80 border-l p-4 bg-muted/30 overflow-y-auto">
          {selectedFieldId ? (
            <PropertyPanel fieldId={selectedFieldId} />
          ) : (
            <FormMetadataForm formId={formId} />
          )}
        </aside>
      </div>
    </div>
  );
}
