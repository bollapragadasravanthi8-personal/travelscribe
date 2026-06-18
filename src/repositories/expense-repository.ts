import { prisma } from "@/lib/prisma";

export type CreateExpenseInput = {
  travelDayId: string;
  amount: number;
  currency?: string;
  category?: string | null;
  notes?: string | null;
};

export type UpdateExpenseInput = Partial<Omit<CreateExpenseInput, "travelDayId">>;

export async function createExpense(input: CreateExpenseInput) {
  return prisma.expense.create({
    data: {
      travelDayId: input.travelDayId,
      amount: input.amount,
      currency: input.currency ?? "USD",
      category: input.category ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function findExpenseById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: {
      travelDay: {
        select: { tripId: true, trip: { select: { userId: true } } },
      },
    },
  });
}

export async function findExpensesByTripId(tripId: string) {
  return prisma.expense.findMany({
    where: { travelDay: { tripId } },
    orderBy: { createdAt: "asc" },
    include: {
      travelDay: {
        select: { id: true, dayNumber: true, title: true },
      },
    },
  });
}

export async function countExpensesByTripId(tripId: string): Promise<number> {
  return prisma.expense.count({
    where: { travelDay: { tripId } },
  });
}

export async function findAllExpensesForUser(userId: string) {
  return prisma.expense.findMany({
    where: { travelDay: { trip: { userId } } },
    orderBy: { createdAt: "desc" },
    include: {
      travelDay: {
        select: {
          id: true,
          dayNumber: true,
          title: true,
          date: true,
          trip: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });
}

export async function updateExpense(
  expenseId: string,
  travelDayId: string,
  data: UpdateExpenseInput,
) {
  return prisma.expense.updateMany({
    where: { id: expenseId, travelDayId },
    data,
  });
}

export async function deleteExpense(expenseId: string, travelDayId: string) {
  return prisma.expense.deleteMany({
    where: { id: expenseId, travelDayId },
  });
}

/** Aggregate expense totals by currency for a user's trips. */
export async function aggregateExpenseTotalsForUser(userId: string) {
  const expenses = await prisma.expense.findMany({
    where: { travelDay: { trip: { userId } } },
    select: { amount: true, currency: true },
  });

  const totals = new Map<string, number>();
  for (const expense of expenses) {
    const amount = Number(expense.amount);
    totals.set(expense.currency, (totals.get(expense.currency) ?? 0) + amount);
  }

  return [...totals.entries()]
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

/** Aggregate expense totals by currency for a single trip. */
export async function aggregateExpenseTotalsByTripId(tripId: string) {
  const expenses = await prisma.expense.findMany({
    where: { travelDay: { tripId } },
    select: { amount: true, currency: true },
  });

  const totals = new Map<string, number>();
  for (const expense of expenses) {
    const amount = Number(expense.amount);
    totals.set(expense.currency, (totals.get(expense.currency) ?? 0) + amount);
  }

  return [...totals.entries()]
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}
