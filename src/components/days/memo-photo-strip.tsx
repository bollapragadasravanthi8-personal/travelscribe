"use client";

import * as React from "react";

import { PhotoItem } from "@/components/photos/photo-item";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";

type MemoPhoto = {
  id: string;
  url: string;
  caption: string | null;
  aiCaption: string | null;
};

type MemoPhotoStripProps = {
  tripId: string;
  dayId: string;
  photos: MemoPhoto[];
};

export function MemoPhotoStrip({ tripId, dayId, photos }: MemoPhotoStripProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo, index) => (
          <PhotoItem
            key={photo.id}
            tripId={tripId}
            dayId={dayId}
            photo={photo}
            onOpen={() => setLightboxIndex(index)}
            sizes="(max-width: 768px) 33vw, 120px"
            compact
          />
        ))}
      </div>
      <PhotoLightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
