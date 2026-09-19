// Supabase-js returns { data, error, ... } instead of throwing (a count
// query also carries `count`), so it needs its own retry wrapper (see
// withRetry.ts for the throwing-SDK equivalent). This environment has shown
// intermittent connect timeouts to Supabase's host — retry transient
// network failures instead of failing the request outright.
export async function withSupabaseRetry<R extends { error: { message: string } | null }>(
  fn: () => PromiseLike<R>,
  { attempts = 3, baseDelayMs = 1000 } = {},
): Promise<R> {
  let result: R;
  for (let i = 0; i < attempts; i++) {
    result = await fn();
    if (!result.error) return result;

    const retryable = /fetch failed|timeout|ECONNRESET|ETIMEDOUT|ENETUNREACH/i.test(
      result.error.message,
    );
    if (!retryable || i === attempts - 1) return result;
    await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
  }
  return result!;
}
