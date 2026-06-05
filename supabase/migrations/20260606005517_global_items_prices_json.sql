-- Create a temporary JSONB column
ALTER TABLE global_items ADD COLUMN unit_prices jsonb;

-- Migrate existing unit_price into unit_prices using "BDT" as the default currency.
-- We use a simple JSON mapping: {"BDT": <unit_price>}
UPDATE global_items 
SET unit_prices = jsonb_build_object('BDT', unit_price)
WHERE unit_price IS NOT NULL;

-- Drop the old column
ALTER TABLE global_items DROP COLUMN unit_price;

-- Rename the new column to unit_price
ALTER TABLE global_items RENAME COLUMN unit_prices TO unit_price;
