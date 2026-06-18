/** Detect Next.js redirect errors thrown by `redirect()`. */
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/** Re-throw redirect errors so navigation is not swallowed by action catch blocks. */
export function rethrowIfRedirect(error: unknown): void {
  if (isRedirectError(error)) {
    throw error;
  }
}
