import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Pencil, Plus, Star, UserRound } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/site/FormField";
import { speakerFormSchema, type SpeakerForm } from "@/lib/admin/speakers";
import {
  deleteSpeaker,
  reorderSpeakers,
  saveSpeaker,
  setSpeakerFlags,
  type AdminSpeaker,
} from "@/lib/admin/speakers.functions";
import { slugify } from "@/lib/slug";
import { TRACKS, trackName } from "@/lib/tracks";
import { PageHeader } from "./AdminShell";
import { DeleteButton, ImageField, SortableList, adminInput, adminSelect } from "./fields";

export function SpeakersAdmin({ speakers }: { speakers: AdminSpeaker[] }) {
  const router = useRouter();
  const reorder = useServerFn(reorderSpeakers);
  const setFlags = useServerFn(setSpeakerFlags);
  const remove = useServerFn(deleteSpeaker);
  const [editing, setEditing] = useState<AdminSpeaker | "new" | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);

  const list = order
    ? order
        .map((id) => speakers.find((speaker) => speaker.id === id))
        .filter((speaker): speaker is AdminSpeaker => !!speaker)
    : speakers;

  const toggle = async (
    speaker: AdminSpeaker,
    patch: { isFeatured?: boolean; isPublished?: boolean },
    message: string,
  ) => {
    try {
      await setFlags({ data: { id: speaker.id, ...patch } });
      await router.invalidate();
      toast.success(message);
    } catch {
      toast.error("Couldn't update the speaker");
    }
  };

  return (
    <>
      <PageHeader
        title="Speakers"
        description="Featured speakers appear on the homepage. Drag to set the order used everywhere."
        actions={
          <Button className="h-12 rounded-full px-6" onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" /> Add speaker
          </Button>
        }
      />
      {list.length === 0 ? (
        <p className="rounded-md bg-paper p-6 text-muted-foreground">No speakers yet.</p>
      ) : (
        <SortableList
          items={list}
          getId={(speaker) => speaker.id}
          getLabel={(speaker) => speaker.name}
          onReorder={async (ids) => {
            setOrder(ids);
            try {
              await reorder({ data: { ids } });
              await router.invalidate();
            } catch {
              toast.error("Couldn't save the new order");
            }
            setOrder(null);
          }}
        >
          {(speaker, handle) => (
            <>
              {handle}
              <div className="flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-t-full bg-light-grey">
                {speaker.photo_url ? (
                  <img src={speaker.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {speaker.name}
                  {!speaker.is_published && (
                    <span className="ml-2 rounded bg-light-grey px-1.5 py-0.5 text-xs text-muted-foreground">
                      Hidden
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {[speaker.role, speaker.organization, trackName(speaker.track)]
                    .filter(Boolean)
                    .join(" · ") || "No details yet"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12"
                aria-pressed={speaker.is_featured}
                aria-label={`Feature ${speaker.name} on the homepage`}
                title={speaker.is_featured ? "Featured on the homepage" : "Not featured"}
                onClick={() =>
                  toggle(
                    speaker,
                    { isFeatured: !speaker.is_featured },
                    speaker.is_featured
                      ? `${speaker.name} removed from the homepage`
                      : `${speaker.name} featured on the homepage`,
                  )
                }
              >
                <Star
                  className={`h-5 w-5 ${speaker.is_featured ? "fill-signal-orange text-signal-orange" : "text-muted-foreground"}`}
                  aria-hidden="true"
                />
              </Button>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={speaker.is_published}
                  onCheckedChange={(published) =>
                    toggle(
                      speaker,
                      { isPublished: published },
                      published ? `${speaker.name} is published` : `${speaker.name} is hidden`,
                    )
                  }
                  aria-label={`Publish ${speaker.name}`}
                />
                <span className="hidden sm:inline">
                  {speaker.is_published ? "Published" : "Hidden"}
                </span>
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12"
                aria-label={`Edit ${speaker.name}`}
                onClick={() => setEditing(speaker)}
              >
                <Pencil className="h-5 w-5" aria-hidden="true" />
              </Button>
              <DeleteButton
                what={speaker.name}
                onConfirm={async () => {
                  await remove({ data: { id: speaker.id } });
                  toast.success(`${speaker.name} deleted`);
                  await router.invalidate();
                }}
              />
            </>
          )}
        </SortableList>
      )}
      {editing && (
        <SpeakerDialog
          speaker={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function SpeakerDialog({
  speaker,
  onClose,
}: {
  speaker: AdminSpeaker | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const save = useServerFn(saveSpeaker);
  // New speakers get a slug that follows the name until it's edited by hand.
  const [slugTouched, setSlugTouched] = useState(!!speaker);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SpeakerForm>({
    resolver: zodResolver(speakerFormSchema) as Resolver<SpeakerForm>,
    defaultValues: {
      ...(speaker ? { id: speaker.id } : {}),
      name: speaker?.name ?? "",
      slug: speaker?.slug ?? "",
      role: speaker?.role ?? "",
      organization: speaker?.organization ?? "",
      bio: speaker?.bio ?? "",
      track: (speaker?.track ?? "") as SpeakerForm["track"],
      photoUrl: speaker?.photo_url ?? null,
      photoAlt: speaker?.photo_alt ?? "",
      linkedinUrl: speaker?.linkedin_url ?? "",
      xUrl: speaker?.x_url ?? "",
      instagramUrl: speaker?.instagram_url ?? "",
      websiteUrl: speaker?.website_url ?? "",
      isFeatured: speaker?.is_featured ?? false,
      isPublished: speaker?.is_published ?? true,
    },
  });

  const name = register("name");
  const submit = handleSubmit(async (values) => {
    try {
      await save({ data: values });
      toast.success(speaker ? "Speaker updated" : "Speaker added");
      onClose();
      await router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save the speaker");
    }
  });

  const text = (
    field: "role" | "organization" | "linkedinUrl" | "xUrl" | "instagramUrl" | "websiteUrl",
    label: string,
    type = "text",
  ) => (
    <Field label={label} htmlFor={`speaker-${field}`} error={errors[field]?.message}>
      <Input
        id={`speaker-${field}`}
        type={type}
        className={adminInput}
        {...register(field)}
        aria-invalid={!!errors[field]}
        {...(type === "url" ? { placeholder: "https://" } : {})}
      />
    </Field>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] max-w-3xl overflow-y-auto bg-paper">
        <DialogTitle className="font-display text-2xl font-bold text-deep-blue">
          {speaker ? `Edit ${speaker.name}` : "Add speaker"}
        </DialogTitle>
        <DialogDescription>
          Shown on the speakers page, and on the homepage when featured.
        </DialogDescription>
        <form onSubmit={submit} noValidate className="mt-2 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="speaker-name" error={errors.name?.message}>
              <Input
                id="speaker-name"
                className={adminInput}
                {...name}
                onChange={(event) => {
                  void name.onChange(event);
                  if (!slugTouched) setValue("slug", slugify(event.target.value));
                }}
                aria-invalid={!!errors.name}
              />
            </Field>
            <Field label="URL slug" htmlFor="speaker-slug" error={errors.slug?.message}>
              <Input
                id="speaker-slug"
                className={adminInput}
                {...register("slug", { onChange: () => setSlugTouched(true) })}
                aria-invalid={!!errors.slug}
              />
            </Field>
            {text("role", "Role")}
            {text("organization", "Organisation")}
            <Field
              label="Conversation"
              htmlFor="speaker-track"
              error={errors.track?.message}
              className="sm:col-span-2"
            >
              <select id="speaker-track" className={adminSelect} {...register("track")}>
                <option value="">None</option>
                {TRACKS.map((track) => (
                  <option key={track.slug} value={track.slug}>
                    {track.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Bio"
              htmlFor="speaker-bio"
              error={errors.bio?.message}
              className="sm:col-span-2"
            >
              <Textarea id="speaker-bio" rows={5} className="text-base" {...register("bio")} />
            </Field>
          </div>
          <ImageField
            label="Photo"
            folder="speakers"
            url={watch("photoUrl")}
            alt={watch("photoAlt")}
            altError={errors.photoAlt?.message}
            onChange={({ url, alt }) => {
              setValue("photoUrl", url, { shouldDirty: true });
              setValue(
                "photoAlt",
                alt || (url && !watch("photoAlt") ? `Portrait of ${watch("name")}` : alt),
                { shouldDirty: true },
              );
            }}
          />
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-2 font-display font-semibold text-deep-blue">Links</legend>
            {text("linkedinUrl", "LinkedIn", "url")}
            {text("xUrl", "X / Twitter", "url")}
            {text("instagramUrl", "Instagram", "url")}
            {text("websiteUrl", "Website", "url")}
          </fieldset>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 font-display font-semibold text-deep-blue">
              <Controller
                control={control}
                name="isPublished"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Published
            </label>
            <label className="flex items-center gap-3 font-display font-semibold text-deep-blue">
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Featured on the homepage
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" className="h-12 rounded-full" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-12 rounded-full px-6">
              {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />} Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
