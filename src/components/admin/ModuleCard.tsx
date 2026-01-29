"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  FileText,
  Inbox,
  Users,
  Calendar,
  DoorOpen,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Map of icon names to Lucide icon components.
 * Icons must be imported and mapped here because Server Components
 * cannot pass component references to Client Components.
 */
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Inbox,
  Users,
  Calendar,
  DoorOpen,
  Heart,
};

export type ModuleIconName = keyof typeof iconMap;

interface ModuleCardProps {
  icon: ModuleIconName;
  label: string;
  href?: string;
  disabled?: boolean;
}

export function ModuleCard({ icon, label, href, disabled }: ModuleCardProps) {
  const Icon = iconMap[icon] ?? FileText;
  const cardContent = (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-8",
        "h-[220px] flex flex-col items-center justify-center gap-4",
        "transition-colors",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer"
      )}
      whileHover={disabled ? undefined : {
        scale: 1.02,
        boxShadow: "0 30px 60px -12px oklch(0 0 0 / 20%)"
      }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Icon className="h-12 w-12 text-foreground" strokeWidth={1.5} />
      <span className="font-display text-xl text-foreground">{label}</span>
      {disabled && (
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Coming Soon
        </span>
      )}
    </motion.div>
  );

  // Disabled cards are not wrapped in Link
  if (disabled || !href) {
    return cardContent;
  }

  return (
    <Link href={href} className="block">
      {cardContent}
    </Link>
  );
}
