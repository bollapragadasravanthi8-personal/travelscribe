"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALLOWED_PHOTO_TYPES } from "@/lib/constants";

type TripCoverFieldProps = {
  defaultUrl?: string;
};

export function TripCoverField({ defaultUrl = "" }: TripCoverFieldProps) {
  const [preview, setPreview] = React.useState<string | null>(
    defaultUrl || null,
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(defaultUrl || null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  }

  React.useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-3">
      <Label>Cover image</Label>

      {preview ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border bg-muted">
          <Image
            src={preview}
            alt="Cover preview"
            fill
            className="object-cover"
            unoptimized={preview.startsWith("blob:")}
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 text-muted-foreground">
          <ImagePlus className="size-8 opacity-50" />
          <span className="text-sm">Upload a cover photo</span>
        </div>
      )}

      <Input
        name="coverFile"
        type="file"
        accept={ALLOWED_PHOTO_TYPES.join(",")}
        onChange={handleFileChange}
        className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
      />

      <div className="space-y-2">
        <Label htmlFor="trip-cover-image-url" className="text-muted-foreground">
          Or paste image URL
        </Label>
        <Input
          id="trip-cover-image-url"
          name="coverImageUrl"
          type="url"
          defaultValue={defaultUrl}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
