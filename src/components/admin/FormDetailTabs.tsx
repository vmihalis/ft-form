"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormBuilderWrapper } from "@/components/form-builder/FormBuilderWrapper";
import { FormSubmissionsContent } from "@/components/admin/FormSubmissionsContent";

interface FormDetailTabsProps {
  formId: string;
}

/**
 * FormDetailTabs - Client wrapper for form detail page tabs
 *
 * Provides tabbed interface for:
 * - Submissions (default): View form submissions
 * - Builder: Edit form structure
 */
export function FormDetailTabs({ formId }: FormDetailTabsProps) {
  return (
    <Tabs defaultValue="submissions" className="h-full">
      <div className="border-b px-6 py-3">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="builder">Edit Form</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="submissions" className="mt-0">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <FormSubmissionsContent formId={formId} />
        </div>
      </TabsContent>
      <TabsContent value="builder" className="mt-0">
        <FormBuilderWrapper formId={formId} />
      </TabsContent>
    </Tabs>
  );
}
