"use server";

import { revalidatePath } from "next/cache";

import { rethrowIfRedirect } from "@/lib/action-errors";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  DEFAULT_EXPENSE_CURRENCY,
  EXPENSE_CATEGORIES,
  ROUTES,
} from "@/lib/constants";
import {
  createExpenseForDay,
  deleteExpenseForDay,
  updateExpenseForDay,
} from "@/services/expense-service";

export type ExpenseActionState = {
  error?: string;
  success?: boolean;
};

function readExpenseIds(formData: FormData) {
  return {
    tripId: String(formData.get("tripId") ?? "").trim(),
    dayId: String(formData.get("dayId") ?? "").trim(),
    expenseId: String(formData.get("expenseId") ?? "").trim(),
  };
}

function parseAmount(raw: string): number | null {
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function parseExpenseFields(formData: FormData) {
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const currency =
    String(formData.get("currency") ?? DEFAULT_EXPENSE_CURRENCY).trim() ||
    DEFAULT_EXPENSE_CURRENCY;
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const category =
    categoryRaw &&
    (EXPENSE_CATEGORIES as readonly string[]).includes(categoryRaw)
      ? categoryRaw
      : categoryRaw || null;

  return {
    amount,
    currency,
    category,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

function revalidateExpensePaths(tripId: string, dayId: string) {
  revalidatePath(ROUTES.trip(tripId));
  revalidatePath(ROUTES.travelDay(tripId, dayId));
  revalidatePath(ROUTES.dashboard);
}

export async function createExpense(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const { tripId, dayId } = readExpenseIds(formData);
  const fields = parseExpenseFields(formData);

  if (!tripId || !dayId) {
    return { error: "Travel day not found." };
  }
  if (fields.amount === null) {
    return { error: "Enter a valid expense amount." };
  }

  try {
    const user = await getCurrentUser();
    await createExpenseForDay(tripId, dayId, user.id, {
      amount: fields.amount,
      currency: fields.currency,
      category: fields.category,
      notes: fields.notes,
    });
    revalidateExpensePaths(tripId, dayId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to create expense. Please try again." };
  }
}

export async function updateExpense(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const { tripId, dayId, expenseId } = readExpenseIds(formData);
  const fields = parseExpenseFields(formData);

  if (!tripId || !dayId || !expenseId) {
    return { error: "Expense not found." };
  }
  if (fields.amount === null) {
    return { error: "Enter a valid expense amount." };
  }

  try {
    const user = await getCurrentUser();
    await updateExpenseForDay(tripId, dayId, expenseId, user.id, {
      amount: fields.amount,
      currency: fields.currency,
      category: fields.category,
      notes: fields.notes,
    });
    revalidateExpensePaths(tripId, dayId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to update expense. Please try again." };
  }
}

export async function deleteExpense(
  _prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const { tripId, dayId, expenseId } = readExpenseIds(formData);
  if (!tripId || !dayId || !expenseId) {
    return { error: "Expense not found." };
  }

  try {
    const user = await getCurrentUser();
    await deleteExpenseForDay(tripId, dayId, expenseId, user.id);
    revalidateExpensePaths(tripId, dayId);
    return { success: true };
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: "Unable to delete expense. Please try again." };
  }
}
