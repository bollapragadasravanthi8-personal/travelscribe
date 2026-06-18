"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import {
  createExpense,
  updateExpense,
  type ExpenseActionState,
} from "@/actions/expenses";
import { StickyFormFooter } from "@/components/mobile/sticky-form-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_EXPENSE_CURRENCY,
  EXPENSE_CATEGORIES,
  EXPENSE_CURRENCIES,
} from "@/lib/constants";

const initialState: ExpenseActionState = {};

export type ExpenseFormValues = {
  amount: string;
  currency: string;
  category: string;
  notes: string;
};

type ExpenseFormProps = {
  mode: "create" | "edit";
  tripId: string;
  dayId: string;
  expenseId?: string;
  defaultValues?: Partial<ExpenseFormValues>;
  onSuccess?: () => void;
  submitLabel?: string;
};

export function ExpenseForm({
  mode,
  tripId,
  dayId,
  expenseId,
  defaultValues,
  onSuccess,
  submitLabel,
}: ExpenseFormProps) {
  const action = mode === "create" ? createExpense : updateExpense;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="dayId" value={dayId} />
      {mode === "edit" && expenseId ? (
        <input type="hidden" name="expenseId" value={expenseId} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense-amount">Amount</Label>
          <Input
            id="expense-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            defaultValue={defaultValues?.amount ?? ""}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-currency">Currency</Label>
          <Select
            id="expense-currency"
            name="currency"
            defaultValue={defaultValues?.currency ?? DEFAULT_EXPENSE_CURRENCY}
          >
            {EXPENSE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-category">Category</Label>
        <Select
          id="expense-category"
          name="category"
          defaultValue={defaultValues?.category ?? ""}
        >
          <option value="">Select category</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-notes">Notes</Label>
        <Textarea
          id="expense-notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Optional details"
          rows={3}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <StickyFormFooter>
        <Button type="submit" className="h-11 w-full sm:w-auto" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel ?? (mode === "create" ? "Add expense" : "Save changes")
          )}
        </Button>
      </StickyFormFooter>
    </form>
  );
}
