-- Sender emails: custom "from" addresses for Camages
CREATE TABLE IF NOT EXISTS sender_emails (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sender_emails_email ON sender_emails(email);
CREATE INDEX IF NOT EXISTS idx_sender_emails_is_default ON sender_emails(is_default) WHERE is_default = true;
