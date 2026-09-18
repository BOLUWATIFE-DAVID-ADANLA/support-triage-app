// Gemini returns transient 503s under high demand fairly often — retry with
// backoff instead of failing the whole classify/report call on the first one.
export async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 3, baseDelayMs = 1000 } = {},
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const retryable =
        err instanceof Error && /503|overloaded|high demand|fetch failed/i.test(err.message);
      if (!retryable || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
    }
  }
  throw lastErr;
}
