"use server";

/**
 * Server Actions for TravelScribe.
 */

export { generateDaySummary, generatePhotoCaption, generateTripStory } from "@/actions/ai";
export { signIn, signOut, signUp, type AuthActionState } from "@/actions/auth";
export {
  addNote,
  createTravelDay,
  deleteNote,
  deleteTravelDay,
  updateTravelDay,
  type DayActionState,
} from "@/actions/days";
export {
  createExpense,
  deleteExpense,
  updateExpense,
  type ExpenseActionState,
} from "@/actions/expenses";
export {
  deletePhoto,
  uploadPhoto,
  type PhotoActionState,
} from "@/actions/photos";
export {
  createTrip,
  deleteTrip,
  updateTrip,
  type TripActionState,
} from "@/actions/trips";
