ALTER TABLE invoices
ADD COLUMN discount_type text CHECK (discount_type IN ('amount', 'percentage')),
ADD COLUMN discount_value numeric DEFAULT 0,
ADD COLUMN shipping_cost numeric DEFAULT 0;
