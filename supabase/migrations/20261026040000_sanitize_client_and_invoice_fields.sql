-- Migration: Sanitize and validate client and invoice communication fields

-- 1. Sanitize clients data: Trim whitespace, set empty strings to NULL, and lowercase emails
UPDATE public.clients
SET 
  email = NULLIF(lower(trim(email)), ''),
  phone = NULLIF(trim(phone), ''),
  whatsapp_phone = NULLIF(trim(whatsapp_phone), ''),
  address = NULLIF(trim(address), ''),
  name = trim(name)
WHERE 
  email IS NOT NULL OR phone IS NOT NULL OR whatsapp_phone IS NOT NULL OR address IS NOT NULL;

-- 2. Sanitize invoices data: Trim whitespace, set empty strings to NULL, and lowercase emails
UPDATE public.invoices
SET 
  client_email = NULLIF(lower(trim(client_email)), ''),
  client_whatsapp = NULLIF(trim(client_whatsapp), ''),
  client_name = trim(client_name),
  client_phone = NULLIF(trim(client_phone), '')
WHERE 
  client_email IS NOT NULL OR client_whatsapp IS NOT NULL OR client_phone IS NOT NULL;

-- 3. Add database check constraint for optional email format on clients
ALTER TABLE public.clients
DROP CONSTRAINT IF EXISTS clients_email_format_check;

ALTER TABLE public.clients
ADD CONSTRAINT clients_email_format_check
CHECK (
  email IS NULL 
  OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 4. Add database check constraint for optional email format on invoices
ALTER TABLE public.invoices
DROP CONSTRAINT IF EXISTS invoices_client_email_format_check;

ALTER TABLE public.invoices
ADD CONSTRAINT invoices_client_email_format_check
CHECK (
  client_email IS NULL 
  OR client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 5. Add performance indexes for client lookup
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp_phone ON public.clients(whatsapp_phone);
