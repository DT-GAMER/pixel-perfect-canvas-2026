CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 255),
  email_normalized text GENERATED ALWAYS AS (lower(trim(email))) STORED,
  profession text NOT NULL CHECK (profession IN ('Doctor/Clinician', 'Nurse', 'Pharmacist', 'Researcher', 'Engineer/Developer', 'Designer', 'Data/AI Specialist', 'Founder/Executive', 'Student', 'Investor', 'Other')),
  other_profession text CHECK (other_profession IS NULL OR char_length(other_profession) BETWEEN 2 AND 80),
  country text NOT NULL CHECK (char_length(country) BETWEEN 2 AND 80),
  city text NOT NULL CHECK (char_length(city) BETWEEN 2 AND 80),
  privacy_agreed boolean NOT NULL CHECK (privacy_agreed = true),
  subscribe_updates boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT registrations_email_normalized_key UNIQUE (email_normalized),
  CONSTRAINT registrations_profession_details_check CHECK (
    (profession = 'Other' AND other_profession IS NOT NULL) OR
    (profession <> 'Other' AND other_profession IS NULL)
  )
);
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.registration_rate_limits (
  key_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempt_count integer NOT NULL DEFAULT 1 CHECK (attempt_count > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.registration_rate_limits TO service_role;
ALTER TABLE public.registration_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER registrations_set_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER registration_rate_limits_set_updated_at
BEFORE UPDATE ON public.registration_rate_limits
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.consume_registration_attempt(
  p_key_hash text,
  p_window_seconds integer DEFAULT 3600,
  p_max_attempts integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_record public.registration_rate_limits%ROWTYPE;
BEGIN
  INSERT INTO public.registration_rate_limits (key_hash)
  VALUES (p_key_hash)
  ON CONFLICT (key_hash) DO UPDATE
    SET attempt_count = CASE
          WHEN public.registration_rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds)
            THEN 1
          ELSE public.registration_rate_limits.attempt_count + 1
        END,
        window_started_at = CASE
          WHEN public.registration_rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds)
            THEN now()
          ELSE public.registration_rate_limits.window_started_at
        END
  RETURNING * INTO current_record;

  RETURN current_record.attempt_count <= p_max_attempts;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_registration_attempt(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_registration_attempt(text, integer, integer) TO service_role;