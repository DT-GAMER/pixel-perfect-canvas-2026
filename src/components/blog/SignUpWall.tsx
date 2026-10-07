import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, LoaderCircle, Lock } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegistrationForm } from "@/components/site/RegistrationForm";
import { EVENT } from "@/lib/event";
import { requestSignInLink } from "@/lib/reader.functions";

type State = "register" | "sign-in" | "registered" | "already-registered" | "link-sent";

const DONE_COPY: Record<"registered" | "already-registered" | "link-sent", [string, string]> = {
  registered: [
    "Check your inbox.",
    "Your registration is confirmed. The email we just sent has a “Continue reading” link that signs you in on this device.",
  ],
  "already-registered": [
    "You're already registered.",
    "We've emailed you a sign-in link. Open it on this device to keep reading.",
  ],
  "link-sent": [
    "Check your inbox.",
    "If that email is registered, a sign-in link is on its way. It works once and expires in 1 hour.",
  ],
};

/** Shown under the free preview of a gated post. Uses the site's one registration form. */
export function SignUpWall({ next, linkExpired }: { next: string; linkExpired: boolean }) {
  const [state, setState] = useState<State>("register");

  if (state === "registered" || state === "already-registered" || state === "link-sent") {
    const [title, body] = DONE_COPY[state];
    return (
      <WallCard>
        <div role="status" className="text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-digital-lime" aria-hidden="true" />
          <h2 className="mt-5 text-h2 text-paper">{title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-paper/80">{body}</p>
        </div>
      </WallCard>
    );
  }

  return (
    <WallCard>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Lock className="h-10 w-10 text-digital-lime" aria-hidden="true" />
          <h2 className="mt-5 text-h2 text-paper">Sign up free to read the full article.</h2>
          <p className="mt-4 text-paper/80">
            Register for {EVENT.name} {EVENT.edition} to unlock every article. We'll email you a
            link that signs you in on this device, plus your summit details for {EVENT.dateLabel}.
          </p>
          {linkExpired && (
            <p
              role="alert"
              className="mt-6 rounded-md bg-signal-orange px-4 py-3 font-semibold text-deep-blue"
            >
              That sign-in link has expired or was already used. Request a new one below.
            </p>
          )}
          <p className="mt-8 text-paper/80">
            {state === "register" ? "Already registered?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => setState(state === "register" ? "sign-in" : "register")}
              className="min-h-12 font-display font-bold text-digital-lime underline underline-offset-4"
            >
              {state === "register" ? "Email me a sign-in link" : "Sign up instead"}
            </button>
          </p>
        </div>
        <div className="rounded-md bg-paper p-6 text-ink sm:p-8">
          {state === "register" ? (
            <RegistrationForm
              idPrefix="wall"
              next={next}
              submitLabel="Sign up and keep reading"
              onResult={(result) =>
                setState(result === "success" ? "registered" : "already-registered")
              }
            />
          ) : (
            <SignInForm next={next} onSent={() => setState("link-sent")} />
          )}
        </div>
      </div>
    </WallCard>
  );
}

function WallCard({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-label="Sign up to keep reading"
      className="relative overflow-hidden rounded-md bg-deep-blue p-7 text-paper sm:p-10"
    >
      {children}
    </section>
  );
}

function SignInForm({ next, onSent }: { next: string; onSent: () => void }) {
  const id = useId();
  const send = useServerFn(requestSignInLink);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await send({ data: { email: email.trim(), next } });
      if (result.status === "sent") onSent();
      else if (result.status === "rate_limited")
        setError("Too many attempts. Please wait an hour and try again.");
      else setError("We couldn't send your link. Please try again.");
    } catch {
      setError("We couldn't send your link. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <Label
          htmlFor={`${id}-email`}
          className="mb-2 block font-display font-semibold text-deep-blue"
        >
          Email you registered with
        </Label>
        <Input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          className="h-12"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={busy} className="w-full rounded-full px-7">
        {busy ? (
          <>
            <LoaderCircle className="animate-spin" /> Sending
          </>
        ) : (
          "Email me a sign-in link"
        )}
      </Button>
    </form>
  );
}
