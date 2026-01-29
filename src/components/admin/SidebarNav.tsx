"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  LucideIcon,
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  DoorOpen,
  Heart,
} from "lucide-react";

/**
 * Navigation item configuration
 */
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  disabled?: boolean;
}

/**
 * Navigation items for the sidebar.
 * Forms is the only active module; others are coming soon placeholders.
 */
const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: FileText, label: "Forms", href: "/admin/forms" },
  { icon: Users, label: "Members", href: "/admin/members", disabled: true },
  { icon: Calendar, label: "Events", href: "/admin/events", disabled: true },
  { icon: DoorOpen, label: "Spaces", href: "/admin/spaces", disabled: true },
  { icon: Heart, label: "Wellness", href: "/admin/wellness", disabled: true },
];

interface SidebarNavProps {
  isCollapsed: boolean;
  /**
   * Optional callback invoked when navigation occurs.
   * Used by MobileNav (Plan 21-04) to close the sheet on navigation.
   */
  onNavigate?: () => void;
}

/**
 * Sidebar Navigation Component
 *
 * Displays navigation items with icons and labels.
 * Highlights the active route.
 * Labels hide when collapsed, show when expanded.
 */
export function SidebarNav({ isCollapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-1 px-3">
      {navItems.map((item) => {
        // Dashboard is exact match, others are prefix match
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <SidebarNavItem
            key={item.href}
            {...item}
            isCollapsed={isCollapsed}
            isActive={isActive}
            onNavigate={onNavigate}
          />
        );
      })}
    </div>
  );
}

interface SidebarNavItemProps extends NavItem {
  isCollapsed: boolean;
  isActive: boolean;
  onNavigate?: () => void;
}

/**
 * Individual navigation item with icon and animated label.
 * Disabled items show muted styling and are non-interactive.
 */
function SidebarNavItem({
  icon: Icon,
  label,
  href,
  disabled,
  isCollapsed,
  isActive,
  onNavigate,
}: SidebarNavItemProps) {
  const content = (
    <motion.div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-sidebar-accent",
        isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
      whileHover={disabled ? undefined : { x: 4 }}
      transition={{ duration: 0.15 }}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <motion.span
        initial={false}
        animate={{
          opacity: isCollapsed ? 0 : 1,
          width: isCollapsed ? 0 : "auto",
        }}
        transition={{ duration: 0.2 }}
        className="text-sm font-medium overflow-hidden whitespace-nowrap"
      >
        {label}
      </motion.span>
    </motion.div>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link href={href} onClick={onNavigate}>
      {content}
    </Link>
  );
}
