-- Replace the original health-focused profession list with tech, marketing,
-- and leadership roles to match C8 Tech Summit's audience.

ALTER TABLE public.registrations DROP CONSTRAINT registrations_profession_check;

-- Carry any existing answers over: renamed roles map directly, retired roles
-- become "Other" with the original answer kept in other_profession.
UPDATE public.registrations SET profession = 'Software Engineer/Developer' WHERE profession = 'Engineer/Developer';
UPDATE public.registrations SET profession = 'Product/UX Designer' WHERE profession = 'Designer';
UPDATE public.registrations SET profession = 'CEO/Executive' WHERE profession = 'Founder/Executive';
UPDATE public.registrations
  SET other_profession = profession, profession = 'Other'
  WHERE profession IN ('Doctor/Clinician', 'Nurse', 'Pharmacist', 'Researcher');

ALTER TABLE public.registrations ADD CONSTRAINT registrations_profession_check CHECK (profession IN (
  'Software Engineer/Developer', 'Product Manager', 'Product/UX Designer', 'Data/AI Specialist',
  'Cloud/DevOps Engineer', 'Cybersecurity Specialist', 'IT/Systems Professional',
  'Marketing/Growth', 'Content/Communications', 'Sales/Business Development',
  'Founder/Co-founder', 'CEO/Executive', 'Manager/Team Lead', 'Investor',
  'Student', 'Other'
));
