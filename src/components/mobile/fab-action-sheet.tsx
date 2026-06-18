"use client";

import { useMobileApp } from "@/components/mobile/mobile-app-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function FabActionSheet() {
  const { isFabSheetOpen, fabActions, closeFabSheet } = useMobileApp();

  return (
    <Sheet open={isFabSheetOpen} onOpenChange={(open) => !open && closeFabSheet()}>
      <SheetContent side="bottom" className="rounded-t-xl pb-[env(safe-area-inset-bottom,0px)]">
        <SheetHeader>
          <SheetTitle>Quick actions</SheetTitle>
          <SheetDescription>Choose an action to continue</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4 pb-4">
          {fabActions.map((action) => (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              className="h-11 w-full justify-start gap-3"
              onClick={() => {
                action.onSelect();
                closeFabSheet();
              }}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
