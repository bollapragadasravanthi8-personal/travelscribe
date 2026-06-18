"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { listTravelDaysForTrip } from "@/services/travel-day-service";

export async function fetchDaysForTrip(tripId: string) {
  const user = await getCurrentUser();
  const days = await listTravelDaysForTrip(tripId, user.id);
  return days.map((day) => ({
    id: day.id,
    dayNumber: day.dayNumber,
    title: day.title,
  }));
}
