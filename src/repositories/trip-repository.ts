import { Prisma } from "@/generated/prisma/client";
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
} satisfies Prisma.TripSelect;

export type TripListItem = Prisma.TripGetPayload<{
  select: typeof tripListSelect;
}> & {
  photoCount: number;
  expenseCount: number;
};

type TripCountRow = { tripId: string; count: number };

async function getPhotoCountsByTripId(tripIds: string[]) {
  if (tripIds.length === 0) {
    return new Map<string, number>();
  }

  const rows = await prisma.$queryRaw<TripCountRow[]>`
    SELECT td."tripId" AS "tripId", COUNT(p.id)::int AS count
    FROM photos p
    INNER JOIN travel_days td ON p."travelDayId" = td.id
    WHERE td."tripId" IN (${Prisma.join(tripIds)})
    GROUP BY td."tripId"
  `;

  return new Map(rows.map((row) => [row.tripId, row.count]));
}

async function getExpenseCountsByTripId(tripIds: string[]) {
  if (tripIds.length === 0) {
    return new Map<string, number>();
  }

  const rows = await prisma.$queryRaw<TripCountRow[]>`
    SELECT td."tripId" AS "tripId", COUNT(e.id)::int AS count
    FROM expenses e
    INNER JOIN travel_days td ON e."travelDayId" = td.id
    WHERE td."tripId" IN (${Prisma.join(tripIds)})
    GROUP BY td."tripId"
  `;

  return new Map(rows.map((row) => [row.tripId, row.count]));
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

/** Lightweight ownership check for layouts — avoids loading trip detail. */
export async function isTripOwnedByUser(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true },
  });
  return trip !== null;
}

export async function findTripTitlesForUser(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });
}

export async function findTripsForUser(userId: string): Promise<TripListItem[]> {
  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: tripListSelect,
  });

  const tripIds = trips.map((trip) => trip.id);
  const [photoCounts, expenseCounts] = await Promise.all([
    getPhotoCountsByTripId(tripIds),
    getExpenseCountsByTripId(tripIds),
  ]);

  return trips.map((trip) => ({
    ...trip,
    photoCount: photoCounts.get(trip.id) ?? 0,
    expenseCount: expenseCounts.get(trip.id) ?? 0,
  }));
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
