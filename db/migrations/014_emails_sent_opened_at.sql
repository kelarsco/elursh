-- Add opened_at tracking to emails_sent
ALTER TABLE emails_sent ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_emails_sent_opened_at ON emails_sent(opened_at) WHERE opened_at IS NOT NULL;
