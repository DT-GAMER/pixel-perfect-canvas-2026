import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Trash2,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { RegistrationFilters } from "@/lib/admin/registrations";
import {
  deleteRegistration,
  type AdminRegistration,
  type listRegistrations,
} from "@/lib/admin/registrations.functions";
import { professions } from "@/lib/registration";
import { PageHeader } from "./AdminShell";
import { StatusBadge } from "./Overview";

type Data = Awaited<ReturnType<typeof listRegistrations>>;
type SortKey = NonNullable<RegistrationFilters["sort"]>;

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});
const formatDateTime = (iso: string | null) => (iso ? dateTime.format(new Date(iso)) : "—");

const selectClass =
  "h-12 rounded-md border border-input bg-paper px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RegistrationsTable({
  data,
  filters,
}: {
  data: Data;
  filters: RegistrationFilters;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(filters.q ?? "");
  const [selected, setSelected] = useState<AdminRegistration | null>(null);

  // Any filter change returns to page 1.
  const update = (patch: Partial<RegistrationFilters>) =>
    navigate({
      to: "/admin/registrations",
      search: (previous: RegistrationFilters) => {
        const next: Record<string, unknown> = { ...previous, page: undefined, ...patch };
        for (const key of Object.keys(next))
          if (next[key] === "" || next[key] === undefined) delete next[key];
        return next as RegistrationFilters;
      },
    });

  const sortBy = (key: SortKey) =>
    update({
      sort: key,
      dir:
        filters.sort === key && filters.dir === "asc"
          ? "desc"
          : filters.sort === key
            ? "asc"
            : key === "created_at"
              ? "desc"
              : "asc",
    });

  const exportParams = new URLSearchParams(
    Object.entries(filters).flatMap(([key, value]) =>
      value === undefined || key === "page" ? [] : [[key, String(value)]],
    ),
  );
  const activeFilters = Object.entries(filters).some(
    ([key, value]) => value !== undefined && !["sort", "dir", "page"].includes(key),
  );

  return (
    <>
      <PageHeader
        title="Registrations"
        description={`${data.total.toLocaleString()} ${activeFilters ? "matching" : "total"} registration${data.total === 1 ? "" : "s"}`}
        actions={
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-2 border-deep-blue px-5 font-display font-semibold text-deep-blue"
          >
            <a href={`/admin/registrations.csv?${exportParams}`} download>
              <Download className="h-5 w-5" aria-hidden="true" /> Export CSV
            </a>
          </Button>
        }
      />

      <section aria-label="Filters" className="rounded-md bg-paper p-4">
        <form
          role="search"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            update({ q: query.trim() || undefined });
          }}
          className="flex gap-2"
        >
          <label htmlFor="registrations-search" className="sr-only">
            Search by name, email, or city
          </label>
          <Input
            id="registrations-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or city"
            className="h-12 text-base"
          />
          <Button type="submit" className="h-12 rounded-full px-5">
            <Search className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Search</span>
          </Button>
        </form>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Filter label="Profession">
            <select
              className={selectClass}
              value={filters.profession ?? ""}
              onChange={(event) => update({ profession: event.target.value || undefined })}
            >
              <option value="">All professions</option>
              {professions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Filter>
          <Filter label="Country">
            <select
              className={selectClass}
              value={filters.country ?? ""}
              onChange={(event) => update({ country: event.target.value || undefined })}
            >
              <option value="">All countries</option>
              {data.countries.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Filter>
          <Filter label="From">
            <input
              type="date"
              className={selectClass}
              value={filters.from ?? ""}
              onChange={(event) => update({ from: event.target.value || undefined })}
            />
          </Filter>
          <Filter label="To">
            <input
              type="date"
              className={selectClass}
              value={filters.to ?? ""}
              onChange={(event) => update({ to: event.target.value || undefined })}
            />
          </Filter>
          <Filter label="Updates opt-in">
            <select
              className={selectClass}
              value={filters.subscribed ?? ""}
              onChange={(event) =>
                update({
                  subscribed: (event.target.value ||
                    undefined) as RegistrationFilters["subscribed"],
                })
              }
            >
              <option value="">Any</option>
              <option value="yes">Opted in</option>
              <option value="no">Not opted in</option>
            </select>
          </Filter>
          <Filter label="Confirmation email">
            <select
              className={selectClass}
              value={filters.email ?? ""}
              onChange={(event) =>
                update({ email: (event.target.value || undefined) as RegistrationFilters["email"] })
              }
            >
              <option value="">Any</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </Filter>
        </div>
        {activeFilters && (
          <button
            type="button"
            className="mt-3 min-h-12 font-semibold text-deep-blue underline underline-offset-4"
            onClick={() => {
              setQuery("");
              navigate({ to: "/admin/registrations", search: {} });
            }}
          >
            Clear filters
          </button>
        )}
      </section>

      <div className="mt-4 overflow-x-auto rounded-md bg-paper">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">Registrations. Select a row to see details.</caption>
          <thead className="border-b border-light-grey text-muted-foreground">
            <tr>
              <SortHeader label="Name" sortKey="full_name" filters={filters} onSort={sortBy} />
              <SortHeader label="Email" sortKey="email" filters={filters} onSort={sortBy} />
              <SortHeader
                label="Profession"
                sortKey="profession"
                filters={filters}
                onSort={sortBy}
              />
              <SortHeader label="Country" sortKey="country" filters={filters} onSort={sortBy} />
              <SortHeader label="City" sortKey="city" filters={filters} onSort={sortBy} />
              <SortHeader
                label="Registered"
                sortKey="created_at"
                filters={filters}
                onSort={sortBy}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-light-grey">
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No registrations match these filters.
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.id} className="hover:bg-light-grey/50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      className="min-h-10 text-left font-semibold text-deep-blue underline-offset-4 hover:underline"
                    >
                      {row.full_name}
                    </button>
                  </td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">
                    {row.profession === "Other"
                      ? (row.other_profession ?? "Other")
                      : row.profession}
                  </td>
                  <td className="px-4 py-3">{row.country}</td>
                  <td className="px-4 py-3">{row.city}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDateTime(row.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            className="h-12 rounded-full"
            disabled={data.page <= 1}
            onClick={() =>
              navigate({
                to: "/admin/registrations",
                search: (previous: RegistrationFilters) => ({ ...previous, page: data.page - 1 }),
              })
            }
          >
            <ChevronLeft aria-hidden="true" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.page} of {data.pageCount}
          </span>
          <Button
            variant="outline"
            className="h-12 rounded-full"
            disabled={data.page >= data.pageCount}
            onClick={() =>
              navigate({
                to: "/admin/registrations",
                search: (previous: RegistrationFilters) => ({ ...previous, page: data.page + 1 }),
              })
            }
          >
            Next <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}

      <RegistrationDetails registration={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Filter({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-deep-blue">
      {label}
      {children}
    </label>
  );
}

function SortHeader({
  label,
  sortKey,
  filters,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  filters: RegistrationFilters;
  onSort: (key: SortKey) => void;
}) {
  const active = (filters.sort ?? "created_at") === sortKey;
  const dir = filters.dir ?? (sortKey === "created_at" ? "desc" : "asc");
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className="px-4 py-2 font-semibold"
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex min-h-10 items-center gap-1 hover:text-deep-blue"
      >
        {label}
        {active &&
          (dir === "asc" ? (
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          ))}
      </button>
    </th>
  );
}

