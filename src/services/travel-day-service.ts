import { cache } from "react";

import { serializeExpenseForClient } from "@/lib/format";
import {
  createTravelDay as createTravelDayRecord,
  deleteTravelDay as deleteTravelDayRecord,
  findTravelDayByIdForUser,
  findTravelDaysByTripId,
  findTravelDaysJournalForTrip,
  getNextDayNumberForTrip,
  updateTravelDay as updateTravelDayRecord,
  type CreateTravelDayInput,
  type UpdateTravelDayInput,
} from "@/repositories/travel-day-repository";
import { findTripByIdForUser } from "@/repositories/trip-repository";
import { TripNotFoundError } from "@/services/trip-service";

export class TravelDayNotFoundError extends Error {
  constructor(message = "Travel day not found") {
    super(message);
    this.name = "TravelDayNotFoundError";
  }
}

async function assertTripOwnedByUser(tripId: string, userId: string) {
  const trip = await findTripByIdForUser(tripId, userId);
  if (!trip) {
    throw new TripNotFoundError();
  }
  return trip;
}

export const listTravelDaysForTrip = cache(
  async (tripId: string, userId: string) => {
    await assertTripOwnedByUser(tripId, userId);
    return findTravelDaysByTripId(tripId);
  },
);

/** Use when trip ownership was already verified (layout/page). */
export const listTravelDaysForVerifiedTrip = cache(async (tripId: string) => {
  return findTravelDaysByTripId(tripId);
});

export const getTripJournalDays = cache(async (tripId: string) => {
  return findTravelDaysJournalForTrip(tripId);
});

export const getTravelDayForUser = cache(async (dayId: string, userId: string) => {
  const day = await findTravelDayByIdForUser(dayId, userId);
  if (!day) {
    throw new TravelDayNotFoundError();
  }
  return {
    ...day,
    expenses: day.expenses.map(serializeExpenseForClient),
  };
});

export async function createTravelDayForTrip(
  tripId: string,
  userId: string,
  input: Omit<CreateTravelDayInput, "tripId" | "dayNumber"> & {
    dayNumber?: number;
  },
) {
  await assertTripOwnedByUser(tripId, userId);
  const dayNumber =
    input.dayNumber ?? (await getNextDayNumberForTrip(tripId));
  return createTravelDayRecord({
    tripId,
    dayNumber,
    date: input.date,
    title: input.title,
    location: input.location,
  });
}

export async function updateTravelDayForUser(
  tripId: string,
  dayId: string,
  userId: string,
  input: UpdateTravelDayInput,
) {
  await assertTripOwnedByUser(tripId, userId);
  const result = await updateTravelDayRecord(dayId, tripId, input);
  if (result.count === 0) {
    throw new TravelDayNotFoundError();
  }
}

export async function deleteTravelDayForUser(
  tripId: string,
  dayId: string,
  userId: string,
) {
  await assertTripOwnedByUser(tripId, userId);
  const result = await deleteTravelDayRecord(dayId, tripId);
  if (result.count === 0) {
    throw new TravelDayNotFoundError();
  }
}
