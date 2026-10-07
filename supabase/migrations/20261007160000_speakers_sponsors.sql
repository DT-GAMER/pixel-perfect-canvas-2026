-- Speakers, sponsors, and sponsor enquiries.
-- Public: read published speakers and visible sponsors. Enquiries are written
-- and read only by the app's server (service role); admin access comes in Phase 6.

CREATE TABLE public.speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) <= 80),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  role text CHECK (char_length(role) <= 100),
  organization text CHECK (char_length(organization) <= 100),
  bio text CHECK (char_length(bio) <= 2000),
  photo_url text,
  photo_alt text,
  -- One of the summit's conversations (see src/lib/tracks.ts).
  track text CHECK (track IN ('ai-and-jobs', 'privacy', 'financial-security', 'nigerias-direction')),
  linkedin_url text CHECK (linkedin_url ~ '^https://'),
  x_url text CHECK (x_url ~ '^https://'),
  instagram_url text CHECK (instagram_url ~ '^https://'),
  website_url text CHECK (website_url ~ '^https://'),
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT speakers_photo_alt_check CHECK (photo_url IS NULL OR char_length(photo_alt) >= 3)
);

CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  tier text NOT NULL CHECK (tier IN ('headline', 'gold', 'silver', 'bronze', 'community', 'media')),
  logo_url text,
  logo_alt text,
  website_url text CHECK (website_url ~ '^https?://'),
  description text CHECK (char_length(description) <= 600),
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sponsors_logo_alt_check CHECK (logo_url IS NULL OR char_length(logo_alt) >= 2)
);

CREATE TABLE public.sponsor_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  company text NOT NULL CHECK (char_length(company) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text CHECK (char_length(phone) <= 40),
  tier_interest text NOT NULL
    CHECK (tier_interest IN ('headline', 'gold', 'silver', 'bronze', 'community', 'media', 'not-sure')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 3000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  notes text CHECK (char_length(notes) <= 5000),
  -- Team notification email (sent to SPONSOR_ENQUIRY_EMAIL).
  notified_at timestamptz,
  notification_error text CHECK (char_length(notification_error) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX speakers_listing_idx ON public.speakers (is_published, display_order);
CREATE INDEX sponsors_listing_idx ON public.sponsors (is_visible, tier, display_order);
CREATE INDEX sponsor_enquiries_status_idx ON public.sponsor_enquiries (status, created_at DESC);

CREATE TRIGGER speakers_set_updated_at BEFORE UPDATE ON public.speakers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER sponsors_set_updated_at BEFORE UPDATE ON public.sponsors
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER sponsor_enquiries_set_updated_at BEFORE UPDATE ON public.sponsor_enquiries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_enquiries ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.speakers, public.sponsors, public.sponsor_enquiries TO service_role;
REVOKE ALL ON public.speakers, public.sponsors, public.sponsor_enquiries FROM anon, authenticated;
GRANT SELECT ON public.speakers, public.sponsors TO anon, authenticated;

CREATE POLICY "Anyone can read published speakers"
ON public.speakers FOR SELECT TO anon, authenticated USING (is_published);

CREATE POLICY "Anyone can read visible sponsors"
ON public.sponsors FOR SELECT TO anon, authenticated USING (is_visible);

CREATE POLICY "Trusted server manages speakers"
ON public.speakers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Trusted server manages sponsors"
ON public.sponsors FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Trusted server manages sponsor enquiries"
ON public.sponsor_enquiries FOR ALL TO service_role USING (true) WITH CHECK (true);
