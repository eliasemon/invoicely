-- Migration: Add template column to invoices table
ALTER TABLE "public"."invoices"
ADD COLUMN IF NOT EXISTS "template" text DEFAULT 'sleek-accent';
