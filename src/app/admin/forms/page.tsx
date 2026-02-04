import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { decrypt } from "@/lib/auth/session";
import { AnimatedPage } from "@/components/ui/animated-page";
import { FormsList } from "@/components/form-builder/FormsList";
import { NewFormDropdown } from "@/components/form-builder/NewFormDropdown";

/**
 * Metadata for the forms list page
 */
export const metadata: Metadata = {
  title: "Forms | Frontier Tower Admin",
  description: "Manage application forms for Frontier Tower",
};

/**
 * Admin Forms List Page
 *
 * Lists all forms with their status, slug, and version.
 * Provides entry point for creating and editing forms.
 */
export default async function FormsPage() {
  // Defense in depth: verify session even though middleware checks too
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (!session?.isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <AnimatedPage className="min-h-screen bg-background">
      {/* Header with title and new form button */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Forms</h1>
          <NewFormDropdown />
        </div>
      </header>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <FormsList />
      </div>
    </AnimatedPage>
  );
}
