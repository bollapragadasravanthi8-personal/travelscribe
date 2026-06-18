"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Map,
  Menu,
  Receipt,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { NavItemConfig } from "@/components/layout/nav-items";

const iconMap: Record<NavItemConfig["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  trips: Map,
  expenses: Receipt,
  profile: User,
  settings: Settings,
};

type MobileNavProps = {
  items: NavItemConfig[];
};

export function MobileNav({ items }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>{APP_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                  item.disabled && "pointer-events-none opacity-50",
                )}
              >
                <Icon className="size-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
