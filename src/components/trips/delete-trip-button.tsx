"use client";

import { useActionState, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteTrip, type TripActionState } from "@/actions/trips";
import { ResponsiveFormShell } from "@/components/mobile/responsive-form-shell";
import { Button } from "@/components/ui/button";

const initialState: TripActionState = {};

type DeleteTripButtonProps = {
  tripId: string;
  tripTitle: string;
};

export function DeleteTripButton({ tripId, tripTitle }: DeleteTripButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteTrip, initialState);

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
        Delete
      </Button>

      <ResponsiveFormShell
        open={open}
        onOpenChange={setOpen}
        title="Delete trip"
        description={`Permanently delete "${tripTitle}" and all related days, notes, photos, and expenses.`}
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tripId" value={tripId} />
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full sm:w-auto"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="h-11 w-full sm:w-auto"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete trip"
              )}
            </Button>
          </div>
        </form>
      </ResponsiveFormShell>
    </>
  );
}
