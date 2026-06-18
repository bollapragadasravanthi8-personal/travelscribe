"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

import { generatePhotoCaption } from "@/actions/ai";
import { deletePhoto, type PhotoActionState } from "@/actions/photos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PhotoItemData = {
  id: string;
  url: string;
  caption: string | null;
  aiCaption: string | null;
  noteId?: string | null;
};

type PhotoItemProps = {
  tripId: string;
  dayId: string;
  photo: PhotoItemData;
  onOpen?: () => void;
  className?: string;
  sizes?: string;
  /** Gallery-only thumbnail without edit/delete actions */
  compact?: boolean;
};

const deleteInitialState: PhotoActionState = {};
const captionInitialState = {
  success: undefined as boolean | undefined,
  error: undefined as string | undefined,
  caption: undefined as string | undefined,
};

export function PhotoItem({
  tripId,
  dayId,
  photo,
  onOpen,
  className,
  sizes = "(max-width: 768px) 50vw, 240px",
  compact = false,
}: PhotoItemProps) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePhoto,
    deleteInitialState,
  );
  const [captionState, captionAction, captionPending] = useActionState(
    generatePhotoCaption,
    captionInitialState,
  );

  const displayCaption = captionState.caption ?? photo.aiCaption ?? photo.caption;

  return (
    <div className={cn("group relative overflow-hidden rounded-xl border bg-card", className)}>
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-square w-full overflow-hidden"
        aria-label="Open photo"
      >
        <Image
          src={photo.url}
          alt={displayCaption ?? "Travel photo"}
          fill
          sizes={sizes}
          className="object-cover transition-transform group-hover:scale-[1.02]"
        />
      </button>

      {!compact ? (
      <div className="space-y-2 p-3">
        {displayCaption ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {displayCaption}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <form action={captionAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="dayId" value={dayId} />
            <input type="hidden" name="photoId" value={photo.id} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-9"
              disabled={captionPending}
            >
              {captionPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="size-4" />
                  AI caption
                </>
              )}
            </Button>
          </form>

          <form action={deleteAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <input type="hidden" name="dayId" value={dayId} />
            <input type="hidden" name="photoId" value={photo.id} />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-9 text-destructive hover:text-destructive"
              disabled={deletePending}
            >
              {deletePending ? (
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

        {deleteState.error || captionState.error ? (
          <p className="text-sm text-destructive">
            {deleteState.error ?? captionState.error}
          </p>
        ) : null}
      </div>
      ) : null}
    </div>
  );
}
