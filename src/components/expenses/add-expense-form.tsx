"use client";

import { ExpenseForm } from "@/components/expenses/expense-form";

type AddExpenseFormProps = {
  tripId: string;
  dayId: string;
};

export function AddExpenseForm({ tripId, dayId }: AddExpenseFormProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <ExpenseForm mode="create" tripId={tripId} dayId={dayId} />
    </div>
  );
}
