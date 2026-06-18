/** Application-wide constants */

export const APP_NAME = "TravelScribe";

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  authCallback: "/auth/callback",
  dashboard: "/dashboard",
  trips: "/trips",
  expenses: "/expenses",
  photos: "/photos",
  profile: "/profile",
  trip: (tripId: string) => `/trips/${tripId}`,
  travelDay: (tripId: string, dayId: string) =>
    `/trips/${tripId}/days/${dayId}`,
} as const;

/** Routes accessible without authentication */
export const PUBLIC_ROUTES = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.authCallback,
] as const;

export const STORAGE_BUCKETS = {
  travelPhotos: "travel-photos",
} as const;

/** Default pagination limits for list views */
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

/** Supported expense categories */
export const EXPENSE_CATEGORIES = [
  "Food & Drink",
  "Transport",
  "Lodging",
  "Activities",
  "Shopping",
  "Other",
] as const;

/** Supported expense currencies (ISO 4217 codes) */
export const EXPENSE_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "INR",
  "AUD",
  "CAD",
] as const;

export const DEFAULT_EXPENSE_CURRENCY = "USD";

/** Photo upload limits */
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

/** Target size after client-side compression (keeps uploads under server action limit). */
export const UPLOAD_PHOTO_TARGET_BYTES = 900 * 1024;

export const UPLOAD_PHOTO_MAX_DIMENSION = 1920;

export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Decorative travel imagery (Unsplash) */
export const TRAVEL_IMAGES = {
  dashboardHero:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
  defaultTripCover:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
  loginBackdrop:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
} as const;
