"use server";

import { revalidatePath } from "next/cache";

import { rethrowIfRedirect } from "@/lib/action-errors";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { requireSessionUser } from "@/lib/auth/session";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  ROUTES,
} from "@/lib/constants";
import { deleteTravelPhoto, uploadTravelPhoto } from "@/lib/storage/photos";
import {
  createPhotoForDay,
  deletePhotoForDay,
} from "@/services/photo-service";

export type PhotoActionState = {
  error?: string;
  success?: boolean;
  uploadedCount?: number;
};

function readPhotoIds(formData: FormData) {
  return {
    tripId: String(formData.get("tripId") ?? "").trim(),
    dayId: String(formData.get("dayId") ?? "").trim(),
    photoId: String(formData.get("photoId") ?? "").trim(),
  };
}

function revalidatePhotoPaths(tripId: string, dayId: string) {
  revalidatePath(ROUTES.travelDay(tripId, dayId));
  revalidatePath(ROUTES.trip(tripId));
  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.photos);
}

function collectUploadFiles(formData: FormData): File[] {
  const multi = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (multi.length > 0) {
    return multi;
  }

  const single = formData.get("file");
  if (single instanceof File && single.size > 0) {
    return [single];
  }

  return [];
}

function validatePhotoFile(file: File): string | null {
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return `"${file.name}" exceeds the maximum upload size.`;
  }
  if (
    !ALLOWED_PHOTO_TYPES.includes(
      file.type as (typeof ALLOWED_PHOTO_TYPES)[number],
    )
  ) {
    return `"${file.name}" is an unsupported photo type.`;
  }
  return null;
}

async function savePhotoFile(
  file: File,
  tripId: string,
  dayId: string,
  userId: string,
  authId: string,
  noteId: string | null,
  caption: string | null,
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadTravelPhoto({
    authId,
    tripId,
    dayId,
    fileName: file.name,
    contentType: file.type,
    fileBuffer: buffer,
  });

  await createPhotoForDay(tripId, dayId, userId, {
    noteId,
    storagePath: uploaded.storagePath,
    url: uploaded.url,
    caption,
  });
}

export async function uploadPhoto(
  _prevState: PhotoActionState,
  formData: FormData,
): Promise<PhotoActionState> {
  const { tripId, dayId } = readPhotoIds(formData);
  if (!tripId || !dayId) {
    return { error: "Travel day not found." };
  }

  const files = collectUploadFiles(formData);
  if (files.length === 0) {
    return { error: "Choose at least one photo to upload." };
  }

  for (const file of files) {
    const validationError = validatePhotoFile(file);
    if (validationError) {
      return { error: validationError };
    }
  }

  const noteIdRaw = String(formData.get("noteId") ?? "").trim();
  const noteId = noteIdRaw || null;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  try {
    const [user, sessionUser] = await Promise.all([
      getCurrentUser(),
      requireSessionUser(),
    ]);

    for (const file of files) {
      await savePhotoFile(
        file,
        tripId,
        dayId,
        user.id,
        sessionUser.id,
        noteId,
        caption,
      );
    }

    revalidatePhotoPaths(tripId, dayId);
    return { success: true, uploadedCount: files.length };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to upload photo. Please try again." };
  }
}

export async function deletePhoto(
  _prevState: PhotoActionState,
  formData: FormData,
): Promise<PhotoActionState> {
  const { tripId, dayId, photoId } = readPhotoIds(formData);
  if (!tripId || !dayId || !photoId) {
    return { error: "Photo not found." };
  }

  try {
    const user = await getCurrentUser();
    const photo = await deletePhotoForDay(tripId, dayId, photoId, user.id);
    try {
      await deleteTravelPhoto(photo.storagePath);
    } catch {
      // DB record removed; storage cleanup failure is non-fatal.
    }
    revalidatePhotoPaths(tripId, dayId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to delete photo. Please try again." };
  }
}
