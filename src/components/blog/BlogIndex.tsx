import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Category, PostSummary } from "@/lib/blog.functions";
import { Arcs } from "@/components/site/Logo";
import { PostCard } from "./PostCard";

type Props = {
  posts: PostSummary[];
  categories: Category[];
  activeCategory: string | null;
  page: number;
  pageCount: number;
};

const chip =
  "inline-flex min-h-12 items-center rounded-full border-2 px-5 font-display font-semibold transition";

export function BlogIndex({ posts, categories, activeCategory, page, pageCount }: Props) {
  const search = (nextPage: number, category = activeCategory) => ({
    ...(category ? { category } : {}),
    ...(nextPage > 1 ? { page: nextPage } : {}),
  });

  return (
    <>
      <section className="relative overflow-hidden bg-deep-blue py-20 text-paper md:py-28">
        <Arcs className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5">
          <p className="font-display text-sm font-bold uppercase text-digital-lime">The C8 blog</p>
          <h1 className="mt-4 max-w-4xl text-h1">Ideas before the summit.</h1>
          <p className="mt-6 max-w-2xl text-lg text-paper/80">
            Explainers and opinion on what AI means for Nigerian jobs, privacy, and financial
            security, plus news from the C8 community.
          </p>
        </div>
      </section>

      <section className="bg-light-grey py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <nav aria-label="Blog categories" className="flex flex-wrap gap-3">
            <Link
              to="/blog"
              search={search(1, null)}
              className={`${chip} ${!activeCategory ? "border-deep-blue bg-deep-blue text-paper" : "border-deep-blue/25 text-deep-blue hover:border-deep-blue"}`}
              aria-current={!activeCategory ? "page" : undefined}
            >
              All
            </Link>
            {categories.map((category) => {
              const active = category.slug === activeCategory;
              return (
                <Link
                  key={category.slug}
                  to="/blog"
                  search={search(1, category.slug)}
                  className={`${chip} ${active ? "border-deep-blue bg-deep-blue text-paper" : "border-deep-blue/25 text-deep-blue hover:border-deep-blue"}`}
                  aria-current={active ? "page" : undefined}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>

          {posts.length === 0 ? (
            <p className="mt-14 text-lg text-muted-foreground">
              No articles here yet. Check back soon.
            </p>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-14 flex flex-wrap items-center justify-center gap-3 font-display font-semibold"
            >
              {page > 1 && (
                <Link
                  to="/blog"
                  search={search(page - 1)}
                  className={`${chip} border-deep-blue/25 text-deep-blue hover:border-deep-blue`}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" /> Newer
                </Link>
              )}
              <span className="px-3 text-deep-blue">
                Page {page} of {pageCount}
              </span>
              {page < pageCount && (
                <Link
                  to="/blog"
                  search={search(page + 1)}
                  className={`${chip} border-deep-blue/25 text-deep-blue hover:border-deep-blue`}
                >
                  Older <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