function RegistrationDetails({
  registration,
  onClose,
}: {
  registration: AdminRegistration | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const remove = useServerFn(deleteRegistration);
  const [confirming, setConfirming] = useState(false);
  if (!registration) return null;

  const fields: [string, ReactNode][] = [
    [
      "Email",
      <a key="email" href={`mailto:${registration.email}`} className="text-deep-blue underline">
        {registration.email}
      </a>,
    ],
    [
      "Profession",
      registration.profession === "Other"
        ? `Other: ${registration.other_profession ?? ""}`
        : registration.profession,
    ],
    ["Location", `${registration.city}, ${registration.country}`],
    ["Registered", formatDateTime(registration.created_at)],
    ["Updates opt-in", registration.subscribe_updates ? "Yes" : "No"],
    ["Privacy policy", registration.privacy_agreed ? "Agreed" : "Not agreed"],
    [
      "Confirmation email",
      <span key="email-status" className="flex flex-wrap items-center gap-2">
        <StatusBadge status={registration.confirmation_email_status} />
        {registration.confirmation_email_sent_at &&
          formatDateTime(registration.confirmation_email_sent_at)}
        {registration.confirmation_email_error && (
          <span className="text-destructive">{registration.confirmation_email_error}</span>
        )}
      </span>,
    ],
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-paper">
        <DialogTitle className="font-display text-2xl font-bold text-deep-blue">
          {registration.full_name}
        </DialogTitle>
        <DialogDescription className="sr-only">Registration details</DialogDescription>
        <dl className="mt-2 divide-y divide-light-grey text-sm">
          {fields.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[140px_1fr] gap-3 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            className="h-12 rounded-full border-destructive text-destructive hover:bg-destructive hover:text-paper"
            onClick={() => setConfirming(true)}
          >
            <Trash2 aria-hidden="true" /> Delete registration
          </Button>
        </div>
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {registration.full_name}'s registration?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes their details. They can register again with the same email.
                This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-12 rounded-full">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="h-12 rounded-full bg-destructive text-paper hover:bg-destructive/90"
                onClick={async () => {
                  try {
                    await remove({ data: { id: registration.id } });
                    toast.success("Registration deleted");
                    onClose();
                    await router.invalidate();
                  } catch {
                    toast.error("Couldn't delete the registration. Please try again.");
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
