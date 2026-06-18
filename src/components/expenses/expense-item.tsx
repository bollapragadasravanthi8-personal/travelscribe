"use client";

import * as React from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { deleteExpense, type ExpenseActionState } from "@/actions/expenses";
import { ExpenseForm, type ExpenseFormValues } from "@/components/expenses/expense-form";
import { ResponsiveFormShell } from "@/components/mobile/responsive-form-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type ExpenseItemData = {
  id: string;
  amount: number | string;
  currency: string;
  category: string | null;
  notes: string | null;
};

type ExpenseItemProps = {
  tripId: string;
  dayId: string;
  expense: ExpenseItemData;
  dayLabel?: string;
  className?: string;
};

const initialState: ExpenseActionState = {};

export function ExpenseItem({
  tripId,
  dayId,
  expense,
  dayLabel,
  className,
}: ExpenseItemProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(deleteExpense, initialState);
  const amount =
    typeof expense.amount === "string"
      ? Number(expense.amount)
      : expense.amount;

  const defaultValues: ExpenseFormValues = {
    amount: amount.toFixed(2),
    currency: expense.currency,
    category: expense.category ?? "",
    notes: expense.notes ?? "",
  };

  return (
    <>
      <div
        className={cn(
          "flex min-h-11 items-start justify-between gap-3 rounded-xl border bg-card p-4",
          className,
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold">
              {formatCurrency(amount, expense.currency)}
            </p>
            {expense.category ? (
              <Badge variant="secondary">{expense.category}</Badge>
            ) : null}
          </div>
          {expense.notes ? (
            <p className="mt-1 text-sm text-muted-foreground">{expense.notes}</p>
          ) : null}
          {dayLabel ? (
            <p className="mt-1 text-xs text-muted-foreground">{dayLabel}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditOpen(true)}
            aria-label="Edit expense"
          >
            <Pencil className="size-4" />
          </Button>
          <form action={formAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="dayId" value={dayId} />
            <input type="hidden" name="expenseId" value={expense.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              disabled={pending}
              aria-label="Delete expense"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      <ResponsiveFormShell
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit expense"
        description="Update expense details."
      >
        <ExpenseForm
          mode="edit"
          tripId={tripId}
          dayId={dayId}
          expenseId={expense.id}
          defaultValues={defaultValues}
          onSuccess={() => setEditOpen(false)}
        />
      </ResponsiveFormShell>

      {state.error ? (
        <p className="mt-1 text-sm text-destructive">{state.error}</p>
      ) : null}
    </>
  );
}
