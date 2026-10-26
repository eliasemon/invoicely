-- Migration: Add WhatsApp & Gmail Connected Accounts, Delivery History, and Customer messaging fields

-- 1. Extend clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS whatsapp_phone text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_preferred boolean DEFAULT false;

-- 2. Extend invoices table to snapshot client communication details
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS client_email text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS client_whatsapp text DEFAULT NULL;

-- 3. Create connected_accounts table
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('WHATSAPP', 'GMAIL')),
  account_identifier TEXT NOT NULL,
  encrypted_credentials TEXT,
  connection_status TEXT NOT NULL CHECK (connection_status IN ('CONNECTED', 'DISCONNECTED', 'CONNECTING', 'EXPIRED', 'FAILED')),
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (profile_id, provider)
);

-- 4. Create document_delivery_history table
CREATE TABLE IF NOT EXISTS public.document_delivery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'challan', 'quotation')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  recipient TEXT NOT NULL,
  sender_account_id UUID REFERENCES public.connected_accounts(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'SENDING', 'SENT', 'FAILED', 'UNKNOWN')),
  provider_message_id TEXT,
  error_code TEXT,
  error_message TEXT,
  idempotency_key TEXT UNIQUE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_delivery_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for connected_accounts
DROP POLICY IF EXISTS "Users can manage own connected accounts" ON public.connected_accounts;
CREATE POLICY "Users can manage own connected accounts" ON public.connected_accounts
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

-- 7. RLS Policies for document_delivery_history
DROP POLICY IF EXISTS "Users can manage own delivery history" ON public.document_delivery_history;
CREATE POLICY "Users can manage own delivery history" ON public.document_delivery_history
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

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connected_accounts_profile_provider ON public.connected_accounts(profile_id, provider);
CREATE INDEX IF NOT EXISTS idx_delivery_history_doc ON public.document_delivery_history(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_history_profile ON public.document_delivery_history(profile_id, created_at DESC);
