import { prisma } from "@/lib/prisma";

export type CreatePhotoInput = {
  travelDayId: string;
  noteId?: string | null;
  storagePath: string;
  url: string;
  caption?: string | null;
  sortOrder?: number;
};

export type UpdatePhotoInput = Partial<
  Pick<CreatePhotoInput, "caption" | "noteId" | "sortOrder">
>;

export async function createPhoto(input: CreatePhotoInput) {
  return prisma.photo.create({
    data: {
      travelDayId: input.travelDayId,
      noteId: input.noteId ?? null,
      storagePath: input.storagePath,
      url: input.url,
      caption: input.caption ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function findPhotoById(id: string) {
  return prisma.photo.findUnique({ where: { id } });
}

export async function findPhotoByIdForUser(photoId: string, userId: string) {
  return prisma.photo.findFirst({
    where: { id: photoId, travelDay: { trip: { userId } } },
    include: {
      note: { select: { content: true } },
      travelDay: {
        select: {
          id: true,
          tripId: true,
          title: true,
          location: true,
          trip: { select: { id: true, title: true, userId: true } },
        },
      },
    },
  });
}

export async function findPhotosByTravelDayId(travelDayId: string) {
  return prisma.photo.findMany({
    where: { travelDayId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function updatePhoto(
  photoId: string,
  travelDayId: string,
  data: UpdatePhotoInput,
) {
  return prisma.photo.updateMany({
    where: { id: photoId, travelDayId },
    data,
  });
}

export async function updatePhotoAiCaption(
  photoId: string,
  userId: string,
  aiCaption: string,
) {
  return prisma.photo.updateMany({
    where: { id: photoId, travelDay: { trip: { userId } } },
    data: { aiCaption },
  });
}

export async function deletePhoto(photoId: string, travelDayId: string) {
  return prisma.photo.deleteMany({
    where: { id: photoId, travelDayId },
  });
}

export async function countPhotosForUser(userId: string): Promise<number> {
  return prisma.photo.count({
    where: { travelDay: { trip: { userId } } },
  });
}

export async function findAllPhotosForUser(userId: string) {
  return prisma.photo.findMany({
    where: { travelDay: { trip: { userId } } },
    orderBy: [{ createdAt: "desc" }],
    include: {
      travelDay: {
        select: {
          id: true,
          dayNumber: true,
          title: true,
          date: true,
          trip: {
            select: { id: true, title: true, country: true },
          },
        },
      },
    },
  });
}

export async function getNextPhotoSortOrder(travelDayId: string): Promise<number> {
  const latest = await prisma.photo.findFirst({
    where: { travelDayId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (latest?.sortOrder ?? -1) + 1;
}
