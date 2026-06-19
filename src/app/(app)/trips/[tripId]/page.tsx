import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Sparkles } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { CreateTravelDayDialog } from "@/components/days/create-travel-day-dialog";
import { TripJournalTimeline } from "@/components/trips/trip-journal-timeline";
import { AiStorySection } from "@/components/trips/ai-story-section";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { EditTripDialog } from "@/components/trips/edit-trip-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import {
  countTripDurationDays,
  formatDateRange,
  formatDisplayDate,
  formatCurrency,
  toDateInputValue,
} from "@/lib/format";
import { getTripExpenseSummary } from "@/services/expense-service";
import { getTripForUser } from "@/services/trip-service";
import { listTravelDaysForVerifiedTrip, getTripJournalDays } from "@/services/travel-day-service";
import type { PageParams } from "@/types";
import { OfflinePageCache } from "@/components/mobile/offline-page-cache";
import {
  toOfflineDaySnapshot,
  toOfflineTripSnapshot,
} from "@/lib/offline/serialize";

type TripDetailsPageProps = PageParams<{ tripId: string }>;

export async function generateMetadata({
  params,
}: TripDetailsPageProps): Promise<Metadata> {
  try {
    const user = await getCurrentUser();
    const { tripId } = await params;
    const trip = await getTripForUser(tripId, user.id);
    return { title: trip.title };
  } catch {
    return { title: "Trip" };
  }
}

export default async function TripDetailsPage({ params }: TripDetailsPageProps) {
  const user = await getCurrentUser();
  const { tripId } = await params;

  let trip;
  let days;
  let journalDays;
  let expenseSummary;
  try {
    [trip, days, journalDays, expenseSummary] = await Promise.all([
      getTripForUser(tripId, user.id),
      listTravelDaysForVerifiedTrip(tripId),
      getTripJournalDays(tripId),
      getTripExpenseSummary(tripId, user.id),
    ]);
  } catch {
    notFound();
  }

  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const tripDurationDays = countTripDurationDays(trip.startDate, trip.endDate);
  const daysLoggedCount = days.length;
  const hasStoryContent =
    Boolean(trip.description?.trim()) ||
    days.some(
      (day) =>
        Boolean(day.aiSummary?.trim()) ||
        day._count.notes > 0 ||
        day._count.photos > 0 ||
        day._count.expenses > 0,
    );

  return (
    <>
      <OfflinePageCache
        trips={[
          toOfflineTripSnapshot({
            id: trip.id,
            title: trip.title,
            country: trip.country,
            startDate: trip.startDate,
            endDate: trip.endDate,
            coverImageUrl: trip.coverImageUrl,
          }),
        ]}
        days={days.map((day) =>
          toOfflineDaySnapshot({
            id: day.id,
            tripId: trip.id,
            dayNumber: day.dayNumber,
            title: day.title,
            location: day.location,
            date: day.date,
          }),
        )}
      />
      <div className="mb-4">
        <Link
          href={ROUTES.trips}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Back to Trips
        </Link>
      </div>

      {trip.coverImageUrl && (
        <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={trip.coverImageUrl}
            alt={trip.title}
            fill
            sizes="(max-width: 768px) 100vw, 960px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <PageHeader
        title={trip.title}
        description={dateRange ?? "No dates set"}
      >
        <div className="flex items-center gap-2">
          <EditTripDialog
            tripId={trip.id}
            defaultValues={{
              title: trip.title,
              country: trip.country ?? "",
              startDate: toDateInputValue(trip.startDate),
              endDate: toDateInputValue(trip.endDate),
              coverImageUrl: trip.coverImageUrl ?? "",
            }}
          />
          <DeleteTripButton tripId={trip.id} tripTitle={trip.title} />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Trip details and summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span>{trip.country ?? "No country set"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4 shrink-0" />
              <span>
                {trip.startDate || trip.endDate
                  ? [
                      formatDisplayDate(trip.startDate) ?? "—",
                      formatDisplayDate(trip.endDate) ?? "—",
                    ].join(" → ")
                  : "No dates set"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tripDurationDays != null ? (
                <Badge variant="secondary">
                  {tripDurationDays} travel day
                  {tripDurationDays === 1 ? "" : "s"}
                </Badge>
              ) : null}
              <Badge variant="outline">
                {daysLoggedCount} day detail{daysLoggedCount === 1 ? "" : "s"}{" "}
                added
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Total spend for this trip</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseSummary.count === 0 ? (
              <>
                <p className="text-2xl font-bold">—</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No expenses logged yet
                </p>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  {expenseSummary.totals.map(({ currency, total }) => (
                    <p key={currency} className="text-2xl font-bold">
                      {formatCurrency(total, currency)}
                    </p>
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {expenseSummary.count} expense
                  {expenseSummary.count === 1 ? "" : "s"} across all days
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            AI Story
          </CardTitle>
          <CardDescription>
            AI-generated narrative for your entire trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiStorySection
            tripId={trip.id}
            story={trip.aiStory}
            hasContent={hasStoryContent}
          />
        </CardContent>
      </Card>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Trip journal</h2>
            <p className="text-sm text-muted-foreground">
              All days, memos, and photos for this trip
            </p>
          </div>
          <CreateTravelDayDialog tripId={trip.id} />
        </div>

        <TripJournalTimeline tripId={trip.id} days={journalDays} />
      </section>
    </>
  );
}
