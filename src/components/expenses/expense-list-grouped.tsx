import Link from "next/link";

import { ExpenseItem } from "@/components/expenses/expense-item";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDisplayDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ExpenseListItem = {
  id: string;
  amount: number | string;
  currency: string;
  category: string | null;
  notes: string | null;
  createdAt?: Date | string;
  travelDay?: {
    id: string;
    dayNumber: number;
    title: string | null;
    date: Date | string | null;
    trip?: {
      id: string;
      title: string;
    };
  };
};

type ExpenseGroup = {
  key: string;
  label: string;
  sublabel?: string;
  tripId?: string;
  expenses: ExpenseListItem[];
  totals: Array<{ currency: string; total: number }>;
};

type ExpenseListGroupedProps = {
  expenses: ExpenseListItem[];
  groupBy?: "trip" | "day" | "category";
  tripId?: string;
  dayId?: string;
  className?: string;
};

function getDayLabel(expense: ExpenseListItem) {
  const day = expense.travelDay;
  if (!day) return undefined;
  const name = day.title ?? `Day ${day.dayNumber}`;
  const date = formatDisplayDate(day.date);
  return date ? `${name} · ${date}` : name;
}

function groupExpenses(
  expenses: ExpenseListItem[],
  groupBy: "trip" | "day" | "category",
): ExpenseGroup[] {
  const groups = new Map<string, ExpenseGroup>();

  for (const expense of expenses) {
    let key: string;
    let label: string;
    let sublabel: string | undefined;
    let tripId: string | undefined;

    if (groupBy === "category") {
      key = expense.category ?? "Uncategorized";
      label = expense.category ?? "Uncategorized";
    } else if (groupBy === "trip") {
      const trip = expense.travelDay?.trip;
      key = trip?.id ?? "unknown";
      label = trip?.title ?? "Unknown trip";
      tripId = trip?.id;
      sublabel = `${expense.travelDay ? getDayLabel(expense) : "Unknown day"}`;
    } else {
      const day = expense.travelDay;
      key = day?.id ?? "unknown";
      label = day?.title ?? (day ? `Day ${day.dayNumber}` : "Unknown day");
      sublabel = [
        day?.trip?.title,
        formatDisplayDate(day?.date ?? null),
      ]
        .filter(Boolean)
        .join(" · ");
    }

    const existing = groups.get(key);
    if (existing) {
      existing.expenses.push(expense);
    } else {
      groups.set(key, {
        key,
        label,
        sublabel: groupBy === "trip" ? undefined : sublabel,
        tripId,
        expenses: [expense],
        totals: [],
      });
    }
  }

  const result = Array.from(groups.values()).map((group) => {
    const totalsMap = new Map<string, number>();
    for (const expense of group.expenses) {
      const amount =
        typeof expense.amount === "string"
          ? Number(expense.amount)
          : expense.amount;
      totalsMap.set(
        expense.currency,
        (totalsMap.get(expense.currency) ?? 0) + amount,
      );
    }
    group.totals = Array.from(totalsMap.entries()).map(([currency, total]) => ({
      currency,
      total,
    }));

    if (groupBy === "trip") {
      const dayCount = new Set(
        group.expenses.map((expense) => expense.travelDay?.id).filter(Boolean),
      ).size;
      group.sublabel = `${group.expenses.length} expense${group.expenses.length === 1 ? "" : "s"} · ${dayCount} day${dayCount === 1 ? "" : "s"}`;
    }

    return group;
  });

  if (groupBy === "trip") {
    return result.sort((a, b) => a.label.localeCompare(b.label));
  }

  return result;
}

export function ExpenseListGrouped({
  expenses,
  groupBy = "day",
  tripId,
  dayId,
  className,
}: ExpenseListGroupedProps) {
  if (expenses.length === 0) {
    return null;
  }

  const groups = groupExpenses(expenses, groupBy);

  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group) => (
        <section
          key={group.key}
          className="overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <div className="flex flex-wrap items-end justify-between gap-2 border-b bg-muted/30 px-4 py-3">
            <div>
              {groupBy === "trip" && group.tripId ? (
                <Link
                  href={ROUTES.trip(group.tripId)}
                  className="font-semibold text-primary hover:underline"
                >
                  {group.label}
                </Link>
              ) : (
                <h3 className="font-semibold">{group.label}</h3>
              )}
              {group.sublabel ? (
                <p className="text-sm text-muted-foreground">{group.sublabel}</p>
              ) : null}
            </div>
            <div className="text-sm font-semibold text-primary">
              {group.totals
                .map(({ currency, total }) => formatCurrency(total, currency))
                .join(" · ")}
            </div>
          </div>
          <div className="space-y-0 divide-y p-2">
            {group.expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                tripId={tripId ?? expense.travelDay?.trip?.id ?? ""}
                dayId={dayId ?? expense.travelDay?.id ?? ""}
                expense={expense}
                dayLabel={groupBy === "trip" ? getDayLabel(expense) : undefined}
                className="border-0 shadow-none"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
