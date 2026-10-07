import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";
import type { RichDoc, RichNode } from "@/lib/rich-text";
import { lagosInputToIso, POST_STATUSES, postFormSchema } from "./blog";

async function staff() {
  const { requireStaff } = await import("@/lib/staff.server");
  await requireStaff("admin", "editor");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
const fail = (error: { message: string; code?: string } | null) => {
  if (error?.code === "23505") throw new Error("Another post already uses that URL slug");
  if (error) throw new Error(error.message);
};

const words = (nodes: RichNode[] = []): number =>
  nodes.reduce(
    (sum, node) =>
      sum + (node.text ? node.text.split(/\s+/).filter(Boolean).length : 0) + words(node.content),
    0,
  );

export type AdminPostRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  is_free: boolean;
  published_at: string | null;
  updated_at: string;
  category: { name: string } | null;
};

export const blogDashboard = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({ q: z.string().max(100).optional(), status: z.enum(POST_STATUSES).optional() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const db = await staff();
    let query = db
      .from("blog_posts")
      .select(
        "id, slug, title, status, is_free, published_at, updated_at, category:categories(name)",
      )
      .order("updated_at", { ascending: false })
      .limit(500);
    const term = data.q?.replace(/[,()*%\\:"']/g, " ").trim();
    if (term) query = query.ilike("title", `%${term}%`);
    if (data.status) query = query.eq("status", data.status);
    const { data: rows, error } = await query;
    fail(error);
    return (rows ?? []) as unknown as AdminPostRow[];
  });

export const postEditorData = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid().optional() }).parse(input))
  .handler(async ({ data }) => {
    const db = await staff();
    const [categories, post] = await Promise.all([
      db.from("categories").select("id, name").order("display_order"),
      data.id
        ? db
            .from("blog_posts")
            .select(
              "id, slug, title, excerpt, content, cover_image_url, cover_image_alt, category_id, tags, author_name, author_role, is_free, preview_paragraphs, status, published_at, seo_title, seo_description",
            )
            .eq("id", data.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
    fail(categories.error);
    fail(post.error);
    if (data.id && !post.data) throw new Error("Post not found");
    return {
      categories: categories.data ?? [],
      post: post.data as
        (Omit<NonNullable<typeof post.data>, "content"> & { content: RichDoc }) | null,
    };
  });

export const savePost = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => postFormSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await staff();
    const content = data.content as RichDoc;
    const publishedAt = data.publishedAt
      ? lagosInputToIso(data.publishedAt)
      : data.status === "published"
        ? new Date().toISOString()
        : null;
    const row = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: content as unknown as Json,
      cover_image_url: data.coverImageUrl,
      cover_image_alt: data.coverImageUrl ? data.coverImageAlt : null,
      category_id: data.categoryId,
      tags: data.tags,
      author_name: data.authorName,
      author_role: data.authorRole,
      is_free: data.isFree,
      preview_paragraphs: data.previewParagraphs,
      reading_minutes: Math.max(1, Math.round(words(content.content) / 200)),
      status: data.status,
      published_at: publishedAt,
      seo_title: data.seoTitle,
      seo_description: data.seoDescription,
    };
    if (data.id) {
      fail((await db.from("blog_posts").update(row).eq("id", data.id)).error);
      return { id: data.id };
    }
    const { data: created, error } = await db.from("blog_posts").insert(row).select("id").single();
    fail(error);
    return { id: created!.id };
  });

export const deletePost = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = await staff();
    fail((await db.from("blog_posts").delete().eq("id", data.id)).error);
    return { ok: true };
  });
