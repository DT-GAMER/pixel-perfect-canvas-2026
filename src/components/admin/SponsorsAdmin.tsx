import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, LoaderCircle, Mail, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/site/FormField";
import { ENQUIRY_STATUSES, sponsorFormSchema, type SponsorForm } from "@/lib/admin/sponsors";
import {
  deleteSponsor,
  reorderSponsors,
  saveSponsor,
  setSponsorVisible,
  updateEnquiry,
  type AdminEnquiry,
  type AdminSponsor,
  type sponsorsDashboard,
} from "@/lib/admin/sponsors.functions";
import { SPONSOR_TIERS, tierName } from "@/lib/sponsorship";
import { PageHeader } from "./AdminShell";
import { DeleteButton, ImageField, SortableList, adminInput, adminSelect } from "./fields";
import { StatusBadge } from "./Overview";

type Data = Awaited<ReturnType<typeof sponsorsDashboard>>;
type Tab = "sponsors" | "enquiries";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

export function SponsorsAdmin({
  data,
  tab,
  status,
}: {
  data: Data;
  tab: Tab;
  status?: string | undefined;
}) {
  const tabClass = (active: boolean) =>
    `inline-flex min-h-12 items-center gap-2 rounded-full px-5 font-display font-semibold ${active ? "bg-deep-blue text-paper" : "text-deep-blue hover:bg-paper"}`;
  return (
    <>
      <PageHeader
        title="Sponsors"
        description="Partners shown on the site, and enquiries from the sponsor form."
      />
      <nav aria-label="Sponsor sections" className="mb-6 flex gap-2">
        <Link
          to="/admin/sponsors"
          search={{}}
          className={tabClass(tab === "sponsors")}
          aria-current={tab === "sponsors" ? "page" : undefined}
        >
          Sponsors <span className="text-sm opacity-70">{data.sponsors.length}</span>
        </Link>
        <Link
          to="/admin/sponsors"
          search={{ tab: "enquiries" }}
          className={tabClass(tab === "enquiries")}
          aria-current={tab === "enquiries" ? "page" : undefined}
        >
          Enquiries
          {data.enquiryCounts["new"] ? (
            <span className="rounded-full bg-signal-orange px-2 text-sm text-deep-blue">
              {data.enquiryCounts["new"]} new
            </span>
          ) : null}
        </Link>
      </nav>
      {tab === "sponsors" ? (
        <SponsorsTab sponsors={data.sponsors} />
      ) : (
        <EnquiriesTab data={data} status={status} />
      )}
    </>
  );
}

// ---------- Sponsors ----------

