import {
  GEMINI_PRIMARY_MODEL,
  geminiGenerateText,
} from "@/lib/ai/gemini-fetch";
import type { AiGenerateTextInput, AiGenerateTextResult, AiProvider } from "@/lib/ai/types";

export class GeminiProvider implements AiProvider {
  readonly name = "gemini" as const;

  async generateText(input: AiGenerateTextInput): Promise<AiGenerateTextResult> {
    const { text, model } = await geminiGenerateText(input, GEMINI_PRIMARY_MODEL);
    return { text, provider: this.name, model };
  }
}
