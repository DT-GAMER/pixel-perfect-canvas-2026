import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { supabaseKey } from "@/integrations/supabase/keys.server";

const ENV_KEYS = ["JWT_SECRET", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;

function isSignedWith(jwt: string, secret: string) {
  const [header, payload, signature] = jwt.split(".");
  const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return signature === expected;
}

function roleOf(jwt: string) {
  return JSON.parse(Buffer.from(jwt.split(".")[1]!, "base64url").toString()) as { role: string };
}

afterEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  vi.restoreAllMocks();
});

describe("supabaseKey", () => {
  it("derives a service key from JWT_SECRET when no key is configured", () => {
    process.env["JWT_SECRET"] = "deployment-secret";

    const key = supabaseKey("service_role");

    expect(key).toBeDefined();
    expect(isSignedWith(key!, "deployment-secret")).toBe(true);
    expect(roleOf(key!).role).toBe("service_role");
  });

  it("ignores a stale JWT key signed with a different secret", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    process.env["JWT_SECRET"] = "deployment-secret";
    process.env["SUPABASE_SERVICE_ROLE_KEY"] = supabaseKey("service_role");
    process.env["JWT_SECRET"] = "new-deployment-secret";

    const key = supabaseKey("service_role");

    expect(isSignedWith(key!, "new-deployment-secret")).toBe(true);
    expect(roleOf(key!).role).toBe("service_role");
    expect(warn).toHaveBeenCalledOnce();
  });
});
