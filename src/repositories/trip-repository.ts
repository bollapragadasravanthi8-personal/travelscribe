import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateTripInput = {
  userId: string;
  title: string;
  description?: string | null;
  country?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  coverImageUrl?: string | null;
};

export type UpdateTripInput = Partial<
  Omit<CreateTripInput, "userId">
>;

const tripListSelect = {
  id: true,
  title: true,
  description: true,
  country: true,
  startDate: true,
  endDate: true,
  coverImageUrl: true,
  aiStory: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { days: true },
  },
  days: {
    select: {
      _count: {
        select: { photos: true, expenses: true },
      },
    },
  },
} satisfies Prisma.TripSelect;

export type TripListItem = Omit<
  Prisma.TripGetPayload<{ select: typeof tripListSelect }>,
  "days"
> & {
  photoCount: number;
  expenseCount: number;
};

function mapTripListItem(
  trip: Prisma.TripGetPayload<{ select: typeof tripListSelect }>,
): TripListItem {
  const photoCount = trip.days.reduce(
    (sum, day) => sum + day._count.photos,
    0,
  );
  const expenseCount = trip.days.reduce(
    (sum, day) => sum + day._count.expenses,
    0,
  );
  const { days, ...rest } = trip;
  void days;
  return { ...rest, photoCount, expenseCount };
}

export async function createTrip(input: CreateTripInput) {
  return prisma.trip.create({
    data: {
      userId: input.userId,
      title: input.title,
      description: input.description ?? null,
      country: input.country ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
    },
  });
}

export async function findTripById(id: string) {
  return prisma.trip.findUnique({ where: { id } });
}

export async function findTripByIdForUser(tripId: string, userId: string) {
  return prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      _count: { select: { days: true } },
    },
  });
}

export async function findTripsForUser(userId: string): Promise<TripListItem[]> {
  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: tripListSelect,
  });
  return trips.map(mapTripListItem);
}

export async function findTripWithStoryContextForUser(
  tripId: string,
  userId: string,
) {
  return prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          notes: { orderBy: { createdAt: "asc" } },
          photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
          expenses: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
}

export async function updateTrip(
  tripId: string,
  userId: string,
  data: UpdateTripInput,
) {
  return prisma.trip.updateMany({
    where: { id: tripId, userId },
    data,
  });
}

export async function updateTripAiStory(
  tripId: string,
  userId: string,
  aiStory: string,
) {
  return prisma.trip.updateMany({
    where: { id: tripId, userId },
    data: { aiStory },
  });
}

export async function deleteTrip(tripId: string, userId: string) {
  return prisma.trip.deleteMany({
    where: { id: tripId, userId },
  });
}
