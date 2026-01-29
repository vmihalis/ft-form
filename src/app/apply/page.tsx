import { DynamicFormPage } from "@/components/dynamic-form/DynamicFormPage";

/**
 * Floor Lead Application - served via dynamic form system
 *
 * Uses the existing DynamicFormPage component with hardcoded slug.
 * Form configuration is managed via admin form builder.
 * Legacy hardcoded form replaced in Phase 16 migration.
 */
export default function ApplyPage() {
  return <DynamicFormPage slug="floor-lead" />;
}
