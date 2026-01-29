import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { decrypt } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { FormsList } from "@/components/form-builder/FormsList";
import { Plus } from "lucide-react";

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
    <main className="min-h-screen bg-background">
      {/* Header with title and new form button */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Forms</h1>
          <Link href="/admin/forms/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Form
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <FormsList />
      </div>
    </main>
  );
}
