-- Homepage FAQ, managed in the dashboard. Starts with the launch questions.
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL CHECK (char_length(question) BETWEEN 5 AND 200),
  answer text NOT NULL CHECK (char_length(answer) BETWEEN 5 AND 2000),
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER faqs_set_updated_at BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.faqs TO service_role;
REVOKE ALL ON public.faqs FROM anon, authenticated;
GRANT SELECT ON public.faqs TO anon, authenticated;

CREATE POLICY "Anyone can read published FAQs"
ON public.faqs FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Trusted server manages FAQs"
ON public.faqs FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.faqs (question, answer, display_order) VALUES
  ('Who is C8 Tech Summit for?', 'Anyone in, or moving into, Nigeria''s tech ecosystem: founders, builders, engineers, designers, researchers, students, investors, and policy people. Emerging voices are especially welcome. Great ideas don''t only come from people who have already made it.', 0),
  ('When and where is it?', '15 October 2026 at 4:00 PM WAT. The 2026 summit is a live virtual event, so you can join from anywhere.', 1),
  ('How do I join on the day?', 'Register on this site. We''ll email your joining link and reminders to the address you registered with before the event starts.', 2),
  ('What is this year''s theme?', '"Navigating Nigeria''s AI Revolution: Jobs, Privacy, & Financial Security." We''re bringing the global AI conversation home: what AI means for Nigerians'' jobs, data, businesses, and everyday lives.', 3),
  ('Can my organisation become a sponsor?', 'Yes. Sponsorship and partnership opportunities are available. Visit our sponsors page or email us to start the conversation.', 4);