function SponsorsTab({ sponsors }: { sponsors: AdminSponsor[] }) {
  const router = useRouter();
  const reorder = useServerFn(reorderSponsors);
  const setVisible = useServerFn(setSponsorVisible);
  const remove = useServerFn(deleteSponsor);
  const [editing, setEditing] = useState<AdminSponsor | "new" | null>(null);
  // Optimistic order so drag-and-drop feels instant.
  const [order, setOrder] = useState<Record<string, string[]>>({});

  const tierSponsors = (tier: string) => {
    const list = sponsors.filter((sponsor) => sponsor.tier === tier);
    const ids = order[tier];
    return ids
      ? ids
          .map((id) => list.find((sponsor) => sponsor.id === id))
          .filter((sponsor): sponsor is AdminSponsor => !!sponsor)
      : list;
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button className="h-12 rounded-full px-6" onClick={() => setEditing("new")}>
          <Plus aria-hidden="true" /> Add sponsor
        </Button>
      </div>
      {sponsors.length === 0 && (
        <p className="mb-6 rounded-md bg-paper p-6 text-muted-foreground">
          No sponsors yet. Until you add some, the site shows each tier as an open slot.
        </p>
      )}
      <div className="space-y-8">
        {SPONSOR_TIERS.map((tier) => {
          const list = tierSponsors(tier.slug);
          if (list.length === 0) return null;
          return (
            <section key={tier.slug} aria-labelledby={`tier-${tier.slug}`}>
              <h2
                id={`tier-${tier.slug}`}
                className="mb-3 font-display text-lg font-bold text-deep-blue"
              >
                {tier.name}
              </h2>
              <SortableList
                items={list}
                getId={(sponsor) => sponsor.id}
                getLabel={(sponsor) => sponsor.name}
                onReorder={async (ids) => {
                  setOrder((previous) => ({ ...previous, [tier.slug]: ids }));
                  try {
                    await reorder({ data: { ids } });
                    await router.invalidate();
                  } catch {
                    toast.error("Couldn't save the new order");
                  }
                  // The server's order (fresh or unchanged) takes over again.
                  setOrder(({ [tier.slug]: _done, ...rest }) => rest);
                }}
              >
                {(sponsor, handle) => (
                  <>
                    {handle}
                    <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-light-grey/50">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No logo</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{sponsor.name}</p>
                      {sponsor.website_url && (
                        <p className="truncate text-sm text-muted-foreground">
                          {sponsor.website_url}
                        </p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Switch
                        checked={sponsor.is_visible}
                        onCheckedChange={async (visible) => {
                          try {
                            await setVisible({ data: { id: sponsor.id, visible } });
                            await router.invalidate();
                            toast.success(
                              visible
                                ? `${sponsor.name} is visible on the site`
                                : `${sponsor.name} is hidden`,
                            );
                          } catch {
                            toast.error("Couldn't update visibility");
                          }
                        }}
                        aria-label={`Show ${sponsor.name} on the site`}
                      />
                      <span className="hidden sm:inline">
                        {sponsor.is_visible ? "Visible" : "Hidden"}
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12"
                      aria-label={`Edit ${sponsor.name}`}
                      onClick={() => setEditing(sponsor)}
                    >
                      <Pencil className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <DeleteButton
                      what={sponsor.name}
                      onConfirm={async () => {
                        await remove({ data: { id: sponsor.id } });
                        toast.success(`${sponsor.name} deleted`);
                        await router.invalidate();
                      }}
                    />
                  </>
                )}
              </SortableList>
            </section>
          );
        })}
      </div>
      {editing && (
        <SponsorDialog
          sponsor={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function SponsorDialog({
  sponsor,
  onClose,
}: {
  sponsor: AdminSponsor | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const save = useServerFn(saveSponsor);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SponsorForm>({
    // raw: submit the form values as typed; the server validates and transforms them.
    resolver: zodResolver(sponsorFormSchema, undefined, { raw: true }) as Resolver<SponsorForm>,
    defaultValues: {
      ...(sponsor ? { id: sponsor.id } : {}),
      name: sponsor?.name ?? "",
      tier: (sponsor?.tier ?? "gold") as SponsorForm["tier"],
      websiteUrl: sponsor?.website_url ?? "",
      description: sponsor?.description ?? "",
      logoUrl: sponsor?.logo_url ?? null,
      logoAlt: sponsor?.logo_alt ?? "",
      isVisible: sponsor?.is_visible ?? true,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await save({ data: values });
      toast.success(sponsor ? "Sponsor updated" : "Sponsor added");
      onClose();
      await router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save the sponsor");
    }
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] max-w-2xl overflow-y-auto bg-paper">
        <DialogTitle className="font-display text-2xl font-bold text-deep-blue">
          {sponsor ? `Edit ${sponsor.name}` : "Add sponsor"}
        </DialogTitle>
        <DialogDescription>
          Higher tiers get bigger cards with a description and link on the sponsors page.
        </DialogDescription>
        <form onSubmit={submit} noValidate className="mt-2 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="sponsor-name" error={errors.name?.message}>
              <Input
                id="sponsor-name"
                className={adminInput}
                {...register("name")}
                aria-invalid={!!errors.name}
              />
            </Field>
            <Field label="Tier" htmlFor="sponsor-tier" error={errors.tier?.message}>
              <select id="sponsor-tier" className={adminSelect} {...register("tier")}>
                {SPONSOR_TIERS.map((tier) => (
                  <option key={tier.slug} value={tier.slug}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Website"
              htmlFor="sponsor-website"
              error={errors.websiteUrl?.message}
              className="sm:col-span-2"
            >
              <Input
                id="sponsor-website"
                type="url"
                placeholder="https://"
                className={adminInput}
                {...register("websiteUrl")}
                aria-invalid={!!errors.websiteUrl}
              />
            </Field>
            <Field
              label="Description (shown for Headline and Gold)"
              htmlFor="sponsor-description"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea
                id="sponsor-description"
                rows={3}
                className="text-base"
                {...register("description")}
              />
            </Field>
          </div>
          <ImageField
            label="Logo"
            folder="sponsors"
            url={watch("logoUrl")}
            alt={watch("logoAlt")}
            altError={errors.logoAlt?.message}
            onChange={({ url, alt }) => {
              setValue("logoUrl", url, { shouldDirty: true });
              setValue("logoAlt", alt || (url && !watch("logoAlt") ? watch("name") : alt), {
                shouldDirty: true,
              });
            }}
          />
          <label className="flex items-center gap-3 font-display font-semibold text-deep-blue">
            <Controller
              control={control}
              name="isVisible"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            Show on the site
          </label>
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

// ---------- Enquiries ----------

function EnquiriesTab({ data, status }: { data: Data; status?: string | undefined }) {
  const [open, setOpen] = useState<AdminEnquiry | null>(null);
  const chip = (active: boolean) =>
    `inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 font-semibold ${active ? "border-deep-blue bg-deep-blue text-paper" : "border-deep-blue/20 text-deep-blue hover:border-deep-blue"}`;
  const total = Object.values(data.enquiryCounts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        <Link to="/admin/sponsors" search={{ tab: "enquiries" }} className={chip(!status)}>
          All <span className="opacity-70">{total}</span>
        </Link>
        {ENQUIRY_STATUSES.map((value) => (
          <Link
            key={value}
            to="/admin/sponsors"
            search={{ tab: "enquiries", status: value }}
            className={`${chip(status === value)} capitalize`}
          >
            {value} <span className="opacity-70">{data.enquiryCounts[value] ?? 0}</span>
          </Link>
        ))}
      </nav>
      <div className="overflow-x-auto rounded-md bg-paper">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Sponsor enquiries</caption>
          <thead className="border-b border-light-grey text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Company
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Contact
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Tier
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Received
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-grey">
            {data.enquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No enquiries here.
                </td>
              </tr>
            ) : (
              data.enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="hover:bg-light-grey/50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="min-h-10 text-left font-semibold text-deep-blue hover:underline"
                      onClick={() => setOpen(enquiry)}
                    >
                      {enquiry.company}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {enquiry.name}
                    <span className="block text-muted-foreground">{enquiry.email}</span>
                  </td>
                  <td className="px-4 py-3">{tierName(enquiry.tier_interest)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {dateTime.format(new Date(enquiry.created_at))}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={enquiry.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {open && <EnquiryDialog enquiry={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function EnquiryDialog({ enquiry, onClose }: { enquiry: AdminEnquiry; onClose: () => void }) {
  const router = useRouter();
  const update = useServerFn(updateEnquiry);
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await update({
        data: { id: enquiry.id, status: status as (typeof ENQUIRY_STATUSES)[number], notes },
      });
      toast.success("Enquiry updated");
      onClose();
      await router.invalidate();
    } catch {
      toast.error("Couldn't update the enquiry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] max-w-2xl overflow-y-auto bg-paper">
        <DialogTitle className="font-display text-2xl font-bold text-deep-blue">
          {enquiry.company}
        </DialogTitle>
        <DialogDescription>
          {tierName(enquiry.tier_interest)} · received{" "}
          {dateTime.format(new Date(enquiry.created_at))}
        </DialogDescription>
        <dl className="mt-2 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[120px_1fr]">
          <dt className="text-muted-foreground">Contact</dt>
          <dd>{enquiry.name}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>
            <a className="text-deep-blue underline" href={`mailto:${enquiry.email}`}>
              {enquiry.email}
            </a>
          </dd>
          <dt className="text-muted-foreground">Phone</dt>
          <dd>
            {enquiry.phone ? (
              <a
                className="text-deep-blue underline"
                href={`tel:${enquiry.phone.replace(/\s/g, "")}`}
              >
                {enquiry.phone}
              </a>
            ) : (
              "Not given"
            )}
          </dd>
          <dt className="text-muted-foreground">Team email</dt>
          <dd>
            {enquiry.notified_at
              ? `Sent ${dateTime.format(new Date(enquiry.notified_at))}`
              : (enquiry.notification_error ?? "Not sent")}
          </dd>
        </dl>
        <div className="mt-4 rounded-md bg-light-grey/50 p-4">
          <p className="text-sm font-semibold text-muted-foreground">Message</p>
          <p className="mt-1 whitespace-pre-wrap text-ink">{enquiry.message}</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
          <Field label="Status" htmlFor="enquiry-status" error={undefined}>
            <select
              id="enquiry-status"
              className={`${adminSelect} capitalize`}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {ENQUIRY_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Internal notes" htmlFor="enquiry-notes" error={undefined}>
            <Textarea
              id="enquiry-notes"
              rows={4}
              className="text-base"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-3">
          <Button asChild variant="outline" className="h-12 rounded-full">
            <a
              href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Sponsoring C8 Tech Summit — ${enquiry.company}`)}`}
            >
              <Mail aria-hidden="true" /> Reply by email{" "}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="h-12 rounded-full" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="h-12 rounded-full px-6"
              disabled={saving}
              onClick={save}
            >
              {saving && <LoaderCircle className="animate-spin" aria-hidden="true" />} Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
