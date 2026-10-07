import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EVENT } from "@/lib/event";
import { RegistrationForm } from "./RegistrationForm";

export function RegisterModal() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<"success" | "duplicate" | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest("[data-register]") : null;
      if (!target) return;
      event.preventDefault();
      setResult(null);
      setOpen(true);
      document.body.dataset["modalOpen"] = "true";
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // The form unmounts with the dialog, so closing also resets it.
  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) document.body.dataset["modalOpen"] = "true";
    else {
      delete document.body.dataset["modalOpen"];
      setResult(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[92svh] max-w-3xl overflow-y-auto border-0 bg-paper p-0 text-ink sm:rounded-md">
        {result ? (
          <div className="grid min-h-[520px] place-items-center bg-deep-blue p-8 text-center text-paper sm:p-14">
            <div className="max-w-lg">
              <CheckCircle2 className="mx-auto h-16 w-16 text-digital-lime" aria-hidden="true" />
              <p className="mt-6 font-display text-sm font-bold uppercase text-digital-lime">
                Registration received
              </p>
              <DialogTitle className="mt-3 text-h2 text-paper">
                {result === "duplicate"
                  ? "You're already on the list."
                  : "Your place is registered."}
              </DialogTitle>
              <DialogDescription className="mt-5 text-base text-paper/80">
                {result === "duplicate"
                  ? "We already have a registration for this email address, so there's nothing more to do. Your joining link will arrive before the event."
                  : `Thanks for registering for ${EVENT.name}. A confirmation is on its way to your inbox. See you on ${EVENT.dateLabel} at ${EVENT.timeLabel}.`}
              </DialogDescription>
              <Button
                type="button"
                className="mt-8 rounded-full px-7"
                onClick={() => changeOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className="bg-deep-blue p-7 text-paper sm:p-10">
              <p className="font-display text-sm font-bold uppercase text-digital-lime">
                {EVENT.dateLabel} · {EVENT.venue}
              </p>
              <DialogHeader className="mt-4 text-left">
                <DialogTitle className="text-h2 text-paper">
                  Add your voice to Nigeria's AI conversation.
                </DialogTitle>
                <DialogDescription className="mt-4 text-base text-paper/75">
                  Register for {EVENT.name} {EVENT.edition}. We'll email your confirmation now and
                  your joining link before the event.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-10 border-t border-paper/20 pt-6 font-display text-sm text-paper/70">
                <p>
                  {EVENT.dateLabel}, {EVENT.timeLabel}
                </p>
                <p className="mt-2">{EVENT.format}, join from anywhere</p>
              </div>
            </div>

            <RegistrationForm
              idPrefix="registration"
              autoFocus
              className="p-7 sm:p-10"
              onResult={setResult}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
