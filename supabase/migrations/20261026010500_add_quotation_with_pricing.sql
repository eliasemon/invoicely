-- Migration: Add quotation_with_pricing column to invoices table
-- Allows persisting whether a quotation shows full pricing breakdown or hides prices/amounts

ALTER TABLE "public"."invoices"
ADD COLUMN IF NOT EXISTS "quotation_with_pricing" boolean DEFAULT true;
