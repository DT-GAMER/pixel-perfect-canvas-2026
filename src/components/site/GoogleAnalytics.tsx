import { useEffect } from "react";
import { loadGoogleAnalytics } from "@/lib/google-analytics";

/**
 * Loads Google Analytics. GA4's enhanced measurement records page views,
 * including in-app navigation; sending our own as well would double-count.
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string | null }) {
  useEffect(() => {
    if (measurementId) loadGoogleAnalytics(measurementId);
  }, [measurementId]);

  return null;
}
