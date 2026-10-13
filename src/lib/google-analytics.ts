// Google Analytics 4 (gtag.js). Browser only; a no-op until loaded.
// The ID comes from GA_MEASUREMENT_ID on the server (see settings.server.ts), so
// local development and the admin dashboard aren't tracked.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads gtag.js once. GA4 records page views itself, including in-app
 * navigation (Enhanced measurement → "Page changes based on browser history
 * events", on by default), so the site only sends conversion events.
 */
export function loadGoogleAnalytics(measurementId: string) {
  if (typeof window === "undefined" || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the Arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

/** Sends a GA4 event (sign_up, generate_lead, …) if gtag is loaded. */
export function trackGoogle(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params ?? {});
}
