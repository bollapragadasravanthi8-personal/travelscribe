"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { TripForm } from "@/components/trips/trip-form";
import { ResponsiveFormShell } from "@/components/mobile/responsive-form-shell";
import { Button } from "@/components/ui/button";

type CreateTripDialogProps = {
  trigger?: React.ReactNode;
};

export function CreateTripDialog({ trigger }: CreateTripDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button className="h-11" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New Trip
        </Button>
      )}

      <ResponsiveFormShell
        open={open}
        onOpenChange={setOpen}
        title="Create trip"
        description="Start a new travel journal."
      >
        <TripForm mode="create" onSuccess={() => setOpen(false)} />
      </ResponsiveFormShell>
    </>
  );
}
