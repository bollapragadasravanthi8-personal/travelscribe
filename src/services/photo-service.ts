import {
  createPhoto as createPhotoRecord,
  deletePhoto as deletePhotoRecord,
  findAllPhotosForUser,
  findPhotoByIdForUser,
  findPhotosByTravelDayId,
  getNextPhotoSortOrder,
  updatePhoto as updatePhotoRecord,
  type CreatePhotoInput,
  type UpdatePhotoInput,
} from "@/repositories/photo-repository";
import { findNoteById } from "@/repositories/note-repository";
import { findTravelDayByIdForUser } from "@/repositories/travel-day-repository";
import { TravelDayNotFoundError } from "@/services/travel-day-service";

export class PhotoNotFoundError extends Error {
  constructor(message = "Photo not found") {
    super(message);
    this.name = "PhotoNotFoundError";
  }
}

export class PhotoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoValidationError";
  }
}

async function assertTravelDayForUser(dayId: string, userId: string) {
  const day = await findTravelDayByIdForUser(dayId, userId);
  if (!day) {
    throw new TravelDayNotFoundError();
  }
  return day;
}

async function validateNoteForDay(
  noteId: string | null | undefined,
  travelDayId: string,
) {
  if (!noteId) return;
  const note = await findNoteById(noteId);
  if (!note || note.travelDayId !== travelDayId) {
    throw new PhotoValidationError(
      "Selected memo does not belong to this travel day.",
    );
  }
}

export async function listPhotosForDay(dayId: string, userId: string) {
  await assertTravelDayForUser(dayId, userId);
  return findPhotosByTravelDayId(dayId);
}

export async function listAllPhotosForUser(userId: string) {
  return findAllPhotosForUser(userId);
}

export async function createPhotoForDay(
  tripId: string,
  dayId: string,
  userId: string,
  input: Omit<CreatePhotoInput, "travelDayId" | "sortOrder"> & {
    sortOrder?: number;
  },
) {
  const day = await assertTravelDayForUser(dayId, userId);
  if (day.trip.id !== tripId) {
    throw new TravelDayNotFoundError();
  }
  await validateNoteForDay(input.noteId, dayId);
  const sortOrder =
    input.sortOrder ?? (await getNextPhotoSortOrder(dayId));
  return createPhotoRecord({
    travelDayId: dayId,
    noteId: input.noteId,
    storagePath: input.storagePath,
    url: input.url,
    caption: input.caption,
    sortOrder,
  });
}

export async function updatePhotoForDay(
  tripId: string,
  dayId: string,
  photoId: string,
  userId: string,
  input: UpdatePhotoInput,
) {
  const day = await assertTravelDayForUser(dayId, userId);
  if (day.trip.id !== tripId) {
    throw new TravelDayNotFoundError();
  }
  await validateNoteForDay(input.noteId, dayId);
  const result = await updatePhotoRecord(photoId, dayId, input);
  if (result.count === 0) {
    throw new PhotoNotFoundError();
  }
}

export async function deletePhotoForDay(
  tripId: string,
  dayId: string,
  photoId: string,
  userId: string,
) {
  const day = await assertTravelDayForUser(dayId, userId);
  if (day.trip.id !== tripId) {
    throw new TravelDayNotFoundError();
  }
  const photo = await findPhotoByIdForUser(photoId, userId);
  if (!photo || photo.travelDay.id !== dayId) {
    throw new PhotoNotFoundError();
  }
  const result = await deletePhotoRecord(photoId, dayId);
  if (result.count === 0) {
    throw new PhotoNotFoundError();
  }
  return photo;
}

export async function getPhotoForUser(photoId: string, userId: string) {
  const photo = await findPhotoByIdForUser(photoId, userId);
  if (!photo) {
    throw new PhotoNotFoundError();
  }
  return photo;
}
