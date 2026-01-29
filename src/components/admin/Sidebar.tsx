"use client";

import { motion } from "motion/react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { SidebarNav } from "./SidebarNav";
import { cn } from "@/lib/utils";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Sidebar dimensions from CONTEXT.md:
 * - Expanded: ~240px width
 * - Collapsed: ~64px width
 */
const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 64;

const sidebarVariants = {
  expanded: { width: SIDEBAR_WIDTH_EXPANDED },
  collapsed: { width: SIDEBAR_WIDTH_COLLAPSED },
};

/**
 * Collapsible Sidebar Component
 *
 * Features:
 * - Glass styling with blur matching design system
 * - Dual interaction: click to pin open, hover for quick peek when collapsed
 * - Smooth animations via Motion library
 * - Fixed positioning on left side with z-index 40
 *
 * Behavior:
 * - Default state: expanded (labels visible) for new users
 * - Collapse toggle button positioned at bottom of sidebar
 * - State persists across sessions via sidebar-store
 */
export function Sidebar() {
  const { isCollapsed, isHovering, setHovering, toggleCollapsed } =
    useSidebarStore();

  // Effective expansion state: pinned open OR hovering while collapsed
  const effectivelyExpanded = !isCollapsed || isHovering;

  return (
    <motion.aside
      initial={false}
      animate={effectivelyExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => isCollapsed && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={cn(
        "glass h-screen flex flex-col",
        "fixed left-0 top-0 z-40",
        "border-r border-sidebar-border",
        // Hide on mobile, show on lg+ screens
        "hidden lg:flex"
      )}
    >
      {/* Logo/Brand area */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <motion.div
          initial={false}
          animate={{ opacity: effectivelyExpanded ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <span className="font-display text-lg font-semibold text-foreground">
            FrontierOS
          </span>
        </motion.div>
        {/* Show icon when collapsed */}
        {!effectivelyExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 w-full flex justify-center"
          >
            <span className="font-display text-lg font-bold text-primary">
              F
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <SidebarNav isCollapsed={!effectivelyExpanded} />
      </nav>

      {/* Collapse toggle button at bottom */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={cn(
            "w-full transition-colors",
            "hover:bg-sidebar-accent"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>
    </motion.aside>
  );
}

// Export dimensions for use in layout
export { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED };
