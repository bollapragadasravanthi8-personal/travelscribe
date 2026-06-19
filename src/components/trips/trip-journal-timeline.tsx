import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, FileText, ImageIcon } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/format";

export type TripJournalDay = {
  id: string;
  dayNumber: number;
  title: string | null;
  date: Date | string | null;
  location: string | null;
  notes: {
    id: string;
    content: string;
    photos: {
      id: string;
      url: string;
      caption: string | null;
      aiCaption: string | null;
    }[];
  }[];
  photos: {
    id: string;
    url: string;
    caption: string | null;
    aiCaption: string | null;
  }[];
  _count: {
    notes: number;
    photos: number;
  };
};

type TripJournalTimelineProps = {
  tripId: string;
  days: TripJournalDay[];
};

function truncateMemo(content: string, maxLength = 140) {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength).trim()}…`;
}

export function TripJournalTimeline({ tripId, days }: TripJournalTimelineProps) {
  if (days.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No travel days yet"
        description="Add days to start logging memos and photos for this trip."
      />
    );
  }

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const heading = day.title ?? `Day ${day.dayNumber}`;
        const meta = [formatDisplayDate(day.date), day.location]
          .filter(Boolean)
          .join(" · ");

        return (
          <article
            key={day.id}
            className="overflow-hidden rounded-xl border bg-card shadow-xs"
          >
            <Link
              href={ROUTES.travelDay(tripId, day.id)}
              className="flex items-start gap-3 border-b bg-muted/20 p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {day.dayNumber}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{heading}</h3>
                    {meta ? (
                      <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
                    ) : null}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="size-3" />
                    {day._count.notes} memo{day._count.notes === 1 ? "" : "s"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <ImageIcon className="size-3" />
                    {day._count.photos} photo
                    {day._count.photos === 1 ? "" : "s"}
                  </Badge>
                </div>
              </div>
            </Link>

            {day.notes.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No memos yet for this day.
              </div>
            ) : (
              <div className="divide-y">
                {day.notes.map((note) => (
                  <div key={note.id} className="space-y-3 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {truncateMemo(note.content)}
                    </p>
                    {note.photos.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {note.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted"
                          >
                            <Image
                              src={photo.url}
                              alt={
                                photo.caption ??
                                photo.aiCaption ??
                                "Memo photo"
                              }
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {day.photos.length > 0 ? (
              <div className="border-t bg-muted/10 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Photo memories
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {day.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.caption ?? photo.aiCaption ?? "Travel photo"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
