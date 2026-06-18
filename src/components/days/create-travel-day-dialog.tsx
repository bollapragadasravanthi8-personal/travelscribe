"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { TravelDayForm } from "@/components/days/travel-day-form";
import { ResponsiveFormShell } from "@/components/mobile/responsive-form-shell";
import { Button } from "@/components/ui/button";

type CreateTravelDayDialogProps = {
  tripId: string;
  trigger?: React.ReactNode;
};

export function CreateTravelDayDialog({
  tripId,
  trigger,
}: CreateTravelDayDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button className="h-11" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add day
        </Button>
      )}

      <ResponsiveFormShell
        open={open}
        onOpenChange={setOpen}
        title="Add travel day"
        description="Log a new day for this trip."
      >
        <TravelDayForm
          mode="create"
          tripId={tripId}
          onSuccess={() => setOpen(false)}
        />
      </ResponsiveFormShell>
    </>
  );
}
