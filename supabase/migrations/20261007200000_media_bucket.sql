-- Public bucket for images uploaded from the dashboard (sponsor logos, speaker
-- photos, blog covers). Reads are public; uploads go through the app's server
-- (service role) after a staff check, so no storage policies are needed.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
