"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { rethrowIfRedirect } from "@/lib/action-errors";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { requireSessionUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";
import { parseFormDate } from "@/lib/format";
import { resolveTripCoverUrl } from "@/lib/trip-cover";
import {
  createTripForUser,
  deleteTripForUser,
  updateTripForUser,
} from "@/services/trip-service";

export type TripActionState = {
  error?: string;
  success?: boolean;
};

function readTripId(formData: FormData): string {
  return String(formData.get("tripId") ?? "").trim();
}

function revalidateTripPaths(tripId?: string) {
  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.trips);
  if (tripId) {
    revalidatePath(ROUTES.trip(tripId));
  }
}

export async function createTrip(
  _prevState: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "Trip title is required." };
  }

  try {
    const [user, sessionUser] = await Promise.all([
      getCurrentUser(),
      requireSessionUser(),
    ]);
    const trip = await createTripForUser(user.id, {
      title,
      country: String(formData.get("country") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      startDate: parseFormDate(String(formData.get("startDate") ?? "")),
      endDate: parseFormDate(String(formData.get("endDate") ?? "")),
      coverImageUrl: null,
    });

    let coverImageUrl: string | null = null;
    try {
      coverImageUrl = await resolveTripCoverUrl(formData, sessionUser.id, trip.id);
    } catch (coverError) {
      if (coverError instanceof Error) {
        return { error: coverError.message };
      }
      return { error: "Unable to upload cover image." };
    }

    if (coverImageUrl) {
      await updateTripForUser(trip.id, user.id, { coverImageUrl });
    }

    revalidateTripPaths(trip.id);
    redirect(ROUTES.trip(trip.id));
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to create trip. Please try again." };
  }
}

export async function updateTrip(
  _prevState: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const tripId = readTripId(formData);
  const title = String(formData.get("title") ?? "").trim();
  if (!tripId) {
    return { error: "Trip not found." };
  }
  if (!title) {
    return { error: "Trip title is required." };
  }

  try {
    const [user, sessionUser] = await Promise.all([
      getCurrentUser(),
      requireSessionUser(),
    ]);

    let coverImageUrl: string | null = null;
    try {
      coverImageUrl = await resolveTripCoverUrl(formData, sessionUser.id, tripId);
    } catch (coverError) {
      if (coverError instanceof Error) {
        return { error: coverError.message };
      }
      return { error: "Unable to upload cover image." };
    }

    await updateTripForUser(tripId, user.id, {
      title,
      country: String(formData.get("country") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      startDate: parseFormDate(String(formData.get("startDate") ?? "")),
      endDate: parseFormDate(String(formData.get("endDate") ?? "")),
      coverImageUrl,
    });
    revalidateTripPaths(tripId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to update trip. Please try again." };
  }
}

export async function deleteTrip(
  _prevState: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const tripId = readTripId(formData);
  if (!tripId) {
    return { error: "Trip not found." };
  }

  try {
    const user = await getCurrentUser();
    await deleteTripForUser(tripId, user.id);
    revalidateTripPaths();
    redirect(ROUTES.trips);
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to delete trip. Please try again." };
  }
}
