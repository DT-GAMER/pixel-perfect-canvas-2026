-- Track the registration confirmation email for each registrant.
-- pending: not attempted yet · sent: accepted by the email provider · failed: provider error
ALTER TABLE public.registrations
  ADD COLUMN confirmation_email_status text NOT NULL DEFAULT 'pending'
    CHECK (confirmation_email_status IN ('pending', 'sent', 'failed')),
  ADD COLUMN confirmation_email_id text,
  ADD COLUMN confirmation_email_sent_at timestamptz,
  ADD COLUMN confirmation_email_error text CHECK (char_length(confirmation_email_error) <= 500);
