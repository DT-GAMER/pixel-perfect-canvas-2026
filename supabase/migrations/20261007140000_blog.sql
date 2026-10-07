-- Blog: categories and posts.
--
-- Gating: anon/authenticated clients can read published post *metadata* through
-- the API, but never the `content` column. Article bodies are only served by the
-- app's server functions (service role), which decide how much a visitor may see.
-- Admin/editor write access arrives with roles in Phase 6.

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text CHECK (char_length(description) <= 300),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) <= 120),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  excerpt text NOT NULL CHECK (char_length(excerpt) BETWEEN 10 AND 400),
  -- Tiptap (ProseMirror) document JSON: { "type": "doc", "content": [...] }
  content jsonb NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb
    CHECK (content->>'type' = 'doc'),
  cover_image_url text,
  cover_image_alt text,
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  author_name text NOT NULL DEFAULT 'C8 Editorial Team' CHECK (char_length(author_name) BETWEEN 2 AND 100),
  author_role text CHECK (char_length(author_role) <= 100),
  -- Free posts have no sign-up wall; gated posts show `preview_paragraphs` paragraphs.
  is_free boolean NOT NULL DEFAULT false,
  preview_paragraphs integer NOT NULL DEFAULT 3 CHECK (preview_paragraphs BETWEEN 1 AND 20),
  reading_minutes integer NOT NULL DEFAULT 1 CHECK (reading_minutes > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  seo_title text CHECK (char_length(seo_title) <= 70),
  seo_description text CHECK (char_length(seo_description) <= 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Every cover image needs alt text (accessibility requirement).
  CONSTRAINT blog_posts_cover_alt_check CHECK (cover_image_url IS NULL OR char_length(cover_image_alt) >= 3),
  CONSTRAINT blog_posts_published_at_check CHECK (status = 'draft' OR published_at IS NOT NULL)
);

CREATE INDEX blog_posts_listing_idx ON public.blog_posts (status, published_at DESC);
CREATE INDEX blog_posts_category_idx ON public.blog_posts (category_id);

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER blog_posts_set_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- A post is live once published, or once a scheduled post's time has come.
CREATE OR REPLACE FUNCTION public.blog_post_is_live(p_status text, p_published_at timestamptz)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT p_status IN ('published', 'scheduled') AND p_published_at <= now();
$$;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.categories, public.blog_posts TO service_role;

REVOKE ALL ON public.categories FROM anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;

-- Column-level grant: everything except `content`.
REVOKE ALL ON public.blog_posts FROM anon, authenticated;
GRANT SELECT (
  id, slug, title, excerpt, cover_image_url, cover_image_alt, category_id, tags,
  author_name, author_role, is_free, preview_paragraphs, reading_minutes, status,
  published_at, seo_title, seo_description, created_at, updated_at
) ON public.blog_posts TO anon, authenticated;

CREATE POLICY "Anyone can read categories"
ON public.categories FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can read live posts"
ON public.blog_posts FOR SELECT TO anon, authenticated
USING (public.blog_post_is_live(status, published_at));

CREATE POLICY "Trusted server manages categories"
ON public.categories FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Trusted server manages posts"
ON public.blog_posts FOR ALL TO service_role
USING (true) WITH CHECK (true);
