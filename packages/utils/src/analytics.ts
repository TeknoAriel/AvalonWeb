declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Eventos de producto (ver docs/avalon-functional-enhancements.md). No envía PII. */
export function trackAvalonEvent(
  name: string,
  payload?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === 'undefined') return;
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: name, ...payload });
  } catch {
    /* noop */
  }
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', name, payload);
  }
}
