import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { decrypt } from "@/lib/auth/session";
import { AnimatedPage } from "@/components/ui/animated-page";
import { FormDetailTabs } from "@/components/admin/FormDetailTabs";

/**
 * Metadata for the form detail page
 */
export const metadata: Metadata = {
  title: "Form | Frontier Tower Admin",
  description: "View submissions and edit form structure",
};

interface FormDetailPageProps {
  params: Promise<{ formId: string }>;
}

/**
 * Form Detail Page
 *
 * Server component with auth check that renders a tabbed interface for:
 * - Submissions tab (default): View and manage form submissions
 * - Builder tab: Edit form structure and fields
 */
export default async function FormDetailPage({ params }: FormDetailPageProps) {
  // Defense in depth: verify session even though middleware checks too
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (!session?.isAuthenticated) {
    redirect("/admin/login");
  }

  // Next.js 16: params is a Promise
  const { formId } = await params;

  return (
    <AnimatedPage className="min-h-screen">
      <FormDetailTabs formId={formId} />
    </AnimatedPage>
  );
}
