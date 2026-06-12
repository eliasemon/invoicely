-- Add terms_and_conditions_enabled to profiles table
ALTER TABLE profiles 
ADD COLUMN terms_and_conditions_enabled BOOLEAN DEFAULT true;

-- Add terms_and_conditions_enabled to invoices table
ALTER TABLE invoices 
ADD COLUMN terms_and_conditions_enabled BOOLEAN DEFAULT true;
