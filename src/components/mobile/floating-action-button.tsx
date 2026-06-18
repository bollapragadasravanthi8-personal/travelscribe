"use client";

import { Plus } from "lucide-react";

import { useMobileApp } from "@/components/mobile/mobile-app-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FloatingActionButtonProps = {
  onClick?: () => void;
  className?: string;
  label?: string;
};

export function FloatingActionButton({
  onClick,
  className,
  label = "Add",
}: FloatingActionButtonProps) {
  const { openAddEntrySheet } = useMobileApp();

  return (
    <Button
      type="button"
      size="icon-lg"
      className={cn(
        "fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 size-14 rounded-full shadow-lg md:hidden",
        className,
      )}
      onClick={onClick ?? openAddEntrySheet}
      aria-label={label}
    >
      <Plus className="size-6" />
    </Button>
  );
}
