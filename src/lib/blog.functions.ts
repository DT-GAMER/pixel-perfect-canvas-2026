import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import type { RichDoc, RichNode } from "./rich-text";

export const POSTS_PER_PAGE = 6;

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  category: { slug: string; name: string } | null;
  authorName: string;
  publishedAt: string;
  readingMinutes: number;
  isFree: boolean;
};

export type PostDetail = PostSummary & {
  authorRole: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  /** Full body when the visitor may read it, otherwise only the preview. */
  blocks: RichNode[];
  /** True when `blocks` is a preview and the rest is behind the sign-up wall. */
  gated: boolean;
  reader: { email: string } | null;
};

export type Category = { slug: string; name: string };

const SUMMARY_COLUMNS =
  "slug, title, excerpt, cover_image_url, cover_image_alt, author_name, published_at, reading_minutes, is_free, category:categories(slug, name)";

type SummaryRow = {
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  author_name: string;
  published_at: string | null;
  reading_minutes: number;
  is_free: boolean;
  category: { slug: string; name: string } | null;
};

const toSummary = (row: SummaryRow): PostSummary => ({
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  coverImageUrl: row.cover_image_url,
  coverImageAlt: row.cover_image_alt,
  category: row.category,
  authorName: row.author_name,
  publishedAt: row.published_at ?? "",
  readingMinutes: row.reading_minutes,
  isFree: row.is_free,
});

type AdminClient = (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

const adminClient = async () =>
  (await import("@/integrations/supabase/client.server")).supabaseAdmin;

// Live = published, or scheduled with its publish time passed.
// Synchronous on purpose: query builders are thenables, so awaiting one runs it.
function liveQuery<T extends string>(client: AdminClient, columns: T) {
  return client
    .from("blog_posts")
    .select(columns, { count: "exact" })
    .in("status", ["published", "scheduled"])
    .lte("published_at", new Date().toISOString());
}

const listSchema = z.object({
  category: z.string().max(80).optional(),
  page: z.number().int().min(1).max(1000).optional(),
});

export const listPosts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => listSchema.parse(input))
  .handler(async ({ data }) => {
    const supabaseAdmin = await adminClient();
    const page = data.page ?? 1;

    const { data: categories, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("id, slug, name")
      .order("display_order");
    if (categoryError) throw new Error(categoryError.message);

    const active = categories.find((category) => category.slug === data.category) ?? null;
    let query = liveQuery(supabaseAdmin, SUMMARY_COLUMNS)
      .order("published_at", { ascending: false })
      .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);
    if (active) query = query.eq("category_id", active.id);

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);

    return {
      posts: (rows as unknown as SummaryRow[]).map(toSummary),
      categories: categories.map(({ slug, name }): Category => ({ slug, name })),
      activeCategory: active?.slug ?? null,
      page,
      pageCount: Math.max(1, Math.ceil((count ?? 0) / POSTS_PER_PAGE)),
    };
  });

export const latestPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await liveQuery(await adminClient(), SUMMARY_COLUMNS)
    .order("published_at", { ascending: false })
    .limit(3);
  if (error) throw new Error(error.message);
  return (data as unknown as SummaryRow[]).map(toSummary);
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(120) }).parse(input))
  .handler(async ({ data }): Promise<PostDetail> => {
    const { data: row, error } = await liveQuery(
      await adminClient(),
      `${SUMMARY_COLUMNS}, author_role, tags, seo_title, seo_description, content, preview_paragraphs`,
    )
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw notFound();

    const post = row as unknown as SummaryRow & {
      author_role: string | null;
      tags: string[];
      seo_title: string | null;
      seo_description: string | null;
      content: RichDoc;
      preview_paragraphs: number;
    };

    const { getReader } = await import("@/integrations/supabase/reader-session.server");
    const reader = await getReader();
    const canReadAll = post.is_free || reader !== null;
    const { previewBlocks } = await import("./rich-text");

    return {
      ...toSummary(post),
      authorRole: post.author_role,
      tags: post.tags,
      seoTitle: post.seo_title,
      seoDescription: post.seo_description,
      // The gated remainder never leaves the server for anonymous visitors.
      blocks: canReadAll
        ? (post.content.content ?? [])
        : previewBlocks(post.content, post.preview_paragraphs),
      gated: !canReadAll,
      reader: reader ? { email: reader.email } : null,
    };
  });
