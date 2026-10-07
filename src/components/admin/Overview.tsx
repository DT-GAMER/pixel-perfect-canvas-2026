import { Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { adminOverview } from "@/lib/admin/overview.functions";
import { formatDate } from "@/lib/format";
import { tierName } from "@/lib/sponsorship";
import { PageHeader } from "./AdminShell";

type Data = Awaited<ReturnType<typeof adminOverview>>;

const INK = "#001F65"; // deep-blue: the single series hue
const GRID = "#EBEAE7"; // light-grey hairlines

export function Overview({ data }: { data: Data }) {
  const { totals } = data;
  return (
    <>
      <PageHeader
        title="Overview"
        description="Registrations, content, and sponsor interest at a glance."
      />

      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Total registrations" value={totals.registrations} note="Goal: 500" />
        <Stat label="Registered this week" value={totals.thisWeek} note="Last 7 days" />
        <Stat
          label="Opted in to updates"
          value={totals.subscribed}
          note={percent(totals.subscribed, totals.registrations)}
        />
        <Stat
          label="New sponsor enquiries"
          value={totals.newEnquiries}
          note={totals.newEnquiries ? "Awaiting reply" : "All handled"}
        />
      </dl>
      {totals.emailFailed > 0 && (
        <p
          role="alert"
          className="mt-4 rounded-md border-l-4 border-signal-orange bg-paper px-4 py-3 font-semibold text-deep-blue"
        >
          {totals.emailFailed} confirmation email{totals.emailFailed === 1 ? "" : "s"} failed to
          send.{" "}
          <Link to="/admin/registrations" search={{ email: "failed" }} className="underline">
            Review
          </Link>
        </p>
      )}

      <section className="mt-6 rounded-md bg-paper p-5 sm:p-6" aria-labelledby="signups-title">
        <h2 id="signups-title" className="font-display text-lg font-bold text-deep-blue">
          Sign-ups per day
        </h2>
        <p className="text-sm text-muted-foreground">Last 30 days, Lagos time</p>
        <div className="mt-4 h-64" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.daily}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              barCategoryGap={2}
            >
              <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: GRID }}
                interval="preserveStartEnd"
                minTickGap={24}
                tick={{ fill: "#5b6070", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5b6070", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0, 31, 101, 0.06)" }}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="rounded-md border border-light-grey bg-paper px-3 py-2 text-sm shadow-md">
                      <p className="font-semibold text-ink">{payload[0].payload.label}</p>
                      <p className="text-muted-foreground">
                        {payload[0].value} sign-up{payload[0].value === 1 ? "" : "s"}
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="count" fill={INK} radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <table className="sr-only">
          <caption>Sign-ups per day, last 30 days</caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>Sign-ups</th>
            </tr>
          </thead>
          <tbody>
            {data.daily.map((day) => (
              <tr key={day.date}>
                <td>{day.label}</td>
                <td>{day.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankedBars title="Top professions" rows={data.professions} total={totals.registrations} />
        <RankedBars title="Top countries" rows={data.countries} total={totals.registrations} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-md bg-paper p-5 sm:p-6" aria-labelledby="posts-title">
          <div className="flex items-center justify-between">
            <h2 id="posts-title" className="font-display text-lg font-bold text-deep-blue">
              Latest blog posts
            </h2>
            <Link to="/admin/blog" className="text-sm font-semibold text-deep-blue underline">
              All posts
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-light-grey">
            {data.posts.map((post) => (
              <li key={post.slug} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0 truncate font-medium text-ink">{post.title}</span>
                <StatusBadge status={post.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-md bg-paper p-5 sm:p-6" aria-labelledby="enquiries-title">
          <div className="flex items-center justify-between">
            <h2 id="enquiries-title" className="font-display text-lg font-bold text-deep-blue">
              Sponsor enquiries
            </h2>
            <Link
              to="/admin/sponsors"
              search={{ tab: "enquiries" }}
              className="text-sm font-semibold text-deep-blue underline"
            >
              All enquiries
            </Link>
          </div>
          {data.enquiries.length === 0 ? (
            <p className="mt-3 text-muted-foreground">No enquiries yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-light-grey">
              {data.enquiries.map((enquiry) => (
                <li key={enquiry.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{enquiry.company}</span>
                    <span className="text-sm text-muted-foreground">
                      {tierName(enquiry.tier_interest)} · {formatDate(enquiry.created_at)}
                    </span>
                  </span>
                  <StatusBadge status={enquiry.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

const percent = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}% of registrants` : "—";

function Stat({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-md bg-paper p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-4xl font-bold tabular-nums text-deep-blue">
        {value.toLocaleString()}
      </dd>
      <dd className="mt-1 text-sm text-muted-foreground">{note}</dd>
    </div>
  );
}

/** Ranked horizontal bars in plain HTML: label, bar, and the value as text. */
function RankedBars({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; count: number }[];
  total: number;
}) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className="rounded-md bg-paper p-5 sm:p-6" aria-label={title}>
      <h2 className="font-display text-lg font-bold text-deep-blue">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No registrations yet.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex justify-between gap-4 text-sm">
                <span className="truncate text-ink">{row.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {row.count} · {Math.round((row.count / Math.max(1, total)) * 100)}%
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-light-grey" aria-hidden="true">
                <div
                  className="h-2 rounded-full bg-deep-blue"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

const STATUS_STYLE: Record<string, string> = {
  published: "bg-digital-teal/15 text-deep-blue",
  scheduled: "bg-digital-lime/40 text-deep-blue",
  draft: "bg-light-grey text-ink",
  new: "bg-signal-orange/20 text-deep-blue",
  contacted: "bg-digital-teal/15 text-deep-blue",
  closed: "bg-light-grey text-ink",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[status] ?? "bg-light-grey"}`}
    >
      {status}
    </span>
  );
}
