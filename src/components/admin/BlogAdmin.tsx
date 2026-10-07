import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Plus, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POST_STATUSES } from "@/lib/admin/blog";
import { deletePost, type AdminPostRow } from "@/lib/admin/blog.functions";
import { PageHeader } from "./AdminShell";
import { DeleteButton } from "./fields";
import { StatusBadge } from "./Overview";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

export function BlogAdmin({
  posts,
  q,
  status,
}: {
  posts: AdminPostRow[];
  q?: string | undefined;
  status?: string | undefined;
}) {
  const navigate = useNavigate();
  const router = useRouter();
  const remove = useServerFn(deletePost);
  const [query, setQuery] = useState(q ?? "");
  const chip = (active: boolean) =>
    `inline-flex min-h-12 items-center rounded-full border-2 px-4 font-semibold capitalize ${active ? "border-deep-blue bg-deep-blue text-paper" : "border-deep-blue/20 text-deep-blue hover:border-deep-blue"}`;

  return (
    <>
      <PageHeader
        title="Blog posts"
        description="Drafts are private. Scheduled posts go live at their publish time."
        actions={
          <Button asChild className="h-12 rounded-full px-6">
            <Link to="/admin/blog/$id" params={{ id: "new" }}>
              <Plus aria-hidden="true" /> New post
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          role="search"
          className="flex flex-1 gap-2"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            navigate({
              to: "/admin/blog",
              search: {
                ...(query.trim() ? { q: query.trim() } : {}),
                ...(status ? { status } : {}),
              } as never,
            });
          }}
        >
          <label htmlFor="posts-search" className="sr-only">
            Search posts by title
          </label>
          <Input
            id="posts-search"
            type="search"
            className="h-12 bg-paper text-base"
            placeholder="Search by title"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="submit" className="h-12 rounded-full px-5">
            <Search aria-hidden="true" /> <span className="sr-only sm:not-sr-only">Search</span>
          </Button>
        </form>
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          <Link to="/admin/blog" search={q ? { q } : {}} className={chip(!status)}>
            All
          </Link>
          {POST_STATUSES.map((value) => (
            <Link
              key={value}
              to="/admin/blog"
              search={{ ...(q ? { q } : {}), status: value }}
              className={chip(status === value)}
            >
              {value}
            </Link>
          ))}
        </nav>
      </div>
      <div className="overflow-x-auto rounded-md bg-paper">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Blog posts</caption>
          <thead className="border-b border-light-grey text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Title
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Category
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Publish date
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Updated
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-grey">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No posts found.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-light-grey/50">
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/blog/$id"
                      params={{ id: post.id }}
                      className="font-semibold text-deep-blue hover:underline"
                    >
                      {post.title}
                    </Link>
                    {post.is_free && (
                      <span className="ml-2 rounded bg-digital-lime/40 px-1.5 py-0.5 text-xs text-deep-blue">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3">{post.category?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {post.published_at ? dateTime.format(new Date(post.published_at)) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {dateTime.format(new Date(post.updated_at))}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <div className="flex justify-end">
                      {post.status !== "draft" && (
                        <Button asChild variant="ghost" size="icon" className="h-12 w-12">
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View “${post.title}” on the site`}
                          >
                            <ExternalLink className="h-5 w-5" aria-hidden="true" />
                          </a>
                        </Button>
                      )}
                      <DeleteButton
                        what={`“${post.title}”`}
                        onConfirm={async () => {
                          await remove({ data: { id: post.id } });
                          toast.success("Post deleted");
                          await router.invalidate();
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
