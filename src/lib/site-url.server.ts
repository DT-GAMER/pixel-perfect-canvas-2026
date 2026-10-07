// The public origin of the site, for emails, canonical links, and feeds. Server only.
import { getRequest } from "@tanstack/react-start/server";

/** SITE_URL if set, otherwise derived from the current request (proxy-aware). */
export function siteUrl(): string {
  const configured = process.env["SITE_URL"]?.trim();
  if (configured) return configured.replace(/\/$/, "");
  try {
    const request = getRequest();
    const headers = request?.headers;
    const host = headers?.get("x-forwarded-host") ?? headers?.get("host");
    if (host) {
      const proto =
        headers?.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
        new URL(request.url).protocol.replace(":", "");
      return `${proto}://${host.split(",")[0]!.trim()}`;
    }
  } catch {
    // Outside a request (e.g. scripts).
  }
  return "http://localhost:3000";
}
