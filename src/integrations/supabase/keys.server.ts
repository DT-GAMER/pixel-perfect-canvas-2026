// Supabase API keys (anon / service_role JWTs). Server only.
//
// Uses SUPABASE_PUBLISHABLE_KEY / SUPABASE_SERVICE_ROLE_KEY when set (local
// dev); otherwise signs them from JWT_SECRET, so a deployment only needs the
// one secret. Auth, REST and Storage verify these with the same JWT_SECRET.
import { createHmac, timingSafeEqual } from "node:crypto";

const base64url = (value: string) => Buffer.from(value).toString("base64url");

function signKey(role: "anon" | "service_role", secret: string) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  // Fixed claims keep the key stable across restarts and containers.
  const payload = base64url(
    JSON.stringify({ role, iss: "supabase", iat: 1767225600, exp: 2524608000 }),
  );
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function isLegacyJwt(value: string) {
  return value.split(".").length === 3;
}

function isSignedWith(value: string, secret: string) {
  const [header, payload, signature] = value.split(".");
  if (!header || !payload || !signature) return false;

  try {
    const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest();
    const given = Buffer.from(signature, "base64url");
    return given.length === expected.length && timingSafeEqual(given, expected);
  } catch {
    return false;
  }
}

export function supabaseKey(role: "anon" | "service_role"): string | undefined {
  const configured =
    process.env[role === "anon" ? "SUPABASE_PUBLISHABLE_KEY" : "SUPABASE_SERVICE_ROLE_KEY"]?.trim();
  const secret = process.env["JWT_SECRET"]?.trim();

  if (configured) {
    if (!secret || !isLegacyJwt(configured) || isSignedWith(configured, secret)) return configured;

    console.warn(
      `[Supabase] Ignoring ${role} key because it is not signed with JWT_SECRET; deriving a matching key instead.`,
    );
  }

  return secret ? signKey(role, secret) : undefined;
}
