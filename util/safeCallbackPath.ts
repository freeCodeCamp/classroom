export function safeCallbackPath(value: unknown, baseUrl: string): string {
  if (typeof value !== 'string' || value === '') {
    return '/';
  }

  try {
    const base = new URL(baseUrl);
    const url = new URL(value, base);
    if (url.origin === base.origin) {
      return url.pathname + url.search + url.hash;
    }
    return '/';
  } catch {
    return '/';
  }
}
