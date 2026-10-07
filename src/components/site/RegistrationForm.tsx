import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Controller, useForm, type Control, type Resolver } from "react-hook-form";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  countries,
  professionGroups,
  registrationSchema,
  type RegistrationInput,
} from "@/lib/registration";
import { submitRegistration } from "@/lib/registration.functions";

const emptyForm: RegistrationInput = {
  fullName: "",
  email: "",
  profession: "Student",
  otherProfession: "",
  country: "Nigeria",
  city: "",
  privacyAgreed: false,
  subscribeUpdates: false,
  website: "",
};

type Props = {
  /** Prefix for field ids; must be unique per page (the modal and a blog wall can coexist). */
  idPrefix: string;
  /** Blog path: when set, the confirmation email also signs them in to keep reading. */
  next?: string;
  autoFocus?: boolean;
  submitLabel?: string;
  className?: string;
  onResult: (result: "success" | "duplicate") => void;
};

/** The one registration form, shared by the register modal and blog sign-up walls. */
export function RegistrationForm({
  idPrefix,
  next,
  autoFocus = false,
  submitLabel = "Complete registration",
  className = "",
  onResult,
}: Props) {
  const registerPerson = useServerFn(submitRegistration);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema) as Resolver<RegistrationInput>,
    defaultValues: emptyForm,
  });
  const profession = watch("profession");

  const submit = handleSubmit(async (values) => {
    try {
      const response = await registerPerson({ data: next ? { ...values, next } : values });
      if (response.status === "success" || response.status === "duplicate") {
        onResult(response.status);
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
    <form onSubmit={submit} noValidate className={`space-y-5 ${className}`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          htmlFor={`${idPrefix}-name`}
          error={errors.fullName?.message}
          className="sm:col-span-2"
        >
          <Input
            id={`${idPrefix}-name`}
            autoFocus={autoFocus}
            autoComplete="name"
            className="h-12"
            {...register("fullName")}
            aria-invalid={!!errors.fullName}
          />
        </Field>
        <Field
          label="Email"
          htmlFor={`${idPrefix}-email`}
          error={errors.email?.message}
          className="sm:col-span-2"
        >
          <Input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="email"
            className="h-12"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field
          label="Profession"
          htmlFor={`${idPrefix}-profession`}
          error={errors.profession?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="profession"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={`${idPrefix}-profession`} className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {professionGroups.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="font-display text-xs uppercase text-digital-teal">
                        {group.label}
                      </SelectLabel>
                      {group.options.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        {profession === "Other" && (
          <Field
            label="Your profession"
            htmlFor={`${idPrefix}-other-profession`}
            error={errors.otherProfession?.message}
            className="sm:col-span-2"
          >
            <Input
              id={`${idPrefix}-other-profession`}
              className="h-12"
              {...register("otherProfession")}
              aria-invalid={!!errors.otherProfession}
            />
          </Field>
        )}
        <Field label="Country" htmlFor={`${idPrefix}-country`} error={errors.country?.message}>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={`${idPrefix}-country`} className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="City" htmlFor={`${idPrefix}-city`} error={errors.city?.message}>
          <Input
            id={`${idPrefix}-city`}
            autoComplete="address-level2"
            className="h-12"
            {...register("city")}
            aria-invalid={!!errors.city}
          />
        </Field>
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <Label htmlFor={`${idPrefix}-website`}>Website</Label>
        <Input
          id={`${idPrefix}-website`}
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <CheckField
        idPrefix={idPrefix}
        control={control}
        name="privacyAgreed"
        error={errors.privacyAgreed?.message}
      >
        I agree to the{" "}
        <Link to="/privacy" target="_blank" className="font-semibold text-deep-blue underline">
          privacy policy
        </Link>
        .
      </CheckField>
      <CheckField idPrefix={idPrefix} control={control} name="subscribeUpdates">
        Send me C8 Tech Summit news and programme updates.
      </CheckField>

      {errors.root?.message && (
        <p
          role="alert"
          className="border-l-4 border-signal-orange bg-light-grey px-4 py-3 text-sm font-semibold text-deep-blue"
        >
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full rounded-full px-7">
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" /> Registering
          </>
        ) : (
          <>
            {submitLabel} <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  error: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-2 block font-display font-semibold text-deep-blue">
        {label}
      </Label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckField({
  idPrefix,
  control,
  name,
  error,
  children,
}: {
  idPrefix: string;
  control: Control<RegistrationInput>;
  name: "privacyAgreed" | "subscribeUpdates";
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Checkbox
              id={`${idPrefix}-${name}`}
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              aria-invalid={!!error}
              className="mt-1 h-5 w-5"
            />
          )}
        />
        <Label
          htmlFor={`${idPrefix}-${name}`}
          className="cursor-pointer text-sm leading-6 text-muted-foreground"
        >
          {children}
        </Label>
      </div>
      {error && (
        <p role="alert" className="ml-8 mt-1 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
