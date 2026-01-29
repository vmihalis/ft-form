import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { decrypt } from "@/lib/auth/session";
import { AnimatedPage } from "@/components/ui/animated-page";
import { SubmissionsPageContent } from "./SubmissionsPageContent";

/**
 * Metadata for the submissions page
 */
export const metadata: Metadata = {
  title: "Submissions | Frontier Tower Admin",
  description: "View and manage all form submissions",
};

/**
 * Submissions Page
 *
 * Dedicated page for viewing all form submissions across all forms.
 * Accessible directly from dashboard hub (2-click access).
 *
 * Features:
 * - SubmissionsTable with filters, search, and export
 * - SubmissionSheet for detailed view on row click
 */
export default async function SubmissionsPage() {
  // Defense in depth: verify session even though middleware checks too
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (!session?.isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <AnimatedPage className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-2xl font-bold">Submissions</h1>
        </div>
      </header>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <SubmissionsPageContent />
      </div>
    </AnimatedPage>
  );
}
