import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { JSONContent } from "@tiptap/react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/site/FormField";
import { settingsFormSchema, type SettingsForm } from "@/lib/admin/settings";
import {
  savePrivacyPolicy,
  saveSettings,
  type settingsEditorData,
} from "@/lib/admin/settings.functions";
import type { RichDoc } from "@/lib/rich-text";
import { PageHeader } from "./AdminShell";
import { adminInput } from "./fields";

const RichTextEditor = lazy(() =>
  import("./RichTextEditor").then((module) => ({ default: module.RichTextEditor })),
);

type Data = Awaited<ReturnType<typeof settingsEditorData>>;

export function SettingsAdmin({ data }: { data: Data }) {
  return (
    <>
      <PageHeader
        title="Site settings"
        description="Event details used across the site, emails, countdown, and calendar invites. Changes appear within 30 seconds."
      />
      <div className="space-y-8">
        <EventSettings form={data.form} />
        <PrivacySettings content={data.privacy} />
      </div>
    </>
  );
}

function EventSettings({ form }: { form: SettingsForm }) {
  const router = useRouter();
  const save = useServerFn(saveSettings);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsForm>({
    // raw: submit the form values as typed; the server validates and transforms them.
    resolver: zodResolver(settingsFormSchema, undefined, { raw: true }) as Resolver<SettingsForm>,
    defaultValues: form,
  });
  const stats = useFieldArray({ control, name: "stats" });

  const submit = handleSubmit(
    async (values) => {
      try {
        await save({ data: values });
        reset(values);
        toast.success("Settings saved");
        await router.invalidate();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't save settings");
      }
    },
    () => toast.error("Check the highlighted fields"),
  );

  const text = (
    name: keyof SettingsForm,
    label: string,
    extra: { type?: string; className?: string; placeholder?: string } = {},
  ) => (
    <Field
      label={label}
      htmlFor={`settings-${name}`}
      error={(errors[name] as { message?: string } | undefined)?.message}
      className={extra.className ?? ""}
    >
      <Input
        id={`settings-${name}`}
        type={extra.type ?? "text"}
        className={adminInput}
        placeholder={extra.placeholder}
        {...register(name as "name")}
        aria-invalid={!!errors[name]}
      />
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Section title="Event">
        {text("name", "Event name")}
        {text("tagline", "Tagline")}
        {text("theme", "Theme", { className: "sm:col-span-2" })}
        {text("themeShort", "Short theme (headings)", { className: "sm:col-span-2" })}
        {text("venue", "Venue", { placeholder: "Live online" })}
        {text("format", "Format", { placeholder: "Virtual summit" })}
      </Section>

      <Section
        title="Date and time (Lagos time)"
        description="Drives the countdown, the “Happening now” pill, date labels, and calendar invites."
      >
        {text("startsAt", "Starts", { type: "datetime-local" })}
        {text("endsAt", "Ends", { type: "datetime-local" })}
      </Section>

      <Section title="Contact and social">
        {text("email", "Contact email", { type: "email", className: "sm:col-span-2" })}
        {text("xUrl", "X / Twitter", { type: "url", placeholder: "https://" })}
        {text("linkedinUrl", "LinkedIn", { type: "url", placeholder: "https://" })}
        {text("instagramUrl", "Instagram", { type: "url", placeholder: "https://" })}
      </Section>

      <Section
        title="Homepage stats"
        description="The count-up numbers in the About section (up to 6)."
      >
        <div className="space-y-3 sm:col-span-2">
          {stats.fields.map((field, index) => (
            <fieldset
              key={field.id}
              className="grid grid-cols-[1fr_80px] gap-3 rounded-md border border-light-grey p-3 sm:grid-cols-[140px_80px_1fr_auto] sm:items-end"
            >
              <legend className="sr-only">Stat {index + 1}</legend>
              <Field
                label="Number"
                htmlFor={`stat-${index}-value`}
                error={errors.stats?.[index]?.value?.message}
              >
                <Input
                  id={`stat-${index}-value`}
                  type="number"
                  min={0}
                  className={adminInput}
                  {...register(`stats.${index}.value`)}
                />
              </Field>
              <Field
                label="Suffix"
                htmlFor={`stat-${index}-suffix`}
                error={errors.stats?.[index]?.suffix?.message}
              >
                <Input
                  id={`stat-${index}-suffix`}
                  className={adminInput}
                  placeholder="+"
                  {...register(`stats.${index}.suffix`)}
                />
              </Field>
              <Field
                label="Label"
                htmlFor={`stat-${index}-label`}
                error={errors.stats?.[index]?.label?.message}
                className="col-span-2 sm:col-span-1"
              >
                <Input
                  id={`stat-${index}-label`}
                  className={adminInput}
                  {...register(`stats.${index}.label`)}
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                className="h-12 rounded-full text-destructive"
                onClick={() => stats.remove(index)}
                aria-label={`Remove stat ${index + 1}`}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </fieldset>
          ))}
          {stats.fields.length < 6 && (
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => stats.append({ value: 0, suffix: "", label: "" })}
            >
              <Plus aria-hidden="true" /> Add stat
            </Button>
          )}
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="h-12 rounded-full px-8 shadow-lg"
        >
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />} Save
          settings
        </Button>
      </div>
    </form>
  );
}

function PrivacySettings({ content }: { content: RichDoc | null }) {
  const save = useServerFn(savePrivacyPolicy);
  const [custom, setCustom] = useState(content !== null);
  const [doc, setDoc] = useState<JSONContent>(
    content ?? { type: "doc", content: [{ type: "paragraph" }] },
  );
  const [saving, setSaving] = useState(false);

  const persist = async () => {
    setSaving(true);
    try {
      await save({ data: { content: custom ? (doc as RichDoc) : null } });
      toast.success(custom ? "Privacy policy saved" : "Using the built-in privacy policy");
    } catch {
      toast.error("Couldn't save the privacy policy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-md bg-paper p-5 sm:p-6" aria-labelledby="privacy-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="privacy-title" className="font-display text-xl font-bold text-deep-blue">
            Privacy policy
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The built-in policy describes exactly what the registration form collects. Write your
            own to replace it (have it reviewed first).
          </p>
        </div>
        <label className="flex items-center gap-3 font-semibold text-deep-blue">
          <Switch checked={custom} onCheckedChange={setCustom} />
          Use a custom policy
        </label>
      </div>
      {custom && (
        <>
          <p id="privacy-body-label" className="sr-only">
            Privacy policy text
          </p>
          <Suspense fallback={<div className="min-h-[300px] rounded-md bg-light-grey/40" />}>
            <RichTextEditor labelId="privacy-body-label" content={doc} onChange={setDoc} />
          </Suspense>
        </>
      )}
      <div className="flex justify-end">
        <Button
          type="button"
          className="h-12 rounded-full px-6"
          disabled={saving}
          onClick={persist}
        >
          {saving && <LoaderCircle className="animate-spin" aria-hidden="true" />} Save privacy
          policy
        </Button>
      </div>
    </section>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md bg-paper p-5 sm:p-6" aria-label={title}>
      <h2 className="font-display text-xl font-bold text-deep-blue">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
