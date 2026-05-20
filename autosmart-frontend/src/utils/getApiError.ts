export function getApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data) return (err as Error)?.message || fallback;
  if (typeof data.message === 'string') return data.message;
  const errors = data.errors as Record<string, string[]> | undefined;
  if (errors) {
    const first = Object.values(errors).flat()[0];
    if (first) return first;
  }
  return fallback;
}
