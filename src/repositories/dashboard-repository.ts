import { prisma } from "@/lib/prisma";
import { sumTripDurationDays } from "@/lib/format";
import { aggregateExpenseTotalsForUser } from "@/repositories/expense-repository";
import { findTripsForUser } from "@/repositories/trip-repository";

export async function getDashboardCountsForUser(
  userId: string,
  trips?: Awaited<ReturnType<typeof findTripsForUser>>,
) {
  const tripList = trips ?? (await findTripsForUser(userId));
  const [photoCount, expenseCount, daysLoggedCount] = await Promise.all([
    prisma.photo.count({ where: { travelDay: { trip: { userId } } } }),
    prisma.expense.count({ where: { travelDay: { trip: { userId } } } }),
    prisma.travelDay.count({ where: { trip: { userId } } }),
  ]);

  const tripCount = tripList.length;
  const travelDayCount = sumTripDurationDays(tripList);

  return {
    tripCount,
    travelDayCount,
    daysLoggedCount,
    photoCount,
    expenseCount,
  };
}

export async function findRecentTravelDaysForUser(userId: string, limit = 5) {
  return prisma.travelDay.findMany({
    where: { trip: { userId } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      trip: { select: { id: true, title: true } },
      _count: { select: { notes: true, photos: true, expenses: true } },
    },
  });
}

export async function getDashboardDataForUser(userId: string) {
  const [trips, recentDays, expenseTotals, countRows] = await Promise.all([
    findTripsForUser(userId),
    findRecentTravelDaysForUser(userId),
    aggregateExpenseTotalsForUser(userId),
    Promise.all([
      prisma.photo.count({ where: { travelDay: { trip: { userId } } } }),
      prisma.expense.count({ where: { travelDay: { trip: { userId } } } }),
      prisma.travelDay.count({ where: { trip: { userId } } }),
    ]),
  ]);

  const [photoCount, expenseCount, daysLoggedCount] = countRows;
  const stats = {
    tripCount: trips.length,
    travelDayCount: sumTripDurationDays(trips),
    daysLoggedCount,
    photoCount,
    expenseCount,
  };

  return { stats, trips, recentDays, expenseTotals };
}
