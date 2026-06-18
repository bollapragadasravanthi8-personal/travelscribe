"use client";

import { WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";

type OfflineBannerProps = {
  isOffline?: boolean;
  className?: string;
};

export function OfflineBanner({ isOffline = false, className }: OfflineBannerProps) {
  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 border-b bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-900 dark:text-amber-200",
        className,
      )}
    >
      <WifiOff className="size-4 shrink-0" />
      You&apos;re offline. Changes may sync when you reconnect.
    </div>
  );
}
