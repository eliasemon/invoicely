CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Backfill clients from existing invoices
INSERT INTO public.clients (profile_id, name, phone, address, created_at, updated_at)
SELECT DISTINCT profile_id, client_name, client_phone, client_address, now(), now()
FROM public.invoices
WHERE client_name IS NOT NULL AND client_name != '';

-- Add client_id to invoices
ALTER TABLE public.invoices
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Backfill client_id on invoices
UPDATE public.invoices i
SET client_id = c.id
FROM public.clients c
WHERE i.profile_id = c.profile_id AND i.client_name = c.name;

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies for clients
CREATE POLICY "Users can view their own clients"
ON public.clients FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own clients"
ON public.clients FOR INSERT
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own clients"
ON public.clients FOR UPDATE
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete their own clients"
ON public.clients FOR DELETE
USING (profile_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
