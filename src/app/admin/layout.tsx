"use client";

import { useEffect } from "react";
import {
  hydrateSidebarState,
  useSidebarStore,
} from "@/lib/stores/sidebar-store";
import { Sidebar } from "@/components/admin/Sidebar";

/**
 * Admin Layout
 *
 * Wraps all /admin/* pages with the dashboard structure:
 * - Collapsible sidebar with glass styling and animations
 * - Main content area with left margin to avoid sidebar overlap
 *
 * The sidebar is hidden on mobile (<lg breakpoint) and replaced
 * with a mobile nav sheet (implemented in Plan 04).
 *
 * Layout hierarchy:
 * - /admin/layout.tsx (this file) - sidebar + content structure
 *   - /admin/page.tsx - dashboard hub
 *   - /admin/forms/* - forms module
 *
 * Note: The static margin of 240px matches the expanded sidebar width.
 * Dynamic margin based on collapse state will be implemented in Plan 04.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Subscribe to sidebar state for future dynamic margin
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  // Hydrate sidebar state from localStorage on mount
  useEffect(() => {
    hydrateSidebarState();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - fixed positioned, hidden on mobile */}
      <Sidebar />

      {/* Main content area with left margin for sidebar on desktop */}
      {/* Static 240px margin matches expanded sidebar width */}
      {/* Dynamic margin based on collapse state will be in Plan 04 */}
      <main className="min-h-screen overflow-auto lg:ml-[240px] lg:transition-[margin-left] lg:duration-200">
        {children}
      </main>
    </div>
  );
}
