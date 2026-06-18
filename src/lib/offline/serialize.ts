import type {
  OfflineDaySnapshot,
  OfflineExpenseSnapshot,
  OfflineTripSnapshot,
} from "@/lib/offline/db";

export function toOfflineTripSnapshot(trip: {
  id: string;
  title: string;
  country: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  coverImageUrl: string | null;
}): OfflineTripSnapshot {
  return {
    id: trip.id,
    title: trip.title,
    country: trip.country,
    startDate: trip.startDate ? String(trip.startDate) : null,
    endDate: trip.endDate ? String(trip.endDate) : null,
    coverImageUrl: trip.coverImageUrl,
    cachedAt: new Date().toISOString(),
  };
}

export function toOfflineDaySnapshot(day: {
  id: string;
  tripId: string;
  dayNumber: number;
  title: string | null;
  location: string | null;
  date: Date | string | null;
}): OfflineDaySnapshot {
  return {
    id: day.id,
    tripId: day.tripId,
    dayNumber: day.dayNumber,
    title: day.title,
    location: day.location,
    date: day.date ? String(day.date) : null,
    cachedAt: new Date().toISOString(),
  };
}

export function toOfflineExpenseSnapshot(expense: {
  id: string;
  travelDayId: string;
  amount: string;
  currency: string;
  category: string | null;
  notes: string | null;
}): OfflineExpenseSnapshot {
  return {
    id: expense.id,
    travelDayId: expense.travelDayId,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    notes: expense.notes,
    cachedAt: new Date().toISOString(),
  };
}
