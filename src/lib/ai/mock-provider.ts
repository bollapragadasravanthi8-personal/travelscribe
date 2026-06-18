import type { AiGenerateTextInput, AiGenerateTextResult, AiProvider } from "@/lib/ai/types";

const MODEL = "mock";

function buildMockResponse(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return "No content was provided to summarize.";
  }
  const preview = trimmed.slice(0, 280).replace(/\s+/g, " ");
  return `[Mock AI] ${preview}${trimmed.length > 280 ? "…" : ""}`;
}

export class MockAiProvider implements AiProvider {
  readonly name = "mock" as const;

  async generateText(input: AiGenerateTextInput): Promise<AiGenerateTextResult> {
    return {
      text: buildMockResponse(input.prompt),
      provider: this.name,
      model: MODEL,
    };
  }
}
