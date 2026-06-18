"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { PhotoItem } from "@/components/photos/photo-item";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { ROUTES } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type PhotoListItem = {
  id: string;
  url: string;
  caption: string | null;
  aiCaption: string | null;
  travelDay?: {
    id: string;
    dayNumber: number;
    title: string | null;
    date?: Date | string | null;
    trip?: {
      id: string;
      title: string;
      country?: string | null;
    };
  };
};

type PhotoTripGroup = {
  tripId: string;
  tripTitle: string;
  tripCountry: string | null;
  photos: Array<
    PhotoListItem & {
      tripId: string;
      dayId: string;
      photoLabel: string;
    }
  >;
};

type PhotoListGroupedProps = {
  photos: PhotoListItem[];
  className?: string;
};

function getDayLabel(day: PhotoListItem["travelDay"]) {
  if (!day) return "Unknown day";
  const name = day.title ?? `Day ${day.dayNumber}`;
  const date = formatDisplayDate(day.date ?? null);
  return date ? `${name} · ${date}` : name;
}

function getPhotoLabel(photo: PhotoListItem) {
  const caption = photo.caption?.trim() || photo.aiCaption?.trim();
  const date = formatDisplayDate(photo.travelDay?.date ?? null);

  if (caption && date) {
    return `${caption} · ${date}`;
  }
  if (caption) {
    return caption;
  }
  return getDayLabel(photo.travelDay);
}

function groupPhotosByTrip(photos: PhotoListItem[]): PhotoTripGroup[] {
  const groups = new Map<string, PhotoTripGroup>();

  for (const photo of photos) {
    const trip = photo.travelDay?.trip;
    const day = photo.travelDay;
    if (!trip || !day) continue;

    const existing = groups.get(trip.id);
    const entry = {
      ...photo,
      tripId: trip.id,
      dayId: day.id,
      photoLabel: getPhotoLabel(photo),
    };

    if (existing) {
      existing.photos.push(entry);
    } else {
      groups.set(trip.id, {
        tripId: trip.id,
        tripTitle: trip.title,
        tripCountry: trip.country ?? null,
        photos: [entry],
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.tripTitle.localeCompare(b.tripTitle),
  );
}

function TripPhotoGrid({
  group,
}: {
  group: PhotoTripGroup;
}) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {group.photos.map((photo, index) => (
          <div key={photo.id} className="space-y-1">
            <PhotoItem
              tripId={photo.tripId}
              dayId={photo.dayId}
              photo={{
                id: photo.id,
                url: photo.url,
                caption: photo.caption,
                aiCaption: photo.aiCaption,
              }}
              onOpen={() => setLightboxIndex(index)}
              sizes="(max-width: 768px) 50vw, 240px"
              compact
            />
            <p className="truncate px-1 text-xs text-muted-foreground">
              {photo.photoLabel}
            </p>
          </div>
        ))}
      </div>

      <PhotoLightbox
        photos={group.photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}

export function PhotoListGrouped({ photos, className }: PhotoListGroupedProps) {
  const groups = groupPhotosByTrip(photos);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group) => (
        <section
          key={group.tripId}
          className="overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <div className="flex flex-wrap items-end justify-between gap-2 border-b bg-muted/30 px-4 py-3">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <Link
                  href={ROUTES.trip(group.tripId)}
                  className="font-semibold text-primary hover:underline"
                >
                  {group.tripTitle}
                </Link>
                {group.tripCountry ? (
                  <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    {group.tripCountry}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {group.photos.length} photo
                {group.photos.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="p-4">
            <TripPhotoGrid group={group} />
          </div>
        </section>
      ))}
    </div>
  );
}
