export type AiGenerateTextInput = {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export type AiGenerateTextResult = {
  text: string;
  provider: "mock" | "gemini";
  model: string;
};

export interface AiProvider {
  readonly name: "mock" | "gemini";
  generateText(input: AiGenerateTextInput): Promise<AiGenerateTextResult>;
}

export type DaySummaryContext = {
  tripTitle: string;
  dayNumber: number;
  dayTitle?: string | null;
  date?: string | null;
  location?: string | null;
  notes: string[];
  photoCaptions: string[];
  expenses: { amount: string; currency: string; category?: string | null }[];
};

export type TripStoryContext = {
  tripTitle: string;
  country?: string | null;
  dateRange?: string | null;
  description?: string | null;
  days: {
    dayNumber: number;
    title?: string | null;
    location?: string | null;
    aiSummary?: string | null;
    notes: string[];
    photoCaptions: string[];
  }[];
};

export type PhotoCaptionContext = {
  tripTitle: string;
  dayTitle?: string | null;
  location?: string | null;
  existingCaption?: string | null;
  noteContent?: string | null;
};
