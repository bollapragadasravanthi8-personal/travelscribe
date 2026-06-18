import { env } from "@/lib/env";
import { GeminiProvider } from "@/lib/ai/gemini-provider";
import { MockAiProvider } from "@/lib/ai/mock-provider";
import type { AiProvider } from "@/lib/ai/types";

let cachedProvider: AiProvider | null = null;

/** Returns Gemini when configured, otherwise a deterministic mock provider. */
export function getAiProvider(): AiProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  cachedProvider = env.ai.geminiApiKey
    ? new GeminiProvider()
    : new MockAiProvider();

  return cachedProvider;
}

export * from "@/lib/ai/types";
export { GeminiApiError, GeminiConfigError, isGeminiError } from "@/lib/ai/gemini-errors";
