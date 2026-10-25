-- Migration: Add currency_symbol_display column to profiles and invoices tables
-- Values: 'all' (show on every item and totals) or 'selected' (show only on subtotal, totals, discount, tax)

ALTER TABLE "public"."profiles"
ADD COLUMN IF NOT EXISTS "currency_symbol_display" text DEFAULT 'all';

ALTER TABLE "public"."invoices"
ADD COLUMN IF NOT EXISTS "currency_symbol_display" text DEFAULT 'all';
