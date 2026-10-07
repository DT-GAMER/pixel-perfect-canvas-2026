// Cookie-based Supabase Auth session for blog readers. Server only.
//
// Readers sign in with a magic link; the session lives in httpOnly cookies so
// SSR knows who is signed in and can decide how much of a gated post to send.
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { supabaseKey } from "./keys.server";
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
  const key = supabaseKey("anon");
  if (!url || !key)
    throw new Error("Missing SUPABASE_URL, or SUPABASE_PUBLISHABLE_KEY / JWT_SECRET");
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

type Claims = {
  sub?: string;
  email?: string;
  exp?: number;
  aud?: string | string[];
  role?: string;
};

/**
 * Verifies a Supabase access token (HS256, signed with JWT_SECRET) locally, so
 * identifying the caller doesn't cost a round trip to the Auth server.
 */
function verifyAccessToken(token: string): Claims | null {
  const secret = process.env["JWT_SECRET"];
  if (!secret) return null;
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  try {
    if (JSON.parse(Buffer.from(header, "base64url").toString()).alg !== "HS256") return null;
    const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest();
    const given = Buffer.from(signature, "base64url");
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as Claims;
    if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;
    if (claims.role !== "authenticated") return null;
    return claims;
  } catch {
    return null;
  }
}

/**
 * The signed-in reader for this request, or null. The session comes from the
 * cookie (refreshed via Auth only when the access token has expired); its
 * token is then verified locally. Falls back to asking Auth if JWT_SECRET is unset.
 */
export async function getReader(): Promise<Reader | null> {
  const hasSession = Object.keys(getCookies()).some((name) =>
    name.startsWith(READER_COOKIE_OPTIONS.name!),
  );
  if (!hasSession) return null;
  const supabase = createReaderClient();

  if (process.env["JWT_SECRET"]) {
    const { data } = await supabase.auth.getSession();
    const claims = data.session ? verifyAccessToken(data.session.access_token) : null;
    if (!claims?.sub || !claims.email) return null;
    return { id: claims.sub, email: claims.email };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return { id: data.user.id, email: data.user.email };
}
