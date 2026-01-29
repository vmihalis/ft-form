"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";

/**
 * Mobile Navigation Component
 *
 * Shows a hamburger menu button that triggers a sheet overlay
 * with navigation items. Only visible on mobile (< lg breakpoint).
 *
 * Features:
 * - Hamburger button hidden on desktop (lg:hidden)
 * - Sheet slides in from left side
 * - Glass styling matching design system
 * - Reuses SidebarNav for consistent navigation
 * - Closes sheet when a navigation item is clicked
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="glass w-[280px] p-0"
        showCloseButton={true}
      >
        <SheetHeader className="px-4 py-4 border-b border-sidebar-border">
          <SheetTitle className="font-display">FrontierOS</SheetTitle>
        </SheetHeader>
        <nav className="py-4">
          {/* Pass onClick handler to close sheet on navigation */}
          <SidebarNav isCollapsed={false} onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
