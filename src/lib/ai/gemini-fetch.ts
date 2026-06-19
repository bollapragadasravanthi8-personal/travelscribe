import { env } from "@/lib/env";
import { GeminiApiError } from "@/lib/ai/gemini-errors";
import type { AiGenerateTextInput } from "@/lib/ai/types";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

/** Primary model — 2.0-flash free tier is often exhausted on new keys. */
export const GEMINI_PRIMARY_MODEL = "gemini-2.5-flash";
export const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash-lite";

const MODEL_CHAIN = [GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL];

function parseGeminiErrorMessage(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return parsed.error?.message ?? null;
  } catch {
    return null;
  }
}

async function callGeminiModel(
  input: AiGenerateTextInput,
  model: string,
  apiKey: string,
): Promise<string> {
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: input.systemInstruction
        ? { parts: [{ text: input.systemInstruction }] }
        : undefined,
      contents: [{ role: "user", parts: [{ text: input.prompt }] }],
      generationConfig: {
        temperature: input.temperature ?? 0.7,
        maxOutputTokens: input.maxOutputTokens ?? 1024,
      },
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    const detail = parseGeminiErrorMessage(body);
    throw new GeminiApiError(
      detail ?? `Gemini request failed with status ${response.status}`,
      response.status,
      body,
    );
  }

  let parsed: GeminiResponse;
  try {
    parsed = JSON.parse(body) as GeminiResponse;
  } catch {
    throw new GeminiApiError("Gemini returned invalid JSON.", response.status, body);
  }

  const text = parsed.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiApiError(
      parsed.error?.message ?? "Gemini returned an empty response.",
      response.status,
      body,
    );
  }

  return text;
}

function shouldRetryWithFallback(error: GeminiApiError) {
  return error.status === 429 || error.status === 503;
}

export async function geminiGenerateText(
  input: AiGenerateTextInput,
  preferredModel = GEMINI_PRIMARY_MODEL,
): Promise<{ text: string; model: string }> {
  const apiKey = env.ai.geminiApiKey;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const models = [
    preferredModel,
    ...MODEL_CHAIN.filter((model) => model !== preferredModel),
  ];

  let lastError: GeminiApiError | null = null;

  for (const model of models) {
    try {
      const text = await callGeminiModel(input, model, apiKey);
      return { text, model };
    } catch (error) {
      if (!(error instanceof GeminiApiError)) {
        throw error;
      }
      lastError = error;
      if (!shouldRetryWithFallback(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new GeminiApiError("Gemini request failed.", 500, "");
}
