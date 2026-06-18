"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { addNote, type DayActionState } from "@/actions/days";
import { StickyFormFooter } from "@/components/mobile/sticky-form-footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: DayActionState = {};

type AddNoteFormProps = {
  tripId: string;
  dayId: string;
};

export function AddNoteForm({ tripId, dayId }: AddNoteFormProps) {
  const [state, formAction, pending] = useActionState(addNote, initialState);

  useEffect(() => {
    if (state.success) {
      const form = document.getElementById(`add-note-form-${dayId}`) as
        | HTMLFormElement
        | null;
      form?.reset();
    }
  }, [state.success, dayId]);

  return (
    <form
      id={`add-note-form-${dayId}`}
      action={formAction}
      className="space-y-4 rounded-xl border bg-muted/20 p-4"
    >
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="dayId" value={dayId} />

      <div className="space-y-2">
        <Label htmlFor={`note-content-${dayId}`}>New memo</Label>
        <Textarea
          id={`note-content-${dayId}`}
          name="content"
          placeholder="Capture a moment, thought, or highlight…"
          required
          rows={4}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <StickyFormFooter className="mt-0 border-0 bg-transparent p-0">
        <Button type="submit" className="h-11 w-full sm:w-auto" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Add memo"
          )}
        </Button>
      </StickyFormFooter>
    </form>
  );
}
