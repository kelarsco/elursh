-- Settings: key-value for global config (e.g. price_modifier_percent)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default: -30 means 30% reduction (user requested 30% off)
INSERT INTO settings (key, value) VALUES ('price_modifier_percent', '-30')
ON CONFLICT (key) DO NOTHING;
