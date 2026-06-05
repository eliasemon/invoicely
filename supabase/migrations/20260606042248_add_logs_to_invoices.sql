ALTER TABLE public.invoices ADD COLUMN logs jsonb DEFAULT '[]'::jsonb;
