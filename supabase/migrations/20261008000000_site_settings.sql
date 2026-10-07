-- Site-wide event settings, edited in the dashboard. A single row (id = true).
-- Everything here is public information shown on the site.
CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  event_name text NOT NULL CHECK (char_length(event_name) BETWEEN 2 AND 80),
  tagline text NOT NULL CHECK (char_length(tagline) <= 160),
  theme text NOT NULL CHECK (char_length(theme) <= 200),
  theme_short text NOT NULL CHECK (char_length(theme_short) <= 120),
  venue text NOT NULL CHECK (char_length(venue) <= 120),
  format text NOT NULL CHECK (char_length(format) <= 80),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  contact_email text NOT NULL CHECK (char_length(contact_email) <= 255),
  x_url text CHECK (x_url ~ '^https://'),
  linkedin_url text CHECK (linkedin_url ~ '^https://'),
  instagram_url text CHECK (instagram_url ~ '^https://'),
  -- Homepage count-up stats: [{ "value": 500, "suffix": "+", "label": "..." }]
  stats jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(stats) = 'array'),
  -- Privacy policy as Tiptap JSON; NULL shows the built-in policy.
  privacy_policy jsonb CHECK (privacy_policy IS NULL OR privacy_policy->>'type' = 'doc'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.site_settings TO service_role;
REVOKE ALL ON public.site_settings FROM anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
CREATE POLICY "Anyone can read site settings"
ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Trusted server manages site settings"
ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.site_settings (
  event_name, tagline, theme, theme_short, venue, format, starts_at, ends_at,
  contact_email, x_url, linkedin_url, instagram_url, stats
) VALUES (
  'C8 Tech Summit',
  'Connecting tech entrepreneurs',
  'Navigating Nigeria''s AI Revolution: Jobs, Privacy, & Financial Security',
  'Navigating Nigeria''s AI Revolution',
  'Live online',
  'Virtual summit',
  '2026-10-15T16:00:00+01:00',
  '2026-10-15T18:00:00+01:00',
  'C8techsummit@gmail.com',
  'https://x.com/c8techsummit?s=21',
  'https://www.linkedin.com/company/c8-tech-summit/',
  'https://www.instagram.com/c8techsummit?stkn=MWdyemZiMmxzODhydA==',
  '[{"value": 500, "suffix": "+", "label": "Registrations expected"},
    {"value": 200, "suffix": "+", "label": "Live attendees"},
    {"value": 3, "suffix": "", "label": "Big questions: jobs, privacy, money"},
    {"value": 1, "suffix": "", "label": "Afternoon that brings the community together"}]'::jsonb
);
