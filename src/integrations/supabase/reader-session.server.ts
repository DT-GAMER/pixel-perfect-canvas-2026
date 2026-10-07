// Cookie-based Supabase Auth session for blog readers. Server only.
//
// Readers sign in with a magic link; the session lives in httpOnly cookies so
// SSR knows who is signed in and can decide how much of a gated post to send.
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import type { Database } from "./types";

// Fixed name: in Docker the server and browser reach Supabase via different hosts,
// and the default name is derived from the URL.
export const READER_COOKIE_OPTIONS: CookieOptionsWithName = {
  name: "sb-c8-auth-token",
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure:
    process.env["NODE_ENV"] === "production" && !process.env["SITE_URL"]?.startsWith("http://"),
  maxAge: 60 * 60 * 24 * 365,
};

type CookieToSet = { name: string; value: string; options: Record<string, unknown> };

function supabaseEnv() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
  return { url, key };
}

/**
 * Supabase client bound to the current request's cookies.
 * Pass `onSetCookies` to collect cookie changes yourself (e.g. when returning a
 * raw Response); otherwise they are written to the current response.
 */
export function createReaderClient(onSetCookies?: (cookies: CookieToSet[]) => void) {
  const { url, key } = supabaseEnv();
  return createServerClient<Database>(url, key, {
    cookieOptions: READER_COOKIE_OPTIONS,
    cookies: {
      getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value })),
      setAll: (cookies) => {
        if (onSetCookies) return onSetCookies(cookies as CookieToSet[]);
        for (const { name, value, options } of cookies) setCookie(name, value, options);
      },
    },
  });
}

export type Reader = { id: string; email: string };

/** The signed-in reader for this request, or null. Refreshes the session if needed. */
export async function getReader(): Promise<Reader | null> {
  const hasSession = Object.keys(getCookies()).some((name) =>
    name.startsWith(READER_COOKIE_OPTIONS.name!),
  );
  if (!hasSession) return null;
  const { data, error } = await createReaderClient().auth.getUser();
  if (error || !data.user?.email) return null;
  return { id: data.user.id, email: data.user.email };
}
