import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { decrypt } from "@/lib/auth/session";
import { logout } from "./actions";
import { Button } from "@/components/ui/button";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

/**
 * Metadata for the admin dashboard page
 */
export const metadata: Metadata = {
  title: "Admin Dashboard | Frontier Tower",
  description: "Manage floor lead applications for Frontier Tower",
};

/**
 * Admin Dashboard Page
 *
 * Protected page for reviewing and managing floor lead applications.
 * Session verification happens both in middleware and here (defense in depth).
 *
 * Features:
 * - Applications table with filters (floor, search)
 * - Click row to open detail sheet
 * - Change application status from detail sheet
 * - Real-time updates via Convex subscriptions
 */
export default async function AdminPage() {
  // Defense in depth: verify session even though middleware checks too
  // This ensures protection even if middleware is bypassed or misconfigured
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (!session?.isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with title and logout */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <form action={logout}>
            <Button type="submit" variant="outline">
              Logout
            </Button>
          </form>
        </div>
      </header>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <AdminDashboard />
      </div>
    </main>
  );
}
