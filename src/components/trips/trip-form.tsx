"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { createTrip, updateTrip, type TripActionState } from "@/actions/trips";
import { StickyFormFooter } from "@/components/mobile/sticky-form-footer";
import { TripCoverField } from "@/components/trips/trip-cover-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: TripActionState = {};

export type TripFormValues = {
  title: string;
  country: string;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
};

type TripFormProps = {
  mode: "create" | "edit";
  tripId?: string;
  defaultValues?: Partial<TripFormValues>;
  onSuccess?: () => void;
  submitLabel?: string;
};

export function TripForm({
  mode,
  tripId,
  defaultValues,
  onSuccess,
  submitLabel,
}: TripFormProps) {
  const action = mode === "create" ? createTrip : updateTrip;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && tripId ? (
        <input type="hidden" name="tripId" value={tripId} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="trip-title">Title</Label>
        <Input
          id="trip-title"
          name="title"
          defaultValue={defaultValues?.title ?? ""}
          placeholder="Summer in Japan"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trip-country">Country</Label>
        <Input
          id="trip-country"
          name="country"
          defaultValue={defaultValues?.country ?? ""}
          placeholder="Japan"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="trip-start-date">Start date</Label>
          <Input
            id="trip-start-date"
            name="startDate"
            type="date"
            defaultValue={defaultValues?.startDate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trip-end-date">End date</Label>
          <Input
            id="trip-end-date"
            name="endDate"
            type="date"
            defaultValue={defaultValues?.endDate ?? ""}
          />
        </div>
      </div>

      <TripCoverField defaultUrl={defaultValues?.coverImageUrl ?? ""} />

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
            submitLabel ?? (mode === "create" ? "Create trip" : "Save changes")
          )}
        </Button>
      </StickyFormFooter>
    </form>
  );
}
