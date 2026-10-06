import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, professions, registrationSchema, type RegistrationInput } from "@/lib/registration";
import { submitRegistration } from "@/lib/registration.functions";

const emptyForm: RegistrationInput = {
  fullName: "",
  email: "",
  profession: "Student",
  otherProfession: "",
  country: "Nigeria",
  city: "",
  privacyAgreed: false as true,
  subscribeUpdates: false,
  website: "",
};

export function RegisterModal() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<"success" | "duplicate" | null>(null);
  const registerPerson = useServerFn(submitRegistration);
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({ resolver: zodResolver(registrationSchema), defaultValues: emptyForm });
  const profession = watch("profession");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-register]") : null;
      if (!target) return;
      event.preventDefault();
      setResult(null);
      setOpen(true);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) document.body.dataset["modalOpen"] = "true";
    else {
      delete document.body.dataset["modalOpen"];
      reset(emptyForm);
      setResult(null);
    }
  };

  const submit = handleSubmit(async (values) => {
    try {
      const response = await registerPerson({ data: values });
      if (response.status === "success" || response.status === "duplicate") {
        setResult(response.status);
        return;
      }
      if (response.status === "rate_limited") {
        setError("root", { message: "Too many attempts. Please wait an hour and try again." });
      } else if (response.status === "invalid") {
        setError("root", { message: response.message });
      } else {
        setError("root", { message: "We couldn't complete your registration. Please try again." });
      }
    } catch {
      setError("root", { message: "Check the highlighted fields and try again." });
    }
  });

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[92svh] max-w-3xl overflow-y-auto border-0 bg-paper p-0 text-ink sm:rounded-md">
        {result ? (
          <div className="grid min-h-[520px] place-items-center bg-deep-blue p-8 text-center text-paper sm:p-14">
            <div className="max-w-lg">
              <CheckCircle2 className="mx-auto h-16 w-16 text-digital-lime" aria-hidden="true" />
              <p className="mt-6 font-display text-sm font-bold uppercase text-digital-lime">Registration received</p>
              <DialogTitle className="mt-3 text-h2 text-paper">
                {result === "duplicate" ? "You're already on the list." : "Your place is registered."}
              </DialogTitle>
              <DialogDescription className="mt-5 text-base text-paper/80">
                {result === "duplicate"
                  ? "We already have a registration for this email address. No further action is needed."
                  : "Thank you for registering for C8 Tech Summit. We'll share important event updates using the email you provided."}
              </DialogDescription>
              <Button type="button" className="mt-8 rounded-full px-7" onClick={() => changeOpen(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className="bg-deep-blue p-7 text-paper sm:p-10">
              <p className="font-display text-sm font-bold uppercase text-digital-lime">15 December 2026 · Lagos</p>
              <DialogHeader className="mt-4 text-left">
                <DialogTitle className="text-h2 text-paper">Join the room shaping what's next.</DialogTitle>
                <DialogDescription className="mt-4 text-base text-paper/75">
                  Register your interest for C8 Tech Summit and receive essential attendance updates.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-10 border-t border-paper/20 pt-6 font-display text-sm text-paper/70">
                <p>9:00 AM – 6:00 PM</p>
                <p className="mt-2">Lagos State, Nigeria</p>
              </div>
            </div>

            <form onSubmit={submit} noValidate className="space-y-5 p-7 sm:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" error={errors.fullName?.message} className="sm:col-span-2">
                  <Input autoFocus autoComplete="name" className="h-12" {...register("fullName")} aria-invalid={!!errors.fullName} />
                </Field>
                <Field label="Email" error={errors.email?.message} className="sm:col-span-2">
                  <Input type="email" autoComplete="email" className="h-12" {...register("email")} aria-invalid={!!errors.email} />
                </Field>
                <Field label="Profession" error={errors.profession?.message} className="sm:col-span-2">
                  <Controller control={control} name="profession" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>{professions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </Field>
                {profession === "Other" && (
                  <Field label="Your profession" error={errors.otherProfession?.message} className="sm:col-span-2">
                    <Input className="h-12" {...register("otherProfession")} aria-invalid={!!errors.otherProfession} />
                  </Field>
                )}
                <Field label="Country" error={errors.country?.message}>
                  <Controller control={control} name="country" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>{countries.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </Field>
                <Field label="City" error={errors.city?.message}>
                  <Input autoComplete="address-level2" className="h-12" {...register("city")} aria-invalid={!!errors.city} />
                </Field>
              </div>

              <div className="absolute -left-[9999px]" aria-hidden="true">
                <Label htmlFor="registration-website">Website</Label>
                <Input id="registration-website" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>

              <CheckField control={control} name="privacyAgreed" error={errors.privacyAgreed?.message}>
                I agree to the <Link to="/privacy" target="_blank" className="font-semibold text-deep-blue underline">privacy policy</Link>.
              </CheckField>
              <CheckField control={control} name="subscribeUpdates">
                Send me C8 Tech Summit news and programme updates.
              </CheckField>

              {errors.root?.message && <p role="alert" className="border-l-4 border-signal-orange bg-light-grey px-4 py-3 text-sm font-semibold text-deep-blue">{errors.root.message}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full rounded-full px-7">
                {isSubmitting ? <><LoaderCircle className="animate-spin" /> Registering</> : <>Complete registration <ArrowRight /></>}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="mb-2 block font-display font-semibold text-deep-blue">{label}</Label>
      {children}
      {error && <p role="alert" className="mt-1 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

function CheckField({ control, name, error, children }: { control: ReturnType<typeof useForm<RegistrationInput>>["control"]; name: "privacyAgreed" | "subscribeUpdates"; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <Controller control={control} name={name} render={({ field }) => (
          <Checkbox id={`registration-${name}`} checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} aria-invalid={!!error} className="mt-1 h-5 w-5" />
        )} />
        <Label htmlFor={`registration-${name}`} className="cursor-pointer text-sm leading-6 text-muted-foreground">{children}</Label>
      </div>
      {error && <p role="alert" className="ml-8 mt-1 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}