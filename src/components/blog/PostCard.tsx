import { Link } from "@tanstack/react-router";
import { ArrowRight, LockOpen } from "lucide-react";
import type { PostSummary } from "@/lib/blog.functions";
import { formatDate } from "@/lib/format";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="reveal group relative flex flex-col overflow-hidden rounded-md bg-paper shadow-sm transition focus-within:ring-4 focus-within:ring-signal-orange hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-[16/10] overflow-hidden bg-light-grey">
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? ""}
            loading="lazy"
            width={1200}
            height={750}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-sm font-bold">
          {post.category && <span className="text-teal-ink">{post.category.name}</span>}
          {post.isFree && (
            <span className="inline-flex items-center gap-1 text-deep-blue/70">
              <LockOpen className="h-4 w-4" aria-hidden="true" /> Free to read
            </span>
          )}
        </div>
        <h3 className="mt-3 text-h3 text-deep-blue">
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-6 flex items-center justify-between border-t border-light-grey pt-4 text-sm text-muted-foreground">
          <span>
            {post.authorName} · {formatDate(post.publishedAt)} · {post.readingMinutes} min read
          </span>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-deep-blue transition group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}
