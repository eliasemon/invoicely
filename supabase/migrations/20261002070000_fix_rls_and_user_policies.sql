-- Fix check_api_secret to support service_role and header secrets
CREATE OR REPLACE FUNCTION check_api_secret()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow service_role key directly
  IF auth.role() = 'service_role' THEN
    RETURN true;
  END IF;

  -- Allow request header secret
  IF current_setting('request.headers', true)::json->>'x-api-secret' = 'da294d82c9e81b9a12b6071e624cbf2d0ae11993641f2f1c19581504229f35f0' THEN
    RETURN true;
  END IF;

  RETURN false;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Allow authenticated users with auth.uid() to manage their own invoices
DROP POLICY IF EXISTS "Users can manage own invoices" ON public.invoices;

CREATE POLICY "Users can manage own invoices" ON public.invoices
FOR ALL
USING (
  check_api_secret()
  OR (profile_id = current_setting('app.current_user_id'::text, true))
  OR ((auth.uid())::text = profile_id)
)
WITH CHECK (
  check_api_secret()
  OR (profile_id = current_setting('app.current_user_id'::text, true))
  OR ((auth.uid())::text = profile_id)
);

-- Allow authenticated users with auth.uid() to manage their own clients
DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;

CREATE POLICY "Users can manage own clients" ON public.clients
FOR ALL
USING (
  check_api_secret()
  OR (profile_id = current_setting('app.current_user_id'::text, true))
  OR ((auth.uid())::text = profile_id)
)
WITH CHECK (
  check_api_secret()
  OR (profile_id = current_setting('app.current_user_id'::text, true))
  OR ((auth.uid())::text = profile_id)
);

-- Backfill missing profiles for existing auth.users
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT u.id::text, u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id::text = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
