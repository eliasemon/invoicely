-- Migration: Add Subject and Mode controls to invoices table
ALTER TABLE "public"."invoices"
ADD COLUMN IF NOT EXISTS "subject_enabled" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "subject" text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "subject_invoice" text DEFAULT 'Bill for Items/Services',
ADD COLUMN IF NOT EXISTS "subject_challan" text DEFAULT 'Delivery Challan for Items/Services',
ADD COLUMN IF NOT EXISTS "subject_quotation" text DEFAULT 'Quotation for Items/Services',
ADD COLUMN IF NOT EXISTS "invoice_mode_enabled" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "challan_mode_enabled" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "quotation_mode_enabled" boolean DEFAULT true;
