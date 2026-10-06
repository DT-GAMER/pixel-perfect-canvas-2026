import { createHash } from "crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { registrationSchema } from "./registration";

export type RegistrationResult =
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "rate_limited" }
  | { status: "invalid"; message: string }
  | { status: "error" };

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(async ({ data }): Promise<RegistrationResult> => {
    if (data.website) return { status: "success" };

    const request = getRequest();
    const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const address = forwarded || request?.headers.get("cf-connecting-ip") || "unknown";
    const keyHash = createHash("sha256").update(`${address}:registration`).digest("hex");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: allowed, error: rateError } = await supabaseAdmin.rpc("consume_registration_attempt", {
      p_key_hash: keyHash,
      p_window_seconds: 3600,
      p_max_attempts: 5,
    });
    if (rateError) {
      console.error("Registration rate-limit check failed", rateError.message);
      return { status: "error" };
    }
    if (!allowed) return { status: "rate_limited" };

    const { error } = await supabaseAdmin.from("registrations").insert({
      full_name: data.fullName,
      email: data.email.trim(),
      profession: data.profession,
      other_profession: data.profession === "Other" ? data.otherProfession?.trim() || null : null,
      country: data.country,
      city: data.city,
      privacy_agreed: data.privacyAgreed,
      subscribe_updates: data.subscribeUpdates,
    });

    if (error?.code === "23505") return { status: "duplicate" };
    if (error) {
      console.error("Registration insert failed", error.message);
      return { status: "error" };
    }
    return { status: "success" };
  });