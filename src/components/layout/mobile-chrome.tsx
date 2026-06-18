"use client";

import { BookOpen, Camera, Receipt } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { AddEntrySheet } from "@/components/mobile/add-entry-sheet";
import { FabActionSheet } from "@/components/mobile/fab-action-sheet";
import { FloatingActionButton } from "@/components/mobile/floating-action-button";
import { MobileAppProvider, useMobileApp } from "@/components/mobile/mobile-app-provider";
import { InstallPrompt } from "@/components/mobile/install-prompt";
import { OfflineHydrator } from "@/components/mobile/offline-hydrator";
import { fetchDaysForTrip } from "@/actions/days/fetch-days";
import { parseDayRouteContext } from "@/lib/mobile/parse-day-route";

type TripOption = {
  id: string;
  title: string;
};

type MobileChromeProps = {
  trips: TripOption[];
  children: React.ReactNode;
};

function FabWithActions() {
  const pathname = usePathname();
  const { openQuickAdd, openFabSheet } = useMobileApp();
  const dayContext = React.useMemo(
    () => parseDayRouteContext(pathname),
    [pathname],
  );

  return (
    <FloatingActionButton
      label="Quick add"
      onClick={() =>
        openFabSheet([
          {
            id: "memory",
            label: "Add Memory",
            icon: <BookOpen className="size-4" />,
            onSelect: () => openQuickAdd("memo", dayContext),
          },
          {
            id: "expense",
            label: "Add Expense",
            icon: <Receipt className="size-4" />,
            onSelect: () => openQuickAdd("expense", dayContext),
          },
          {
            id: "photo",
            label: "Upload Photo",
            icon: <Camera className="size-4" />,
            onSelect: () => openQuickAdd("photo", dayContext),
          },
        ])
      }
    />
  );
}

function MobileChromeInner({ trips, children }: MobileChromeProps) {
  const pathname = usePathname();
  const hideFab =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth");

  return (
    <>
      {children}
      <OfflineHydrator />
      <InstallPrompt />
      {!hideFab && <FabWithActions />}
      <AddEntrySheet trips={trips} getDaysForTrip={fetchDaysForTrip} />
      <FabActionSheet />
    </>
  );
}

export function MobileChrome({ trips, children }: MobileChromeProps) {
  return (
    <MobileAppProvider>
      <MobileChromeInner trips={trips}>{children}</MobileChromeInner>
    </MobileAppProvider>
  );
}
