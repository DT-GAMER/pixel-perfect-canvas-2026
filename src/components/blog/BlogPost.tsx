import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import type { PostDetail } from "@/lib/blog.functions";
import { formatDate } from "@/lib/format";
import { signOutReader } from "@/lib/reader.functions";
import { ArticleBody } from "./ArticleBody";
import { SignUpWall } from "./SignUpWall";

export function BlogPost({ post, linkExpired }: { post: PostDetail; linkExpired: boolean }) {
  const router = useRouter();
  const signOut = useServerFn(signOutReader);

  return (
    <article>
      <header className="bg-deep-blue text-paper">
        <div className="mx-auto max-w-4xl px-5 pb-14 pt-12 md:pb-20 md:pt-16">
          <Link
            to="/blog"
            className="inline-flex min-h-12 items-center gap-2 font-display font-semibold text-paper/80 hover:text-digital-lime"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" /> All articles
          </Link>
          {post.category && (
            <p className="mt-6 font-display text-sm font-bold uppercase text-digital-lime">
              {post.category.name}
            </p>
          )}
          <h1 className="mt-4 text-h1">{post.title}</h1>
          <p className="mt-6 max-w-3xl text-xl text-paper/85">{post.excerpt}</p>
          <p className="mt-8 font-display text-paper/70">
            {post.authorName}
            {post.authorRole ? `, ${post.authorRole}` : ""} · {formatDate(post.publishedAt)} ·{" "}
            {post.readingMinutes} min read
          </p>
        </div>
      </header>

      {post.coverImageUrl && (
        <div className="bg-[linear-gradient(to_bottom,var(--deep-blue)_50%,var(--paper)_50%)]">
          <div className="mx-auto max-w-5xl px-5">
            <img
              src={post.coverImageUrl}
              alt={post.coverImageAlt ?? ""}
              width={1200}
              height={750}
              fetchPriority="high"
              className="aspect-[16/9] w-full rounded-md object-cover"
            />
          </div>
        </div>
      )}

      <div className="bg-paper py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <div className="relative">
            <ArticleBody blocks={post.blocks} />
            {post.gated && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-paper to-transparent"
              />
            )}
          </div>

          {post.tags.length > 0 && !post.gated && (
            <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-light-grey px-4 py-1.5 text-sm text-deep-blue"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {post.reader && (
            <p className="mt-12 border-t border-light-grey pt-6 text-sm text-muted-foreground">
              Signed in as <strong className="text-ink">{post.reader.email}</strong> ·{" "}
              <button
                type="button"
                className="min-h-12 font-semibold text-deep-blue underline underline-offset-4"
                onClick={async () => {
                  await signOut();
                  await router.invalidate();
                }}
              >
                Sign out
              </button>
            </p>
          )}
        </div>

        {post.gated && (
          <div className="mx-auto mt-6 max-w-5xl px-5">
            <SignUpWall next={`/blog/${post.slug}`} linkExpired={linkExpired} />
          </div>
        )}
      </div>
    </article>
  );
}
