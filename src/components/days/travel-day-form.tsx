"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import {
  createTravelDay,
  updateTravelDay,
  type DayActionState,
} from "@/actions/days";
import { StickyFormFooter } from "@/components/mobile/sticky-form-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: DayActionState = {};

export type TravelDayFormValues = {
  title: string;
  date: string;
  location: string;
  memo: string;
};

type TravelDayFormProps = {
  mode: "create" | "edit";
  tripId: string;
  dayId?: string;
  defaultValues?: Partial<TravelDayFormValues>;
  onSuccess?: () => void;
  submitLabel?: string;
};

export function TravelDayForm({
  mode,
  tripId,
  dayId,
  defaultValues,
  onSuccess,
  submitLabel,
}: TravelDayFormProps) {
  const action = mode === "create" ? createTravelDay : updateTravelDay;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tripId" value={tripId} />
      {mode === "edit" && dayId ? (
        <input type="hidden" name="dayId" value={dayId} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="day-title">Title</Label>
        <Input
          id="day-title"
          name="title"
          defaultValue={defaultValues?.title ?? ""}
          placeholder="Arrival in Tokyo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="day-date">Date</Label>
        <Input
          id="day-date"
          name="date"
          type="date"
          defaultValue={defaultValues?.date ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="day-location">Location</Label>
        <Input
          id="day-location"
          name="location"
          defaultValue={defaultValues?.location ?? ""}
          placeholder="Tokyo, Japan"
        />
      </div>

      {mode === "create" ? (
        <div className="space-y-2">
          <Label htmlFor="day-memo">First memo (optional)</Label>
          <Textarea
            id="day-memo"
            name="memo"
            defaultValue={defaultValues?.memo ?? ""}
            placeholder="What happened today?"
            rows={4}
          />
        </div>
      ) : null}

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
            submitLabel ?? (mode === "create" ? "Add day" : "Save changes")
          )}
        </Button>
      </StickyFormFooter>
    </form>
  );
}
