import { GeminiApiError, isGeminiError } from "@/lib/ai/gemini-errors";

/** Map Gemini failures to short, user-facing messages. */
export function formatAiError(error: unknown, fallback: string): string {
  if (error instanceof GeminiApiError) {
    if (error.status === 429) {
      return "Gemini rate limit reached. Wait a minute and try again, or check your API quota in Google AI Studio.";
    }
    if (error.status === 503) {
      return "Gemini is busy right now. Please try again in a moment.";
    }
    if (error.message && error.message.length < 180) {
      return error.message;
    }
  }

  if (isGeminiError(error) && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
    return "Gemini API key is not configured on the server.";
  }

  return fallback;
}
