ALTER TABLE invoices
ADD COLUMN issued_at timestamptz,
ADD COLUMN due_date timestamptz;
