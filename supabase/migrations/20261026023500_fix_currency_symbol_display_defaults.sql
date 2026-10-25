-- Migration: Fix currency_symbol_display column default on invoices
-- Invoices should default to NULL so they dynamically inherit the user's profile setting,
-- unless explicitly overridden on an invoice.

ALTER TABLE "public"."invoices" ALTER COLUMN "currency_symbol_display" DROP DEFAULT;
ALTER TABLE "public"."invoices" ALTER COLUMN "currency_symbol_display" SET DEFAULT NULL;

-- Reset existing invoices to NULL so they inherit from their owner's profile
UPDATE "public"."invoices" SET "currency_symbol_display" = NULL;
