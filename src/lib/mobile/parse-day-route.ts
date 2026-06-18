/** Extract trip/day IDs from a day detail pathname for FAB context shortcuts. */
export function parseDayRouteContext(pathname: string): {
  tripId?: string;
  dayId?: string;
} {
  const match = pathname.match(/^\/trips\/([^/]+)\/days\/([^/]+)$/);
  if (!match) {
    return {};
  }

  return { tripId: match[1], dayId: match[2] };
}
