-- Themes table for manager CRUD; Theme page uses API when available
CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 99,
  features JSONB DEFAULT '[]',
  image TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_themes_sort_order ON themes(sort_order ASC);
