CREATE POLICY "Trusted server manages registrations"
ON public.registrations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Trusted server manages registration rate limits"
ON public.registration_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);