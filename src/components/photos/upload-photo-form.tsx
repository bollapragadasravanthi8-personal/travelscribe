"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";

import { uploadPhoto, type PhotoActionState } from "@/actions/photos";
import { StickyFormFooter } from "@/components/mobile/sticky-form-footer";
import { Button } from "@/components/ui/button";
import { ALLOWED_PHOTO_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const initialState: PhotoActionState = {};

type UploadPhotoFormProps = {
  tripId: string;
  dayId: string;
  /** When set, photos are attached to this memo. Otherwise they are photo memories for the day. */
  linkedNoteId?: string;
  onSuccess?: () => void;
  className?: string;
};

function isAllowedPhotoType(file: File) {
  return ALLOWED_PHOTO_TYPES.includes(
    file.type as (typeof ALLOWED_PHOTO_TYPES)[number],
  );
}

export function UploadPhotoForm({
  tripId,
  dayId,
  linkedNoteId,
  onSuccess,
  className,
}: UploadPhotoFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(!linkedNoteId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pickError, setPickError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(uploadPhoto, initialState);
  const isMemoUpload = Boolean(linkedNoteId);
  const formId = linkedNoteId
    ? `upload-photo-memo-${linkedNoteId}`
    : `upload-photo-memory-${dayId}`;

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setSelectedFiles([]);
      setPickError(null);
      setExpanded(!linkedNoteId);
      onSuccess?.();
    }
  }, [state.success, linkedNoteId, onSuccess]);

  function addFiles(files: FileList | File[]) {
    const next: File[] = [];
    for (const file of files) {
      if (!isAllowedPhotoType(file)) {
        setPickError(`"${file.name}" is an unsupported photo type.`);
        continue;
      }
      next.push(file);
    }
    if (next.length > 0) {
      setPickError(null);
      setSelectedFiles((current) => [...current, ...next]);
    }
  }

  function handleCameraChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      addFiles(event.target.files);
    }
    event.target.value = "";
  }

  function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      addFiles(event.target.files);
    }
    event.target.value = "";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      setPickError("Take or choose at least one photo.");
      return;
    }

    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("dayId", dayId);
    if (linkedNoteId) {
      formData.set("noteId", linkedNoteId);
    }
    for (const file of selectedFiles) {
      formData.append("files", file);
    }
    formAction(formData);
  }

  if (linkedNoteId && !expanded) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("mt-3 h-9 gap-2", className)}
        onClick={() => setExpanded(true)}
      >
        <Camera className="size-4" />
        Add photos to memo
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      id={formId}
      onSubmit={handleSubmit}
      className={cn(
        "space-y-4 rounded-xl border bg-muted/20 p-4",
        linkedNoteId && "mt-3",
        className,
      )}
    >
      {isMemoUpload ? (
        <p className="text-sm font-medium text-muted-foreground">
          Photos for this memo
        </p>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">
          Add photo memories
        </p>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleCameraChange}
        aria-hidden
        tabIndex={-1}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={ALLOWED_PHOTO_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={handleGalleryChange}
        aria-hidden
        tabIndex={-1}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 justify-start gap-2"
          disabled={pending}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="size-4" />
          Take photo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 justify-start gap-2"
          disabled={pending}
          onClick={() => galleryInputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          Choose from gallery
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Use the camera on your phone or pick one or more saved images.
      </p>

      {selectedFiles.length > 0 ? (
        <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
          <span>
            {selectedFiles.length} photo{selectedFiles.length === 1 ? "" : "s"}{" "}
            ready to upload
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Clear selected photos"
            disabled={pending}
            onClick={() => setSelectedFiles([])}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : null}

      {pickError ? (
        <p className="text-sm text-destructive">{pickError}</p>
      ) : null}
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <StickyFormFooter className="mt-0 border-0 bg-transparent p-0">
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            className="h-11 sm:w-auto"
            disabled={pending || selectedFiles.length === 0}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="size-4" />
                Upload photos
              </>
            )}
          </Button>
          {linkedNoteId ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              onClick={() => {
                setSelectedFiles([]);
                setPickError(null);
                setExpanded(false);
              }}
              disabled={pending}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </StickyFormFooter>
    </form>
  );
}
