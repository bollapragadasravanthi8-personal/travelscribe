"use client";

import useEmblaCarousel from "embla-carousel-react";
import * as React from "react";

import { PhotoItem } from "@/components/photos/photo-item";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { cn } from "@/lib/utils";

type PhotoGalleryItem = {
  id: string;
  url: string;
  caption: string | null;
  aiCaption: string | null;
  noteId?: string | null;
};

type PhotoGalleryProps = {
  tripId: string;
  dayId: string;
  photos: PhotoGalleryItem[];
  className?: string;
};

export function PhotoGallery({
  tripId,
  dayId,
  photos,
  className,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  return (
    <>
      {/* Mobile: horizontal swipe strip */}
      <div className={cn("md:hidden", className)}>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-3">
            {photos.map((photo, index) => (
              <PhotoItem
                key={photo.id}
                tripId={tripId}
                dayId={dayId}
                photo={photo}
                onOpen={() => setLightboxIndex(index)}
                className="min-w-[72%] shrink-0"
                sizes="(max-width: 768px) 72vw, 240px"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: responsive grid */}
      <div className={cn("hidden grid-cols-2 gap-3 sm:grid-cols-3 md:grid", className)}>
        {photos.map((photo, index) => (
          <PhotoItem
            key={photo.id}
            tripId={tripId}
            dayId={dayId}
            photo={photo}
            onOpen={() => setLightboxIndex(index)}
            sizes="(max-width: 768px) 50vw, 240px"
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
