"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { rethrowIfRedirect } from "@/lib/action-errors";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ROUTES } from "@/lib/constants";
import { parseFormDate } from "@/lib/format";
import { createNote, deleteNote as deleteNoteRecord, updateNote as updateNoteRecord } from "@/repositories/note-repository";
import {
  deletePhotosByNoteId,
  findPhotosByNoteId,
} from "@/repositories/photo-repository";
import { deleteTravelPhoto } from "@/lib/storage/photos";
import {
  createTravelDayForTrip,
  deleteTravelDayForUser,
  getTravelDayForUser,
  updateTravelDayForUser,
} from "@/services/travel-day-service";

export type DayActionState = {
  error?: string;
  success?: boolean;
};

function readIds(formData: FormData) {
  return {
    tripId: String(formData.get("tripId") ?? "").trim(),
    dayId: String(formData.get("dayId") ?? "").trim(),
  };
}

function revalidateDayPaths(tripId: string, dayId?: string) {
  revalidatePath(ROUTES.trip(tripId));
  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.photos);
  if (dayId) {
    revalidatePath(ROUTES.travelDay(tripId, dayId));
  }
}

export async function createTravelDay(
  _prevState: DayActionState,
  formData: FormData,
): Promise<DayActionState> {
  const { tripId } = readIds(formData);
  if (!tripId) {
    return { error: "Trip not found." };
  }

  try {
    const user = await getCurrentUser();
    const day = await createTravelDayForTrip(tripId, user.id, {
      title: String(formData.get("title") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      date: parseFormDate(String(formData.get("date") ?? "")),
    });

    const memo = String(formData.get("memo") ?? "").trim();
    if (memo) {
      await createNote(day.id, memo);
    }

    revalidateDayPaths(tripId, day.id);
    redirect(ROUTES.travelDay(tripId, day.id));
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to create travel day. Please try again." };
  }
}

export async function updateTravelDay(
  _prevState: DayActionState,
  formData: FormData,
): Promise<DayActionState> {
  const { tripId, dayId } = readIds(formData);
  if (!tripId || !dayId) {
    return { error: "Travel day not found." };
  }

  try {
    const user = await getCurrentUser();
    await updateTravelDayForUser(tripId, dayId, user.id, {
      title: String(formData.get("title") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      date: parseFormDate(String(formData.get("date") ?? "")),
    });
    revalidateDayPaths(tripId, dayId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to update travel day. Please try again." };
  }
}

export async function deleteTravelDay(
  _prevState: DayActionState,
  formData: FormData,
): Promise<DayActionState> {
  const { tripId, dayId } = readIds(formData);
  if (!tripId || !dayId) {
    return { error: "Travel day not found." };
  }

  try {
    const user = await getCurrentUser();
    await deleteTravelDayForUser(tripId, dayId, user.id);
    revalidateDayPaths(tripId);
    redirect(ROUTES.trip(tripId));
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to delete travel day. Please try again." };
  }
}

export async function addNote(
  _prevState: DayActionState,
  formData: FormData,
): Promise<DayActionState> {
  const { tripId, dayId } = readIds(formData);
  const content = String(formData.get("content") ?? "").trim();
  if (!tripId || !dayId) {
    return { error: "Travel day not found." };
  }
  if (!content) {
    return { error: "Memo content is required." };
  }

  try {
    const user = await getCurrentUser();
    const day = await getTravelDayForUser(dayId, user.id);
    if (day.trip.id !== tripId) {
      return { error: "Travel day not found." };
    }
    await createNote(dayId, content);
    revalidateDayPaths(tripId, dayId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to add memo. Please try again." };
  }
}

export async function deleteNote(
  _prevState: DayActionState,
  formData: FormData,
): Promise<DayActionState> {
  const { tripId, dayId } = readIds(formData);
  const noteId = String(formData.get("noteId") ?? "").trim();
  if (!tripId || !dayId || !noteId) {
    return { error: "Memo not found." };
  }

  try {
    const user = await getCurrentUser();
    const day = await getTravelDayForUser(dayId, user.id);
    if (day.trip.id !== tripId) {
      return { error: "Travel day not found." };
    }

    // Memo photos use onDelete: SetNull — delete them explicitly so they
    // do not reappear in the day's photo memory section.
    const memoPhotos = await findPhotosByNoteId(noteId, dayId);
    await deletePhotosByNoteId(noteId, dayId);
    await deleteNoteRecord(noteId, dayId);
    for (const photo of memoPhotos) {
      try {
        await deleteTravelPhoto(photo.storagePath);
      } catch {
        // DB records removed; storage cleanup failure is non-fatal.
      }
    }

    revalidateDayPaths(tripId, dayId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to delete memo. Please try again." };
  }
}

export async function updateNote(
  _prevState: DayActionState,
  formData: FormData,
): Promise<DayActionState> {
  const { tripId, dayId } = readIds(formData);
  const noteId = String(formData.get("noteId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!tripId || !dayId || !noteId) {
    return { error: "Memo not found." };
  }
  if (!content) {
    return { error: "Memo content is required." };
  }

  try {
    const user = await getCurrentUser();
    const day = await getTravelDayForUser(dayId, user.id);
    if (day.trip.id !== tripId) {
      return { error: "Travel day not found." };
    }
    const result = await updateNoteRecord(noteId, dayId, content);
    if (result.count === 0) {
      return { error: "Memo not found." };
    }
    revalidateDayPaths(tripId, dayId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to update memo. Please try again." };
  }
}
