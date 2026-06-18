import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateTravelDayInput = {
  tripId: string;
  dayNumber: number;
  date?: Date | null;
  title?: string | null;
  location?: string | null;
};

export type UpdateTravelDayInput = Partial<
  Omit<CreateTravelDayInput, "tripId" | "dayNumber">
>;

const travelDayDetailInclude = {
  trip: {
    select: { id: true, title: true, userId: true },
  },
  notes: {
    orderBy: { createdAt: "asc" as const },
    include: {
      photos: {
        orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
      },
      _count: { select: { photos: true } },
    },
  },
  photos: {
    where: { noteId: null },
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  expenses: {
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.TravelDayInclude;

export type TravelDayDetail = Prisma.TravelDayGetPayload<{
  include: typeof travelDayDetailInclude;
}>;

export async function createTravelDay(input: CreateTravelDayInput) {
  return prisma.travelDay.create({
    data: {
      tripId: input.tripId,
      dayNumber: input.dayNumber,
      date: input.date ?? null,
      title: input.title ?? null,
      location: input.location ?? null,
    },
  });
}

export async function findTravelDayById(id: string) {
  return prisma.travelDay.findUnique({ where: { id } });
}

/** Lightweight ownership check for layouts — avoids loading full day graph. */
export async function isTravelDayOwnedByUser(dayId: string, userId: string) {
  const day = await prisma.travelDay.findFirst({
    where: { id: dayId, trip: { userId } },
    select: { id: true },
  });
  return day !== null;
}

export async function findTravelDayByIdForUser(
  dayId: string,
  userId: string,
): Promise<TravelDayDetail | null> {
  return prisma.travelDay.findFirst({
    where: { id: dayId, trip: { userId } },
    include: travelDayDetailInclude,
  });
}

export async function findTravelDaysByTripId(tripId: string) {
  return prisma.travelDay.findMany({
    where: { tripId },
    orderBy: { dayNumber: "asc" },
    include: {
      _count: {
        select: { notes: true, photos: true, expenses: true },
      },
    },
  });
}

export async function getNextDayNumberForTrip(tripId: string): Promise<number> {
  const latest = await prisma.travelDay.findFirst({
    where: { tripId },
    orderBy: { dayNumber: "desc" },
    select: { dayNumber: true },
  });
  return (latest?.dayNumber ?? 0) + 1;
}

export async function updateTravelDay(
  dayId: string,
  tripId: string,
  data: UpdateTravelDayInput,
) {
  return prisma.travelDay.updateMany({
    where: { id: dayId, tripId },
    data,
  });
}

export async function updateTravelDayAiSummary(
  dayId: string,
  userId: string,
  aiSummary: string,
) {
  return prisma.travelDay.updateMany({
    where: { id: dayId, trip: { userId } },
    data: { aiSummary },
  });
}

export async function deleteTravelDay(dayId: string, tripId: string) {
  return prisma.travelDay.deleteMany({
    where: { id: dayId, tripId },
  });
}
