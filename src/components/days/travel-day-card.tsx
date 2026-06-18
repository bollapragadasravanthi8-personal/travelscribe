import Link from "next/link";
import { Camera, ChevronRight, FileText, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TravelDayCardData = {
  id: string;
  dayNumber: number;
  title: string | null;
  date: Date | string | null;
  location: string | null;
  aiSummary: string | null;
  _count: {
    notes: number;
    photos: number;
    expenses: number;
  };
};

type TravelDayCardProps = {
  tripId: string;
  day: TravelDayCardData;
  className?: string;
};

export function TravelDayCard({ tripId, day, className }: TravelDayCardProps) {
  const heading = day.title ?? `Day ${day.dayNumber}`;
  const dateLabel = formatDisplayDate(day.date);

  return (
    <Link
      href={ROUTES.travelDay(tripId, day.id)}
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/40 active:scale-[0.99]",
        className,
      )}
    >
      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {day.dayNumber}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold group-hover:text-primary">
              {heading}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {[dateLabel, day.location].filter(Boolean).join(" · ") ||
                "No date or location"}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {day._count.notes > 0 ? (
            <Badge variant="secondary" className="gap-1">
              <FileText className="size-3" />
              {day._count.notes}
            </Badge>
          ) : null}
          {day._count.photos > 0 ? (
            <Badge variant="outline" className="gap-1">
              <Camera className="size-3" />
              {day._count.photos}
            </Badge>
          ) : null}
          {day._count.expenses > 0 ? (
            <Badge variant="outline" className="gap-1">
              <Receipt className="size-3" />
              {day._count.expenses}
            </Badge>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
