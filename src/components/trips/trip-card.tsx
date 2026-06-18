import Image from "next/image";
import Link from "next/link";
import { Calendar, Camera, MapPin, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES, TRAVEL_IMAGES } from "@/lib/constants";
import { formatDateRange, formatCurrency, countTripDurationDays } from "@/lib/format";
import { cn } from "@/lib/utils";

type TripCardExpenseTotal = {
  currency: string;
  total: number;
};

export type TripCardData = {
  id: string;
  title: string;
  country: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  coverImageUrl: string | null;
  photoCount?: number;
  expenseCount?: number;
  _count?: {
    days?: number;
    photos?: number;
  };
  expenseTotals?: TripCardExpenseTotal[];
};

type TripCardProps = {
  trip: TripCardData;
  className?: string;
};

export function TripCard({ trip, className }: TripCardProps) {
  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const photoCount = trip.photoCount ?? trip._count?.photos ?? 0;
  const daysLoggedCount = trip._count?.days ?? 0;
  const tripDurationDays = countTripDurationDays(trip.startDate, trip.endDate);
  const expenseCount = trip.expenseCount ?? 0;

  return (
    <Link href={ROUTES.trip(trip.id)} className={cn("group block", className)}>
      <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md active:scale-[0.99]">
        <div className="relative aspect-[16/10] w-full bg-muted">
          {trip.coverImageUrl ? (
            <Image
              src={trip.coverImageUrl}
              alt={trip.title}
              fill
              className="object-cover transition-transform group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/20 via-teal-400/20 to-amber-300/30">
              <Image
                src={TRAVEL_IMAGES.defaultTripCover}
                alt=""
                fill
                className="object-cover opacity-60 mix-blend-overlay"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="size-10 text-primary/70" />
              </div>
            </div>
          )}
        </div>
        <CardHeader className="gap-2 px-4 pt-4 pb-2">
          <CardTitle className="line-clamp-2 text-base">{trip.title}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {trip.country ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {trip.country}
              </span>
            ) : null}
            {dateRange ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                {dateRange}
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-4 pb-4">
          {tripDurationDays != null ? (
            <Badge variant="secondary">
              {tripDurationDays} day{tripDurationDays === 1 ? "" : "s"}
            </Badge>
          ) : null}
          {daysLoggedCount > 0 ? (
            <Badge variant="outline">
              {daysLoggedCount} logged
            </Badge>
          ) : null}
          {photoCount > 0 ? (
            <Badge variant="outline" className="gap-1">
              <Camera className="size-3" />
              {photoCount}
            </Badge>
          ) : null}
          {trip.expenseTotals?.map(({ currency, total }) => (
            <Badge key={currency} variant="outline" className="gap-1">
              <Receipt className="size-3" />
              {formatCurrency(total, currency)}
            </Badge>
          ))}
          {!trip.expenseTotals?.length && expenseCount > 0 ? (
            <Badge variant="outline" className="gap-1">
              <Receipt className="size-3" />
              {expenseCount}
            </Badge>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
