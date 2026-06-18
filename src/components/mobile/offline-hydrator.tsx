"use client";

import * as React from "react";

import { OfflineBanner } from "@/components/mobile/offline-banner";
import {
  cacheDays,
  cacheExpenses,
  cacheTrips,
  type OfflineDaySnapshot,
  type OfflineExpenseSnapshot,
  type OfflineTripSnapshot,
} from "@/lib/offline/db";

type OfflineHydratorProps = {
  trips?: OfflineTripSnapshot[];
  days?: OfflineDaySnapshot[];
  expenses?: OfflineExpenseSnapshot[];
};

export function OfflineHydrator({
  trips,
  days,
  expenses,
}: OfflineHydratorProps) {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    setIsOffline(!navigator.onLine);

    function handleOnline() {
      setIsOffline(false);
    }

    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  React.useEffect(() => {
    if (!navigator.onLine) return;
    if (trips?.length) void cacheTrips(trips);
    if (days?.length) void cacheDays(days);
    if (expenses?.length) void cacheExpenses(expenses);
  }, [trips, days, expenses]);

  return <OfflineBanner isOffline={isOffline} />;
}
