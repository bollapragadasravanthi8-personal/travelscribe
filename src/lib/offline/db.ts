import { get, set } from "idb-keyval";

export type OfflineTripSnapshot = {
  id: string;
  title: string;
  country: string | null;
  startDate: string | null;
  endDate: string | null;
  coverImageUrl: string | null;
  cachedAt: string;
};

export type OfflineDaySnapshot = {
  id: string;
  tripId: string;
  dayNumber: number;
  title: string | null;
  location: string | null;
  date: string | null;
  cachedAt: string;
};

export type OfflineExpenseSnapshot = {
  id: string;
  travelDayId: string;
  amount: string;
  currency: string;
  category: string | null;
  notes: string | null;
  cachedAt: string;
};

const KEYS = {
  trips: "offline:trips",
  days: "offline:days",
  expenses: "offline:expenses",
} as const;

export async function cacheTrips(trips: OfflineTripSnapshot[]) {
  await set(KEYS.trips, trips);
}

export async function cacheDays(days: OfflineDaySnapshot[]) {
  await set(KEYS.days, days);
}

export async function cacheExpenses(expenses: OfflineExpenseSnapshot[]) {
  await set(KEYS.expenses, expenses);
}

export async function getCachedTrips(): Promise<OfflineTripSnapshot[]> {
  return (await get<OfflineTripSnapshot[]>(KEYS.trips)) ?? [];
}

export async function getCachedDays(): Promise<OfflineDaySnapshot[]> {
  return (await get<OfflineDaySnapshot[]>(KEYS.days)) ?? [];
}

export async function getCachedExpenses(): Promise<OfflineExpenseSnapshot[]> {
  return (await get<OfflineExpenseSnapshot[]>(KEYS.expenses)) ?? [];
}
