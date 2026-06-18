import { serializeExpenseForClient } from "@/lib/format";
import { cache } from "react";

import {
  aggregateExpenseTotalsByTripId,
  countExpensesByTripId,
  createExpense as createExpenseRecord,
  deleteExpense as deleteExpenseRecord,
  findAllExpensesForUser,
  findExpenseById,
  findExpensesByTripId,
  updateExpense as updateExpenseRecord,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/repositories/expense-repository";
import { findTripByIdForUser } from "@/repositories/trip-repository";
import { findTravelDayByIdForUser } from "@/repositories/travel-day-repository";
import { getTripForUser, TripNotFoundError } from "@/services/trip-service";
import { TravelDayNotFoundError } from "@/services/travel-day-service";

export class ExpenseNotFoundError extends Error {
  constructor(message = "Expense not found") {
    super(message);
    this.name = "ExpenseNotFoundError";
  }
}

async function assertTravelDayForUser(dayId: string, userId: string) {
  const day = await findTravelDayByIdForUser(dayId, userId);
  if (!day) {
    throw new TravelDayNotFoundError();
  }
  return day;
}

export const getTripExpenseSummary = cache(
  async (tripId: string, userId: string) => {
    await getTripForUser(tripId, userId);

    const [count, totals] = await Promise.all([
      countExpensesByTripId(tripId),
      aggregateExpenseTotalsByTripId(tripId),
    ]);

    return { count, totals };
  },
);

export async function listExpensesForTrip(tripId: string, userId: string) {
  const trip = await findTripByIdForUser(tripId, userId);
  if (!trip) {
    throw new TripNotFoundError();
  }
  const expenses = await findExpensesByTripId(tripId);
  return expenses.map(serializeExpenseForClient);
}

export async function listAllExpensesForUser(userId: string) {
  const expenses = await findAllExpensesForUser(userId);
  return expenses.map(serializeExpenseForClient);
}

export async function createExpenseForDay(
  tripId: string,
  dayId: string,
  userId: string,
  input: Omit<CreateExpenseInput, "travelDayId">,
) {
  const day = await assertTravelDayForUser(dayId, userId);
  if (day.trip.id !== tripId) {
    throw new TravelDayNotFoundError();
  }
  const expense = await createExpenseRecord({
    travelDayId: dayId,
    ...input,
  });
  return serializeExpenseForClient(expense);
}

export async function updateExpenseForDay(
  tripId: string,
  dayId: string,
  expenseId: string,
  userId: string,
  input: UpdateExpenseInput,
) {
  const day = await assertTravelDayForUser(dayId, userId);
  if (day.trip.id !== tripId) {
    throw new TravelDayNotFoundError();
  }
  const result = await updateExpenseRecord(expenseId, dayId, input);
  if (result.count === 0) {
    throw new ExpenseNotFoundError();
  }
}

export async function deleteExpenseForDay(
  tripId: string,
  dayId: string,
  expenseId: string,
  userId: string,
) {
  const day = await assertTravelDayForUser(dayId, userId);
  if (day.trip.id !== tripId) {
    throw new TravelDayNotFoundError();
  }
  const result = await deleteExpenseRecord(expenseId, dayId);
  if (result.count === 0) {
    throw new ExpenseNotFoundError();
  }
}

export async function getExpenseForUser(expenseId: string, userId: string) {
  const expense = await findExpenseById(expenseId);
  if (!expense || expense.travelDay.trip.userId !== userId) {
    throw new ExpenseNotFoundError();
  }
  return serializeExpenseForClient(expense);
}
