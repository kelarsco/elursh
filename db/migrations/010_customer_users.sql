-- Customer users: signup/login for Get Started flow (Google + email OTP)
CREATE TABLE IF NOT EXISTS customer_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  google_id TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT customer_users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_customer_users_email ON customer_users(email);
CREATE INDEX IF NOT EXISTS idx_customer_users_google_id ON customer_users(google_id);

-- Link onboarding sessions to customer users
ALTER TABLE onboarding_sessions ADD COLUMN IF NOT EXISTS customer_user_id INT REFERENCES customer_users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_customer_user ON onboarding_sessions(customer_user_id);
