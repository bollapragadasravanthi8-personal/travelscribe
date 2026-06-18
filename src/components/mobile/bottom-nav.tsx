"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map,
  PlusCircle,
  Receipt,
  User,
  type LucideIcon,
} from "lucide-react";

import { useMobileApp } from "@/components/mobile/mobile-app-provider";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BottomNavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  action?: "add-entry";
};

const navItems: BottomNavItem[] = [
  { label: "Home", href: ROUTES.dashboard, icon: Home },
  { label: "Trips", href: ROUTES.trips, icon: Map },
  { label: "Add Entry", icon: PlusCircle, action: "add-entry" },
  { label: "Expenses", href: ROUTES.expenses, icon: Receipt },
  { label: "Profile", href: ROUTES.profile, icon: User },
];

function isActivePath(pathname: string, href: string) {
  if (href === ROUTES.dashboard) {
    return pathname === ROUTES.dashboard;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const { openAddEntrySheet } = useMobileApp();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href ? isActivePath(pathname, item.href) : false;

          if (item.action === "add-entry") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={openAddEntrySheet}
                className="flex flex-col items-center justify-center gap-1 px-1 text-xs font-medium text-primary transition-colors"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Icon className="size-5" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", isActive && "stroke-[2.5px]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
