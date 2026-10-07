import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/site/Logo";
import { EVENT } from "@/lib/event";
import { getStaff, requestStaffSignIn } from "@/lib/staff.functions";

export const Route = createFileRoute("/admin_/login")({
  validateSearch: z.object({ signin: z.string().optional().catch(undefined) }),
  beforeLoad: async () => {
    if (await getStaff()) throw redirect({ to: "/admin" });
  },
  head: () => ({
    meta: [
      { title: `Sign in — ${EVENT.name} dashboard` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { signin } = Route.useSearch();
  const send = useServerFn(requestStaffSignIn);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState<string | null>(
    signin === "expired"
      ? "That sign-in link has expired or was already used. Request a new one."
      : null,
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address");
    setState("busy");
    setError(null);
    try {
      const result = await send({ data: { email: email.trim() } });
      if (result.status === "sent") return setState("sent");
      setError(
        result.status === "rate_limited"
          ? "Too many attempts. Please wait an hour and try again."
          : "We couldn't send your link. Please try again.",
      );
    } catch {
      setError("We couldn't send your link. Please try again.");
    }
    setState("idle");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-deep-blue px-4 py-12">
      <div className="w-full max-w-md rounded-md bg-paper p-8 shadow-2xl sm:p-10">
        <div className="flex items-center gap-3 font-display font-bold text-deep-blue">
          <LogoMark className="h-10 w-10" />
          <span>
            {EVENT.name}
            <span className="block text-xs font-medium text-digital-teal">Dashboard</span>
          </span>
        </div>
        {state === "sent" ? (
          <div role="status" className="mt-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-digital-teal" aria-hidden="true" />
            <h1 className="mt-4 font-display text-2xl font-bold text-deep-blue">
              Check your inbox.
            </h1>
            <p className="mt-3 text-muted-foreground">
              If that email belongs to the team, a sign-in link is on its way. It expires in 1 hour.
            </p>
          </div>
        ) : (
          <>
            <h1 className="mt-8 font-display text-3xl font-bold text-deep-blue">Sign in</h1>
            <p className="mt-2 text-muted-foreground">We'll email you a one-time sign-in link.</p>
            <form onSubmit={submit} noValidate className="mt-6 space-y-5">
              <div>
                <Label
                  htmlFor="staff-email"
                  className="mb-2 block font-display font-semibold text-deep-blue"
                >
                  Work email
                </Label>
                <Input
                  id="staff-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  className="h-12"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "staff-email-error" : undefined}
                />
                {error && (
                  <p
                    id="staff-email-error"
                    role="alert"
                    className="mt-1 text-sm font-medium text-destructive"
                  >
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={state === "busy"} className="w-full rounded-full">
                {state === "busy" ? (
                  <>
                    <LoaderCircle className="animate-spin" /> Sending
                  </>
                ) : (
                  "Email me a sign-in link"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
