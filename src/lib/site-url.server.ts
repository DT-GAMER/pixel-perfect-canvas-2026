// The public origin of the site, for emails, canonical links, and feeds. Server only.
import { getRequest } from "@tanstack/react-start/server";

/** SITE_URL if set, otherwise derived from the current request (proxy-aware). */
export function siteUrl(): string {
  const configured = process.env["SITE_URL"]?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const coolifyUrl = process.env["SERVICE_FQDN_APP_3000"]?.trim();
  if (coolifyUrl) {
    const withScheme = /^https?:\/\//i.test(coolifyUrl) ? coolifyUrl : `https://${coolifyUrl}`;
    return withScheme.replace(/\/$/, "");
  }

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
