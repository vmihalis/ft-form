import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { decrypt } from "@/lib/auth/session";
import { AnimatedPage } from "@/components/ui/animated-page";
import { FormBuilderWrapper } from "@/components/form-builder/FormBuilderWrapper";

/**
 * Metadata for the form builder page
 */
export const metadata: Metadata = {
  title: "Form Builder | Frontier Tower Admin",
  description: "Edit form structure and fields",
};

interface FormBuilderPageProps {
  params: Promise<{ formId: string }>;
}

/**
 * Form Builder Edit Page
 *
 * Server component with auth check that renders the FormBuilder client component.
 * The formId param is passed to FormBuilderWrapper which handles data loading.
 */
export default async function FormBuilderPage({ params }: FormBuilderPageProps) {
  // Defense in depth: verify session even though middleware checks too
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (!session?.isAuthenticated) {
    redirect("/admin/login");
  }

  // Next.js 16: params is a Promise
  const { formId } = await params;

  return (
    <AnimatedPage>
      <FormBuilderWrapper formId={formId} />
    </AnimatedPage>
  );
}
