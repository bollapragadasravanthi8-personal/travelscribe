import Link from "next/link";
import {
  CalendarDays,
  Camera,
  ChevronRight,
  DollarSign,
  Map,
  Receipt,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDisplayDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ExpenseTotal = {
  currency: string;
  total: number;
};

type DashboardStatsProps = {
  tripCount: number;
  travelDayCount: number;
  photoCount: number;
  expenseCount: number;
  expenseTotals: ExpenseTotal[];
};

const statItems = [
  {
    key: "trips",
    label: "Trips",
    icon: Map,
    href: ROUTES.trips,
    accent: "from-sky-500/15 to-teal-500/10",
    getValue: (props: DashboardStatsProps) => props.tripCount,
  },
  {
    key: "days",
    label: "Travel days",
    icon: CalendarDays,
    href: ROUTES.trips,
    accent: "from-amber-500/15 to-orange-500/10",
    getValue: (props: DashboardStatsProps) => props.travelDayCount,
  },
  {
    key: "photos",
    label: "Photos",
    icon: Camera,
    href: ROUTES.photos,
    accent: "from-violet-500/15 to-purple-500/10",
    getValue: (props: DashboardStatsProps) => props.photoCount,
  },
  {
    key: "expenses",
    label: "Expenses",
    icon: Receipt,
    href: ROUTES.expenses,
    accent: "from-rose-500/15 to-pink-500/10",
    getValue: (props: DashboardStatsProps) => props.expenseCount,
  },
] as const;

export function DashboardStats(props: DashboardStatsProps) {
  const expenseSummary =
    props.expenseTotals.length > 0
      ? props.expenseTotals
          .map(({ currency, total }) => formatCurrency(total, currency))
          .join(" · ")
      : "—";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.key} href={item.href} className="group block">
            <Card
              className={cn(
                "gap-3 border-transparent bg-gradient-to-br py-4 transition-all hover:border-primary/20 hover:shadow-md active:scale-[0.98]",
                item.accent,
              )}
            >
              <CardHeader className="px-4 pb-0">
                <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                  {item.label}
                  <Icon className="size-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between px-4">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {item.getValue(props)}
                </p>
                <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        );
      })}

      <Link href={ROUTES.expenses} className="group block sm:col-span-2 xl:col-span-4">
        <Card className="gap-3 border-transparent bg-gradient-to-r from-primary/10 via-teal-500/10 to-amber-500/10 py-4 transition-all hover:border-primary/20 hover:shadow-md active:scale-[0.99]">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              Total spend
              <DollarSign className="size-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between px-4">
            <p className="text-2xl font-bold tracking-tight">{expenseSummary}</p>
            <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

type RecentDay = {
  id: string;
  dayNumber: number;
  title: string | null;
  date: Date | string | null;
  trip: {
    id: string;
    title: string;
  };
  _count?: {
    notes?: number;
    photos?: number;
    expenses?: number;
  };
};

type RecentActivityProps = {
  days: RecentDay[];
  className?: string;
};

export function RecentActivity({ days, className }: RecentActivityProps) {
  if (days.length === 0) {
    return null;
  }

  return (
    <section className={cn("mt-8", className)}>
      <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
      <div className="space-y-3">
        {days.map((day) => {
          const label = day.title ?? `Day ${day.dayNumber}`;
          const meta = [
            formatDisplayDate(day.date),
            day._count?.notes ? `${day._count.notes} memos` : null,
            day._count?.photos ? `${day._count.photos} photos` : null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <Link
              key={day.id}
              href={ROUTES.travelDay(day.trip.id, day.id)}
              className="flex min-h-11 items-center justify-between rounded-xl border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-accent/50 active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{label}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {day.trip.title}
                  {meta ? ` · ${meta}` : ""}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
