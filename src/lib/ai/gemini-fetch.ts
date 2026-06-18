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

const DEFAULT_MODEL = "gemini-2.0-flash";

export async function geminiGenerateText(
  input: AiGenerateTextInput,
  model = DEFAULT_MODEL,
): Promise<string> {
  const apiKey = env.ai.geminiApiKey;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

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
    throw new GeminiApiError(
      `Gemini request failed with status ${response.status}`,
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
