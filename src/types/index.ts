/**
 * Shared TypeScript types for TravelScribe.
 * Domain types will be extended as features are implemented.
 */

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type PageParams<T extends Record<string, string>> = {
  params: Promise<T>;
};

export type SearchParams = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Placeholder domain types — align with Prisma models when features ship
export type TripSummary = {
  id: string;
  title: string;
  country: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type TravelDaySummary = {
  id: string;
  tripId: string;
  dayNumber: number;
  title: string | null;
  location: string | null;
  date: string | null;
};

export type NoteSummary = {
  id: string;
  travelDayId: string;
  content: string;
  photoCount: number;
};

/** Photo always has travelDayId; noteId is optional (day-only vs memo photo) */
export type PhotoSummary = {
  id: string;
  travelDayId: string;
  noteId: string | null;
  url: string;
  caption: string | null;
  aiCaption: string | null;
};
