import { cache } from "react";

import {
  createTrip as createTripRecord,
  deleteTrip as deleteTripRecord,
  findTripByIdForUser,
  findTripTitlesForUser,
  findTripsForUser,
  updateTrip as updateTripRecord,
  type CreateTripInput,
  type UpdateTripInput,
} from "@/repositories/trip-repository";

export class TripNotFoundError extends Error {
  constructor(message = "Trip not found") {
    super(message);
    this.name = "TripNotFoundError";
  }
}

async function assertTripForUser(tripId: string, userId: string) {
  const trip = await findTripByIdForUser(tripId, userId);
  if (!trip) {
    throw new TripNotFoundError();
  }
  return trip;
}

export const listTripsForUser = cache(async (userId: string) => {
  return findTripsForUser(userId);
});

/** Lightweight trip list for nav / FAB — id + title only. */
export const listTripTitlesForUser = cache(async (userId: string) => {
  return findTripTitlesForUser(userId);
});

export const getTripForUser = cache(async (tripId: string, userId: string) => {
  return assertTripForUser(tripId, userId);
});

export async function createTripForUser(
  userId: string,
  input: Omit<CreateTripInput, "userId">,
) {
  return createTripRecord({ ...input, userId });
}

export async function updateTripForUser(
  tripId: string,
  userId: string,
  input: UpdateTripInput,
) {
  await assertTripForUser(tripId, userId);
  const result = await updateTripRecord(tripId, userId, input);
  if (result.count === 0) {
    throw new TripNotFoundError();
  }
}

export async function deleteTripForUser(tripId: string, userId: string) {
  await assertTripForUser(tripId, userId);
  const result = await deleteTripRecord(tripId, userId);
  if (result.count === 0) {
    throw new TripNotFoundError();
  }
}
