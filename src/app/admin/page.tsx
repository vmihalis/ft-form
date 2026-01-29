import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { decrypt } from "@/lib/auth/session";
import { ModuleCard } from "@/components/admin/ModuleCard";
import { FileText, Inbox, Users, Calendar, DoorOpen, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | FrontierOS",
  description: "FrontierOS command center for Frontier Tower",
};

/**
 * Dashboard Hub Page
 *
 * The central command center of FrontierOS. Users land here after login
 * and navigate to specific modules via hero cards.
 *
 * Modules:
 * - Forms: Active, links to /admin/forms
 * - Members, Events, Spaces, Wellness: Placeholder cards showing "Coming Soon"
 */
export default async function DashboardPage() {
  // Defense in depth: verify session even though middleware checks too
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (!session?.isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-8 py-6">
        <h1 className="text-3xl font-display font-bold text-foreground">
          FrontierOS
        </h1>
        <p className="text-muted-foreground mt-1">
          Command center for Frontier Tower
        </p>
      </header>

      {/* Module Cards Grid */}
      <main className="px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard
            icon={FileText}
            label="Forms"
            href="/admin/forms"
          />
          <ModuleCard
            icon={Inbox}
            label="Submissions"
            href="/admin/submissions"
          />
          <ModuleCard
            icon={Users}
            label="Members"
            disabled
          />
          <ModuleCard
            icon={Calendar}
            label="Events"
            disabled
          />
          <ModuleCard
            icon={DoorOpen}
            label="Spaces"
            disabled
          />
          <ModuleCard
            icon={Heart}
            label="Wellness"
            disabled
          />
        </div>
      </main>
    </div>
  );
}
