"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { logout } from "@/app/admin/actions";

/**
 * Admin Header Component
 *
 * A shared header that appears at the top of the main content area.
 * Contains:
 * - Mobile navigation trigger (hamburger) - visible only on mobile
 * - Theme toggle (light/dark mode)
 * - Logout button
 *
 * The header is sticky and always visible on both desktop and mobile.
 * Glass-like styling with backdrop blur for visual consistency.
 */
export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-8">
      {/* Left side: mobile nav + page title space */}
      <div className="flex items-center gap-4">
        <MobileNav />
        {/* Page-specific title can be added by child pages if needed */}
      </div>

      {/* Right side: theme toggle + logout */}
      <div className="flex items-center gap-2">
        <ModeToggle />
        <form action={logout}>
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
