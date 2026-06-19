"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";

import { updateNote, type DayActionState } from "@/actions/days";
import { ResponsiveFormShell } from "@/components/mobile/responsive-form-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: DayActionState = {};

type EditNoteDialogProps = {
  tripId: string;
  dayId: string;
  noteId: string;
  defaultContent: string;
};

export function EditNoteDialog({
  tripId,
  dayId,
  noteId,
  defaultContent,
}: EditNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateNote, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-4" />
        Edit
      </Button>

      <ResponsiveFormShell
        open={open}
        onOpenChange={setOpen}
        title="Edit memo"
        description="Update this memo's text."
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="dayId" value={dayId} />
          <input type="hidden" name="noteId" value={noteId} />

          <div className="space-y-2">
            <Label htmlFor={`edit-note-${noteId}`}>Memo</Label>
            <Textarea
              id={`edit-note-${noteId}`}
              name="content"
              defaultValue={defaultContent}
              required
              rows={5}
            />
          </div>

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <Button type="submit" className="h-11 w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </ResponsiveFormShell>
    </>
  );
}
