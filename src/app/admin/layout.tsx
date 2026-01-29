"use client";

import { useEffect } from "react";
import {
  hydrateSidebarState,
  useSidebarStore,
} from "@/lib/stores/sidebar-store";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/Header";
import { cn } from "@/lib/utils";

/**
 * Admin Layout
 *
 * Wraps all /admin/* pages with the dashboard structure:
 * - Collapsible sidebar with glass styling and animations (desktop only)
 * - Mobile navigation via hamburger menu + sheet
 * - Shared header with theme toggle and logout
 * - Main content area with dynamic margin based on sidebar state
 *
 * Responsive behavior:
 * - Desktop (>= lg): Sidebar visible, hamburger hidden
 * - Mobile (< lg): Sidebar hidden, hamburger menu in header
 *
 * Layout hierarchy:
 * - /admin/layout.tsx (this file) - sidebar + header + content
 *   - /admin/page.tsx - dashboard hub
 *   - /admin/forms/* - forms module
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  // Hydrate sidebar state from localStorage on mount
  useEffect(() => {
    hydrateSidebarState();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content area with responsive margin */}
      <div
        className={cn(
          "min-h-screen transition-[margin] duration-200",
          // Desktop: margin adjusts based on sidebar collapse state
          "lg:ml-[240px]",
          isCollapsed && "lg:ml-[64px]"
          // Mobile: no left margin (full width content)
        )}
      >
        <AdminHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
