import { createFileRoute } from "@tanstack/react-router";
import { serialize } from "cookie";
import { safeNextPath } from "@/lib/reader";

// Landing page for magic sign-in links: verifies the one-time token, sets the
// reader's session cookies, and sends them back to what they were reading.
export const Route = createFileRoute("/auth/confirm")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const next = safeNextPath(url.searchParams.get("next"));
        const tokenHash = url.searchParams.get("token_hash");
        const headers = new Headers({ "cache-control": "no-store" });

        let ok = false;
        if (tokenHash) {
          const { createReaderClient } =
            await import("@/integrations/supabase/reader-session.server");
          const supabase = createReaderClient((cookies) => {
            for (const { name, value, options } of cookies) {
              headers.append("set-cookie", serialize(name, value, options));
            }
          });
          const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
          if (error) console.error("Magic link verification failed", error.message);
          ok = !error;
        }

        const destination = new URL(next, url.origin);
        if (!ok) destination.searchParams.set("signin", "expired");
        headers.set("location", `${destination.pathname}${destination.search}${destination.hash}`);
        return new Response(null, { status: 303, headers });
      },
    },
  },
});
