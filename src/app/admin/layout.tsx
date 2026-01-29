"use client";

import { useEffect } from "react";
import { hydrateSidebarState, useSidebarStore } from "@/lib/stores/sidebar-store";

/**
 * Admin Layout
 *
 * Wraps all /admin/* pages with the dashboard structure:
 * - Collapsible sidebar (implemented in Plan 02)
 * - Main content area with flex-1
 *
 * The sidebar is hidden on mobile (<lg breakpoint) and replaced
 * with a mobile nav sheet (implemented in Plan 02).
 *
 * Layout hierarchy:
 * - /admin/layout.tsx (this file) - sidebar + content structure
 *   - /admin/page.tsx - dashboard hub
 *   - /admin/forms/* - forms module
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Import sidebar store to prepare for Plan 02
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  // Hydrate sidebar state from localStorage on mount
  useEffect(() => {
    hydrateSidebarState();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar placeholder - will be replaced with Sidebar component in Plan 02 */}
      {/* Hidden on mobile, visible on lg+ screens */}
      <aside className="hidden lg:block">
        {/* Sidebar component goes here in Plan 02 */}
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
