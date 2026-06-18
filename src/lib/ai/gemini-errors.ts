export class GeminiApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
    this.body = body;
  }
}

export class GeminiConfigError extends Error {
  constructor(message = "Gemini API key is not configured.") {
    super(message);
    this.name = "GeminiConfigError";
  }
}

export function isGeminiError(error: unknown): error is GeminiApiError | GeminiConfigError {
  return error instanceof GeminiApiError || error instanceof GeminiConfigError;
}
