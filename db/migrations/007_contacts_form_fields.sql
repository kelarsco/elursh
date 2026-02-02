-- Add fields for progressive contact form
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS primary_goal TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS budget TEXT;
