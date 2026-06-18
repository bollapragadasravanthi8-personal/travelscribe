import { geminiGenerateText } from "@/lib/ai/gemini-fetch";
import type { AiGenerateTextInput, AiGenerateTextResult, AiProvider } from "@/lib/ai/types";

const MODEL = "gemini-2.0-flash";

export class GeminiProvider implements AiProvider {
  readonly name = "gemini" as const;

  async generateText(input: AiGenerateTextInput): Promise<AiGenerateTextResult> {
    const text = await geminiGenerateText(input, MODEL);
    return { text, provider: this.name, model: MODEL };
  }
}
