import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { DayDetailSections } from "@/components/days/day-detail-sections";
import { DeleteTravelDayButton } from "@/components/days/delete-travel-day-button";
import { EditTravelDayDialog } from "@/components/days/edit-travel-day-dialog";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { formatDisplayDate, toDateInputValue } from "@/lib/format";
import { getTravelDayForUser } from "@/services/travel-day-service";
import type { PageParams } from "@/types";
import { OfflinePageCache } from "@/components/mobile/offline-page-cache";
import {
  toOfflineDaySnapshot,
  toOfflineExpenseSnapshot,
  toOfflineTripSnapshot,
} from "@/lib/offline/serialize";

type TravelDayDetailsPageProps = PageParams<{
  tripId: string;
  dayId: string;
}>;

export async function generateMetadata({
  params,
}: TravelDayDetailsPageProps): Promise<Metadata> {
  try {
    const user = await getCurrentUser();
    const { dayId } = await params;
    const day = await getTravelDayForUser(dayId, user.id);
    const title = day.title ?? `Day ${day.dayNumber}`;
    return { title: `${title} · ${day.trip.title}` };
  } catch {
    return { title: "Travel Day" };
  }
}

export default async function TravelDayDetailsPage({
  params,
}: TravelDayDetailsPageProps) {
  const user = await getCurrentUser();
  const { tripId, dayId } = await params;

  let day;
  try {
    day = await getTravelDayForUser(dayId, user.id);
  } catch {
    notFound();
  }

  const heading = day.title ?? `Day ${day.dayNumber}`;
  const dateLabel = formatDisplayDate(day.date);
  const hasSummaryContent =
    day.notes.length > 0 || day.photos.length > 0 || day.expenses.length > 0;

  return (
    <>
      <OfflinePageCache
        trips={[
          toOfflineTripSnapshot({
            id: day.trip.id,
            title: day.trip.title,
            country: null,
            startDate: null,
            endDate: null,
            coverImageUrl: null,
          }),
        ]}
        days={[
          toOfflineDaySnapshot({
            id: day.id,
            tripId: day.trip.id,
            dayNumber: day.dayNumber,
            title: day.title,
            location: day.location,
            date: day.date,
          }),
        ]}
        expenses={day.expenses.map((expense) =>
          toOfflineExpenseSnapshot({
            id: expense.id,
            travelDayId: day.id,
            amount: expense.amount,
            currency: expense.currency,
            category: expense.category,
            notes: expense.notes,
          }),
        )}
      />
      <div className="sticky top-12 z-30 -mx-4 mb-4 border-b bg-background/95 px-4 py-2 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <Link
          href={ROUTES.trip(tripId)}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Back to {day.trip.title}
        </Link>
      </div>

      <PageHeader
        title={heading}
        description={[dateLabel, day.location].filter(Boolean).join(" · ") || "Travel day"}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Day {day.dayNumber}</Badge>
          <EditTravelDayDialog
            tripId={tripId}
            dayId={day.id}
            defaultValues={{
              title: day.title ?? "",
              date: toDateInputValue(day.date),
              location: day.location ?? "",
              memo: "",
            }}
          />
          <DeleteTravelDayButton
            tripId={tripId}
            dayId={day.id}
            dayLabel={heading}
          />
        </div>
      </PageHeader>

      {day.location && (
        <p className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {day.location}
        </p>
      )}

      <DayDetailSections
        data={{
          tripId,
          dayId: day.id,
          aiSummary: day.aiSummary,
          hasSummaryContent,
          notes: day.notes.map((note) => ({
            id: note.id,
            content: note.content,
            photos: note.photos.map((photo) => ({
              id: photo.id,
              url: photo.url,
              caption: photo.caption,
              aiCaption: photo.aiCaption,
            })),
          })),
          photos: day.photos,
          expenses: day.expenses,
        }}
      />
    </>
  );
}
