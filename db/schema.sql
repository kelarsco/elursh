-- Elursh Manager: PostgreSQL schema
-- Run: psql $DATABASE_URL -f db/schema.sql

-- Admin sessions (optional: store session in DB via connect-pg-simple)
-- For now we use memory store; admins are whitelisted by email in env.

-- Analysed stores (from store audit flow; one row per store_url, re-analysis updates)
CREATE TABLE IF NOT EXISTS analysed_stores (
  id SERIAL PRIMARY KEY,
  store_url TEXT NOT NULL UNIQUE,
  analysed_at TIMESTAMPTZ DEFAULT NOW(),
  result_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts (users who submitted contact / send message)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  store_link TEXT,
  message TEXT,
  source TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services (full CRUD from manager; replaces static JSON for Improve Store)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  store_stages JSONB DEFAULT '[]',
  description TEXT,
  pain_points JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  delivery_days_min INT DEFAULT 5,
  delivery_days_max INT DEFAULT 10,
  rating NUMERIC(3,1) DEFAULT 4.5,
  users INT DEFAULT 500,
  packages JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes (full CRUD from manager; Theme page uses API when available)
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

-- Store reports: custom audit result per store (when they run audit, show this)
CREATE TABLE IF NOT EXISTS store_reports (
  id SERIAL PRIMARY KEY,
  store_url TEXT NOT NULL UNIQUE,
  report_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (bought services from Improve Store)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  store_link TEXT,
  collaborator_code TEXT,
  service_id INT,
  service_title TEXT,
  package_name TEXT,
  package_price_usd NUMERIC(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (Paystack and any other payments)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE,
  email TEXT,
  amount_kobo BIGINT,
  amount_usd NUMERIC(10,2),
  metadata_json JSONB,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emails sent (log of manager-sent emails)
CREATE TABLE IF NOT EXISTS emails_sent (
  id SERIAL PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analysed_stores_store_url ON analysed_stores(store_url);
CREATE INDEX IF NOT EXISTS idx_analysed_stores_analysed_at ON analysed_stores(analysed_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_themes_sort_order ON themes(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
