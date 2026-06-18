"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import { TripForm, type TripFormValues } from "@/components/trips/trip-form";
import { ResponsiveFormShell } from "@/components/mobile/responsive-form-shell";
import { Button } from "@/components/ui/button";

type EditTripDialogProps = {
  tripId: string;
  defaultValues: TripFormValues;
  trigger?: React.ReactNode;
};

export function EditTripDialog({
  tripId,
  defaultValues,
  trigger,
}: EditTripDialogProps) {
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
        title="Edit trip"
        description="Update trip details."
      >
        <TripForm
          mode="edit"
          tripId={tripId}
          defaultValues={defaultValues}
          onSuccess={() => setOpen(false)}
        />
      </ResponsiveFormShell>
    </>
  );
}
