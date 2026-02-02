-- Add fulfillment_status to payments for theme/Fix-It orders (pending, in_progress, completed, cancelled)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fulfillment_status TEXT;
