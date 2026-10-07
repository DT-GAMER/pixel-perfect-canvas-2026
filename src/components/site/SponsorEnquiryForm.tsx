import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitSponsorEnquiry } from "@/lib/sponsors.functions";
import { SPONSOR_TIERS, sponsorEnquirySchema, type SponsorEnquiryInput } from "@/lib/sponsorship";
import { Field } from "./FormField";

type Tier = SponsorEnquiryInput["tierInterest"];

export function SponsorEnquiryForm({ defaultTier }: { defaultTier?: Tier | undefined }) {
  const [sent, setSent] = useState(false);
  const submitEnquiry = useServerFn(submitSponsorEnquiry);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SponsorEnquiryInput>({
    resolver: zodResolver(sponsorEnquirySchema) as Resolver<SponsorEnquiryInput>,
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      tierInterest: defaultTier ?? "not-sure",
      message: "",
      website: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const result = await submitEnquiry({ data: values });
      if (result.status === "success") setSent(true);
      else if (result.status === "rate_limited")
        setError("root", { message: "Too many enquiries from here. Please try again in an hour." });
      else setError("root", { message: "We couldn't send your enquiry. Please try again." });
    } catch {
      setError("root", { message: "Check the highlighted fields and try again." });
    }
  });

  if (sent) {
    return (
      <div role="status" className="py-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-teal-ink" aria-hidden="true" />
        <h3 className="mt-5 text-h2 text-deep-blue">Thank you.</h3>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          We've received your enquiry and sent a confirmation to your inbox. The C8 team will be in
          touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="enquiry-name" error={errors.name?.message}>
          <Input
            id="enquiry-name"
            autoComplete="name"
            className="h-12"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field
          label="Company or organisation"
          htmlFor="enquiry-company"
          error={errors.company?.message}
        >
          <Input
            id="enquiry-company"
            autoComplete="organization"
            className="h-12"
            {...register("company")}
            aria-invalid={!!errors.company}
          />
        </Field>
        <Field label="Email" htmlFor="enquiry-email" error={errors.email?.message}>
          <Input
            id="enquiry-email"
            type="email"
            autoComplete="email"
            className="h-12"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field label="Phone (optional)" htmlFor="enquiry-phone" error={errors.phone?.message}>
          <Input
            id="enquiry-phone"
            type="tel"
            autoComplete="tel"
            className="h-12"
            {...register("phone")}
            aria-invalid={!!errors.phone}
          />
        </Field>
        <Field
          label="Tier of interest"
          htmlFor="enquiry-tier"
          error={errors.tierInterest?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="tierInterest"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="enquiry-tier" className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPONSOR_TIERS.map((tier) => (
                    <SelectItem key={tier.slug} value={tier.slug}>
                      {tier.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="not-sure">Not sure yet</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Message"
          htmlFor="enquiry-message"
          error={errors.message?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="enquiry-message"
            rows={5}
            className="text-base"
            placeholder="What would you like to achieve by partnering with C8?"
            {...register("message")}
            aria-invalid={!!errors.message}
          />
        </Field>
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <Label htmlFor="enquiry-website">Website</Label>
        <Input id="enquiry-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {errors.root?.message && (
        <p
          role="alert"
          className="border-l-4 border-signal-orange bg-light-grey px-4 py-3 text-sm font-semibold text-deep-blue"
        >
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full rounded-full px-7 sm:w-auto">
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" /> Sending
          </>
        ) : (
          <>
            Send enquiry <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
