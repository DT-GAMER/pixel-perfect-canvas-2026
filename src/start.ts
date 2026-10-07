import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Refresh EVENT from site_settings (cached) before rendering or running server functions.
const settingsMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const { loadSettings } = await import("./lib/settings.server");
    await loadSettings();
  } catch (error) {
    console.error("Loading site settings failed; using defaults", error);
  }
  return next();
});

// Baseline security headers on every response.
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  const response = result instanceof Response ? result : result.response;
  const set = (name: string, value: string) => {
    try {
      if (!response.headers.has(name)) response.headers.set(name, value);
    } catch {
      // Some responses (e.g. Response.redirect) have immutable headers.
    }
  };
  set("X-Content-Type-Options", "nosniff");
  set("Referrer-Policy", "strict-origin-when-cross-origin");
  set("X-Frame-Options", "SAMEORIGIN");
  set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  if (process.env["SITE_URL"]?.startsWith("https://"))
    set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return result;
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    securityHeadersMiddleware,
    errorMiddleware,
    csrfMiddleware,
    settingsMiddleware,
  ],
}));
