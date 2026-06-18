import type { Expense } from "@/generated/prisma/client";

/** Fixed locale so server and client render identical Intl output (avoids hydration errors). */
const APP_LOCALE = "en-US";

type DateLike = Date | string | null | undefined;

function toDate(value: DateLike): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a date for HTML `<input type="date">` values (YYYY-MM-DD). */
export function toDateInputValue(value: DateLike): string {
  const date = toDate(value);
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

/** Human-readable date for UI labels. */
export function formatDisplayDate(value: DateLike): string | null {
  const date = toDate(value);
  if (!date) return null;
  return new Intl.DateTimeFormat(APP_LOCALE, {
    dateStyle: "medium",
  }).format(date);
}

/** Parse a form date string (YYYY-MM-DD) into a Date at UTC midnight. */
export function parseFormDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Compact range label, e.g. "Jan 1, 2025 – Jan 7, 2025". */
export function formatDateRange(
  start: DateLike,
  end: DateLike,
): string | null {
  const startLabel = formatDisplayDate(start);
  const endLabel = formatDisplayDate(end);
  if (!startLabel && !endLabel) return null;
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel ?? endLabel;
}

/** Inclusive calendar-day count between trip start and end dates. */
export function countTripDurationDays(
  start: DateLike,
  end: DateLike,
): number | null {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return null;

  const startMs = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
  const endMs = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
  );
  if (endMs < startMs) return null;

  return Math.round((endMs - startMs) / (24 * 60 * 60 * 1000)) + 1;
}

/** Sum inclusive trip durations across all trips that have start and end dates. */
export function sumTripDurationDays(
  trips: Array<{ startDate: DateLike; endDate: DateLike }>,
): number {
  let total = 0;
  for (const trip of trips) {
    const days = countTripDurationDays(trip.startDate, trip.endDate);
    if (days != null) {
      total += days;
    }
  }
  return total;
}

/** Format a monetary amount with currency code. */
export function formatCurrency(
  amount: number | string,
  currency = "USD",
): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) return `${currency} 0.00`;
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

type ExpenseLike = Pick<Expense, "amount" | "currency"> | {
  amount: number | string | { toString(): string };
  currency: string;
};

/** Sum expenses grouped by ISO currency code. */
export function summarizeExpensesByCurrency(
  expenses: ExpenseLike[],
): { currency: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    const amount =
      typeof expense.amount === "object" && expense.amount !== null
        ? Number(expense.amount.toString())
        : Number(expense.amount);
    if (!Number.isFinite(amount)) continue;
    totals.set(expense.currency, (totals.get(expense.currency) ?? 0) + amount);
  }
  return [...totals.entries()]
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

/** Convert Prisma Decimal expense amounts to plain strings for client components. */
export function serializeExpenseForClient<T extends ExpenseLike & Record<string, unknown>>(
  expense: T,
) {
  const amount =
    typeof expense.amount === "object" && expense.amount !== null
      ? expense.amount.toString()
      : String(expense.amount);

  return {
    ...expense,
    amount,
  };
}
