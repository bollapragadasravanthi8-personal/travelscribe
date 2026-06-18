"use client";

import { useActionState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteNote, type DayActionState } from "@/actions/days";
import { MemoPhotoStrip } from "@/components/days/memo-photo-strip";
import { UploadPhotoForm } from "@/components/photos/upload-photo-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotePhoto = {
  id: string;
  url: string;
  caption: string | null;
  aiCaption: string | null;
};

type NoteItemData = {
  id: string;
  content: string;
  createdAt?: Date | string;
  photos?: NotePhoto[];
};

type NoteItemProps = {
  tripId: string;
  dayId: string;
  note: NoteItemData;
  className?: string;
};

const initialState: DayActionState = {};

export function NoteItem({ tripId, dayId, note, className }: NoteItemProps) {
  const [state, formAction, pending] = useActionState(deleteNote, initialState);
  const photos = note.photos ?? [];

  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-4 shadow-xs",
        className,
      )}
    >
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>

      <MemoPhotoStrip tripId={tripId} dayId={dayId} photos={photos} />

      <UploadPhotoForm
        tripId={tripId}
        dayId={dayId}
        linkedNoteId={note.id}
      />

      <div className="mt-3 flex items-center justify-end gap-2">
        <form action={formAction}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="dayId" value={dayId} />
          <input type="hidden" name="noteId" value={note.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-9 text-destructive hover:text-destructive"
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete
              </>
            )}
          </Button>
        </form>
      </div>
      {state.error ? (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      ) : null}
    </article>
  );
}
