"use client";

import { OfflineHydrator } from "@/components/mobile/offline-hydrator";
import type {
  OfflineDaySnapshot,
  OfflineExpenseSnapshot,
  OfflineTripSnapshot,
} from "@/lib/offline/db";

type OfflinePageCacheProps = {
  trips?: OfflineTripSnapshot[];
  days?: OfflineDaySnapshot[];
  expenses?: OfflineExpenseSnapshot[];
};

/** Writes page snapshots to IndexedDB when online for read-only offline viewing. */
export function OfflinePageCache(props: OfflinePageCacheProps) {
  return <OfflineHydrator {...props} />;
}
