import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useBlocker, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { JSONContent } from "@tiptap/react";
import { ArrowLeft, Eye, LoaderCircle } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { Field } from "@/components/site/FormField";
import { isoToLagosInput, postFormSchema, type PostForm } from "@/lib/admin/blog";
import { savePost, type postEditorData } from "@/lib/admin/blog.functions";
import { previewBlocks, type RichDoc, type RichNode } from "@/lib/rich-text";
import { slugify } from "@/lib/slug";
import { PageHeader } from "./AdminShell";
import { ImageField, adminInput, adminSelect } from "./fields";
import { errorMessage, onInvalid } from "./form-errors";

// Tiptap only runs in the browser; load it separately from the rest of the page.
const RichTextEditor = lazy(() =>
  import("./RichTextEditor").then((module) => ({ default: module.RichTextEditor })),
);

type Data = Awaited<ReturnType<typeof postEditorData>>;

export function PostEditor({ data, defaultAuthor }: { data: Data; defaultAuthor: string }) {
  const { post, categories } = data;
  const router = useRouter();
  const navigate = useNavigate();
  const save = useServerFn(savePost);
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [content, setContent] = useState<JSONContent>(
    post?.content ?? { type: "doc", content: [] },
  );
  const [contentDirty, setContentDirty] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PostForm>({
    // raw: submit the form values as typed; the server validates and transforms them.
    resolver: zodResolver(postFormSchema, undefined, { raw: true }) as Resolver<PostForm>,
    defaultValues: {
      ...(post ? { id: post.id } : {}),
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? { type: "doc", content: [] },
      coverImageUrl: post?.cover_image_url ?? null,
      coverImageAlt: post?.cover_image_alt ?? "",
      categoryId: post?.category_id ?? "",
      tags: (post?.tags ?? []).join(", "),
      authorName: post?.author_name ?? defaultAuthor,
      authorRole: post?.author_role ?? "",
      isFree: post?.is_free ?? false,
      previewParagraphs: post?.preview_paragraphs ?? 3,
      status: (post?.status ?? "draft") as PostForm["status"],
      publishedAt: isoToLagosInput(post?.published_at ?? null),
      seoTitle: post?.seo_title ?? "",
      seoDescription: post?.seo_description ?? "",
    },
  });

  const dirty = isDirty || contentDirty;
  useBlocker({
    shouldBlockFn: () =>
      dirty && !isSubmitting && !window.confirm("You have unsaved changes. Leave anyway?"),
    enableBeforeUnload: () => dirty,
  });

  const status = watch("status");
  const title = register("title");

  const submit = handleSubmit(async (values) => {
    try {
      const { id } = await save({ data: { ...values, content: content as RichDoc } });
      toast.success(post ? "Post saved" : "Post created");
      setContentDirty(false);
      reset(values);
      if (!post) await navigate({ to: "/admin/blog/$id", params: { id }, replace: true });
      else await router.invalidate();
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't save the post"));
    }
  }, onInvalid);

  return (
    <form onSubmit={submit} noValidate>
      <Link
        to="/admin/blog"
        className="mb-4 inline-flex min-h-12 items-center gap-2 font-semibold text-deep-blue"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" /> All posts
      </Link>
      <PageHeader
        title={post ? "Edit post" : "New post"}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full px-5"
              onClick={() => setPreviewing(true)}
            >
              <Eye aria-hidden="true" /> Preview
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-12 rounded-full px-6">
              {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {status === "published"
                ? "Save & publish"
                : status === "scheduled"
                  ? "Save & schedule"
                  : "Save draft"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="space-y-5 rounded-md bg-paper p-5">
            <Field label="Title" htmlFor="post-title" error={errors.title?.message}>
              <Input
                id="post-title"
                className="h-14 font-display text-2xl font-bold md:text-2xl"
                {...title}
                onChange={(event) => {
                  void title.onChange(event);
                  if (!slugTouched)
                    setValue("slug", slugify(event.target.value, 120), { shouldDirty: true });
                }}
                aria-invalid={!!errors.title}
              />
            </Field>
            <Field label="URL slug" htmlFor="post-slug" error={errors.slug?.message}>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">/blog/</span>
                <Input
                  id="post-slug"
                  className={adminInput}
                  {...register("slug", { onChange: () => setSlugTouched(true) })}
                  aria-invalid={!!errors.slug}
                />
              </div>
            </Field>
            <Field
              label="Excerpt (cards, RSS, and search results)"
              htmlFor="post-excerpt"
              error={errors.excerpt?.message}
            >
              <Textarea
                id="post-excerpt"
                rows={3}
                className="text-base"
                {...register("excerpt")}
                aria-invalid={!!errors.excerpt}
              />
            </Field>
          </div>
          <div>
            <p id="post-body-label" className="mb-2 font-display font-semibold text-deep-blue">
              Article
            </p>
            <Suspense
              fallback={
                <div className="flex min-h-[480px] items-center justify-center rounded-md bg-paper text-muted-foreground">
                  Loading editor…
                </div>
              }
            >
              <RichTextEditor
                labelId="post-body-label"
                content={content}
                onChange={(doc) => {
                  setContent(doc);
                  setContentDirty(true);
                }}
              />
            </Suspense>
          </div>
        </div>

        <aside className="space-y-5" aria-label="Post settings">
          <Panel title="Publishing">
            <Field label="Status" htmlFor="post-status" error={errors.status?.message}>
              <select id="post-status" className={adminSelect} {...register("status")}>
                <option value="draft">Draft (private)</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </Field>
            {status !== "draft" && (
              <Field
                label={
                  status === "scheduled" ? "Publish at (Lagos time)" : "Publish date (Lagos time)"
                }
                htmlFor="post-published-at"
                error={errors.publishedAt?.message}
              >
                <input
                  id="post-published-at"
                  type="datetime-local"
                  className={adminSelect}
                  {...register("publishedAt")}
                />
              </Field>
            )}
            {status === "published" && !watch("publishedAt") && (
              <p className="text-sm text-muted-foreground">Leave empty to publish now.</p>
            )}
          </Panel>

          <Panel title="Access">
            <label className="flex items-center gap-3 font-semibold text-deep-blue">
              <Controller
                control={control}
                name="isFree"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Free to read (no sign-up wall)
            </label>
            {!watch("isFree") && (
              <Field
                label="Free preview paragraphs"
                htmlFor="post-preview"
                error={errors.previewParagraphs?.message}
              >
                <Input
                  id="post-preview"
                  type="number"
                  min={1}
                  max={20}
                  className={adminInput}
                  {...register("previewParagraphs")}
                />
              </Field>
            )}
          </Panel>

          <Panel title="Details">
            <Field label="Category" htmlFor="post-category" error={errors.categoryId?.message}>
              <select id="post-category" className={adminSelect} {...register("categoryId")}>
                <option value="">None</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags (comma-separated)" htmlFor="post-tags" error={errors.tags?.message}>
              <Input
                id="post-tags"
                className={adminInput}
                placeholder="AI, jobs, skills"
                {...register("tags")}
              />
            </Field>
            <Field label="Author" htmlFor="post-author" error={errors.authorName?.message}>
              <Input
                id="post-author"
                className={adminInput}
                {...register("authorName")}
                aria-invalid={!!errors.authorName}
              />
            </Field>
            <Field
              label="Author role (optional)"
              htmlFor="post-author-role"
              error={errors.authorRole?.message}
            >
              <Input id="post-author-role" className={adminInput} {...register("authorRole")} />
            </Field>
          </Panel>

          <Panel title="Cover image">
            <ImageField
              label="Cover"
              folder="blog"
              url={watch("coverImageUrl")}
              alt={watch("coverImageAlt")}
              altError={errors.coverImageAlt?.message}
              onChange={({ url, alt }) => {
                setValue("coverImageUrl", url, { shouldDirty: true });
                setValue("coverImageAlt", alt, { shouldDirty: true });
              }}
            />
          </Panel>

          <Panel title="Search & social">
            <Field
              label={`SEO title (${(watch("seoTitle") ?? "").length}/70)`}
              htmlFor="post-seo-title"
              error={errors.seoTitle?.message}
            >
              <Input
                id="post-seo-title"
                className={adminInput}
                placeholder="Defaults to the title"
                {...register("seoTitle")}
              />
            </Field>
            <Field
              label={`SEO description (${(watch("seoDescription") ?? "").length}/200)`}
              htmlFor="post-seo-description"
              error={errors.seoDescription?.message}
            >
              <Textarea
                id="post-seo-description"
                rows={3}
                className="text-base"
                placeholder="Defaults to the excerpt"
                {...register("seoDescription")}
              />
            </Field>
          </Panel>
        </aside>
      </div>

      {previewing && (
        <PreviewDialog
          title={watch("title")}
          excerpt={watch("excerpt")}
          coverUrl={watch("coverImageUrl")}
          coverAlt={watch("coverImageAlt")}
          blocks={(content.content ?? []) as RichNode[]}
          gatedAfter={watch("isFree") ? null : Number(watch("previewParagraphs")) || 3}
          onClose={() => setPreviewing(false)}
        />
      )}
    </form>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-md bg-paper p-5" aria-label={title}>
      <h2 className="font-display text-lg font-bold text-deep-blue">{title}</h2>
      {children}
    </section>
  );
}

/** Renders the post with the public article renderer, marking where the wall starts. */
function PreviewDialog({
  title,
  excerpt,
  coverUrl,
  coverAlt,
  blocks,
  gatedAfter,
  onClose,
}: {
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string;
  blocks: RichNode[];
  gatedAfter: number | null;
  onClose: () => void;
}) {
  const free =
    gatedAfter === null ? blocks : previewBlocks({ type: "doc", content: blocks }, gatedAfter);
  const rest = blocks.slice(free.length);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] max-w-4xl overflow-y-auto bg-paper p-0">
        <div className="bg-deep-blue px-8 py-10 text-paper">
          <p className="font-display text-sm font-bold uppercase text-digital-lime">Preview</p>
          <DialogTitle className="mt-3 text-h2 text-paper">{title || "Untitled post"}</DialogTitle>
          <DialogDescription className="mt-4 text-lg text-paper/85">{excerpt}</DialogDescription>
        </div>
        <div className="px-8 py-8">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={coverAlt}
              className="mb-8 aspect-[16/9] w-full rounded-md object-cover"
            />
          )}
          <ArticleBody blocks={free} />
          {gatedAfter !== null && rest.length > 0 && (
            <>
              <p className="my-8 rounded-md border-2 border-dashed border-signal-orange px-4 py-3 text-center font-display font-bold text-deep-blue">
                Sign-up wall: readers who aren't signed in stop here
              </p>
              <ArticleBody blocks={rest} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
