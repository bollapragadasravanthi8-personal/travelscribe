"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Receipt,
  User,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavItemConfig } from "@/components/layout/nav-items";

const iconMap: Record<NavItemConfig["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  trips: Map,
  expenses: Receipt,
  profile: User,
  settings: User,
};

type SidebarProps = {
  items: NavItemConfig[];
  className?: string;
};

export function Sidebar({ items, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col",
        className,
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              aria-disabled={item.disabled}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                item.disabled && "pointer-events-none opacity-50",
              )}
            >
              <Icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
