-- Onboarding sessions: track user progress through get-started flow (platform, store, first choice)
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT,
  store_url TEXT,
  store_connected BOOLEAN DEFAULT FALSE,
  first_choice TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
