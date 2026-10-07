-- Staff accounts for the admin dashboard. A staff member is an auth user with a
-- profile row; blog readers are auth users without one.
--   admin  – everything, including team management
--   editor – blog posts only
-- The dashboard reads and writes through the app's server (service role) after
-- checking the caller's role, so no client-facing policies are needed.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL CHECK (char_length(email) <= 255),
  full_name text CHECK (char_length(full_name) <= 100),
  role text NOT NULL CHECK (role IN ('admin', 'editor')),
  invited_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  last_sign_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles (lower(email));

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.profiles TO service_role;
REVOKE ALL ON public.profiles FROM anon, authenticated;

CREATE POLICY "Trusted server manages profiles"
ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
