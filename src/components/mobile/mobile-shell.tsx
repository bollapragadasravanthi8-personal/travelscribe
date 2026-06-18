"use client";

import { BottomNav } from "@/components/mobile/bottom-nav";
import { cn } from "@/lib/utils";

type MobileShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <>
      <div
        className={cn(
          "flex min-h-full flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0",
          className,
        )}
      >
        {children}
      </div>
      <BottomNav />
    </>
  );
}
