-- Add note_enabled and note_text columns to invoices table
-- These allow invoice owners to add/toggle a bottom N.B. note on their invoices

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS note_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS note_text    text;

-- Set a sensible default note text for existing rows (optional – owners can change it)
UPDATE invoices SET note_text = NULL WHERE note_text IS NULL;
