"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import {
  ExpenseForm,
  type ExpenseFormValues,
} from "@/components/expenses/expense-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type EditExpenseDialogProps = {
  tripId: string;
  dayId: string;
  expenseId: string;
  defaultValues: ExpenseFormValues;
};

export function EditExpenseDialog({
  tripId,
  dayId,
  expenseId,
  defaultValues,
}: EditExpenseDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
          <DialogDescription>Update this expense entry.</DialogDescription>
        </DialogHeader>
        <ExpenseForm
          tripId={tripId}
          dayId={dayId}
          expenseId={expenseId}
          mode="edit"
          defaultValues={defaultValues}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
