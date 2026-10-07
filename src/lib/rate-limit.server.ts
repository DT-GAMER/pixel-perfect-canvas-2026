// Persistent per-IP rate limiting backed by Postgres. Server only.
import { createHash } from "crypto";
import { getRequestIP } from "@tanstack/react-start/server";

/**
 * Records an attempt for this client and scope; returns false once the limit is hit.
 * Throws if the check itself fails, so callers can fail closed.
 */
export async function consumeAttempt(scope: string, maxAttempts: number, windowSeconds = 3600) {
  // X-Forwarded-For is client-controlled unless a trusted proxy sets it,
  // so only honour it when TRUST_PROXY=true (e.g. behind Vercel or a load balancer).
  const address =
    getRequestIP({ xForwardedFor: process.env["TRUST_PROXY"] === "true" }) ?? "unknown";
  const keyHash = createHash("sha256").update(`${address}:${scope}`).digest("hex");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin.rpc("consume_registration_attempt", {
    p_key_hash: keyHash,
    p_window_seconds: windowSeconds,
    p_max_attempts: maxAttempts,
  });
  if (error) throw new Error(`Rate-limit check failed: ${error.message}`);
  return data === true;
}
