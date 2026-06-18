import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ExpenseListGrouped } from "@/components/expenses/expense-list-grouped";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Receipt } from "lucide-react";
import { listAllExpensesForUser } from "@/services/expense-service";
import { OfflinePageCache } from "@/components/mobile/offline-page-cache";
import { toOfflineExpenseSnapshot } from "@/lib/offline/serialize";

export const metadata: Metadata = {
  title: "Expenses",
};

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  const expenses = await listAllExpensesForUser(user.id);

  return (
    <>
      <OfflinePageCache
        expenses={expenses.map((expense) =>
          toOfflineExpenseSnapshot({
            id: expense.id,
            travelDayId: expense.travelDayId,
            amount: expense.amount,
            currency: expense.currency,
            category: expense.category,
            notes: expense.notes,
          }),
        )}
      />
      <PageHeader
        title="Expenses"
        description="All spending across your trips."
      />

      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description="Log expenses from a travel day to see them here."
        />
      ) : (
        <ExpenseListGrouped expenses={expenses} groupBy="trip" />
      )}
    </>
  );
}
