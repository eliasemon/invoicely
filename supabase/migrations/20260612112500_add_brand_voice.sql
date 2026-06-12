-- Add brand_voice and brand_voice_enabled to profiles table
ALTER TABLE profiles 
ADD COLUMN brand_voice TEXT,
ADD COLUMN brand_voice_enabled BOOLEAN DEFAULT true;

-- Add brand_voice and brand_voice_enabled to invoices table
ALTER TABLE invoices 
ADD COLUMN brand_voice TEXT,
ADD COLUMN brand_voice_enabled BOOLEAN DEFAULT true;
