"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import {
  TravelDayForm,
  type TravelDayFormValues,
} from "@/components/days/travel-day-form";
import { ResponsiveFormShell } from "@/components/mobile/responsive-form-shell";
import { Button } from "@/components/ui/button";

type EditTravelDayDialogProps = {
  tripId: string;
  dayId: string;
  defaultValues: TravelDayFormValues;
  trigger?: React.ReactNode;
};

export function EditTravelDayDialog({
  tripId,
  dayId,
  defaultValues,
  trigger,
}: EditTravelDayDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
          Edit
        </Button>
      )}

      <ResponsiveFormShell
        open={open}
        onOpenChange={setOpen}
        title="Edit travel day"
        description="Update day details."
      >
        <TravelDayForm
          mode="edit"
          tripId={tripId}
          dayId={dayId}
          defaultValues={defaultValues}
          onSuccess={() => setOpen(false)}
        />
      </ResponsiveFormShell>
    </>
  );
}
