-- Add status column to contacts table for tracking message handling
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
